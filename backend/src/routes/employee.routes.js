import express from 'express';
import employeeController from '../controllers/employee.controller.js';
import validate from '../middleware/validation.middleware.js';
import employeeValidation from '../validations/employee.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';
import { employeeUpload } from '../middleware/upload.middleware.js';
import AppError from '../utils/appError.js';

const router = express.Router();

// Self-profile checker middleware
const allowSelfOrAdmin = (req, res, next) => {
  const isSelf = req.user.employee && req.user.employee.id === req.params.id;
  const isManagement = ['ADMIN', 'HR', 'MANAGER'].includes(req.user.role);

  if (!isSelf && !isManagement) {
    return next(new AppError('You do not have permission to access this profile.', 403));
  }
  next();
};

router.use(protect);

router.get('/', restrictTo('ADMIN', 'HR', 'MANAGER'), validate(employeeValidation.queryEmployees), employeeController.getEmployees);
router.get('/:id', allowSelfOrAdmin, validate(employeeValidation.getEmployee), employeeController.getEmployee);

router.post('/', restrictTo('ADMIN', 'HR'), employeeUpload, validate(employeeValidation.createEmployee), employeeController.createEmployee);
router.put('/:id', restrictTo('ADMIN', 'HR'), employeeUpload, validate(employeeValidation.updateEmployee), employeeController.updateEmployee);
router.delete('/:id', restrictTo('ADMIN', 'HR'), validate(employeeValidation.deleteEmployee), employeeController.deleteEmployee);

export default router;
