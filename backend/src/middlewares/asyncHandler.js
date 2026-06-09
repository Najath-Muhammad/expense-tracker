/**
 * asyncHandler - Wraps async route handlers to catch errors
 * Passes errors to Express global error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
