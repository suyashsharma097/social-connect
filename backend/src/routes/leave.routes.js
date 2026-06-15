import express from 'express';
import leaveController from '../controllers/leave.controller.js';
import validate from '../middleware/validation.middleware.js';
import leaveValidation from '../validations/leave.validation.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/balances', leaveController.getBalances);
router.get('/', validate(leaveValidation.getLeaves), leaveController.getLeaves);
router.post('/', validate(leaveValidation.applyLeave), leaveController.applyLeave);
router.post('/:id/review', restrictTo('ADMIN', 'HR', 'MANAGER'), validate(leaveValidation.reviewLeave), leaveController.reviewLeave);

export default router;
