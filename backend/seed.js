// backend/seed.js
// OPTIONAL DEMO SEED SCRIPT
// Run with: node backend/seed.js <user_email>
// This seeds sample specialty coffee shop data into PostgreSQL for a specified user.

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DB_NAME,
});

async function runSeed() {
  const targetEmail = process.argv[2];
  if (!targetEmail) {
    console.error('Usage: node backend/seed.js <user_email>');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    const userRes = await client.query('SELECT id, name FROM users WHERE email = $1', [targetEmail]);
    if (userRes.rows.length === 0) {
      console.error(`User with email "${targetEmail}" not found in database.`);
      process.exit(1);
    }
    const userId = userRes.rows[0].id;
    console.log(`Seeding DEMO DATA for user: ${userRes.rows[0].name} (ID: ${userId})`);

    // Clean existing
    await client.query('DELETE FROM chat_messages WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM expenses WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM sales WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM customers WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM products WHERE user_id = $1', [userId]);

    // Insert sample products
    const p1 = await client.query(`
      INSERT INTO products (user_id, name, category, price, cost, stock)
      VALUES 
      ($1, 'Oat Milk Flat White', 'Espresso', 5.50, 1.40, 180),
      ($1, 'Double Espresso (Ethiopia)', 'Espresso', 4.25, 0.85, 240),
      ($1, 'Nitro Cold Brew', 'Cold Brew', 5.75, 1.20, 85),
      ($1, 'V60 Pour Over (Geisha)', 'Filter Coffee', 9.50, 3.20, 25),
      ($1, 'Artisan Almond Croissant', 'Pastry', 4.75, 2.10, 18),
      ($1, 'Avocado Sourdough Toast', 'Food', 11.50, 4.30, 35),
      ($1, 'Colombia Pink Bourbon 250g', 'Retail Beans', 22.00, 10.00, 4)
      RETURNING id, name, price;
    `, [userId]);

    console.log(`Inserted ${p1.rows.length} sample products.`);
    console.log('Demo seed completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
