import express from 'express';
import authRoutes from './auth.routes.js';
import employeeRoutes from './employee.routes.js';
import leaveRoutes from './leave.routes.js';
import assetRoutes from './asset.routes.js';
import masterRoutes from './master.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/leaves', leaveRoutes);
router.use('/assets', assetRoutes);
router.use('/masters', masterRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
