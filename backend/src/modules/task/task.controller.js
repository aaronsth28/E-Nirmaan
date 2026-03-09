const { successResponse, errorResponse } = require('../../utils/response');
const { validateRequiredFields, isInAllowedOptions, sanitizeString } = require('../../utils/validators');
const taskService = require('./task.service');

const ALLOWED_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'ON_HOLD'];

const createTask = async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) {
      return res.status(400).json(errorResponse('Invalid project ID', 400));
    }

    const { title, description, startDate, endDate, status, assignedTo } = req.body;

    const validation = validateRequiredFields(req.body, ['title']);
    if (!validation.isValid) {
      return res.status(400).json(errorResponse('Missing required fields', 400, validation.missingFields));
    }

    if (status && !isInAllowedOptions(status, ALLOWED_STATUSES)) {
      return res.status(400).json(errorResponse(`Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}`, 400));
    }

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json(errorResponse('End date must not be before start date', 400));
    }

    const taskData = {
      projectId,
      title: sanitizeString(title),
      description: description ? sanitizeString(description) : null,
      startDate: startDate || null,
      endDate: endDate || null,
      status: status || 'PLANNED',
      assignedTo: assignedTo || null,
    };

    const result = await taskService.createTask(taskData, req.user.id);
    return res.status(201).json(successResponse(result, 'Task created successfully', 201));
  } catch (error) {
    next(error);
  }
};

const getTasksByProject = async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) {
      return res.status(400).json(errorResponse('Invalid project ID', 400));
    }

    const tasks = await taskService.getTasksByProject(projectId);
    return res.status(200).json(successResponse(tasks, 'Tasks retrieved successfully', 200));
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json(errorResponse('Invalid task ID', 400));
    }

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      return res.status(404).json(errorResponse('Task not found', 404));
    }

    return res.status(200).json(successResponse(task, 'Task retrieved successfully', 200));
  } catch (error) {
    next(error);
  }
};

const assignTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json(errorResponse('Invalid task ID', 400));
    }

    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json(errorResponse('assignedTo is required', 400));
    }

    const result = await taskService.assignTask(taskId, assignedTo);
    return res.status(200).json(successResponse(result, 'Task assigned successfully', 200));
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json(errorResponse('Invalid task ID', 400));
    }

    const result = await taskService.deleteTask(taskId);
    return res.status(200).json(successResponse(result, 'Task deleted successfully', 200));
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json(errorResponse('Task not found', 404));
    }
    next(error);
  }
};

module.exports = { createTask, getTasksByProject, getTaskById, assignTask, deleteTask };
