const ApiResponse = require('../../utils/apiResponse');
const { StatusCode } = require('../../enums');
const asyncHandler = require('../../middlewares/asyncHandler');

class ExpenseController {
  constructor(expenseService) {
    this._expenseService = expenseService;

    this.addExpense = asyncHandler(this.addExpense.bind(this));
    this.getExpenses = asyncHandler(this.getExpenses.bind(this));
    this.getExpense = asyncHandler(this.getExpense.bind(this));
    this.updateExpense = asyncHandler(this.updateExpense.bind(this));
    this.deleteExpense = asyncHandler(this.deleteExpense.bind(this));
    this.getDashboard = asyncHandler(this.getDashboard.bind(this));
  }

  async addExpense(req, res) {
    const expense = await this._expenseService.addExpense(
      req.user._id,
      req.params.walletId || req.body.walletId,
      req.body
    );
    return ApiResponse.created(res, 'Expense added successfully', { expense });
  }

  async getExpenses(req, res) {
    const { page, limit, sortBy, sortOrder, category, startDate, endDate, minAmount, maxAmount, search } = req.query;
    const { docs, total } = await this._expenseService.getExpenses(
      req.params.walletId,
      req.user._id,
      { category, startDate, endDate, minAmount, maxAmount, search },
      { page, limit, sortBy, sortOrder }
    );
    return ApiResponse.paginated(res, 'Expenses fetched', docs, page, limit, total);
  }

  async getExpense(req, res) {
    const expense = await this._expenseService.getExpense(req.params.id, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Expense fetched', { expense });
  }

  async updateExpense(req, res) {
    const expense = await this._expenseService.updateExpense(req.params.id, req.user._id, req.body);
    return ApiResponse.success(res, StatusCode.OK, 'Expense updated', { expense });
  }

  async deleteExpense(req, res) {
    await this._expenseService.deleteExpense(req.params.id, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Expense deleted');
  }

  async getDashboard(req, res) {
    const data = await this._expenseService.getDashboardData(req.params.walletId, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Dashboard data fetched', data);
  }
}

module.exports = ExpenseController;
