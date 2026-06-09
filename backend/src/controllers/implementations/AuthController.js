const ApiResponse = require('../../utils/apiResponse');
const { StatusCode } = require('../../enums');
const { COOKIE } = require('../../constants');
const asyncHandler = require('../../middlewares/asyncHandler');

/**
 * AuthController - Handles HTTP layer for authentication
 * Delegates all logic to AuthService
 */
class AuthController {
  /**
   * @param {AuthService} authService
   */
  constructor(authService) {
    this._authService = authService;

    // Bind methods so they work as Express route handlers
    this.register = asyncHandler(this.register.bind(this));
    this.login = asyncHandler(this.login.bind(this));
    this.logout = asyncHandler(this.logout.bind(this));
    this.refreshToken = asyncHandler(this.refreshToken.bind(this));
    this.forgotPassword = asyncHandler(this.forgotPassword.bind(this));
    this.resetPassword = asyncHandler(this.resetPassword.bind(this));
    this.changePassword = asyncHandler(this.changePassword.bind(this));
    this.getMe = asyncHandler(this.getMe.bind(this));
  }

  async register(req, res) {
    const user = await this._authService.register(req.body);
    return ApiResponse.created(res, 'Account created successfully', { user });
  }

  async login(req, res) {
    const { email, password, rememberMe } = req.body;
    const { user, accessToken, refreshToken } = await this._authService.login(email, password, rememberMe);

    // Set refresh token as HttpOnly cookie
    res.cookie(COOKIE.REFRESH_TOKEN, refreshToken, {
      httpOnly: COOKIE.HTTP_ONLY,
      secure: COOKIE.SECURE,
      sameSite: COOKIE.SAME_SITE,
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : COOKIE.MAX_AGE_REFRESH,
    });

    return ApiResponse.success(res, StatusCode.OK, 'Login successful', { user, accessToken });
  }

  async logout(req, res) {
    await this._authService.logout(req.user._id);
    res.clearCookie(COOKIE.REFRESH_TOKEN);
    return ApiResponse.success(res, StatusCode.OK, 'Logged out successfully');
  }

  async refreshToken(req, res) {
    const token = req.cookies[COOKIE.REFRESH_TOKEN];
    if (!token) {
      return ApiResponse.error(res, StatusCode.UNAUTHORIZED, 'Refresh token not found');
    }

    const { accessToken, refreshToken } = await this._authService.refreshTokens(token);

    res.cookie(COOKIE.REFRESH_TOKEN, refreshToken, {
      httpOnly: COOKIE.HTTP_ONLY,
      secure: COOKIE.SECURE,
      sameSite: COOKIE.SAME_SITE,
      maxAge: COOKIE.MAX_AGE_REFRESH,
    });

    return ApiResponse.success(res, StatusCode.OK, 'Token refreshed', { accessToken });
  }

  async forgotPassword(req, res) {
    const result = await this._authService.forgotPassword(req.body.email);
    return ApiResponse.success(res, StatusCode.OK, result.message, {});
  }

  async resetPassword(req, res) {
    const { token, password } = req.body;
    await this._authService.resetPassword(token, password);
    return ApiResponse.success(res, StatusCode.OK, 'Password reset successfully');
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;
    await this._authService.changePassword(req.user._id, currentPassword, newPassword);
    res.clearCookie(COOKIE.REFRESH_TOKEN);
    return ApiResponse.success(res, StatusCode.OK, 'Password changed successfully');
  }

  async getMe(req, res) {
    return ApiResponse.success(res, StatusCode.OK, 'Profile fetched', { user: req.user });
  }
}

module.exports = AuthController;
