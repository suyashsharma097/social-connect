import express from 'express';
import authController from '../controllers/auth.controller.js';
import validate from '../middleware/validation.middleware.js';
import authValidation from '../validations/auth.validation.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.get('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);
router.get('/me', protect, authController.getMe);

export default router;
