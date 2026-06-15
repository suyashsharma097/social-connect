import express from 'express';
import masterController from '../controllers/master.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/departments', masterController.getDepartments);
router.post('/departments', restrictTo('ADMIN', 'HR'), masterController.createDepartment);

router.get('/skills', masterController.getSkills);
router.post('/skills', restrictTo('ADMIN', 'HR'), masterController.createSkill);

export default router;
