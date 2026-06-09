const { NotFoundError, ForbiddenError } = require('../../errors');
const { ActivityType, TransactionType } = require('../../enums');
const logger = require('../../utils/logger');

/**
 * ExpenseService - Business logic for expense management
 */
class ExpenseService {
  constructor(expenseRepository, walletRepository, activityRepository, budgetService) {
    this._expenseRepo = expenseRepository;
    this._walletRepo = walletRepository;
    this._activityRepo = activityRepository;
    this._budgetService = budgetService;
  }

  async addExpense(userId, walletId, data) {
    await this._assertWalletAccess(walletId, userId);

    const expense = await this._expenseRepo.create({
      ...data,
      user: userId,
      wallet: walletId,
    });

    // Update budget spending
    if (this._budgetService) {
      await this._budgetService.updateBudgetSpending(walletId, new Date(data.date || Date.now()))
        .catch((e) => logger.error(`Budget update failed: ${e.message}`));
    }

    const user = await this._getUserName(userId);
    await this._logActivity(
      userId, walletId, ActivityType.EXPENSE_ADDED,
      `${user} added ₹${data.amount} ${data.category} expense: ${data.title}`
    );

    return expense;
  }

  async updateExpense(expenseId, userId, data) {
    const expense = await this._expenseRepo.findById(expenseId);
    if (!expense) throw new NotFoundError('Expense not found');

    await this._assertWalletAccess(expense.wallet, userId);

    const updated = await this._expenseRepo.updateById(expenseId, data);

    // Re-calculate budget
    if (this._budgetService && data.amount !== undefined) {
      await this._budgetService.updateBudgetSpending(expense.wallet, expense.date)
        .catch((e) => logger.error(`Budget update failed: ${e.message}`));
    }

    await this._logActivity(
      userId, expense.wallet, ActivityType.EXPENSE_UPDATED,
      `Updated expense: ${updated.title}`
    );

    return updated;
  }

  async deleteExpense(expenseId, userId) {
    const expense = await this._expenseRepo.findById(expenseId);
    if (!expense) throw new NotFoundError('Expense not found');

    await this._assertWalletAccess(expense.wallet, userId);

    await this._expenseRepo.deleteById(expenseId);

    // Re-calculate budget
    if (this._budgetService) {
      await this._budgetService.updateBudgetSpending(expense.wallet, expense.date)
        .catch((e) => logger.error(`Budget update failed: ${e.message}`));
    }

    await this._logActivity(
      userId, expense.wallet, ActivityType.EXPENSE_DELETED,
      `Deleted expense: ${expense.title} (₹${expense.amount})`
    );
  }

  async getExpense(expenseId, userId) {
    const expense = await this._expenseRepo.findById(expenseId, [
      { path: 'user', select: 'name avatar' },
    ]);
    if (!expense) throw new NotFoundError('Expense not found');
    await this._assertWalletAccess(expense.wallet, userId);
    return expense;
  }

  async getExpenses(walletId, userId, filters, options) {
    await this._assertWalletAccess(walletId, userId);
    return this._expenseRepo.findByWallet(walletId, filters, options);
  }

  async getDashboardData(walletId, userId) {
    await this._assertWalletAccess(walletId, userId);

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [
      totalExpense,
      totalIncome,
      todayExpense,
      monthExpense,
      categoryBreakdown,
      monthlyTrend,
      weeklySpending,
      recentTransactions,
    ] = await Promise.all([
      this._expenseRepo.getTotalByWallet(walletId),
      null, // Will be filled by income service
      this._expenseRepo.getTodayTotal(walletId),
      this._expenseRepo.getMonthTotal(walletId, month, year),
      this._expenseRepo.getCategoryBreakdown(walletId),
      this._expenseRepo.getMonthlyTrend(walletId, 6),
      this._expenseRepo.getWeeklySpending(walletId),
      this._expenseRepo.getRecentTransactions(walletId, 10),
    ]);

    return {
      todayExpense,
      monthExpense,
      totalExpense,
      categoryBreakdown,
      monthlyTrend,
      weeklySpending,
      recentTransactions,
    };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  async _assertWalletAccess(walletId, userId) {
    const hasAccess = await this._walletRepo.isMember(walletId, userId);
    if (!hasAccess) throw new ForbiddenError('You do not have access to this wallet');
  }

  async _getUserName(userId) {
    try {
      const user = await this._walletRepo._model?.findById?.(userId) ?? null;
      return user?.name || 'User';
    } catch {
      return 'User';
    }
  }

  async _logActivity(userId, walletId, type, message) {
    try {
      await this._activityRepo.create({ user: userId, wallet: walletId, type, message });
    } catch (err) {
      logger.error(`Activity log failed: ${err.message}`);
    }
  }
}

module.exports = ExpenseService;
