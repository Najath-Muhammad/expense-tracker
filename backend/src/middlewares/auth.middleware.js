const { UnauthorizedError } = require('../errors');
const UserRepository = require('../repositories/implementations/UserRepository');
const asyncHandler = require('./asyncHandler');

const userRepo = new UserRepository();

/**
 * authenticate - Validates JWT access token from Authorization header
 * Injects user into req.user
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token required');
  }

  const token = authHeader.split(' ')[1];

  // Lazy-load AuthService to avoid circular deps
  const jwt = require('jsonwebtoken');
  const { JWT } = require('../constants');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: JWT.ISSUER,
      audience: JWT.AUDIENCE,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new UnauthorizedError('Access token expired');
    throw new UnauthorizedError('Invalid access token');
  }

  const user = await userRepo.findById(payload.sub);
  if (!user || !user.isActive) throw new UnauthorizedError('User not found or account deactivated');

  req.user = user;
  next();
});

/**
 * authorize - Role-based access control middleware
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => (req, res, next) => {
  const { ForbiddenError } = require('../errors');
  if (!roles.includes(req.user?.role)) {
    throw new ForbiddenError(`Role ${req.user?.role} is not authorized`);
  }
  next();
};

module.exports = { authenticate, authorize };
