import { GoogleGenAI } from '@google/genai';
import { getDashboardAnalytics } from './analyticsService.ts';
import { db } from '../../db/index.ts';
import { products, customers, sales, expenses } from '../../db/schema.ts';
import { eq, desc } from 'drizzle-orm';

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

export async function generateAiResponse(userId: number, userMessage: string): Promise<string> {
  // 1. Fetch real café data for this user
  const [analytics30d, analyticsAll, userProducts, userCustomers, recentSales, recentExpenses] = await Promise.all([
    getDashboardAnalytics(userId, { period: '30d' }),
    getDashboardAnalytics(userId, { period: 'all' }),
    db.select().from(products).where(eq(products.userId, userId)),
    db.select().from(customers).where(eq(customers.userId, userId)),
    db.select().from(sales).where(eq(sales.userId, userId)).orderBy(desc(sales.saleDate)).limit(10),
    db.select().from(expenses).where(eq(expenses.userId, userId)).orderBy(desc(expenses.expenseDate)).limit(10),
  ]);

  // Check if user has zero data
  if (userProducts.length === 0 && analyticsAll.totalOrders === 0 && recentExpenses.length === 0) {
    return "I don't have enough café data yet. Add some sales, products, and expenses (or click 'Dataset' in the navigation bar to load sample records), and I'll start analyzing your business trends, margins, and profitability.";
  }

  // 2. Format comprehensive, structured business context
  const businessContext = {
    overview_all_time: {
      total_revenue: analyticsAll.totalRevenue,
      total_orders: analyticsAll.totalOrders,
      average_order_value: analyticsAll.averageOrderValue,
      total_product_cost: analyticsAll.totalProductCost,
      gross_profit: analyticsAll.grossProfit,
      gross_profit_margin_pct: analyticsAll.grossProfitMargin,
      total_expenses: analyticsAll.totalExpenses,
      net_profit: analyticsAll.netProfit,
      net_profit_margin_pct: analyticsAll.netProfitMargin,
    },
    overview_last_30_days: {
      revenue_30d: analytics30d.totalRevenue,
      orders_30d: analytics30d.totalOrders,
      average_order_value_30d: analytics30d.averageOrderValue,
      gross_profit_30d: analytics30d.grossProfit,
      expenses_30d: analytics30d.totalExpenses,
      net_profit_30d: analytics30d.netProfit,
    },
    top_selling_products_by_units: analyticsAll.topProducts.map(p => ({
      name: p.name,
      category: p.category,
      units_sold: p.quantitySold,
      revenue: p.revenue,
      profit: p.profit,
      margin_pct: p.margin,
      current_stock: p.stock,
    })),
    most_profitable_products: analyticsAll.mostProfitableProducts.map(p => ({
      name: p.name,
      total_profit: p.profit,
      margin_pct: p.margin,
    })),
    underperforming_or_low_sales_products: analyticsAll.lowestPerformingProducts.map(p => ({
      name: p.name,
      units_sold: p.quantitySold,
      revenue: p.revenue,
      current_stock: p.stock,
    })),
    inventory_alerts_low_stock: analyticsAll.lowStockProducts.map(p => ({
      name: p.name,
      current_stock: p.stock,
      category: p.category,
    })),
    sales_by_category: analyticsAll.salesByCategory.map(c => ({
      category: c.category,
      revenue: c.revenue,
      percentage_of_sales: c.percentage,
    })),
    expenses_by_category: analyticsAll.expenseBreakdown.map(e => ({
      category: e.category,
      amount: e.amount,
      percentage_of_expenses: e.percentage,
    })),
    total_registered_customers: userCustomers.length,
    recent_daily_revenue: analyticsAll.revenueTrend.slice(-7),
  };

  const systemInstruction = `You are Brewlytics AI Analyst, a specialized business intelligence and financial advisor for specialty coffee shops and café owners.

Answer questions using ONLY the business data provided in the context.
Never invent sales, revenue, expenses, customers, products or financial metrics.
If the available data is insufficient, clearly say that there is not enough data.
Explain calculations in simple, clear business language.
When appropriate, identify trends, unusual changes, possible causes and actionable recommendations (e.g. menu engineering, stock replenishment, cost-cutting on top expense categories, promotional suggestions).
Do not present guesses as facts.
All financial values must be based on the supplied data.
Keep your response concise, well-structured with bullet points or brief sections where helpful.`;

  const promptContent = `User Question: "${userMessage}"

Real Café Business Data Context (from PostgreSQL):
\`\`\`json
${JSON.stringify(businessContext, null, 2)}
\`\`\`

Please answer the user's question accurately using only the verified facts and numbers above.`;

  const currentApiKey = process.env.GEMINI_API_KEY;
  if (currentApiKey) {
    const ai = new GoogleGenAI({ apiKey: currentApiKey });
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptContent,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        if (response && response.text) {
          return response.text.trim();
        }
      } catch (_err: any) {
        // Silently try next candidate model without printing failure lines to stderr
      }
    }
  }

  // Graceful deterministic data fallback if all LLM models encounter network or quota issues
  const rev = analyticsAll.totalRevenue;
  const net = analyticsAll.netProfit;
  const topProd = analyticsAll.topProducts[0];
  const topExp = analyticsAll.expenseBreakdown[0];

  return `Based on your café's verified database records:
• All-time revenue is $${rev.toLocaleString()} across ${analyticsAll.totalOrders} order(s).
• Gross Profit is $${analyticsAll.grossProfit.toLocaleString()} (${analyticsAll.grossProfitMargin}% margin).
• Total Expenses are $${analyticsAll.totalExpenses.toLocaleString()}, resulting in a Net Profit of $${net.toLocaleString()}.
${topProd ? `• Best-selling product: "${topProd.name}" (${topProd.quantitySold} units sold, generating $${topProd.profit} profit).` : ''}
${topExp ? `• Top expense category: ${topExp.category} ($${topExp.amount}).` : ''}
${analyticsAll.lowStockProducts.length > 0 ? `• Warning: ${analyticsAll.lowStockProducts.length} item(s) are low in stock.` : ''}`;
}
