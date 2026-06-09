import { Response } from 'express';
import { BudgetService } from '../../services/implementations/BudgetService';
import ApiResponse from '../../utils/apiResponse';
import { MESSAGES } from '../../constants';
import { StatusCode } from '../../enums';
import { AuthenticatedRequest } from '../../types';
import logger from '../../utils/logger';

export class BudgetController {
  private _budgetService: BudgetService;

  constructor(budgetService: BudgetService) {
    this._budgetService = budgetService;
  }

  async getBudget(req: AuthenticatedRequest, res: Response) {
    try {
      const now = new Date();
      const budget = await this._budgetService.getBudget(req.params.walletId as string, req.user._id, now.getMonth() + 1, now.getFullYear());
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { budget });
    } catch (error: any) {
      logger.error(`BudgetController.getBudget error: ${error.message}`);
      throw error;
    }
  }

  async getBudgets(req: AuthenticatedRequest, res: Response) {
    try {
      const budgets = await this._budgetService.getBudgets(req.params.walletId as string, req.user._id);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { budgets });
    } catch (error: any) {
      logger.error(`BudgetController.getBudgets error: ${error.message}`);
      throw error;
    }
  }

  async setBudget(req: AuthenticatedRequest, res: Response) {
    try {
      const { amount, month, year } = req.body;
      const budget = await this._budgetService.setBudget(req.user._id, req.params.walletId as string, amount, month, year);
      return ApiResponse.created(res, MESSAGES.BUDGET_SET, { budget });
    } catch (error: any) {
      logger.error(`BudgetController.setBudget error: ${error.message}`);
      throw error;
    }
  }
}
