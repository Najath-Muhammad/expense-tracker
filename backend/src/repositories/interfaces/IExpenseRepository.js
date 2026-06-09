const IBaseRepository = require('./IBaseRepository');

class IExpenseRepository extends IBaseRepository {
  async findByWallet(walletId, filters, options) { throw new Error('findByWallet() not implemented'); }
  async getTotalByWallet(walletId, startDate, endDate) { throw new Error('getTotalByWallet() not implemented'); }
  async getTodayTotal(walletId) { throw new Error('getTodayTotal() not implemented'); }
  async getMonthTotal(walletId, month, year) { throw new Error('getMonthTotal() not implemented'); }
  async getCategoryBreakdown(walletId, startDate, endDate) { throw new Error('getCategoryBreakdown() not implemented'); }
  async getMonthlyTrend(walletId, months) { throw new Error('getMonthlyTrend() not implemented'); }
  async getWeeklySpending(walletId) { throw new Error('getWeeklySpending() not implemented'); }
  async getRecentTransactions(walletId, limit) { throw new Error('getRecentTransactions() not implemented'); }
  async search(walletId, query) { throw new Error('search() not implemented'); }
}

module.exports = IExpenseRepository;
