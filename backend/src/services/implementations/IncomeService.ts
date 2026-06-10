import { Types } from 'mongoose';
import { IIncomeRepository } from '../../repositories/interfaces/IIncomeRepository';
import { IWalletRepository } from '../../repositories/interfaces/IWalletRepository';
import { NotFoundError, ForbiddenError } from '../../errors';
import { MESSAGES } from '../../constants';
import logger from '../../utils/logger';
import { IncomeFilters, CreateIncomeDTO } from '../../types';
import { notificationService } from './NotificationService';

export class IncomeService {
  private _incomeRepo: IIncomeRepository;
  private _walletRepo: IWalletRepository;

  constructor(incomeRepo: IIncomeRepository, walletRepo: IWalletRepository) {
    this._incomeRepo = incomeRepo;
    this._walletRepo = walletRepo;
  }

  private async _checkWalletAccess(walletId: string | Types.ObjectId, userId: string | Types.ObjectId) {
    const wallet = await this._walletRepo.findById(walletId);
    if (!wallet) throw new NotFoundError(MESSAGES.ERROR_WALLET_NOT_FOUND);
    if (!wallet.isMember(userId)) throw new ForbiddenError(MESSAGES.ERROR_FORBIDDEN);
    return wallet;
  }

  async addIncome(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, data: CreateIncomeDTO) {
    try {
      await this._checkWalletAccess(walletId, userId);

      const income = await this._incomeRepo.create({
        ...data as any,
        user: userId as any,
        wallet: walletId as any,
      });

      // Fire push to ALL wallet members (non-blocking)
      const amount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(data.amount);
      notificationService.sendToWallet(walletId.toString(), {
        title: '💰 New Income',
        body: `${data.title} — ${amount}`,
        tag: 'income-added',
      });

      return income;
    } catch (error: any) {
      logger.error(`IncomeService.addIncome error: ${error.message}`);
      throw error;
    }
  }

  async getIncomeList(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, filters: IncomeFilters) {
    try {
      await this._checkWalletAccess(walletId, userId);
      return this._incomeRepo.findWithFilters(walletId, filters);
    } catch (error: any) {
      logger.error(`IncomeService.getIncomeList error: ${error.message}`);
      throw error;
    }
  }

  async getIncomeById(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, incomeId: string | Types.ObjectId) {
    try {
      await this._checkWalletAccess(walletId, userId);
      
      const income = await this._incomeRepo.findById(incomeId);
      if (!income) throw new NotFoundError(MESSAGES.ERROR_NOT_FOUND);

      return income;
    } catch (error: any) {
      logger.error(`IncomeService.getIncomeById error: ${error.message}`);
      throw error;
    }
  }

  async updateIncome(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, incomeId: string | Types.ObjectId, data: any) {
    try {
      await this._checkWalletAccess(walletId, userId);
      
      const income = await this._incomeRepo.update(incomeId, data);
      if (!income) throw new NotFoundError(MESSAGES.ERROR_NOT_FOUND);

      return income;
    } catch (error: any) {
      logger.error(`IncomeService.updateIncome error: ${error.message}`);
      throw error;
    }
  }

  async deleteIncome(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, incomeId: string | Types.ObjectId) {
    try {
      await this._checkWalletAccess(walletId, userId);
      
      const income = await this._incomeRepo.delete(incomeId);
      if (!income) throw new NotFoundError(MESSAGES.ERROR_NOT_FOUND);

      return income;
    } catch (error: any) {
      logger.error(`IncomeService.deleteIncome error: ${error.message}`);
      throw error;
    }
  }

  async getTotalIncome(userId: string | Types.ObjectId, walletId: string | Types.ObjectId) {
    try {
      await this._checkWalletAccess(walletId, userId);
      return this._incomeRepo.getTotalIncome(walletId);
    } catch (error: any) {
      logger.error(`IncomeService.getTotalIncome error: ${error.message}`);
      throw error;
    }
  }
}
