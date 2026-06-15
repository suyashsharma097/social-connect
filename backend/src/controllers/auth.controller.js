import authService from '../services/auth.service.js';
import logger from '../config/logger.js';

const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    logger.info(`User registration attempt for email: ${email}`);
    const user = await authService.register(email, password, role);
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please verify your email.',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.info(`User login attempt for email: ${email}`);
    const result = await authService.login(email, password);
    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        status: 'fail',
        message: 'Refresh token is required.',
      });
    }
    const result = await authService.refresh(refreshToken);
    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.id);
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully.',
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    await authService.verifyEmail(token);
    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          role: req.user.role,
          isVerified: req.user.isVerified,
          employee: req.user.employee,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
};
