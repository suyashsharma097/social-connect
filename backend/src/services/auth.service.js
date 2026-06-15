import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import env from '../config/env.js';
import userRepository from '../repositories/user.repository.js';
import employeeRepository from '../repositories/employee.repository.js';
import { sendEmail } from '../config/mail.js';
import AppError from '../utils/appError.js';

const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const getTokens = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateToken(payload, env.jwt.accessSecret, env.jwt.accessExpiry);
  const refreshToken = generateToken(payload, env.jwt.refreshSecret, env.jwt.refreshExpiry);
  return { accessToken, refreshToken };
};

const register = async (email, password, role = 'EMPLOYEE') => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new AppError('Email is already registered.', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await userRepository.createUser({
    email,
    passwordHash,
    role,
    verificationToken,
  });

  // Send verification email
  const verifyUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
  const htmlContent = `
    <h2>Welcome to Social Connect!</h2>
    <p>Thank you for registering. Please verify your email by clicking the link below:</p>
    <a href="${verifyUrl}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
    <p>Or copy this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
  `;

  try {
    await sendEmail(email, 'Verify Your Email - Social Connect', htmlContent);
  } catch (err) {
    // Log error but don't fail registration
    console.error('Email send failure:', err.message);
  }

  // If registering as an Employee, let's create a stub employee profile automatically
  if (role === 'EMPLOYEE') {
    await employeeRepository.createEmployee({
      userId: user.id,
      firstName: 'New',
      lastName: 'Employee',
      email: email,
      salary: 0,
    });
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  };
};

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Incorrect email or password.', 401);
  }

  const tokens = getTokens(user);
  
  // Save refresh token to db
  await userRepository.updateUser(user.id, { refreshToken: tokens.refreshToken });

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      employeeId: user.employee?.id || null,
    },
    ...tokens,
  };
};

const refresh = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, env.jwt.refreshSecret);
    const user = await userRepository.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      throw new AppError('Invalid refresh token.', 401);
    }

    const tokens = getTokens(user);

    // Update refresh token
    await userRepository.updateUser(user.id, { refreshToken: tokens.refreshToken });

    return tokens;
  } catch (error) {
    throw new AppError('Invalid or expired refresh token. Please login again.', 401);
  }
};

const logout = async (userId) => {
  await userRepository.updateUser(userId, { refreshToken: null });
};

const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new AppError('No user found with that email address.', 404);
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

  await userRepository.updateUser(user.id, {
    resetToken,
    resetTokenExpires,
  });

  const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
  const htmlContent = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to set a new password (valid for 1 hour):</p>
    <a href="${resetUrl}" style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    <p>Or copy this link: <a href="${resetUrl}">${resetUrl}</a></p>
  `;

  await sendEmail(email, 'Reset Password - Social Connect', htmlContent);
};

const resetPassword = async (token, newPassword) => {
  const user = await userRepository.findByResetToken(token);
  if (!user) {
    throw new AppError('Password reset token is invalid or has expired.', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userRepository.updateUser(user.id, {
    passwordHash,
    resetToken: null,
    resetTokenExpires: null,
    refreshToken: null, // Force log out everywhere
  });
};

const verifyEmail = async (token) => {
  const user = await userRepository.findByVerificationToken(token);
  if (!user) {
    throw new AppError('Email verification token is invalid.', 400);
  }

  await userRepository.updateUser(user.id, {
    isVerified: true,
    verificationToken: null,
  });
};

export default {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
