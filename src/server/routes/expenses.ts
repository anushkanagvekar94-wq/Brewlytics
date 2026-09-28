import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { expenses } from '../../db/schema.ts';
import { and, desc, eq, gte, ilike, lte } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';

const router = Router();

// GET expenses for user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let conditions = [eq(expenses.userId, userId)];

    if (search && search.trim()) {
      conditions.push(ilike(expenses.description, `%${search.trim()}%`));
    }

    if (category && category !== 'All') {
      conditions.push(eq(expenses.category, category));
    }

    if (startDate) {
      conditions.push(gte(expenses.expenseDate, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(expenses.expenseDate, new Date(endDate)));
    }

    const list = await db.select().from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.expenseDate));

    res.json(list);
  } catch (error: any) {
    console.error('Fetch expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// POST new expense
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { category, description, amount, expenseDate } = req.body;

    if (!category || !description || amount === undefined) {
      return res.status(400).json({ error: 'Category, description, and amount are required' });
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const dateVal = expenseDate ? new Date(expenseDate) : new Date();

    const created = await db.insert(expenses).values({
      userId,
      category: category.trim(),
      description: description.trim(),
      amount: numAmount,
      expenseDate: dateVal,
    }).returning();

    res.status(201).json(created[0]);
  } catch (error: any) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// PUT update expense
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const expenseId = parseInt(req.params.id, 10);
    const { category, description, amount, expenseDate } = req.body;

    if (isNaN(expenseId)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const existing = await db.select().from(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updateData: any = {};
    if (category !== undefined) updateData.category = category.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }
      updateData.amount = numAmount;
    }
    if (expenseDate !== undefined) {
      updateData.expenseDate = new Date(expenseDate);
    }

    const updated = await db.update(expenses)
      .set(updateData)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
      .returning();

    res.json(updated[0]);
  } catch (error: any) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

// DELETE expense
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const expenseId = parseInt(req.params.id, 10);

    if (isNaN(expenseId)) {
      return res.status(400).json({ error: 'Invalid expense ID' });
    }

    const deleted = await db.delete(expenses)
      .where(and(eq(expenses.id, expenseId), eq(expenses.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully', id: expenseId });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
