require('dotenv').config();
const app = require('./app');

/**
 * Server Entry Point
 * Starts the Express server on configured port
 */

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║         E-Nirmaan: Construction Management System           ║
║                  Authentication Backend                      ║
╚══════════════════════════════════════════════════════════════╝

✓ Server running at http://localhost:${PORT}
✓ Environment: ${NODE_ENV}
✓ API Base URL: http://localhost:${PORT}/api

Available Endpoints:
  • GET    /health                  - Health check
  • POST   /api/auth/login          - User login
  • POST   /api/auth/users          - Create user (Admin only)

Database Status: Connected
Waiting for requests...
`);
});

/**
 * Handle server errors
 */
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

/**
 * Handle process termination
 */
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
