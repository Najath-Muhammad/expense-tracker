const { validationResult } = require('express-validator');
const { ValidationError } = require('../errors');

/**
 * validate - Express-validator middleware
 * Throws ValidationError if any validation fails
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((e) => ({
      field: e.path,
      message: e.msg,
    }));
    throw new ValidationError('Validation failed', formattedErrors);
  }
  next();
};

module.exports = validate;
