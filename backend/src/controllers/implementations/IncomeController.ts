import { Response } from 'express';
import { IncomeService } from '../../services/implementations/IncomeService';
import ApiResponse from '../../utils/apiResponse';
import { MESSAGES } from '../../constants';
import { StatusCode } from '../../enums';
import { AuthenticatedRequest, IncomeFilters } from '../../types';
import logger from '../../utils/logger';

export class IncomeController {
  private _incomeService: IncomeService;

  constructor(incomeService: IncomeService) {
    this._incomeService = incomeService;
  }

  async addIncome(req: AuthenticatedRequest, res: Response) {
    try {
      const income = await this._incomeService.addIncome(req.user._id, req.params.walletId as string, req.body);
      return ApiResponse.created(res, MESSAGES.INCOME_ADDED, { income });
    } catch (error: any) {
      logger.error(`IncomeController.addIncome error: ${error.message}`);
      throw error;
    }
  }

  async getIncomeList(req: AuthenticatedRequest, res: Response) {
    try {
      const filters: IncomeFilters = req.query;
      const result = await this._incomeService.getIncomeList(req.user._id, req.params.walletId as string, filters);
      
      const meta = {
        page: Number(filters.page) || 1,
        limit: Number(filters.limit) || 10,
        total: result.total,
      };

      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { income: result.docs }, meta);
    } catch (error: any) {
      logger.error(`IncomeController.getIncomeList error: ${error.message}`);
      throw error;
    }
  }

  async getIncome(req: AuthenticatedRequest, res: Response) {
    try {
      const income = await this._incomeService.getIncomeById(req.user._id, req.params.walletId as string, req.params.id as string);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { income });
    } catch (error: any) {
      logger.error(`IncomeController.getIncome error: ${error.message}`);
      throw error;
    }
  }

  async updateIncome(req: AuthenticatedRequest, res: Response) {
    try {
      const income = await this._incomeService.updateIncome(req.user._id, req.params.walletId as string, req.params.id as string, req.body);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.INCOME_UPDATED, { income });
    } catch (error: any) {
      logger.error(`IncomeController.updateIncome error: ${error.message}`);
      throw error;
    }
  }

  async deleteIncome(req: AuthenticatedRequest, res: Response) {
    try {
      await this._incomeService.deleteIncome(req.user._id, req.params.walletId as string, req.params.id as string);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.INCOME_DELETED);
    } catch (error: any) {
      logger.error(`IncomeController.deleteIncome error: ${error.message}`);
      throw error;
    }
  }

  async getBalance(req: AuthenticatedRequest, res: Response) {
    try {
      // Balance logic normally needs both income and expense, we get total income here
      // For full balance, the report controller is better, but this gets total income.
      const totalIncome = await this._incomeService.getTotalIncome(req.user._id, req.params.walletId as string);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { totalIncome });
    } catch (error: any) {
      logger.error(`IncomeController.getBalance error: ${error.message}`);
      throw error;
    }
  }
}
