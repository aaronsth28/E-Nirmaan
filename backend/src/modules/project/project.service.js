const pool = require('../../config/db');
const {
  ValidationError,
  DatabaseError,
} = require('../../utils/errors');

/**
 * Project Service
 * Contains all business logic for project operations
 */

/**
 * Create new project
 * @param {object} projectData - Project data
 * @param {string} projectData.name - Project name
 * @param {string} projectData.description - Project description
 * @param {string} projectData.location - Project location
 * @param {number} projectData.budget - Project budget
 * @param {string} projectData.startDate - Project start date
 * @param {string} projectData.endDate - Project end date
 * @param {string} projectData.status - Project status
 * @param {number} createdBy - ID of user creating the project
 * @returns {Promise<object>} Created project object
 * @throws {ValidationError} If validation fails
 * @throws {DatabaseError} If database operation fails
 */
const createProject = async (projectData, createdBy) => {
  const { name, description, location, budget, startDate, endDate, status } = projectData;

  try {
    // Insert new project into database
    const result = await pool.query(
      `INSERT INTO projects (name, description, location, budget, start_date, end_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, description, location, budget, start_date, end_date, status, created_by, created_at`,
      [name, description || null, location, budget || 0, startDate, endDate, status || 'PLANNED', createdBy]
    );

    const project = result.rows[0];

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      location: project.location,
      budget: parseFloat(project.budget),
      startDate: project.start_date,
      endDate: project.end_date,
      status: project.status,
      createdBy: project.created_by,
      createdAt: project.created_at,
    };
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw new DatabaseError(`Failed to create project: ${error.message}`);
  }
};

/**
 * Get all projects
 * @returns {Promise<array>} Array of project objects
 * @throws {DatabaseError} If database operation fails
 */
const getAllProjects = async () => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.location, p.budget, p.start_date, p.end_date, 
              p.status, p.created_by, p.created_at, u.first_name, u.last_name
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       ORDER BY p.created_at DESC`
    );

    return result.rows.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      location: project.location,
      budget: parseFloat(project.budget),
      startDate: project.start_date,
      endDate: project.end_date,
      status: project.status,
      createdBy: project.created_by,
      createdByName: project.first_name && project.last_name
        ? `${project.first_name} ${project.last_name}`
        : null,
      createdAt: project.created_at,
    }));
  } catch (error) {
    throw new DatabaseError(`Failed to fetch projects: ${error.message}`);
  }
};

/**
 * Get project by ID
 * @param {number} id - Project ID
 * @returns {Promise<object|null>} Project object or null if not found
 * @throws {DatabaseError} If database operation fails
 */
const getProjectById = async (id) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.name, p.description, p.location, p.budget, p.start_date, p.end_date, 
              p.status, p.created_by, p.created_at, u.first_name, u.last_name
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const project = result.rows[0];
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      location: project.location,
      budget: parseFloat(project.budget),
      startDate: project.start_date,
      endDate: project.end_date,
      status: project.status,
      createdBy: project.created_by,
      createdByName: project.first_name && project.last_name
        ? `${project.first_name} ${project.last_name}`
        : null,
      createdAt: project.created_at,
    };
  } catch (error) {
    throw new DatabaseError(`Failed to fetch project: ${error.message}`);
  }
};

const deleteProject = async (id) => {
  try {
    const result = await pool.query(
      `DELETE FROM projects WHERE id = $1 RETURNING id, name`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ValidationError('Project not found');
    }

    return {
      id: result.rows[0].id,
      name: result.rows[0].name,
    };
  } catch (error) {
    if (error.statusCode) throw error;
    throw new DatabaseError(`Failed to delete project: ${error.message}`);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject,
};
