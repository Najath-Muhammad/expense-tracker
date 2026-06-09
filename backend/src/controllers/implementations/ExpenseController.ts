import { Response } from 'express';
import { ExpenseService } from '../../services/implementations/ExpenseService';
import ApiResponse from '../../utils/apiResponse';
import { MESSAGES } from '../../constants';
import { StatusCode } from '../../enums';
import { AuthenticatedRequest, ExpenseFilters } from '../../types';
import logger from '../../utils/logger';

export class ExpenseController {
  private _expenseService: ExpenseService;

  constructor(expenseService: ExpenseService) {
    this._expenseService = expenseService;
  }

  async addExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const expense = await this._expenseService.addExpense(req.user._id, req.params.walletId as string, req.body);
      return ApiResponse.created(res, MESSAGES.EXPENSE_ADDED, { expense });
    } catch (error: any) {
      logger.error(`ExpenseController.addExpense error: ${error.message}`);
      throw error;
    }
  }

  async getExpenses(req: AuthenticatedRequest, res: Response) {
    try {
      const filters: ExpenseFilters = req.query;
      const result = await this._expenseService.getExpenses(req.user._id, req.params.walletId as string, filters);
      
      const meta = {
        page: Number(filters.page) || 1,
        limit: Number(filters.limit) || 10,
        total: result.total,
      };

      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { expenses: result.docs }, meta);
    } catch (error: any) {
      logger.error(`ExpenseController.getExpenses error: ${error.message}`);
      throw error;
    }
  }

  async getExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const expense = await this._expenseService.getExpenseById(req.user._id, req.params.walletId as string, req.params.id as string);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.FETCHED, { expense });
    } catch (error: any) {
      logger.error(`ExpenseController.getExpense error: ${error.message}`);
      throw error;
    }
  }

  async updateExpense(req: AuthenticatedRequest, res: Response) {
    try {
      const expense = await this._expenseService.updateExpense(req.user._id, req.params.walletId as string, req.params.id as string, req.body);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.EXPENSE_UPDATED, { expense });
    } catch (error: any) {
      logger.error(`ExpenseController.updateExpense error: ${error.message}`);
      throw error;
    }
  }

  async deleteExpense(req: AuthenticatedRequest, res: Response) {
    try {
      await this._expenseService.deleteExpense(req.user._id, req.params.walletId as string, req.params.id as string);
      return ApiResponse.success(res, StatusCode.OK, MESSAGES.EXPENSE_DELETED);
    } catch (error: any) {
      logger.error(`ExpenseController.deleteExpense error: ${error.message}`);
      throw error;
    }
  }
}
