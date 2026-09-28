import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'brewlytics-secret-key-specialty-coffee-intelligence';

export interface AuthRequest extends Request {
  user?: typeof users.$inferSelect;
  userId?: number;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // Try standard JWT first
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    if (decoded && decoded.userId) {
      const userList = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
      if (userList.length > 0) {
        req.user = userList[0];
        req.userId = userList[0].id;
        return next();
      }
    }
  } catch (_jwtErr) {
    // JWT verification failed, attempt Firebase ID token verification
  }

  // Try Firebase Auth verification
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (decodedToken && decodedToken.uid) {
      // Find or create user
      let userList = await db.select().from(users).where(eq(users.uid, decodedToken.uid)).limit(1);
      if (userList.length === 0) {
        // Upsert by email or insert
        const email = decodedToken.email || `${decodedToken.uid}@brewlytics.local`;
        const name = decodedToken.name || email.split('@')[0] || 'Café Owner';
        
        const createdUsers = await db.insert(users).values({
          uid: decodedToken.uid,
          name,
          email,
          cafeName: 'My Specialty Café',
          currency: '$',
          timezone: 'UTC',
        }).onConflictDoUpdate({
          target: users.email,
          set: { uid: decodedToken.uid, name },
        }).returning();

        req.user = createdUsers[0];
        req.userId = createdUsers[0].id;
      } else {
        req.user = userList[0];
        req.userId = userList[0].id;
      }
      return next();
    }
  } catch (firebaseErr) {
    console.error('Auth verification failed:', firebaseErr);
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  return res.status(401).json({ error: 'Unauthorized: User not found' });
};
