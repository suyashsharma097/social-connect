import logger from '../config/logger.js';
import AppError from '../utils/appError.js';

const handlePrismaError = (err) => {
  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const field = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return new AppError(`A record with this ${field} already exists.`, 409);
  }
  // Prisma foreign key constraint violation
  if (err.code === 'P2003') {
    return new AppError('Invalid related record referenced (foreign key violation).', 400);
  }
  // Prisma record not found
  if (err.code === 'P2025') {
    return new AppError('Requested record was not found.', 404);
  }
  return new AppError(`Database error: ${err.message}`, 500);
};

const handleJWTError = () => new AppError('Invalid authentication token. Please log in again.', 401);

const handleJWTExpiredError = () => new AppError('Your authentication token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong on the server.',
    });
  }
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    let error = { ...err, message: err.message, stack: err.stack };

    if (err.constructor.name.startsWith('Prisma')) {
      error = handlePrismaError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorDev(error, res);
  } else {
    let error = { ...err, message: err.message };

    if (err.constructor.name.startsWith('Prisma')) {
      error = handlePrismaError(err);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};
