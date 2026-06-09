const { NotFoundError, ForbiddenError, ConflictError } = require('../../errors');
const { BudgetStatus, BUDGET_THRESHOLDS, ActivityType, NotificationType } = require('../../enums');
const { BUDGET_THRESHOLDS: THRESHOLDS } = require('../../constants');
const logger = require('../../utils/logger');
const Budget = require('../../models/Budget');
const Expense = require('../../models/Expense');

class BudgetService {
  constructor(walletRepository, activityRepository) {
    this._walletRepo = walletRepository;
    this._activityRepo = activityRepository;
  }

  async setBudget(userId, walletId, amount, month, year) {
    await this._assertWalletAccess(walletId, userId);

    // Upsert budget
    const budget = await Budget.findOneAndUpdate(
      { wallet: walletId, month, year },
      { $set: { user: userId, amount } },
      { upsert: true, new: true, runValidators: true }
    );

    // Calculate current spending
    const spent = await this._calculateMonthSpending(walletId, month, year);
    await Budget.findByIdAndUpdate(budget._id, {
      spent,
      status: this._calculateStatus(amount, spent),
    });

    await this._logActivity(userId, walletId, ActivityType.BUDGET_SET,
      `Set monthly budget to ₹${amount} for ${month}/${year}`);

    return budget;
  }

  async getBudget(walletId, userId, month, year) {
    await this._assertWalletAccess(walletId, userId);
    const budget = await Budget.findOne({ wallet: walletId, month, year }).lean();
    if (!budget) throw new NotFoundError('Budget not set for this period');
    return budget;
  }

  async getBudgets(walletId, userId) {
    await this._assertWalletAccess(walletId, userId);
    return Budget.find({ wallet: walletId }).sort({ year: -1, month: -1 }).lean();
  }

  async updateBudgetSpending(walletId, date) {
    const d = new Date(date);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();

    const budget = await Budget.findOne({ wallet: walletId, month, year });
    if (!budget) return; // No budget set

    const spent = await this._calculateMonthSpending(walletId, month, year);
    const status = this._calculateStatus(budget.amount, spent);

    await Budget.findByIdAndUpdate(budget._id, { spent, status });

    // Check if notifications need to be sent
    this._checkBudgetThresholds(budget, spent);
  }

  async _calculateMonthSpending(walletId, month, year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await Expense.aggregate([
      { $match: { wallet: walletId, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  _calculateStatus(budget, spent) {
    const pct = (spent / budget) * 100;
    if (pct >= THRESHOLDS.EXCEEDED) return BudgetStatus.EXCEEDED;
    if (pct >= THRESHOLDS.DANGER) return BudgetStatus.DANGER;
    if (pct >= THRESHOLDS.CRITICAL) return BudgetStatus.CRITICAL;
    if (pct >= THRESHOLDS.WARNING) return BudgetStatus.WARNING;
    return BudgetStatus.SAFE;
  }

  _checkBudgetThresholds(budget, spent) {
    const pct = (spent / budget.amount) * 100;
    // TODO: emit socket event / send push notification
    if (pct >= 100 && !budget.notifiedAt100) {
      logger.warn(`[BUDGET EXCEEDED] Wallet ${budget.wallet}: ${pct.toFixed(0)}%`);
    }
  }

  async _assertWalletAccess(walletId, userId) {
    const hasAccess = await this._walletRepo.isMember(walletId, userId);
    if (!hasAccess) throw new ForbiddenError('Access denied');
  }

  async _logActivity(userId, walletId, type, message) {
    try {
      await this._activityRepo.create({ user: userId, wallet: walletId, type, message });
    } catch (err) {
      logger.error(`Activity log failed: ${err.message}`);
    }
  }
}

module.exports = BudgetService;
