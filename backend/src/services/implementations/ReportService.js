const { ForbiddenError } = require('../../errors');
const logger = require('../../utils/logger');

/**
 * ReportService - Generates all analytical reports
 */
class ReportService {
  constructor(expenseRepository, incomeRepository, walletRepository) {
    this._expenseRepo = expenseRepository;
    this._incomeRepo = incomeRepository;
    this._walletRepo = walletRepository;
  }

  async getDashboard(walletId, userId) {
    await this._assertWalletAccess(walletId, userId);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [
      totalIncome,
      totalExpense,
      todayExpense,
      monthExpense,
      monthIncome,
      categoryBreakdown,
      expenseMonthlyTrend,
      incomeMonthlyTrend,
      weeklySpending,
      recentExpenses,
    ] = await Promise.all([
      this._incomeRepo.getTotalByWallet(walletId),
      this._expenseRepo.getTotalByWallet(walletId),
      this._expenseRepo.getTodayTotal(walletId),
      this._expenseRepo.getMonthTotal(walletId, month, year),
      this._incomeRepo.getMonthTotal(walletId, month, year),
      this._expenseRepo.getCategoryBreakdown(walletId),
      this._expenseRepo.getMonthlyTrend(walletId, 6),
      this._incomeRepo.getMonthlyTrend(walletId, 6),
      this._expenseRepo.getWeeklySpending(walletId),
      this._expenseRepo.getRecentTransactions(walletId, 10),
    ]);

    const balance = totalIncome - totalExpense;
    const monthBalance = monthIncome - monthExpense;

    return {
      balance,
      totalIncome,
      totalExpense,
      todayExpense,
      monthExpense,
      monthIncome,
      monthBalance,
      categoryBreakdown,
      expenseMonthlyTrend,
      incomeMonthlyTrend,
      weeklySpending,
      recentExpenses,
    };
  }

  async getWidgetData(walletId, userId) {
    await this._assertWalletAccess(walletId, userId);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [totalIncome, totalExpense, todayExpense, monthExpense] = await Promise.all([
      this._incomeRepo.getTotalByWallet(walletId),
      this._expenseRepo.getTotalByWallet(walletId),
      this._expenseRepo.getTodayTotal(walletId),
      this._expenseRepo.getMonthTotal(walletId, month, year),
    ]);

    return {
      balance: totalIncome - totalExpense,
      todayExpense,
      monthExpense,
    };
  }

  async getMonthlyReport(walletId, userId, month, year) {
    await this._assertWalletAccess(walletId, userId);

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [income, expense, categoryBreakdown, sourceBreakdown] = await Promise.all([
      this._incomeRepo.getMonthTotal(walletId, month, year),
      this._expenseRepo.getMonthTotal(walletId, month, year),
      this._expenseRepo.getCategoryBreakdown(walletId, start, end),
      this._incomeRepo.getSourceBreakdown(walletId, start, end),
    ]);

    return {
      month, year,
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      categoryBreakdown,
      sourceBreakdown,
    };
  }

  async getYearlyReport(walletId, userId, year) {
    await this._assertWalletAccess(walletId, userId);

    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59, 999);

    const [totalIncome, totalExpense, monthlyIncome, monthlyExpense] = await Promise.all([
      this._incomeRepo.getTotalByWallet(walletId, start, end),
      this._expenseRepo.getTotalByWallet(walletId, start, end),
      this._incomeRepo.getMonthlyTrend(walletId, 12),
      this._expenseRepo.getMonthlyTrend(walletId, 12),
    ]);

    return {
      year,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      monthlyIncome,
      monthlyExpense,
    };
  }

  async _assertWalletAccess(walletId, userId) {
    const hasAccess = await this._walletRepo.isMember(walletId, userId);
    if (!hasAccess) throw new ForbiddenError('Access denied');
  }
}

module.exports = ReportService;
