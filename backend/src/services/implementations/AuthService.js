const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT, COOKIE } = require('../../constants');
const { UnauthorizedError, ConflictError, NotFoundError, BadRequestError } = require('../../errors');
const { ActivityType, TokenType } = require('../../enums');
const logger = require('../../utils/logger');

/**
 * AuthService - Handles all authentication business logic
 * Depends on IUserRepository and IActivityRepository abstractions
 */
class AuthService {
  /**
   * @param {IUserRepository} userRepository
   * @param {IActivityRepository} activityRepository
   */
  constructor(userRepository, activityRepository) {
    this._userRepo = userRepository;
    this._activityRepo = activityRepository;
  }

  /**
   * Register a new user
   */
  async register(data) {
    const { name, email, password } = data;

    const existing = await this._userRepo.findByEmail(email);
    if (existing) throw new ConflictError('An account with this email already exists');

    const user = await this._userRepo.create({ name, email, password });

    await this._logActivity(user._id, null, ActivityType.LOGIN, `${name} registered an account`);

    return user;
  }

  /**
   * Login user and return tokens
   */
  async login(email, password, rememberMe = false) {
    const userDoc = await this._userRepo.findByEmailWithPassword(email);
    if (!userDoc) throw new UnauthorizedError('Invalid email or password');
    if (!userDoc.isActive) throw new UnauthorizedError('Account is deactivated. Contact support.');

    const isMatch = await userDoc.comparePassword(password);
    if (!isMatch) throw new UnauthorizedError('Invalid email or password');

    const accessToken = this._generateAccessToken(userDoc._id, userDoc.role);
    const refreshToken = this._generateRefreshToken(userDoc._id, rememberMe);

    await this._userRepo.updateRefreshToken(userDoc._id, refreshToken);
    await this._userRepo.updateLastLogin(userDoc._id);

    await this._logActivity(userDoc._id, null, ActivityType.LOGIN, `${userDoc.name} logged in`);

    return {
      user: userDoc.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Logout - clear refresh token
   */
  async logout(userId) {
    await this._userRepo.updateRefreshToken(userId, null);
    await this._logActivity(userId, null, ActivityType.LOGOUT, 'User logged out');
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(token) {
    const payload = this._verifyRefreshToken(token);
    const user = await this._userRepo.findByRefreshToken(token);
    if (!user) throw new UnauthorizedError('Invalid refresh token');

    const accessToken = this._generateAccessToken(user._id, user.role);
    const refreshToken = this._generateRefreshToken(user._id);

    await this._userRepo.updateRefreshToken(user._id, refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Initiate password reset
   */
  async forgotPassword(email) {
    const user = await this._userRepo.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If this email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this._userRepo.setPasswordReset(user._id, resetToken, expires);

    // TODO: Send email via NotificationService
    logger.info(`Password reset token generated for: ${email}`);

    return { resetToken, message: 'Password reset email sent' };
  }

  /**
   * Reset password using token
   */
  async resetPassword(token, newPassword) {
    const user = await this._userRepo.findByPasswordResetToken(token);
    if (!user) throw new BadRequestError('Invalid or expired reset token');

    // Create user doc to trigger password hash hook
    const { User } = require('../../models/User');
    await User.findByIdAndUpdate(user._id, {
      password: newPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    await this._logActivity(user._id, null, ActivityType.PASSWORD_CHANGED, 'Password was reset');
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(userId, currentPassword, newPassword) {
    const userDoc = await this._userRepo.findByEmailWithPassword(
      (await this._userRepo.findById(userId)).email
    );

    const isMatch = await userDoc.comparePassword(currentPassword);
    if (!isMatch) throw new BadRequestError('Current password is incorrect');

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(newPassword, salt);

    await this._userRepo.updateById(userId, { password: hashed });
    await this._userRepo.updateRefreshToken(userId, null); // invalidate sessions

    await this._logActivity(userId, null, ActivityType.PASSWORD_CHANGED, 'Password changed successfully');
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET, {
        issuer: JWT.ISSUER,
        audience: JWT.AUDIENCE,
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') throw new UnauthorizedError('Access token expired');
      throw new UnauthorizedError('Invalid access token');
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  _generateAccessToken(userId, role) {
    return jwt.sign(
      { sub: userId.toString(), role, type: TokenType.ACCESS },
      process.env.JWT_SECRET,
      {
        expiresIn: JWT.ACCESS_EXPIRY,
        issuer: JWT.ISSUER,
        audience: JWT.AUDIENCE,
        algorithm: JWT.ALGORITHM,
      }
    );
  }

  _generateRefreshToken(userId, rememberMe = false) {
    return jwt.sign(
      { sub: userId.toString(), type: TokenType.REFRESH },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: rememberMe ? '30d' : JWT.REFRESH_EXPIRY,
        issuer: JWT.ISSUER,
        audience: JWT.AUDIENCE,
        algorithm: JWT.ALGORITHM,
      }
    );
  }

  _verifyRefreshToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        issuer: JWT.ISSUER,
        audience: JWT.AUDIENCE,
      });
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async _logActivity(userId, walletId, type, message) {
    try {
      if (this._activityRepo) {
        await this._activityRepo.create({ user: userId, wallet: walletId, type, message });
      }
    } catch (err) {
      logger.error(`Failed to log activity: ${err.message}`);
    }
  }
}

module.exports = AuthService;
