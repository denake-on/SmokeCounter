// Example backend server for smoking counter app
// This is an example that could be deployed on platforms like Vercel, Netlify, or any Node.js hosting
// It includes support for Upstash Redis and Neon PostgreSQL

const express = require('express');
const { createClient } = require('@upstash/redis');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// Determine storage method based on environment
let useRedis = false;
let usePostgreSQL = false;

if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  // Initialize Upstash Redis client
  const redisClient = createClient({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
  });

  useRedis = true;
  console.log('Using Upstash Redis for storage');
} else if (process.env.DATABASE_URL) {
  // Initialize PostgreSQL pool for Neon
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  usePostgreSQL = true;
  console.log('Using Neon PostgreSQL for storage');

  // Initialize table if needed
  async function initializeTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS smoking_counts (
          id SERIAL PRIMARY KEY,
          date DATE UNIQUE,
          count INTEGER DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (err) {
      console.error('Error initializing table:', err);
    }
  }

  initializeTable();
} else {
  console.log('Using in-memory storage (for development)');
}

// In-memory storage for development
let smokingCounts = {};

// Get counter value
app.get('/counter', async (req, res) => {
  const today = new Date().toDateString();

  try {
    let count = 0;

    if (useRedis) {
      const value = await redisClient.get(`smoking_count:${today}`);
      count = value ? parseInt(value) : 0;
    } else if (usePostgreSQL) {
      const result = await pool.query(
        'SELECT count FROM smoking_counts WHERE date = $1',
        [new Date().toISOString().split('T')[0]]
      );

      if (result.rows.length > 0) {
        count = result.rows[0].count;
      } else {
        // If no record for today, return 0
        count = 0;
      }
    } else {
      // Using in-memory storage
      count = smokingCounts[today] || 0;
    }

    res.json({ date: today, count });
  } catch (error) {
    console.error('Error getting counter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update counter value
app.post('/counter', async (req, res) => {
  const { date, count } = req.body;

  if (typeof count !== 'number' || count < 0) {
    return res.status(400).json({ error: 'Invalid count value' });
  }

  try {
    if (useRedis) {
      // Store in Upstash Redis with 24-hour expiration + 1 hour buffer
      await redisClient.setex(`smoking_count:${date}`, 25 * 60 * 60, count.toString());
    } else if (usePostgreSQL) {
      const result = await pool.query(`
        INSERT INTO smoking_counts (date, count)
        VALUES ($1, $2)
        ON CONFLICT (date)
        DO UPDATE SET count = $2, updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [date, count]);
    } else {
      // Using in-memory storage
      smokingCounts[date] = count;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating counter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset all counts (admin endpoint)
app.post('/reset', async (req, res) => {
  const password = req.headers['admin-password'];

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (useRedis) {
      // Clear all smoking count keys from Redis
      const keys = await redisClient.keys('smoking_count:*');
      if (keys.length > 0) {
        await redisClient.del(...keys); // Use spread operator for del
      }
    } else if (usePostgreSQL) {
      // Clear all records from PostgreSQL
      await pool.query('DELETE FROM smoking_counts');
    } else {
      // Clear in-memory storage
      smokingCounts = {};
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting counters:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});