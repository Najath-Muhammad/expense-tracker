import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { IWalletRepository } from '../../repositories/interfaces/IWalletRepository';
import { BadRequestError, UnauthorizedError, NotFoundError } from '../../errors';
import { MESSAGES, JWT } from '../../constants';
import { WalletType, WalletRole } from '../../enums';
import { RegisterDTO, LoginDTO, SafeUser, IUser } from '../../types';
import logger from '../../utils/logger';

export class AuthService {
  private _userRepository: IUserRepository;
  private _walletRepository: IWalletRepository;

  constructor(userRepository: IUserRepository, walletRepository: IWalletRepository) {
    this._userRepository = userRepository;
    this._walletRepository = walletRepository;
  }

  private generateAccessToken(user: IUser): string {
    return jwt.sign(
      { sub: user._id.toString(), role: user.role, type: 'access' },
      process.env.JWT_SECRET as string,
      { expiresIn: JWT.ACCESS_EXPIRES_IN }
    );
  }

  private generateRefreshToken(user: IUser): string {
    return jwt.sign(
      { sub: user._id.toString(), type: 'refresh' },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: JWT.REFRESH_EXPIRES_IN }
    );
  }

  async register(data: RegisterDTO) {
    try {
      const existingUser = await this._userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new BadRequestError(MESSAGES.ERROR_EMAIL_EXISTS);
      }

      const user = await this._userRepository.create({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      // Create a default personal wallet
      const wallet = await this._walletRepository.create({
        name: 'Personal Wallet',
        type: WalletType.PERSONAL,
        owner: user._id,
        members: [{ user: user._id, role: WalletRole.OWNER, joinedAt: new Date() }],
        isShared: false,
      });

      await this._userRepository.update(user._id, { activeWallet: wallet._id });
      user.activeWallet = wallet._id;

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      await this._userRepository.update(user._id, { refreshToken });

      return { user: user.toSafeObject(), accessToken, refreshToken };
    } catch (error: any) {
      logger.error(`AuthService.register error: ${error.message}`);
      throw error; // Rethrow to let global error handler catch it
    }
  }

  async login(data: LoginDTO) {
    try {
      const user = await this._userRepository.findByEmail(data.email, true);
      if (!user) {
        throw new UnauthorizedError(MESSAGES.ERROR_INVALID_CREDENTIALS);
      }

      const isMatch = await user.comparePassword(data.password);
      if (!isMatch) {
        throw new UnauthorizedError(MESSAGES.ERROR_INVALID_CREDENTIALS);
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      await this._userRepository.update(user._id, {
        refreshToken,
        lastLogin: new Date(),
      });

      return { user: user.toSafeObject(), accessToken, refreshToken };
    } catch (error: any) {
      logger.error(`AuthService.login error: ${error.message}`);
      throw error;
    }
  }

  async refreshTokens(token: string) {
    try {
      if (!token) throw new UnauthorizedError(MESSAGES.ERROR_INVALID_TOKEN);

      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as jwt.JwtPayload;
      const user = await this._userRepository.findById(decoded.sub as string);

      if (!user || user.refreshToken !== token) {
        throw new UnauthorizedError(MESSAGES.ERROR_INVALID_TOKEN);
      }

      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      await this._userRepository.update(user._id, { refreshToken: newRefreshToken });

      return { accessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      logger.error(`AuthService.refreshTokens error: ${error.message}`);
      throw new UnauthorizedError(MESSAGES.ERROR_INVALID_TOKEN);
    }
  }

  async logout(userId: string | Types.ObjectId) {
    try {
      await this._userRepository.update(userId, { refreshToken: null });
    } catch (error: any) {
      logger.error(`AuthService.logout error: ${error.message}`);
      throw error;
    }
  }

  async changePassword(userId: string | Types.ObjectId, currentPass: string, newPass: string) {
    try {
      const user = await this._userRepository.findById(userId);
      if (!user) throw new NotFoundError(MESSAGES.ERROR_USER_NOT_FOUND);

      const userWithPass = await this._userRepository.findByEmail(user.email, true);
      const isMatch = await userWithPass!.comparePassword(currentPass);

      if (!isMatch) throw new BadRequestError(MESSAGES.ERROR_INVALID_PASSWORD);

      userWithPass!.password = newPass;
      userWithPass!.refreshToken = null; // force re-login
      await userWithPass!.save();
    } catch (error: any) {
      logger.error(`AuthService.changePassword error: ${error.message}`);
      throw error;
    }
  }
}
