const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL Connection Pool
 * Manages database connections efficiently for production use
 * Implements connection pooling with configurable limits
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'enirmaan',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Connection timeout
});

/**
 * Handle pool connection errors
 */
pool.on('error', (err) => {
  console.error('[DB Pool Error]', err);
  process.exit(-1);
});

/**
 * Test database connection on module load
 */
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('[DB Connection Error]', err);
    process.exit(1);
  } else {
    console.log('✓ Database connected successfully');
  }
});

module.exports = pool;
