const { NotFoundError, ForbiddenError } = require('../../errors');
const { ActivityType } = require('../../enums');
const logger = require('../../utils/logger');

class IncomeService {
  constructor(incomeRepository, walletRepository, activityRepository) {
    this._incomeRepo = incomeRepository;
    this._walletRepo = walletRepository;
    this._activityRepo = activityRepository;
  }

  async addIncome(userId, walletId, data) {
    await this._assertWalletAccess(walletId, userId);
    const income = await this._incomeRepo.create({ ...data, user: userId, wallet: walletId });
    await this._logActivity(userId, walletId, ActivityType.INCOME_ADDED,
      `Added ₹${data.amount} income: ${data.title}`);
    return income;
  }

  async updateIncome(incomeId, userId, data) {
    const income = await this._incomeRepo.findById(incomeId);
    if (!income) throw new NotFoundError('Income not found');
    await this._assertWalletAccess(income.wallet, userId);
    const updated = await this._incomeRepo.updateById(incomeId, data);
    await this._logActivity(userId, income.wallet, ActivityType.INCOME_UPDATED,
      `Updated income: ${updated.title}`);
    return updated;
  }

  async deleteIncome(incomeId, userId) {
    const income = await this._incomeRepo.findById(incomeId);
    if (!income) throw new NotFoundError('Income not found');
    await this._assertWalletAccess(income.wallet, userId);
    await this._incomeRepo.deleteById(incomeId);
    await this._logActivity(userId, income.wallet, ActivityType.INCOME_DELETED,
      `Deleted income: ${income.title} (₹${income.amount})`);
  }

  async getIncome(incomeId, userId) {
    const income = await this._incomeRepo.findById(incomeId, [{ path: 'user', select: 'name avatar' }]);
    if (!income) throw new NotFoundError('Income not found');
    await this._assertWalletAccess(income.wallet, userId);
    return income;
  }

  async getIncomes(walletId, userId, filters, options) {
    await this._assertWalletAccess(walletId, userId);
    return this._incomeRepo.findByWallet(walletId, filters, options);
  }

  async getWalletBalance(walletId, userId) {
    await this._assertWalletAccess(walletId, userId);
    const [totalIncome, totalExpense] = await Promise.all([
      this._incomeRepo.getTotalByWallet(walletId),
      // We'll import dynamically to avoid circular dependency
      this._getExpenseTotal(walletId),
    ]);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }

  async _getExpenseTotal(walletId) {
    try {
      const Expense = require('../../models/Expense');
      const result = await Expense.aggregate([
        { $match: { wallet: walletId } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);
      return result[0]?.total || 0;
    } catch {
      return 0;
    }
  }

  async _assertWalletAccess(walletId, userId) {
    const hasAccess = await this._walletRepo.isMember(walletId, userId);
    if (!hasAccess) throw new ForbiddenError('You do not have access to this wallet');
  }

  async _logActivity(userId, walletId, type, message) {
    try {
      await this._activityRepo.create({ user: userId, wallet: walletId, type, message });
    } catch (err) {
      logger.error(`Activity log failed: ${err.message}`);
    }
  }
}

module.exports = IncomeService;
