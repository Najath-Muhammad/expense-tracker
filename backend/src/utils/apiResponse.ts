import { Response } from 'express';
import { StatusCode, StatusCodeType } from '../enums';
import { MESSAGES } from '../constants';

interface MetaData {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export default class ApiResponse {
  /**
   * Send a success response
   */
  static success<T>(
    res: Response,
    statusCode: StatusCodeType = StatusCode.OK,
    message: string = MESSAGES.SUCCESS,
    data?: T,
    meta?: MetaData
  ): void {
    const payload: any = {
      success: true,
      message,
    };

    if (data !== undefined) payload.data = data;
    if (meta !== undefined) payload.meta = meta;

    res.status(statusCode).json(payload);
  }

  /**
   * Send a created response (201)
   */
  static created<T>(
    res: Response,
    message: string = MESSAGES.CREATED,
    data?: T
  ): void {
    this.success(res, StatusCode.CREATED, message, data);
  }

  /**
   * Send a no content response (204)
   */
  static noContent(res: Response): void {
    res.status(StatusCode.NO_CONTENT).send();
  }

  /**
   * Send an error response
   */
  static error(
    res: Response,
    statusCode: StatusCodeType = StatusCode.INTERNAL_SERVER_ERROR,
    message: string = MESSAGES.ERROR_GENERIC,
    errors?: any[]
  ): void {
    const payload: any = {
      success: false,
      message,
    };

    if (errors && errors.length > 0) {
      payload.errors = errors;
    }

    res.status(statusCode).json(payload);
  }
}
