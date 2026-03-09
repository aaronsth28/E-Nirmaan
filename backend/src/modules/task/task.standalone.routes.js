const express = require('express');
const router = express.Router();
const taskController = require('./task.controller');
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/rbac.middleware');

// GET /api/tasks/:id — get single task
router.get(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN', 'SITE_ENGINEER'),
  taskController.getTaskById
);

// PUT /api/tasks/:id/assign — assign task to engineer (ADMIN only)
router.put(
  '/:id/assign',
  authMiddleware,
  roleMiddleware('ADMIN'),
  taskController.assignTask
);

// DELETE /api/tasks/:id — delete task (ADMIN only)
router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  taskController.deleteTask
);

module.exports = router;
