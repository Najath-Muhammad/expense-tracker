const { StatusCode, ResponseMessage } = require('../enums');

/**
 * Base custom error class
 */
class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = ResponseMessage.VALIDATION_ERROR, errors = []) {
    super(message, StatusCode.BAD_REQUEST, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = ResponseMessage.UNAUTHORIZED) {
    super(message, StatusCode.UNAUTHORIZED);
  }
}

class ForbiddenError extends AppError {
  constructor(message = ResponseMessage.FORBIDDEN) {
    super(message, StatusCode.FORBIDDEN);
  }
}

class NotFoundError extends AppError {
  constructor(message = ResponseMessage.NOT_FOUND) {
    super(message, StatusCode.NOT_FOUND);
  }
}

class ConflictError extends AppError {
  constructor(message = ResponseMessage.CONFLICT) {
    super(message, StatusCode.CONFLICT);
  }
}

class InternalError extends AppError {
  constructor(message = ResponseMessage.INTERNAL_ERROR) {
    super(message, StatusCode.INTERNAL_ERROR);
  }
}

class BadRequestError extends AppError {
  constructor(message = ResponseMessage.BAD_REQUEST) {
    super(message, StatusCode.BAD_REQUEST);
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = ResponseMessage.TOO_MANY_REQUESTS) {
    super(message, StatusCode.TOO_MANY_REQUESTS);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  InternalError,
  BadRequestError,
  TooManyRequestsError,
};
