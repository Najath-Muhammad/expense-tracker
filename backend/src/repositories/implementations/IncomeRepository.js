const BaseRepository = require('./BaseRepository');
const Income = require('../../models/Income');
const { PAGINATION } = require('../../constants');

class IncomeRepository extends BaseRepository {
  constructor() {
    super(Income);
  }

  async findByWallet(walletId, filters = {}, options = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      sortBy = 'date',
      sortOrder = 'desc',
      source,
      startDate,
      endDate,
      search,
    } = { ...filters, ...options };

    const query = { wallet: walletId };
    if (source) query.source = source;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [docs, total] = await Promise.all([
      Income.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('user', 'name avatar')
        .lean()
        .exec(),
      Income.countDocuments(query),
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
    const result = await Income.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getMonthTotal(walletId, month, year) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    return this.getTotalByWallet(walletId, start, end);
  }

  async getMonthlyTrend(walletId, months = 6) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    return Income.aggregate([
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

  async getSourceBreakdown(walletId, startDate, endDate) {
    const query = { wallet: walletId };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    return Income.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$source',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }
}

module.exports = IncomeRepository;
