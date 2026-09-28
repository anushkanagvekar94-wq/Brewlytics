import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { products } from '../../db/schema.ts';
import { and, eq, ilike } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';

const router = Router();

// GET all products for authenticated user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const search = req.query.search as string;
    const category = req.query.category as string;

    let conditions = [eq(products.userId, userId)];

    if (search && search.trim()) {
      conditions.push(ilike(products.name, `%${search.trim()}%`));
    }

    if (category && category !== 'All') {
      conditions.push(eq(products.category, category));
    }

    const items = await db.select().from(products).where(and(...conditions)).orderBy(products.name);

    // Calculate profit metrics dynamically
    const enriched = items.map((p) => {
      const profitPerUnit = Number((p.price - p.cost).toFixed(2));
      const profitMargin = p.price > 0 ? Number(((profitPerUnit / p.price) * 100).toFixed(1)) : 0;
      return {
        ...p,
        profitPerUnit,
        profitMargin,
      };
    });

    res.json(enriched);
  } catch (error: any) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST new product
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { name, category, price, cost, stock } = req.body;

    if (!name || !category || price === undefined || cost === undefined) {
      return res.status(400).json({ error: 'Name, category, price, and cost are required' });
    }

    const numPrice = Number(price);
    const numCost = Number(cost);
    const numStock = stock !== undefined ? parseInt(stock, 10) : 0;

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid non-negative number' });
    }
    if (isNaN(numCost) || numCost < 0) {
      return res.status(400).json({ error: 'Cost must be a valid non-negative number' });
    }

    const created = await db.insert(products).values({
      userId,
      name: name.trim(),
      category: category.trim(),
      price: numPrice,
      cost: numCost,
      stock: isNaN(numStock) ? 0 : Math.max(0, numStock),
    }).returning();

    const p = created[0];
    const profitPerUnit = Number((p.price - p.cost).toFixed(2));
    const profitMargin = p.price > 0 ? Number(((profitPerUnit / p.price) * 100).toFixed(1)) : 0;

    res.status(201).json({
      ...p,
      profitPerUnit,
      profitMargin,
    });
  } catch (error: any) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT update product
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const productId = parseInt(req.params.id, 10);
    const { name, category, price, cost, stock } = req.body;

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    // Ensure product belongs to user
    const existing = await db.select().from(products)
      .where(and(eq(products.id, productId), eq(products.userId, userId)))
      .limit(1);

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (category !== undefined) updateData.category = category.trim();
    if (price !== undefined) {
      const np = Number(price);
      if (isNaN(np) || np < 0) return res.status(400).json({ error: 'Invalid price' });
      updateData.price = np;
    }
    if (cost !== undefined) {
      const nc = Number(cost);
      if (isNaN(nc) || nc < 0) return res.status(400).json({ error: 'Invalid cost' });
      updateData.cost = nc;
    }
    if (stock !== undefined) {
      const ns = parseInt(stock, 10);
      updateData.stock = isNaN(ns) ? 0 : Math.max(0, ns);
    }

    const updated = await db.update(products)
      .set(updateData)
      .where(and(eq(products.id, productId), eq(products.userId, userId)))
      .returning();

    const p = updated[0];
    const profitPerUnit = Number((p.price - p.cost).toFixed(2));
    const profitMargin = p.price > 0 ? Number(((profitPerUnit / p.price) * 100).toFixed(1)) : 0;

    res.json({
      ...p,
      profitPerUnit,
      profitMargin,
    });
  } catch (error: any) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE product
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const productId = parseInt(req.params.id, 10);

    if (isNaN(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const deleted = await db.delete(products)
      .where(and(eq(products.id, productId), eq(products.userId, userId)))
      .returning();

    if (deleted.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', id: productId });
  } catch (error: any) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
