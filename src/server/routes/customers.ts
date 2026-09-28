import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { customers, sales } from '../../db/schema.ts';
import { and, desc, eq, ilike } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';

const router = Router();

// GET all customers for user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const search = req.query.search as string;

    let conditions = [eq(customers.userId, userId)];

    if (search && search.trim()) {
      conditions.push(ilike(customers.name, `%${search.trim()}%`));
    }

    const list = await db.select().from(customers).where(and(...conditions)).orderBy(customers.name);
    res.json(list);
  } catch (error: any) {
    console.error('Fetch customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET single customer with purchase history
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const customerId = parseInt(req.params.id, 10);

    if (isNaN(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const list = await db.select().from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
      .limit(1);

    if (list.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = list[0];
    const customerSales = await db.select().from(sales)
      .where(and(eq(sales.customerId, customerId), eq(sales.userId, userId)))
      .orderBy(desc(sales.saleDate));

    res.json({
      ...customer,
      sales: customerSales,
      totalSpend: customerSales.reduce((acc, s) => acc + s.totalAmount, 0),
      totalOrders: customerSales.length,
    });
  } catch (error: any) {
    console.error('Fetch customer detail error:', error);
    res.status(500).json({ error: 'Failed to fetch customer detail' });
  }
});

// POST new customer
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, email, phone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    const created = await db.insert(customers).values({
      userId,
      name: name.trim(),
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
    }).returning();

    res.status(201).json(created[0]);
  } catch (error: any) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT update customer
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const customerId = parseInt(req.params.id, 10);
    const { name, email, phone } = req.body;

    if (isNaN(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const existing = await db.select().from(customers)
      .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;

    const updated = await db.update(customers)
      .set(updateData)
      .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE customer
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const customerId = parseInt(req.params.id, 10);

    if (isNaN(customerId)) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const deleted = await db.delete(customers)
      .where(and(eq(customers.id, customerId), eq(customers.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully', id: customerId });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
