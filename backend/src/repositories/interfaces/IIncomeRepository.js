const IBaseRepository = require('./IBaseRepository');

class IIncomeRepository extends IBaseRepository {
  async findByWallet(walletId, filters, options) { throw new Error('findByWallet() not implemented'); }
  async getTotalByWallet(walletId, startDate, endDate) { throw new Error('getTotalByWallet() not implemented'); }
  async getMonthTotal(walletId, month, year) { throw new Error('getMonthTotal() not implemented'); }
  async getMonthlyTrend(walletId, months) { throw new Error('getMonthlyTrend() not implemented'); }
  async getSourceBreakdown(walletId, startDate, endDate) { throw new Error('getSourceBreakdown() not implemented'); }
}

module.exports = IIncomeRepository;
