import { Types } from 'mongoose';
import { IExpenseRepository } from '../../repositories/interfaces/IExpenseRepository';
import { IWalletRepository } from '../../repositories/interfaces/IWalletRepository';
import { NotFoundError, ForbiddenError } from '../../errors';
import { MESSAGES } from '../../constants';
import logger from '../../utils/logger';
import { ExpenseFilters, CreateExpenseDTO } from '../../types';
import { notificationService } from './NotificationService';

export class ExpenseService {
  private _expenseRepo: IExpenseRepository;
  private _walletRepo: IWalletRepository;

  constructor(expenseRepo: IExpenseRepository, walletRepo: IWalletRepository) {
    this._expenseRepo = expenseRepo;
    this._walletRepo = walletRepo;
  }

  private async _checkWalletAccess(walletId: string | Types.ObjectId, userId: string | Types.ObjectId) {
    const wallet = await this._walletRepo.findById(walletId);
    if (!wallet) throw new NotFoundError(MESSAGES.ERROR_WALLET_NOT_FOUND);
    if (!wallet.isMember(userId)) throw new ForbiddenError(MESSAGES.ERROR_FORBIDDEN);
    return wallet;
  }

  async addExpense(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, data: CreateExpenseDTO) {
    try {
      await this._checkWalletAccess(walletId, userId);

      const expense = await this._expenseRepo.create({
        ...data as any,
        user: userId as any,
        wallet: walletId as any,
      });

      // Fire push to ALL wallet members (non-blocking)
      const amount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(data.amount);
      notificationService.sendToWallet(walletId.toString(), {
        title: '💸 New Expense',
        body: `${data.title} — ${amount}`,
        tag: 'expense-added',
      });

      return expense;
    } catch (error: any) {
      logger.error(`ExpenseService.addExpense error: ${error.message}`);
      throw error;
    }
  }

  async getExpenses(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, filters: ExpenseFilters) {
    try {
      await this._checkWalletAccess(walletId, userId);
      return this._expenseRepo.findWithFilters(walletId, filters);
    } catch (error: any) {
      logger.error(`ExpenseService.getExpenses error: ${error.message}`);
      throw error;
    }
  }

  async getExpenseById(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, expenseId: string | Types.ObjectId) {
    try {
      await this._checkWalletAccess(walletId, userId);
      
      const expense = await this._expenseRepo.findById(expenseId);
      if (!expense) throw new NotFoundError(MESSAGES.ERROR_NOT_FOUND);

      return expense;
    } catch (error: any) {
      logger.error(`ExpenseService.getExpenseById error: ${error.message}`);
      throw error;
    }
  }

  async updateExpense(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, expenseId: string | Types.ObjectId, data: any) {
    try {
      await this._checkWalletAccess(walletId, userId);
      
      const expense = await this._expenseRepo.update(expenseId, data);
      if (!expense) throw new NotFoundError(MESSAGES.ERROR_NOT_FOUND);

      return expense;
    } catch (error: any) {
      logger.error(`ExpenseService.updateExpense error: ${error.message}`);
      throw error;
    }
  }

  async deleteExpense(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, expenseId: string | Types.ObjectId) {
    try {
      await this._checkWalletAccess(walletId, userId);
      
      const expense = await this._expenseRepo.delete(expenseId);
      if (!expense) throw new NotFoundError(MESSAGES.ERROR_NOT_FOUND);

      return expense;
    } catch (error: any) {
      logger.error(`ExpenseService.deleteExpense error: ${error.message}`);
      throw error;
    }
  }
}
