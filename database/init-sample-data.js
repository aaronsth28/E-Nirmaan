/**
 * Database Initialization Script
 * Inserts sample users for testing
 * 
 * Usage: node database/init-sample-data.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../src/config/db');

/**
 * Sample users to insert
 * Passwords are hashed versions of: TestPassword123!
 */
const sampleUsers = [
  {
    email: 'admin@enirmaan.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    password: 'TestPassword123!',
  },
  {
    email: 'manager@enirmaan.com',
    firstName: 'Store',
    lastName: 'Manager',
    role: 'STORE_MANAGER',
    password: 'TestPassword123!',
  },
  {
    email: 'engineer@enirmaan.com',
    firstName: 'Site',
    lastName: 'Engineer',
    role: 'SITE_ENGINEER',
    password: 'TestPassword123!',
  },
];

/**
 * Insert sample data into database
 */
const initializeSampleData = async () => {
  try {
    console.log('Starting sample data initialization...\n');

    for (const user of sampleUsers) {
      // Hash password
      const passwordHash = await bcrypt.hash(user.password, 10);

      // Check if user already exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`⚠ User ${user.email} already exists, skipping...`);
        continue;
      }

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (email, first_name, last_name, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, role`,
        [user.email, user.firstName, user.lastName, passwordHash, user.role]
      );

      console.log(`✓ Created user: ${user.email} (${user.role})`);
    }

    console.log('\n✓ Sample data initialization completed!');
    console.log('\nTest users created:');
    sampleUsers.forEach((user) => {
      console.log(`  • ${user.email} (${user.role}) - Password: ${user.password}`);
    });
    console.log('\nYou can now login using these credentials.');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing sample data:', error.message);
    process.exit(1);
  }
};

// Run initialization
initializeSampleData();
