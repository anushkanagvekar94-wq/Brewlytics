import { Router, Response } from 'express';
import { db } from '../../db/index.ts';
import { chatMessages } from '../../db/schema.ts';
import { and, asc, eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { generateAiResponse } from '../services/aiService.ts';

const router = Router();

// GET chat history
router.get('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const history = await db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(asc(chatMessages.createdAt));

    res.json(history);
  } catch (error: any) {
    console.error('Fetch chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// POST chat message
router.post('/chat', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const trimmedMsg = message.trim();

    // 1. Store user message in DB
    await db.insert(chatMessages).values({
      userId,
      role: 'user',
      message: trimmedMsg,
    });

    // 2. Generate AI response grounded in real database analytics
    const aiAnswer = await generateAiResponse(userId, trimmedMsg);

    // 3. Store AI response in DB
    const insertedAi = await db.insert(chatMessages).values({
      userId,
      role: 'assistant',
      message: aiAnswer,
    }).returning();

    res.json({
      role: 'assistant',
      message: aiAnswer,
      createdAt: insertedAi[0].createdAt,
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process AI chat query' });
  }
});

// DELETE chat history
router.delete('/history', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
    res.json({ message: 'Chat history cleared successfully' });
  } catch (error: any) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

export default router;
