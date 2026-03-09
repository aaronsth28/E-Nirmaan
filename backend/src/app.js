const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorResponse } = require('./utils/response');

/**
 * Express Application Configuration
 * Sets up middleware, routes, and error handling
 */

const app = express();

/**
 * Middleware Configuration
 */

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// CORS configuration for frontend at http://localhost:5173
const corsOptions = {
  origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Request logging middleware (simple console logging)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

/**
 * API Routes
 */

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const projectRoutes = require('./modules/project/project.routes');
const taskRoutes = require('./modules/task/task.routes');
const taskStandaloneRoutes = require('./modules/task/task.standalone.routes');
const userRoutes = require('./modules/user/user.routes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/tasks', taskRoutes);
app.use('/api/tasks', taskStandaloneRoutes);
app.use('/api/users', userRoutes);

/**
 * 404 Not Found Handler
 */
app.use((req, res) => {
  res.status(404).json(
    errorResponse(`Route not found: ${req.method} ${req.path}`, 404)
  );
});

/**
 * Global Error Handling Middleware
 * Must be the last middleware defined
 */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log error details
  console.error('[Error]', {
    statusCode,
    message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  // In production, don't expose internal error details
  if (process.env.NODE_ENV === 'production') {
    return res.status(statusCode).json(
      errorResponse(
        statusCode === 500 ? 'Internal Server Error' : message,
        statusCode
      )
    );
  }

  // In development, include error details
  res.status(statusCode).json(
    errorResponse(message, statusCode, {
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    })
  );
});

module.exports = app;
