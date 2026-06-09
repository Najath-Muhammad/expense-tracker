const { AppError, ValidationError } = require('../errors');
const { StatusCode } = require('../enums');
const logger = require('../utils/logger');

/**
 * Global Error Handler Middleware
 * Must be the LAST middleware registered in Express
 */
const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || StatusCode.INTERNAL_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = StatusCode.BAD_REQUEST;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = StatusCode.BAD_REQUEST;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = StatusCode.CONFLICT;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCode.UNAUTHORIZED;
    message = 'Invalid token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = StatusCode.UNAUTHORIZED;
    message = 'Token expired';
  }

  // Log error
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`, { stack: err.stack });
  } else {
    logger.warn(`[${req.method}] ${req.path} → ${statusCode}: ${message}`);
  }

  // Don't leak internal error details in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
    errors = [];
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = globalErrorHandler;
