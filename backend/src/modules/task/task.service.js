const pool = require('../../config/db');
const { DatabaseError, NotFoundError } = require('../../utils/errors');

const createTask = async (taskData, createdBy) => {
  const { projectId, title, description, startDate, endDate, status, assignedTo } = taskData;

  try {
    // Verify project exists
    const project = await pool.query('SELECT id FROM projects WHERE id = $1', [projectId]);
    if (project.rows.length === 0) {
      throw new NotFoundError('Project not found');
    }

    // If assignedTo is provided, verify user exists and is SITE_ENGINEER
    if (assignedTo) {
      const user = await pool.query('SELECT id, role FROM users WHERE id = $1', [assignedTo]);
      if (user.rows.length === 0) {
        throw new NotFoundError('Assigned user not found');
      }
      if (user.rows[0].role !== 'SITE_ENGINEER') {
        throw new DatabaseError('User must have SITE_ENGINEER role');
      }
    }

    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, start_date, end_date, status, assigned_to, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, project_id, title, description, start_date, end_date, status, assigned_to, created_by, created_at`,
      [projectId, title, description || null, startDate || null, endDate || null, status || 'PLANNED', assignedTo || null, createdBy]
    );

    const task = result.rows[0];
    return {
      id: task.id,
      projectId: task.project_id,
      title: task.title,
      description: task.description,
      startDate: task.start_date,
      endDate: task.end_date,
      status: task.status,
      assignedTo: task.assigned_to,
      createdBy: task.created_by,
      createdAt: task.created_at,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new DatabaseError(`Failed to create task: ${error.message}`);
  }
};

const getTasksByProject = async (projectId) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.project_id, t.title, t.description, t.start_date, t.end_date,
              t.status, t.assigned_to, t.created_by, t.created_at,
              u.first_name AS assigned_first, u.last_name AS assigned_last
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.project_id = $1
       ORDER BY t.created_at DESC`,
      [projectId]
    );

    return result.rows.map((t) => ({
      id: t.id,
      projectId: t.project_id,
      title: t.title,
      description: t.description,
      startDate: t.start_date,
      endDate: t.end_date,
      status: t.status,
      assignedTo: t.assigned_to,
      assignedName: t.assigned_first && t.assigned_last
        ? `${t.assigned_first} ${t.assigned_last}`
        : null,
      createdBy: t.created_by,
      createdAt: t.created_at,
    }));
  } catch (error) {
    throw new DatabaseError(`Failed to fetch tasks: ${error.message}`);
  }
};

const getTaskById = async (id) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.project_id, t.title, t.description, t.start_date, t.end_date,
              t.status, t.assigned_to, t.created_by, t.created_at,
              u.first_name AS assigned_first, u.last_name AS assigned_last
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;

    const t = result.rows[0];
    return {
      id: t.id,
      projectId: t.project_id,
      title: t.title,
      description: t.description,
      startDate: t.start_date,
      endDate: t.end_date,
      status: t.status,
      assignedTo: t.assigned_to,
      assignedName: t.assigned_first && t.assigned_last
        ? `${t.assigned_first} ${t.assigned_last}`
        : null,
      createdBy: t.created_by,
      createdAt: t.created_at,
    };
  } catch (error) {
    throw new DatabaseError(`Failed to fetch task: ${error.message}`);
  }
};

const assignTask = async (taskId, assignedTo) => {
  try {
    // Verify user exists and is SITE_ENGINEER
    const user = await pool.query('SELECT id, role FROM users WHERE id = $1', [assignedTo]);
    if (user.rows.length === 0) {
      throw new NotFoundError('User not found');
    }
    if (user.rows[0].role !== 'SITE_ENGINEER') {
      throw new DatabaseError('User must have SITE_ENGINEER role');
    }

    const result = await pool.query(
      `UPDATE tasks SET assigned_to = $1 WHERE id = $2
       RETURNING id, project_id, title, description, start_date, end_date, status, assigned_to, created_by, created_at`,
      [assignedTo, taskId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Task not found');
    }

    const t = result.rows[0];
    return {
      id: t.id,
      projectId: t.project_id,
      title: t.title,
      description: t.description,
      startDate: t.start_date,
      endDate: t.end_date,
      status: t.status,
      assignedTo: t.assigned_to,
      createdBy: t.created_by,
      createdAt: t.created_at,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new DatabaseError(`Failed to assign task: ${error.message}`);
  }
};

const deleteTask = async (taskId) => {
  try {
    const result = await pool.query(
      `DELETE FROM tasks WHERE id = $1 RETURNING id, title`,
      [taskId]
    );
    if (result.rows.length === 0) {
      throw new NotFoundError('Task not found');
    }
    return { id: result.rows[0].id, title: result.rows[0].title };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new DatabaseError(`Failed to delete task: ${error.message}`);
  }
};

module.exports = { createTask, getTasksByProject, getTaskById, assignTask, deleteTask };
