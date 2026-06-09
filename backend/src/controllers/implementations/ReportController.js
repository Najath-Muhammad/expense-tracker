const ApiResponse = require('../../utils/apiResponse');
const { StatusCode } = require('../../enums');
const asyncHandler = require('../../middlewares/asyncHandler');

class ReportController {
  constructor(reportService) {
    this._reportService = reportService;

    this.getDashboard = asyncHandler(this.getDashboard.bind(this));
    this.getWidgetData = asyncHandler(this.getWidgetData.bind(this));
    this.getMonthlyReport = asyncHandler(this.getMonthlyReport.bind(this));
    this.getYearlyReport = asyncHandler(this.getYearlyReport.bind(this));
  }

  async getDashboard(req, res) {
    const data = await this._reportService.getDashboard(req.params.walletId, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Dashboard data fetched', data);
  }

  async getWidgetData(req, res) {
    const data = await this._reportService.getWidgetData(req.params.walletId, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Widget data fetched', data);
  }

  async getMonthlyReport(req, res) {
    const { month, year } = req.query;
    const now = new Date();
    const data = await this._reportService.getMonthlyReport(
      req.params.walletId,
      req.user._id,
      Number(month) || now.getMonth() + 1,
      Number(year) || now.getFullYear()
    );
    return ApiResponse.success(res, StatusCode.OK, 'Monthly report fetched', data);
  }

  async getYearlyReport(req, res) {
    const { year } = req.query;
    const data = await this._reportService.getYearlyReport(
      req.params.walletId,
      req.user._id,
      Number(year) || new Date().getFullYear()
    );
    return ApiResponse.success(res, StatusCode.OK, 'Yearly report fetched', data);
  }
}

module.exports = ReportController;
