const express = require('express');
const router = express.Router({ mergeParams: true });
const taskController = require('./task.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/rbac.middleware');

// POST /api/projects/:projectId/tasks — create task (ADMIN only)
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  taskController.createTask
);

// GET /api/projects/:projectId/tasks — list tasks (ADMIN + SITE_ENGINEER)
router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN', 'SITE_ENGINEER'),
  taskController.getTasksByProject
);

module.exports = router;
