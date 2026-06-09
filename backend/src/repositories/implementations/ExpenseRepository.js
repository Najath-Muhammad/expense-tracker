const BaseRepository = require('./BaseRepository');
const Expense = require('../../models/Expense');
const { PAGINATION } = require('../../constants');

class ExpenseRepository extends BaseRepository {
  constructor() {
    super(Expense);
  }

  async findByWallet(walletId, filters = {}, options = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = 'date',
      sortOrder = 'desc',
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
    } = { ...filters, ...options };

    const query = { wallet: walletId };
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [docs, total] = await Promise.all([
      Expense.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name avatar')
        .lean()
        .exec(),
      Expense.countDocuments(query),
    ]);

    return { docs, total };
  }

  async getTotalByWallet(walletId, startDate, endDate) {
    const query = { wallet: walletId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const result = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getTodayTotal(walletId) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return this.getTotalByWallet(walletId, start, end);
  }

  async getMonthTotal(walletId, month, year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return this.getTotalByWallet(walletId, start, end);
  }

  async getCategoryBreakdown(walletId, startDate, endDate) {
    const query = { wallet: walletId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    return Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  async getMonthlyTrend(walletId, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return Expense.aggregate([
      { $match: { wallet: walletId, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);
  }

  async getWeeklySpending(walletId) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    return Expense.aggregate([
      { $match: { wallet: walletId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          date: { $first: '$date' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);
  }

  async getRecentTransactions(walletId, limit = 10) {
    return Expense.find({ wallet: walletId })
      .sort({ date: -1 })
      .limit(limit)
      .populate('user', 'name avatar')
      .lean()
      .exec();
  }

  async search(walletId, searchQuery) {
    return Expense.find({
      wallet: walletId,
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
      ],
    })
      .sort({ date: -1 })
      .limit(20)
      .lean()
      .exec();
  }
}

module.exports = ExpenseRepository;
