import { Types } from 'mongoose';
import { IWalletRepository } from '../../repositories/interfaces/IWalletRepository';
import { IUserRepository } from '../../repositories/interfaces/IUserRepository';
import { BadRequestError, NotFoundError, ForbiddenError } from '../../errors';
import { WalletRole, WalletType } from '../../enums';
import { MESSAGES } from '../../constants';
import logger from '../../utils/logger';

export class WalletService {
  private _walletRepo: IWalletRepository;
  private _userRepo: IUserRepository;

  constructor(walletRepo: IWalletRepository, userRepo: IUserRepository) {
    this._walletRepo = walletRepo;
    this._userRepo = userRepo;
  }

  async createWallet(userId: string | Types.ObjectId, data: any) {
    try {
      const wallet = await this._walletRepo.create({
        ...data,
        owner: userId,
        members: [{ user: userId, role: WalletRole.OWNER }],
        isShared: data.type !== WalletType.PERSONAL,
      });

      // Update user's active wallet if none
      const user = await this._userRepo.findById(userId);
      if (user && !user.activeWallet) {
        await this._userRepo.update(userId, { activeWallet: wallet._id });
      }

      return wallet;
    } catch (error: any) {
      logger.error(`WalletService.createWallet error: ${error.message}`);
      throw error;
    }
  }

  async getUserWallets(userId: string | Types.ObjectId) {
    try {
      return this._walletRepo.findUserWallets(userId);
    } catch (error: any) {
      logger.error(`WalletService.getUserWallets error: ${error.message}`);
      throw error;
    }
  }

  async getWalletById(walletId: string | Types.ObjectId, userId: string | Types.ObjectId) {
    try {
      const wallet = await this._walletRepo.findById(walletId);
      if (!wallet) throw new NotFoundError(MESSAGES.ERROR_WALLET_NOT_FOUND);

      if (!wallet.isMember(userId)) {
        throw new ForbiddenError(MESSAGES.ERROR_FORBIDDEN);
      }

      return wallet;
    } catch (error: any) {
      logger.error(`WalletService.getWalletById error: ${error.message}`);
      throw error;
    }
  }

  async updateWallet(walletId: string | Types.ObjectId, userId: string | Types.ObjectId, data: any) {
    try {
      const wallet = await this.getWalletById(walletId, userId);
      const role = wallet.getMemberRole(userId);

      if (role !== WalletRole.OWNER && role !== WalletRole.ADMIN) {
        throw new ForbiddenError(MESSAGES.ERROR_NOT_WALLET_ADMIN);
      }

      return this._walletRepo.update(walletId, data);
    } catch (error: any) {
      logger.error(`WalletService.updateWallet error: ${error.message}`);
      throw error;
    }
  }

  async generateInvite(walletId: string | Types.ObjectId, userId: string | Types.ObjectId) {
    try {
      const wallet = await this.getWalletById(walletId, userId);
      if (wallet.owner.toString() !== userId.toString()) {
        throw new ForbiddenError(MESSAGES.ERROR_NOT_WALLET_OWNER);
      }

      wallet.generateInviteCode();
      wallet.isShared = true;
      await wallet.save();

      return wallet.inviteCode;
    } catch (error: any) {
      logger.error(`WalletService.generateInvite error: ${error.message}`);
      throw error;
    }
  }

  async joinWallet(userId: string | Types.ObjectId, inviteCode: string) {
    try {
      const wallet = await this._walletRepo.findByInviteCode(inviteCode);
      if (!wallet) throw new NotFoundError(MESSAGES.ERROR_INVALID_INVITE);

      if (wallet.isMember(userId)) {
        throw new BadRequestError(MESSAGES.ERROR_ALREADY_MEMBER);
      }

      wallet.members.push({
        user: new Types.ObjectId(userId.toString()),
        role: WalletRole.MEMBER,
        joinedAt: new Date(),
      } as any);
      wallet.isShared = true;
      await wallet.save();

      return wallet;
    } catch (error: any) {
      logger.error(`WalletService.joinWallet error: ${error.message}`);
      throw error;
    }
  }

  async removeMember(walletId: string | Types.ObjectId, reqUserId: string | Types.ObjectId, memberId: string | Types.ObjectId) {
    try {
      const wallet = await this.getWalletById(walletId, reqUserId);

      // Only owner/admin can remove others, or user can remove themselves
      const reqRole = wallet.getMemberRole(reqUserId);
      if (reqRole !== WalletRole.OWNER && reqRole !== WalletRole.ADMIN && reqUserId.toString() !== memberId.toString()) {
        throw new ForbiddenError(MESSAGES.ERROR_NOT_WALLET_ADMIN);
      }

      // Cannot remove owner
      if (wallet.owner.toString() === memberId.toString()) {
        throw new BadRequestError(MESSAGES.ERROR_CANNOT_REMOVE_OWNER);
      }

      await this._walletRepo.removeMember(walletId, memberId);
    } catch (error: any) {
      logger.error(`WalletService.removeMember error: ${error.message}`);
      throw error;
    }
  }
}
