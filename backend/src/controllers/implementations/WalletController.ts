import { Request, Response } from 'express';
import { WalletService } from '../../services/implementations/WalletService';
import ApiResponse from '../../utils/apiResponse';
import { MESSAGES } from '../../constants';
import { StatusCode } from '../../enums';
import { AuthenticatedRequest } from '../../types';
import logger from '../../utils/logger';

export class WalletController {
  private _walletService: WalletService;

  constructor(walletService: WalletService) {
    this._walletService = walletService;
  }

  async createWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const wallet = await this._walletService.createWallet(req.user._id, req.body);
      return ApiResponse.created(res, MESSAGES.WALLET_CREATED, { wallet });
    } catch (error: any) {
      logger.error(`WalletController.createWallet error: ${error.message}`);
      throw error;
    }
  }

  async getWallets(req: AuthenticatedRequest, res: Response) {
    try {
      const wallets = await this._walletService.getUserWallets(req.user._id);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { wallets });
    } catch (error: any) {
      logger.error(`WalletController.getWallets error: ${error.message}`);
      throw error;
    }
  }

  async getWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const wallet = await this._walletService.getWalletById(req.params.id as string, req.user._id);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { wallet });
    } catch (error: any) {
      logger.error(`WalletController.getWallet error: ${error.message}`);
      throw error;
    }
  }

  async updateWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const wallet = await this._walletService.updateWallet(req.params.id as string, req.user._id, req.body);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.WALLET_UPDATED, { wallet });
    } catch (error: any) {
      logger.error(`WalletController.updateWallet error: ${error.message}`);
      throw error;
    }
  }

  async generateInvite(req: AuthenticatedRequest, res: Response) {
    try {
      const inviteCode = await this._walletService.generateInvite(req.params.id as string, req.user._id);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.WALLET_INVITE_GENERATED, { inviteCode });
    } catch (error: any) {
      logger.error(`WalletController.generateInvite error: ${error.message}`);
      throw error;
    }
  }

  async joinWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const wallet = await this._walletService.joinWallet(req.user._id, req.body.inviteCode);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.WALLET_JOINED, { wallet });
    } catch (error: any) {
      logger.error(`WalletController.joinWallet error: ${error.message}`);
      throw error;
    }
  }

  async removeMember(req: AuthenticatedRequest, res: Response) {
    try {
      await this._walletService.removeMember(req.params.id as string, req.user._id, req.params.memberId as string);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.WALLET_MEMBER_REMOVED);
    } catch (error: any) {
      logger.error(`WalletController.removeMember error: ${error.message}`);
      throw error;
    }
  }
}
