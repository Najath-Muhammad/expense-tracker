import { Types } from 'mongoose';
import { IBaseRepository } from './IBaseRepository';
import { IExpense, ExpenseFilters, PaginatedResult } from '../../types';

export interface IExpenseRepository extends IBaseRepository<IExpense> {
  findWithFilters(walletId: string | Types.ObjectId, filters: ExpenseFilters): Promise<PaginatedResult<IExpense>>;
  getDashboardStats(walletId: string | Types.ObjectId, startDate: Date, endDate: Date): Promise<any>;
}
