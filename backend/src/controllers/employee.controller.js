import employeeService from '../services/employee.service.js';
import logger from '../config/logger.js';

const getEmployee = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    logger.info('Creating new employee profile.');
    const employee = await employeeService.createEmployee(req.body, req.files);
    res.status(201).json({
      status: 'success',
      message: 'Employee profile created successfully.',
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    logger.info(`Updating employee profile with ID: ${req.params.id}`);
    const employee = await employeeService.updateEmployee(req.params.id, req.body, req.files);
    res.status(200).json({
      status: 'success',
      message: 'Employee profile updated successfully.',
      data: { employee },
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    logger.info(`Deleting employee profile with ID: ${req.params.id}`);
    await employeeService.deleteEmployee(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'Employee profile deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || '',
      departmentId: req.query.departmentId || '',
    };
    const result = await employeeService.getAllEmployees(filters);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployees,
};
