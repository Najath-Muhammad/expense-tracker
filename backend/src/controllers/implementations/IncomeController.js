const ApiResponse = require('../../utils/apiResponse');
const { StatusCode } = require('../../enums');
const asyncHandler = require('../../middlewares/asyncHandler');

class IncomeController {
  constructor(incomeService) {
    this._incomeService = incomeService;

    this.addIncome = asyncHandler(this.addIncome.bind(this));
    this.getIncomes = asyncHandler(this.getIncomes.bind(this));
    this.getIncome = asyncHandler(this.getIncome.bind(this));
    this.updateIncome = asyncHandler(this.updateIncome.bind(this));
    this.deleteIncome = asyncHandler(this.deleteIncome.bind(this));
    this.getBalance = asyncHandler(this.getBalance.bind(this));
  }

  async addIncome(req, res) {
    const income = await this._incomeService.addIncome(
      req.user._id,
      req.params.walletId || req.body.walletId,
      req.body
    );
    return ApiResponse.created(res, 'Income added successfully', { income });
  }

  async getIncomes(req, res) {
    const { page, limit, sortBy, sortOrder, source, startDate, endDate, search } = req.query;
    const { docs, total } = await this._incomeService.getIncomes(
      req.params.walletId,
      req.user._id,
      { source, startDate, endDate, search },
      { page, limit, sortBy, sortOrder }
    );
    return ApiResponse.paginated(res, 'Incomes fetched', docs, page, limit, total);
  }

  async getIncome(req, res) {
    const income = await this._incomeService.getIncome(req.params.id, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Income fetched', { income });
  }

  async updateIncome(req, res) {
    const income = await this._incomeService.updateIncome(req.params.id, req.user._id, req.body);
    return ApiResponse.success(res, StatusCode.OK, 'Income updated', { income });
  }

  async deleteIncome(req, res) {
    await this._incomeService.deleteIncome(req.params.id, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Income deleted');
  }

  async getBalance(req, res) {
    const balance = await this._incomeService.getWalletBalance(req.params.walletId, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Balance fetched', balance);
  }
}

module.exports = IncomeController;
