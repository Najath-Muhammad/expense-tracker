import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { StatusCode } from '../enums';
import ApiResponse from '../utils/apiResponse';
import logger from '../utils/logger';

const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // Clone mongoose error properties if they exist
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    error = new AppError(messages.join(', '), StatusCode.BAD_REQUEST, true, messages);
  } else if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, StatusCode.BAD_REQUEST);
  } else if (err.code === 11000) {
    const value = Object.keys(err.keyValue)[0];
    error = new AppError(`Duplicate field value: ${value}. Please use another value!`, StatusCode.CONFLICT);
  }

  // Fallback for non-AppErrors
  if (!(error instanceof AppError)) {
    const statusCode = error.statusCode || StatusCode.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';
    error = new AppError(message, statusCode, false);
  }

  // Log error (only non-operational or internal server errors)
  if (!error.isOperational || error.statusCode === StatusCode.INTERNAL_SERVER_ERROR) {
    logger.error(`[ERROR] ${req.method} ${req.originalUrl} >> ${error.stack}`);
  } else {
    logger.warn(`[WARN] ${req.method} ${req.originalUrl} >> ${error.message}`);
  }

  // Send response
  const statusCode = error.statusCode || StatusCode.INTERNAL_SERVER_ERROR;
  const isDev = process.env.NODE_ENV === 'development';

  const payload: any = {
    success: false,
    message: error.message,
  };

  if (error.errors) {
    payload.errors = error.errors;
  }

  if (isDev && !error.isOperational) {
    payload.stack = error.stack;
  }

  res.status(statusCode).json(payload);
};

export default globalErrorHandler;
