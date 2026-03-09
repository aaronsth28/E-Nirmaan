const { successResponse, errorResponse } = require('../../utils/response');
const {
  validateRequiredFields,
  isInAllowedOptions,
  sanitizeString,
} = require('../../utils/validators');
const projectService = require('./project.service');

/**
 * Project Controller
 * Handles HTTP requests and responses
 * Validates input and calls service layer
 */

const ALLOWED_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD'];

/**
 * Create Project Controller (Admin only)
 * Creates a new construction project
 * POST /api/projects
 * @param {object} req - Express request object with body { name, description, location, budget, startDate, endDate, status }
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, location, budget, startDate, endDate, status } = req.body;

    // Validate required fields
    const validation = validateRequiredFields(req.body, ['name', 'location', 'startDate', 'endDate']);
    if (!validation.isValid) {
      return res.status(400).json(
        errorResponse(
          'Missing required fields',
          400,
          validation.missingFields
        )
      );
    }

    // Validate status if provided
    if (status && !isInAllowedOptions(status, ALLOWED_STATUSES)) {
      return res.status(400).json(
        errorResponse(
          `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
          400
        )
      );
    }

    // Validate budget is non-negative
    if (budget !== undefined && budget !== null) {
      const budgetNum = parseFloat(budget);
      if (isNaN(budgetNum) || budgetNum < 0) {
        return res.status(400).json(
          errorResponse('Budget must be a non-negative number', 400)
        );
      }
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime())) {
      return res.status(400).json(
        errorResponse('Invalid start date format', 400)
      );
    }

    if (isNaN(end.getTime())) {
      return res.status(400).json(
        errorResponse('Invalid end date format', 400)
      );
    }

    if (end < start) {
      return res.status(400).json(
        errorResponse('End date must not be before start date', 400)
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeString(name),
      description: description ? sanitizeString(description) : null,
      location: sanitizeString(location),
      budget: budget ? parseFloat(budget) : 0,
      startDate,
      endDate,
      status: status || 'PLANNED',
    };

    // Get user ID from authenticated request
    const createdBy = req.user.id;

    // Call service to create project
    const result = await projectService.createProject(sanitizedData, createdBy);

    return res.status(201).json(
      successResponse(result, 'Project created successfully', 201)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Projects Controller
 * Retrieves all projects
 * GET /api/projects
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware
 */
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects();

    return res.status(200).json(
      successResponse(projects, 'Projects retrieved successfully', 200)
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get Project By ID Controller
 * Retrieves a specific project by ID
 * GET /api/projects/:id
 * @param {object} req - Express request object with params { id }
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware
 */
const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json(
        errorResponse('Invalid project ID', 400)
      );
    }

    const project = await projectService.getProjectById(projectId);

    if (!project) {
      return res.status(404).json(
        errorResponse('Project not found', 404)
      );
    }

    return res.status(200).json(
      successResponse(project, 'Project retrieved successfully', 200)
    );
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const projectId = parseInt(id, 10);
    if (isNaN(projectId)) {
      return res.status(400).json(errorResponse('Invalid project ID', 400));
    }

    const result = await projectService.deleteProject(projectId);
    return res.status(200).json(successResponse(result, 'Project deleted successfully', 200));
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(404).json(errorResponse('Project not found', 404));
    }
    next(error);
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject,
};
