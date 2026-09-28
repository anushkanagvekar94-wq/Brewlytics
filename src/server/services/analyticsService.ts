import { db } from '../../db/index.ts';
import { sales, saleItems, products, expenses } from '../../db/schema.ts';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';

export interface DateFilterOptions {
  period?: 'today' | '7d' | '30d' | '90d' | 'all';
  startDate?: string;
  endDate?: string;
}

export function getDateRange(options: DateFilterOptions): { start: Date | null; end: Date | null } {
  const now = new Date();
  let start: Date | null = null;
  let end: Date | null = null;

  if (options.startDate) {
    start = new Date(options.startDate);
  }
  if (options.endDate) {
    end = new Date(options.endDate);
  }

  if (!start && options.period) {
    end = new Date();
    switch (options.period) {
      case 'today': {
        const d = new Date(now);
        d.setHours(0, 0, 0, 0);
        start = d;
        break;
      }
      case '7d': {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      }
      case '30d': {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      }
      case '90d': {
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      }
      case 'all':
      default:
        start = null;
        end = null;
        break;
    }
  }

  return { start, end };
}

export async function getDashboardAnalytics(userId: number, options: DateFilterOptions) {
  const { start, end } = getDateRange(options);

  // Conditions for sales
  const salesConditions = [eq(sales.userId, userId)];
  if (start) salesConditions.push(gte(sales.saleDate, start));
  if (end) salesConditions.push(lte(sales.saleDate, end));

  // Conditions for expenses
  const expenseConditions = [eq(expenses.userId, userId)];
  if (start) expenseConditions.push(gte(expenses.expenseDate, start));
  if (end) expenseConditions.push(lte(expenses.expenseDate, end));

  // 1. Fetch Sales Aggregation
  const salesRows = await db.select().from(sales).where(and(...salesConditions)).orderBy(sales.saleDate);
  const totalOrders = salesRows.length;
  const totalRevenue = Number(salesRows.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2));
  const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

  // 2. Fetch Sale Items for these sales with Products
  let totalProductCost = 0;
  let grossProfit = 0;
  const productSalesMap = new Map<number, {
    id: number;
    name: string;
    category: string;
    cost: number;
    price: number;
    stock: number;
    quantitySold: number;
    revenue: number;
    profit: number;
  }>();

  const categoryMap = new Map<string, { category: string; revenue: number; quantity: number }>();

  if (salesRows.length > 0) {
    const saleIds = salesRows.map(s => s.id);
    const items = await db.select({
      id: saleItems.id,
      saleId: saleItems.saleId,
      productId: saleItems.productId,
      quantity: saleItems.quantity,
      unitPrice: saleItems.unitPrice,
      totalPrice: saleItems.totalPrice,
      productName: products.name,
      productCategory: products.category,
      productCost: products.cost,
      productStock: products.stock,
    })
    .from(saleItems)
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(and(eq(products.userId, userId)));

    // Filter items belonging to the filtered sales
    const filteredItems = items.filter(it => saleIds.includes(it.saleId));

    for (const it of filteredItems) {
      const lineCost = it.quantity * it.productCost;
      const lineRevenue = it.totalPrice;
      const lineProfit = lineRevenue - lineCost;

      totalProductCost += lineCost;
      grossProfit += lineProfit;

      // Group by Product
      if (!productSalesMap.has(it.productId)) {
        productSalesMap.set(it.productId, {
          id: it.productId,
          name: it.productName,
          category: it.productCategory,
          cost: it.productCost,
          price: it.unitPrice,
          stock: it.productStock,
          quantitySold: 0,
          revenue: 0,
          profit: 0,
        });
      }
      const pEntry = productSalesMap.get(it.productId)!;
      pEntry.quantitySold += it.quantity;
      pEntry.revenue = Number((pEntry.revenue + lineRevenue).toFixed(2));
      pEntry.profit = Number((pEntry.profit + lineProfit).toFixed(2));

      // Group by Category
      if (!categoryMap.has(it.productCategory)) {
        categoryMap.set(it.productCategory, {
          category: it.productCategory,
          revenue: 0,
          quantity: 0,
        });
      }
      const catEntry = categoryMap.get(it.productCategory)!;
      catEntry.revenue = Number((catEntry.revenue + lineRevenue).toFixed(2));
      catEntry.quantity += it.quantity;
    }
  }

  totalProductCost = Number(totalProductCost.toFixed(2));
  grossProfit = Number(grossProfit.toFixed(2));
  const grossProfitMargin = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0;

  // 3. Fetch Expenses
  const expenseRows = await db.select().from(expenses).where(and(...expenseConditions));
  const totalExpenses = Number(expenseRows.reduce((sum, e) => sum + e.amount, 0).toFixed(2));
  const netProfit = Number((grossProfit - totalExpenses).toFixed(2));
  const netProfitMargin = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;

  // Expense breakdown by category
  const expenseCategoryMap = new Map<string, number>();
  for (const exp of expenseRows) {
    const cur = expenseCategoryMap.get(exp.category) || 0;
    expenseCategoryMap.set(exp.category, Number((cur + exp.amount).toFixed(2)));
  }

  const expenseBreakdown = Array.from(expenseCategoryMap.entries()).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? Number(((amount / totalExpenses) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.amount - a.amount);

  // Revenue & Profit trend by day
  const dailyTrendMap = new Map<string, { date: string; revenue: number; orders: number }>();
  for (const s of salesRows) {
    const dStr = new Date(s.saleDate).toISOString().split('T')[0];
    if (!dailyTrendMap.has(dStr)) {
      dailyTrendMap.set(dStr, { date: dStr, revenue: 0, orders: 0 });
    }
    const day = dailyTrendMap.get(dStr)!;
    day.revenue = Number((day.revenue + s.totalAmount).toFixed(2));
    day.orders += 1;
  }
  const revenueTrend = Array.from(dailyTrendMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // All products to evaluate top vs underperforming
  const allUserProducts = await db.select().from(products).where(eq(products.userId, userId));
  const productList = allUserProducts.map(p => {
    const salesInfo = productSalesMap.get(p.id);
    const quantitySold = salesInfo ? salesInfo.quantitySold : 0;
    const revenue = salesInfo ? salesInfo.revenue : 0;
    const profit = salesInfo ? salesInfo.profit : 0;
    const margin = p.price > 0 ? Number((((p.price - p.cost) / p.price) * 100).toFixed(1)) : 0;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      cost: p.cost,
      stock: p.stock,
      quantitySold,
      revenue,
      profit,
      margin,
    };
  });

  const topProducts = [...productList].sort((a, b) => b.quantitySold - a.quantitySold).slice(0, 5);
  const mostProfitableProducts = [...productList].sort((a, b) => b.profit - a.profit).slice(0, 5);
  const lowestPerformingProducts = [...productList].sort((a, b) => a.quantitySold - b.quantitySold).slice(0, 5);
  const lowStockProducts = allUserProducts.filter(p => p.stock <= 5);

  const salesByCategory = Array.from(categoryMap.values()).map(c => ({
    ...c,
    percentage: totalRevenue > 0 ? Number(((c.revenue / totalRevenue) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.revenue - a.revenue);

  // Generate dynamic AI Insight grounded strictly in real data
  let aiInsight = 'Add your first sales and expense records to unlock automated AI café intelligence.';
  if (totalRevenue > 0) {
    const topCat = salesByCategory[0]?.category || 'Beverages';
    const topProd = topProducts[0]?.name || 'Specialty Drink';
    const profitHealth = netProfit >= 0 ? `net profit of $${netProfit.toLocaleString()}` : `net loss of $${Math.abs(netProfit).toLocaleString()}`;
    aiInsight = `Your café generated $${totalRevenue.toLocaleString()} across ${totalOrders} orders. ${topCat} is your leading sales driver, with "${topProd}" being the most ordered item. After $${totalExpenses.toLocaleString()} in operating expenses, you are operating at a ${profitHealth} (${netProfitMargin}% margin).`;
    if (lowStockProducts.length > 0) {
      aiInsight += ` Attention needed: ${lowStockProducts.length} product(s) have critically low inventory (under 5 units).`;
    }
  }

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    totalProductCost,
    grossProfit,
    grossProfitMargin,
    totalExpenses,
    netProfit,
    netProfitMargin,
    revenueTrend,
    salesByCategory,
    salesByProduct: Array.from(productSalesMap.values()).sort((a, b) => b.revenue - a.revenue),
    topProducts,
    mostProfitableProducts,
    lowestPerformingProducts,
    lowStockProducts,
    expenseBreakdown,
    totalProductsCount: allUserProducts.length,
    aiInsight,
  };
}
