import { Response } from 'express';
import { ReportService } from '../../services/implementations/ReportService';
import ApiResponse from '../../utils/apiResponse';
import { MESSAGES } from '../../constants';
import { StatusCode } from '../../enums';
import { AuthenticatedRequest } from '../../types';
import logger from '../../utils/logger';

export class ReportController {
  private _reportService: ReportService;

  constructor(reportService: ReportService) {
    this._reportService = reportService;
  }

  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await this._reportService.getDashboardData(req.user._id, req.params.walletId as string);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, data);
    } catch (error: any) {
      logger.error(`ReportController.getDashboard error: ${error.message}`);
      throw error;
    }
  }

  async getMonthlyReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { month, year } = req.query;
      const data = await this._reportService.getMonthlyReport(
        req.user._id,
        req.params.walletId as string,
        Number(month),
        Number(year)
      );
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, data);
    } catch (error: any) {
      logger.error(`ReportController.getMonthlyReport error: ${error.message}`);
      throw error;
    }
  }

  async getYearlyReport(req: AuthenticatedRequest, res: Response) {
    try {
      const { year } = req.query;
      const data = await this._reportService.getYearlyReport(
        req.user._id,
        req.params.walletId as string,
        Number(year)
      );
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, data);
    } catch (error: any) {
      logger.error(`ReportController.getYearlyReport error: ${error.message}`);
      throw error;
    }
  }
}
