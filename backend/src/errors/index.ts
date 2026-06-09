import { StatusCode, StatusCodeType } from '../enums';
import { MESSAGES } from '../constants';

export class AppError extends Error {
  public readonly statusCode: StatusCodeType;
  public readonly isOperational: boolean;
  public readonly errors?: any[];

  constructor(
    message: string,
    statusCode: StatusCodeType = StatusCode.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    errors?: any[]
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = MESSAGES.ERROR_BAD_REQUEST, errors?: any[]) {
    super(message, StatusCode.BAD_REQUEST, true, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = MESSAGES.ERROR_UNAUTHORIZED) {
    super(message, StatusCode.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = MESSAGES.ERROR_FORBIDDEN) {
    super(message, StatusCode.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = MESSAGES.ERROR_NOT_FOUND) {
    super(message, StatusCode.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict') {
    super(message, StatusCode.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(errors: any[], message: string = MESSAGES.ERROR_VALIDATION) {
    super(message, StatusCode.UNPROCESSABLE, true, errors);
  }
}
