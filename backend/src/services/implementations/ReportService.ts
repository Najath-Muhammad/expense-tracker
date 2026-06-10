import { Types } from 'mongoose';
import { IExpenseRepository } from '../../repositories/interfaces/IExpenseRepository';
import { IIncomeRepository } from '../../repositories/interfaces/IIncomeRepository';
import { IWalletRepository } from '../../repositories/interfaces/IWalletRepository';
import { NotFoundError, ForbiddenError } from '../../errors';
import { MESSAGES } from '../../constants';
import logger from '../../utils/logger';

export class ReportService {
  private _expenseRepo: IExpenseRepository;
  private _incomeRepo: IIncomeRepository;
  private _walletRepo: IWalletRepository;

  constructor(expenseRepo: IExpenseRepository, incomeRepo: IIncomeRepository, walletRepo: IWalletRepository) {
    this._expenseRepo = expenseRepo;
    this._incomeRepo = incomeRepo;
    this._walletRepo = walletRepo;
  }

  private async _checkWalletAccess(walletId: string | Types.ObjectId, userId: string | Types.ObjectId) {
    const wallet = await this._walletRepo.findById(walletId);
    if (!wallet) throw new NotFoundError(MESSAGES.ERROR_WALLET_NOT_FOUND);
    if (!wallet.isMember(userId)) throw new ForbiddenError(MESSAGES.ERROR_FORBIDDEN);
    return wallet;
  }

  async getDashboardData(userId: string | Types.ObjectId, walletId: string | Types.ObjectId) {
    try {
      await this._checkWalletAccess(walletId, userId);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const todayEnd   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      // Start of current week (Monday)
      const dayOfWeek = now.getDay();
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
      const weekEnd   = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const [totalIncome, totalExpense, dashboardStats, todayAgg, weeklyAgg] = await Promise.all([
        this._incomeRepo.getTotalIncome(walletId),
        this._expenseRepo.aggregate([
          { $match: { wallet: new Types.ObjectId(walletId.toString()) } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        this._expenseRepo.getDashboardStats(walletId, firstDayOfMonth, new Date()),
        // Today's total
        this._expenseRepo.aggregate([
          { $match: { wallet: new Types.ObjectId(walletId.toString()), date: { $gte: todayStart, $lte: todayEnd } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        // This week — group by day-of-week
        this._expenseRepo.aggregate([
          { $match: { wallet: new Types.ObjectId(walletId.toString()), date: { $gte: weekStart, $lte: weekEnd } } },
          { $group: { _id: { $dayOfWeek: '$date' }, total: { $sum: '$amount' } } },
          { $sort: { '_id': 1 } },
        ]),
      ]);

      const monthIncome = await this._incomeRepo.getTotalIncome(walletId, firstDayOfMonth, new Date());
      
      const expenseTotal  = totalExpense.length > 0 ? totalExpense[0].total : 0;
      const todayExpense  = todayAgg.length   > 0 ? todayAgg[0].total   : 0;
      const balance       = totalIncome - expenseTotal;

      const stats        = dashboardStats.length > 0 ? dashboardStats[0] : { totalStats: [], byCategory: [], recent: [] };
      const monthExpense = stats.totalStats.length > 0 ? stats.totalStats[0].totalAmount : 0;

      // Build Mon-Sun weekly array
      const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      // MongoDB $dayOfWeek: 1=Sun, 2=Mon … 7=Sat  →  convert to Mon-based index
      const weeklyMap: Record<number, number> = {};
      for (const row of weeklyAgg) {
        const mongoDow = row._id as number;
        const monIndex = mongoDow === 1 ? 6 : mongoDow - 2;
        weeklyMap[monIndex] = row.total;
      }
      const weeklyExpense = DAY_NAMES.map((day, i) => ({ day, amount: weeklyMap[i] || 0 }));

      // Add a simple aggregate for the past 6 months trend
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0,0,0,0);

      const expenseTrend = await this._expenseRepo.aggregate([
        { $match: { wallet: new Types.ObjectId(walletId.toString()), date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const incomeTrend = await this._incomeRepo.aggregate([
        { $match: { wallet: new Types.ObjectId(walletId.toString()), date: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      return {
        balance,
        totalIncome,
        totalExpense: expenseTotal,
        todayExpense,
        weeklyExpense,
        monthIncome,
        monthExpense,
        categoryBreakdown: stats.byCategory,
        expenseMonthlyTrend: expenseTrend,
        incomeMonthlyTrend: incomeTrend,
        recentExpenses: stats.recent,
      };
    } catch (error: any) {
      logger.error(`ReportService.getDashboardData error: ${error.message}`);
      throw error;
    }
  }

  async getWidgetData(userId: string | Types.ObjectId, walletId: string | Types.ObjectId) {
    try {
      await this._checkWalletAccess(walletId, userId);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [totalIncome, totalExpense] = await Promise.all([
        this._incomeRepo.getTotalIncome(walletId),
        this._expenseRepo.aggregate([
          { $match: { wallet: new Types.ObjectId(walletId.toString()) } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

      const expenseTotal = totalExpense.length > 0 ? totalExpense[0].total : 0;
      const balance = totalIncome - expenseTotal;

      const recentExpenses = await this._expenseRepo.findWithFilters(walletId.toString(), { limit: 3 });

      return {
        balance,
        totalIncome,
        totalExpense: expenseTotal,
        recentExpenses: recentExpenses.docs,
        currency: 'INR',
        updatedAt: new Date(),
      };
    } catch (error: any) {
      logger.error(`ReportService.getWidgetData error: ${error.message}`);
      throw error;
    }
  }

  async getMonthlyReport(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, month: number, year: number) {
    try {
      await this._checkWalletAccess(walletId, userId);

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const totalIncome = await this._incomeRepo.getTotalIncome(walletId, startDate, endDate);
      const expenses = await this._expenseRepo.aggregate([
        { $match: { wallet: new Types.ObjectId(walletId.toString()), date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const totalExpense = expenses.length > 0 ? expenses[0].total : 0;

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      };
    } catch (error: any) {
      logger.error(`ReportService.getMonthlyReport error: ${error.message}`);
      throw error;
    }
  }

  async getYearlyReport(userId: string | Types.ObjectId, walletId: string | Types.ObjectId, year: number) {
    try {
      await this._checkWalletAccess(walletId, userId);

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      const totalIncome = await this._incomeRepo.getTotalIncome(walletId, startDate, endDate);
      const expenses = await this._expenseRepo.aggregate([
        { $match: { wallet: new Types.ObjectId(walletId.toString()), date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const totalExpense = expenses.length > 0 ? expenses[0].total : 0;

      return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      };
    } catch (error: any) {
      logger.error(`ReportService.getYearlyReport error: ${error.message}`);
      throw error;
    }
  }
}
