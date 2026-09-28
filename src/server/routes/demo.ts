import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { products, customers, sales, saleItems, expenses, chatMessages } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';

const router = Router();

export async function seedUserDemoData(userId: number) {
  // 1. Clear any existing data for this user first
  await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
  await db.delete(expenses).where(eq(expenses.userId, userId));
  await db.delete(sales).where(eq(sales.userId, userId));
  await db.delete(customers).where(eq(customers.userId, userId));
  await db.delete(products).where(eq(products.userId, userId));

  // 2. Insert Sample Specialty Coffee Products
  const sampleProducts = [
    { name: 'Oat Milk Flat White', category: 'Espresso', price: 5.50, cost: 1.40, stock: 180 },
    { name: 'Double Espresso (Ethiopia Yirgacheffe)', category: 'Espresso', price: 4.25, cost: 0.85, stock: 240 },
    { name: 'Vanilla Bean Latte', category: 'Espresso', price: 6.00, cost: 1.65, stock: 150 },
    { name: 'Nitro Cold Brew (Single Origin)', category: 'Cold Brew', price: 5.75, cost: 1.20, stock: 85 },
    { name: 'Kyoto-Style Drip Cold Brew', category: 'Cold Brew', price: 6.50, cost: 1.50, stock: 40 },
    { name: 'V60 Pour Over (Panama Geisha)', category: 'Filter Coffee', price: 9.50, cost: 3.20, stock: 25 },
    { name: 'Japanese Batch Brew', category: 'Filter Coffee', price: 4.00, cost: 0.70, stock: 120 },
    { name: 'Artisan Almond Croissant', category: 'Pastry', price: 4.75, cost: 2.10, stock: 18 },
    { name: 'Cardamom Cinnamon Bun', category: 'Pastry', price: 5.00, cost: 2.25, stock: 14 },
    { name: 'Sourdough Avocado Toast', category: 'Food', price: 11.50, cost: 4.30, stock: 35 },
    { name: 'Ethiopia Sidama 250g Beans', category: 'Retail Beans', price: 18.00, cost: 8.50, stock: 8 },
    { name: 'Colombia Pink Bourbon 250g Beans', category: 'Retail Beans', price: 22.00, cost: 10.00, stock: 4 }, // Low stock alert!
  ];

  const insertedProducts = await db.insert(products).values(
    sampleProducts.map(p => ({ ...p, userId }))
  ).returning();

  // 3. Insert Sample Customers
  const sampleCustomers = [
    { name: 'Elena Rostova', email: 'elena@creative.studio', phone: '+1 555-0144' },
    { name: 'Marcus Chen', email: 'marcus.c@techcorp.io', phone: '+1 555-0182' },
    { name: 'Sophia Sterling', email: 'sophia@archdesign.com', phone: '+1 555-0199' },
    { name: 'Liam Davies', email: 'liam@cityrunning.club', phone: '+1 555-0210' },
    { name: 'Aria Patel', email: 'aria.p@medcenter.org', phone: '+1 555-0322' },
  ];

  const insertedCustomers = await db.insert(customers).values(
    sampleCustomers.map(c => ({ ...c, userId }))
  ).returning();

  // 4. Insert Realistic Sales over past 14 days
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const paymentMethods = ['Card', 'Card', 'Mobile / Apple Pay', 'Cash'];

  const salesToGenerate = [
    { daysAgo: 13, custIdx: 0, items: [{ pIdx: 0, q: 2 }, { pIdx: 7, q: 1 }] },
    { daysAgo: 12, custIdx: 1, items: [{ pIdx: 3, q: 1 }, { pIdx: 9, q: 1 }] },
    { daysAgo: 11, custIdx: 2, items: [{ pIdx: 5, q: 1 }, { pIdx: 10, q: 1 }] },
    { daysAgo: 10, custIdx: 3, items: [{ pIdx: 1, q: 2 }, { pIdx: 8, q: 2 }] },
    { daysAgo: 9, custIdx: 4, items: [{ pIdx: 0, q: 3 }, { pIdx: 7, q: 2 }] },
    { daysAgo: 8, custIdx: 0, items: [{ pIdx: 2, q: 2 }, { pIdx: 9, q: 1 }] },
    { daysAgo: 7, custIdx: 1, items: [{ pIdx: 3, q: 2 }, { pIdx: 4, q: 1 }] },
    { daysAgo: 6, custIdx: 2, items: [{ pIdx: 5, q: 2 }, { pIdx: 11, q: 1 }] },
    { daysAgo: 5, custIdx: 3, items: [{ pIdx: 0, q: 4 }, { pIdx: 8, q: 3 }] },
    { daysAgo: 4, custIdx: 4, items: [{ pIdx: 6, q: 2 }, { pIdx: 9, q: 2 }] },
    { daysAgo: 3, custIdx: 0, items: [{ pIdx: 0, q: 2 }, { pIdx: 2, q: 1 }, { pIdx: 7, q: 2 }] },
    { daysAgo: 2, custIdx: 1, items: [{ pIdx: 3, q: 3 }, { pIdx: 4, q: 2 }] },
    { daysAgo: 1, custIdx: 2, items: [{ pIdx: 5, q: 1 }, { pIdx: 10, q: 2 }, { pIdx: 0, q: 2 }] },
    { daysAgo: 0, custIdx: 3, items: [{ pIdx: 0, q: 3 }, { pIdx: 9, q: 1 }, { pIdx: 1, q: 2 }] },
    { daysAgo: 0, custIdx: 4, items: [{ pIdx: 2, q: 2 }, { pIdx: 8, q: 1 }] },
  ];

  for (let i = 0; i < salesToGenerate.length; i++) {
    const sPlan = salesToGenerate[i];
    const saleDate = new Date(now - sPlan.daysAgo * dayMs - (i * 3600000));
    const payMethod = paymentMethods[i % paymentMethods.length];
    const customer = insertedCustomers[sPlan.custIdx];

    // Calculate total
    let saleTotal = 0;
    const lineItems = sPlan.items.map(it => {
      const prod = insertedProducts[it.pIdx];
      const lineTotal = Number((prod.price * it.q).toFixed(2));
      saleTotal += lineTotal;
      return {
        productId: prod.id,
        quantity: it.q,
        unitPrice: prod.price,
        totalPrice: lineTotal,
      };
    });

    saleTotal = Number(saleTotal.toFixed(2));

    const newSale = await db.insert(sales).values({
      userId,
      customerId: customer.id,
      saleDate,
      paymentMethod: payMethod,
      totalAmount: saleTotal,
      notes: `Order #${1000 + i}`,
    }).returning();

    for (const line of lineItems) {
      await db.insert(saleItems).values({
        saleId: newSale[0].id,
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalPrice: line.totalPrice,
      });
    }
  }

  // 5. Insert Sample Expenses
  const sampleExpenses = [
    { category: 'Ingredients', description: 'Oat Milk, Whole Milk & Syrups supply', amount: 320.00, daysAgo: 12 },
    { category: 'Ingredients', description: 'Specialty Green Coffee Roaster Batch', amount: 580.00, daysAgo: 10 },
    { category: 'Rent', description: 'Monthly Café Floor Space Lease', amount: 1850.00, daysAgo: 14 },
    { category: 'Utilities', description: 'Commercial Espresso Electricity & Water Filtration', amount: 240.00, daysAgo: 8 },
    { category: 'Equipment', description: 'La Marzocco Grouphead Gaskets & Maintenance', amount: 165.00, daysAgo: 6 },
    { category: 'Staff', description: 'Barista shifts & weekend staff wages', amount: 950.00, daysAgo: 3 },
    { category: 'Marketing', description: 'Local Specialty Coffee Map Sponsorship & Stickers', amount: 110.00, daysAgo: 2 },
  ];

  for (const exp of sampleExpenses) {
    await db.insert(expenses).values({
      userId,
      category: exp.category,
      description: exp.description,
      amount: exp.amount,
      expenseDate: new Date(now - exp.daysAgo * dayMs),
    });
  }

  // 6. Insert Welcome AI Analyst message
  await db.insert(chatMessages).values({
    userId,
    role: 'assistant',
    message: "Welcome to Brewlytics! I have loaded your demo specialty café records. I can analyze your sales trends, top margins (like your Oat Milk Flat White and Panama Geisha), inventory shortages, and expense breakdowns. Ask me anything about your café's numbers!",
  });
}

// POST /api/demo/seed — explicitly populates DEMO DATA for the requesting user
router.post('/seed', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await seedUserDemoData(userId);
    res.json({ message: 'DEMO DATA loaded successfully! You can explore all modules and charts.' });
  } catch (error: any) {
    console.error('Seed demo data error:', error);
    res.status(500).json({ error: 'Failed to seed demo data' });
  }
});

// POST /api/demo/clear — resets data to clean empty state
router.post('/clear', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
    await db.delete(expenses).where(eq(expenses.userId, userId));
    await db.delete(sales).where(eq(sales.userId, userId));
    await db.delete(customers).where(eq(customers.userId, userId));
    await db.delete(products).where(eq(products.userId, userId));

    res.json({ message: 'All café business data cleared. Database is now completely empty.' });
  } catch (error: any) {
    console.error('Clear data error:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

export default router;
