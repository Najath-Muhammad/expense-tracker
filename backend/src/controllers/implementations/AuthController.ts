import { Request, Response } from 'express';
import { AuthService } from '../../services/implementations/AuthService';
import ApiResponse from '../../utils/apiResponse';
import { ROUTE_PATHS, MESSAGES, JWT } from '../../constants';
import { StatusCode } from '../../enums';
import { AuthenticatedRequest } from '../../types';
import logger from '../../utils/logger';

export class AuthController {
  private _authService: AuthService;

  constructor(authService: AuthService) {
    this._authService = authService;
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: JWT.COOKIE_MAX_AGE,
    });
  }

  private clearCookies(res: Response) {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });
  }

  async register(req: Request, res: Response) {
    try {
      const { user, accessToken, refreshToken } = await this._authService.register(req.body);
      this.setCookies(res, accessToken, refreshToken);
      return ApiResponse.created(res, MESSAGES.REGISTER_SUCCESS, { user, accessToken });
    } catch (error: any) {
      logger.error(`AuthController.register error: ${error.message}`);
      throw error;
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { user, accessToken, refreshToken } = await this._authService.login(req.body);
      this.setCookies(res, accessToken, refreshToken);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.LOGIN_SUCCESS, { user, accessToken });
    } catch (error: any) {
      logger.error(`AuthController.login error: ${error.message}`);
      throw error;
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    try {
      if (req.user) {
        await this._authService.logout(req.user._id);
      }
      this.clearCookies(res);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.LOGOUT_SUCCESS);
    } catch (error: any) {
      logger.error(`AuthController.logout error: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const token = req.cookies.refreshToken;
      const { accessToken, refreshToken } = await this._authService.refreshTokens(token);
      this.setCookies(res, accessToken, refreshToken);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.TOKEN_REFRESHED, { accessToken });
    } catch (error: any) {
      logger.error(`AuthController.refreshToken error: ${error.message}`);
      this.clearCookies(res);
      throw error;
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { user: req.user });
    } catch (error: any) {
      logger.error(`AuthController.getMe error: ${error.message}`);
      throw error;
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      await this._authService.changePassword(req.user._id, currentPassword, newPassword);
      this.clearCookies(res);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.PASSWORD_CHANGED);
    } catch (error: any) {
      logger.error(`AuthController.changePassword error: ${error.message}`);
      throw error;
    }
  }
}
