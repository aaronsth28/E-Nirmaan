const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { roleMiddleware } = require('../../middlewares/rbac.middleware');
const { successResponse, errorResponse } = require('../../utils/response');
const pool = require('../../config/db');

// GET /api/users?role=SITE_ENGINEER
router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  async (req, res, next) => {
    try {
      const { role } = req.query;
      let query = 'SELECT id, email, first_name, last_name, role, is_active FROM users';
      const params = [];

      if (role) {
        params.push(role);
        query += ` WHERE role = $${params.length}`;
      }

      query += ' ORDER BY first_name, last_name';

      const result = await pool.query(query, params);

      const users = result.rows.map((u) => ({
        id: u.id,
        email: u.email,
        firstName: u.first_name,
        lastName: u.last_name,
        name: `${u.first_name} ${u.last_name}`,
        role: u.role,
        isActive: u.is_active,
      }));

      return res.status(200).json(successResponse(users, 'Users retrieved successfully', 200));
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
