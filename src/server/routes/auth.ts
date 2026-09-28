import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../../db/index.ts';
import { users, products } from '../../db/schema.ts';
import { eq } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../../middleware/auth.ts';
import { adminAuth } from '../../lib/firebase-admin.ts';
import { seedUserDemoData } from './demo.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'brewlytics-secret-key-specialty-coffee-intelligence';

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check existing email
    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const customUid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newUsers = await db.insert(users).values({
      uid: customUid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      cafeName: `${name.trim()}'s Coffee Bar`,
      currency: '$',
      timezone: 'UTC',
    }).returning();

    const createdUser = newUsers[0];
    
    // Automatically seed starter specialty café dataset so new users have instant analytics & working AI
    try {
      await seedUserDemoData(createdUser.id);
    } catch (seedErr) {
      console.warn('Auto-seed starter data notice:', seedErr);
    }

    const token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        cafeName: createdUser.cafeName,
        currency: createdUser.currency,
        timezone: createdUser.timezone,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const foundUsers = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (foundUsers.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = foundUsers[0];
    if (!user.passwordHash) {
      return res.status(400).json({ error: 'This account was signed in via Google. Please use Google Sign-In.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cafeName: user.cafeName,
        currency: user.currency,
        timezone: user.timezone,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in. Please try again.' });
  }
});

// 1-Click Instant Demo Login for reviewers & visitors
router.post('/demo-login', async (_req, res: Response) => {
  try {
    const demoEmail = 'elena.barista@brewlytics.coffee';
    let userList = await db.select().from(users).where(eq(users.email, demoEmail)).limit(1);
    let user;
    if (userList.length === 0) {
      const created = await db.insert(users).values({
        uid: 'demo_barista_uid_main',
        name: 'Elena Rostova',
        email: demoEmail,
        cafeName: "Elena's Artisan Roastery",
        currency: '$',
        timezone: 'UTC',
      }).returning();
      user = created[0];
      await seedUserDemoData(user.id);
    } else {
      user = userList[0];
      const prods = await db.select().from(products).where(eq(products.userId, user.id)).limit(1);
      if (prods.length === 0) {
        await seedUserDemoData(user.id);
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cafeName: user.cafeName,
        currency: user.currency,
        timezone: user.timezone,
      },
    });
  } catch (error: any) {
    console.error('Demo login error:', error);
    res.status(500).json({ error: 'Failed to launch demo café' });
  }
});

// Firebase / Google Sign-In exchange
router.post('/firebase-login', async (req, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required' });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = decoded.email || `${decoded.uid}@brewlytics.local`;
    const name = decoded.name || email.split('@')[0] || 'Café Owner';

    // Upsert user
    const existing = await db.select().from(users).where(eq(users.uid, decoded.uid)).limit(1);
    let user;
    if (existing.length === 0) {
      const created = await db.insert(users).values({
        uid: decoded.uid,
        name,
        email: email.toLowerCase(),
        cafeName: `${name}'s Roastery & Café`,
        currency: '$',
        timezone: 'UTC',
      }).onConflictDoUpdate({
        target: users.email,
        set: { uid: decoded.uid, name },
      }).returning();
      user = created[0];
      try {
        await seedUserDemoData(user.id);
      } catch (seedErr) {
        console.warn('Auto-seed starter data notice for Google user:', seedErr);
      }
    } else {
      user = existing[0];
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cafeName: user.cafeName,
        currency: user.currency,
        timezone: user.timezone,
      },
    });
  } catch (error: any) {
    console.error('Firebase login error:', error);
    res.status(401).json({ error: 'Firebase authentication failed' });
  }
});

// Current User Me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    cafeName: req.user.cafeName,
    currency: req.user.currency,
    timezone: req.user.timezone,
  });
});

// Update Profile & Business info
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Unauthorized' });
    const { name, cafeName, currency, timezone } = req.body;

    const updated = await db.update(users)
      .set({
        name: name !== undefined ? name : req.user?.name,
        cafeName: cafeName !== undefined ? cafeName : req.user?.cafeName,
        currency: currency !== undefined ? currency : req.user?.currency,
        timezone: timezone !== undefined ? timezone : req.user?.timezone,
      })
      .where(eq(users.id, req.userId))
      .returning();

    const u = updated[0];
    res.json({
      id: u.id,
      name: u.name,
      email: u.email,
      cafeName: u.cafeName,
      currency: u.currency,
      timezone: u.timezone,
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile settings' });
  }
});

// Change Password
router.put('/change-password', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId || !req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    if (req.user.passwordHash) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required' });
      }
      const isMatch = await bcrypt.compare(currentPassword, req.user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password incorrect' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await db.update(users)
      .set({ passwordHash })
      .where(eq(users.id, req.userId));

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
