import { Types } from 'mongoose';
import { IWalletRepository } from '../../repositories/interfaces/IWalletRepository';
import Budget from '../../models/Budget';
import Expense from '../../models/Expense';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../errors';
import { MESSAGES, BUDGET_THRESHOLDS } from '../../constants';
import { BudgetStatus } from '../../enums';
import logger from '../../utils/logger';

export class BudgetService {
  private _walletRepo: IWalletRepository;

  constructor(walletRepo: IWalletRepository) {
    this._walletRepo = walletRepo;
  }

  private async _checkWalletAccess(walletId: string | Types.ObjectId, userId: string | Types.ObjectId) {
    const wallet = await this._walletRepo.findById(walletId);
    if (!wallet) throw new NotFoundError(MESSAGES.ERROR_WALLET_NOT_FOUND);
    if (!wallet.isMember(userId)) throw new ForbiddenError(MESSAGES.ERROR_FORBIDDEN);
    return wallet;
  }

  async setBudget(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, amount: number, month: number, year: number) {
    try {
      await this._checkWalletAccess(walletId, userId);

      // Calculate spent so far this month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const expenses = await Expense.aggregate([
        {
          $match: {
            wallet: new Types.ObjectId(walletId.toString()),
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spent = expenses.length > 0 ? expenses[0].total : 0;
      let status: string = BudgetStatus.SAFE;
      const pct = amount > 0 ? (spent / amount) * 100 : 0;

      if (pct >= BUDGET_THRESHOLDS.DANGER) status = BudgetStatus.EXCEEDED;
      else if (pct >= BUDGET_THRESHOLDS.CRITICAL) status = BudgetStatus.DANGER;
      else if (pct >= BUDGET_THRESHOLDS.WARNING) status = BudgetStatus.WARNING;

      const budget = await Budget.findOneAndUpdate(
        { wallet: walletId, month, year },
        { user: userId, amount, spent, status },
        { new: true, upsert: true, runValidators: true }
      );

      return budget;
    } catch (error: any) {
      logger.error(`BudgetService.setBudget error: ${error.message}`);
      throw error;
    }
  }

  async getBudget(walletId: string | Types.ObjectId, userId: string | Types.ObjectId, month: number, year: number) {
    try {
      await this._checkWalletAccess(walletId, userId);
      const budget = await Budget.findOne({ wallet: walletId, month, year });
      if (!budget) throw new NotFoundError(MESSAGES.ERROR_NOT_FOUND);
      return budget;
    } catch (error: any) {
      logger.error(`BudgetService.getBudget error: ${error.message}`);
      throw error;
    }
  }

  async getBudgets(walletId: string | Types.ObjectId, userId: string | Types.ObjectId) {
    try {
      await this._checkWalletAccess(walletId, userId);
      return Budget.find({ wallet: walletId }).sort({ year: -1, month: -1 });
    } catch (error: any) {
      logger.error(`BudgetService.getBudgets error: ${error.message}`);
      throw error;
    }
  }

  // Called automatically by expense service (omitted integration for brevity, but this is the logic)
  async updateBudgetSpending(walletId: string | Types.ObjectId, amount: number, date: Date) {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const budget = await Budget.findOne({ wallet: walletId, month, year });
      if (!budget) return;

      budget.spent += amount;
      
      const pct = (budget.spent / budget.amount) * 100;
      if (pct >= BUDGET_THRESHOLDS.DANGER) budget.status = BudgetStatus.EXCEEDED;
      else if (pct >= BUDGET_THRESHOLDS.CRITICAL) budget.status = BudgetStatus.DANGER;
      else if (pct >= BUDGET_THRESHOLDS.WARNING) budget.status = BudgetStatus.WARNING;

      await budget.save();
    } catch (error: any) {
      logger.error(`BudgetService.updateBudgetSpending error: ${error.message}`);
    }
  }
}
