const express = require('express');
const router = express.Router();
const projectController = require('./project.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/rbac.middleware');

/**
 * Project Routes
 * Handles all project management API endpoints
 */

/**
 * POST /api/projects
 * Create new project (Admin only)
 * Requires authentication and ADMIN role
 * Request body:
 *   - name: string (required)
 *   - description: string (optional)
 *   - location: string (required)
 *   - budget: number (optional, defaults to 0)
 *   - startDate: string/date (required)
 *   - endDate: string/date (required)
 *   - status: string (optional, defaults to 'PLANNED')
 * Response: { id, name, description, location, budget, startDate, endDate, status, createdBy, createdAt }
 */
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  projectController.createProject
);

/**
 * GET /api/projects
 * Get all projects
 * Requires authentication
 * Response: Array of project objects
 */
router.get(
  '/',
  authMiddleware,
  projectController.getAllProjects
);

/**
 * GET /api/projects/:id
 * Get project by ID
 * Requires authentication
 * Response: Project object
 */
router.get(
  '/:id',
  authMiddleware,
  projectController.getProjectById
);

/**
 * DELETE /api/projects/:id
 * Delete project (Admin only)
 * Cascade deletes associated tasks
 */
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  projectController.deleteProject
);

module.exports = router;
