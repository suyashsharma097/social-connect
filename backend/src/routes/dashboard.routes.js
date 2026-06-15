import express from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/stats', protect, dashboardController.getStats);

export default router;
