import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { sales, saleItems, products, customers } from '../../db/schema.ts';
import { and, desc, eq, gte, ilike, lte, or, inArray } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';

const router = Router();

// GET all sales for user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const search = req.query.search as string;
    const paymentMethod = req.query.paymentMethod as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let conditions = [eq(sales.userId, userId)];

    if (paymentMethod && paymentMethod !== 'All') {
      conditions.push(eq(sales.paymentMethod, paymentMethod));
    }

    if (startDate) {
      conditions.push(gte(sales.saleDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(sales.saleDate, new Date(endDate)));
    }

    // Fetch sales with customer info
    const salesList = await db.select({
      id: sales.id,
      saleDate: sales.saleDate,
      paymentMethod: sales.paymentMethod,
      totalAmount: sales.totalAmount,
      notes: sales.notes,
      customerId: sales.customerId,
      customerName: customers.name,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(sales.saleDate));

    // If search filter provided, filter by customerName or ID
    let filteredSales = salesList;
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filteredSales = salesList.filter(s => 
        (s.customerName && s.customerName.toLowerCase().includes(q)) ||
        s.id.toString().includes(q) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }

    res.json(filteredSales);
  } catch (error: any) {
    console.error('Fetch sales error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// GET single sale with items
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const saleId = parseInt(req.params.id, 10);

    if (isNaN(saleId)) {
      return res.status(400).json({ error: 'Invalid sale ID' });
    }

    const saleRecord = await db.select({
      id: sales.id,
      saleDate: sales.saleDate,
      paymentMethod: sales.paymentMethod,
      totalAmount: sales.totalAmount,
      notes: sales.notes,
      customerId: sales.customerId,
      customerName: customers.name,
      customerEmail: customers.email,
      customerPhone: customers.phone,
      createdAt: sales.createdAt,
    })
    .from(sales)
    .leftJoin(customers, eq(sales.customerId, customers.id))
    .where(and(eq(sales.id, saleId), eq(sales.userId, userId)))
    .limit(1);

    if (saleRecord.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Fetch sale items
    const items = await db.select({
      id: saleItems.id,
      productId: saleItems.productId,
      productName: products.name,
      productCategory: products.category,
      unitPrice: saleItems.unitPrice,
      quantity: saleItems.quantity,
      totalPrice: saleItems.totalPrice,
    })
    .from(saleItems)
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(eq(saleItems.saleId, saleId));

    res.json({
      ...saleRecord[0],
      items,
    });
  } catch (error: any) {
    console.error('Fetch sale detail error:', error);
    res.status(500).json({ error: 'Failed to fetch sale detail' });
  }
});

// POST new sale
// Calculate total dynamically on backend; verify products belong to user; update stock
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { customerId, paymentMethod, saleDate, items, notes } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one product item is required' });
    }

    // Extract product IDs
    const itemReqs = items.map((i: any) => ({
      productId: parseInt(i.productId, 10),
      quantity: Math.max(1, parseInt(i.quantity, 10) || 1),
    }));

    const productIds = itemReqs.map(i => i.productId).filter(id => !isNaN(id));

    if (productIds.length !== itemReqs.length) {
      return res.status(400).json({ error: 'Invalid product selected' });
    }

    // Fetch actual products from DB for this user to get true prices and stock
    const dbProducts = await db.select().from(products)
      .where(and(eq(products.userId, userId), inArray(products.id, productIds)));

    if (dbProducts.length !== productIds.length) {
      return res.status(400).json({ error: 'One or more products were not found or do not belong to you' });
    }

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    let calculatedTotal = 0;
    const preparedItems: {
      productId: number;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];

    for (const item of itemReqs) {
      const p = productMap.get(item.productId)!;
      const unitPrice = p.price;
      const lineTotal = Number((unitPrice * item.quantity).toFixed(2));
      calculatedTotal += lineTotal;
      preparedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice: lineTotal,
      });
    }

    calculatedTotal = Number(calculatedTotal.toFixed(2));

    // Verify customer if provided
    let verifiedCustomerId: number | null = null;
    if (customerId) {
      const parsedCustId = parseInt(customerId, 10);
      if (!isNaN(parsedCustId)) {
        const cust = await db.select().from(customers)
          .where(and(eq(customers.id, parsedCustId), eq(customers.userId, userId)))
          .limit(1);
        if (cust.length > 0) {
          verifiedCustomerId = parsedCustId;
        }
      }
    }

    const saleDateObj = saleDate ? new Date(saleDate) : new Date();

    // Insert sale record
    const createdSales = await db.insert(sales).values({
      userId,
      customerId: verifiedCustomerId,
      saleDate: saleDateObj,
      paymentMethod: paymentMethod.trim(),
      totalAmount: calculatedTotal,
      notes: notes ? notes.trim() : null,
    }).returning();

    const createdSale = createdSales[0];

    // Insert sale items and decrement stock
    for (const item of preparedItems) {
      await db.insert(saleItems).values({
        saleId: createdSale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
      });

      const p = productMap.get(item.productId)!;
      const newStock = Math.max(0, p.stock - item.quantity);
      await db.update(products)
        .set({ stock: newStock })
        .where(eq(products.id, item.productId));
    }

    res.status(201).json({
      ...createdSale,
      items: preparedItems,
    });
  } catch (error: any) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// DELETE sale
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const saleId = parseInt(req.params.id, 10);

    if (isNaN(saleId)) {
      return res.status(400).json({ error: 'Invalid sale ID' });
    }

    // Fetch sale items to restore stock
    const items = await db.select().from(saleItems).where(eq(saleItems.saleId, saleId));

    const deleted = await db.delete(sales)
      .where(and(eq(sales.id, saleId), eq(sales.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Restore stock for deleted sale
    for (const item of items) {
      const p = await db.select().from(products).where(eq(products.id, item.productId)).limit(1);
      if (p.length > 0) {
        await db.update(products)
          .set({ stock: p[0].stock + item.quantity })
          .where(eq(products.id, item.productId));
      }
    }

    res.json({ message: 'Sale deleted successfully and inventory restored', id: saleId });
  } catch (error: any) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

export default router;
