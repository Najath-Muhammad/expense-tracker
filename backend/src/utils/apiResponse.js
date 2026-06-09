const { StatusCode } = require('../enums');

/**
 * Standardized API response helper
 */
class ApiResponse {
  /**
   * Send a success response
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message
   * @param {object} data - Response data
   * @param {object} meta - Pagination or extra meta info
   */
  static success(res, statusCode = StatusCode.OK, message = 'Success', data = {}, meta = null) {
    const response = { success: true, message, data };
    if (meta) response.meta = meta;
    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response
   * @param {object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {Array} errors - Validation errors
   */
  static error(res, statusCode = StatusCode.INTERNAL_ERROR, message = 'Error', errors = []) {
    return res.status(statusCode).json({ success: false, message, errors });
  }

  /**
   * Created response (201)
   */
  static created(res, message = 'Created', data = {}) {
    return this.success(res, StatusCode.CREATED, message, data);
  }

  /**
   * No content response (204)
   */
  static noContent(res) {
    return res.status(StatusCode.NO_CONTENT).send();
  }

  /**
   * Paginated response with meta
   */
  static paginated(res, message = 'Success', data = [], page = 1, limit = 10, total = 0) {
    const totalPages = Math.ceil(total / limit);
    const meta = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
    return this.success(res, StatusCode.OK, message, data, meta);
  }
}

module.exports = ApiResponse;
