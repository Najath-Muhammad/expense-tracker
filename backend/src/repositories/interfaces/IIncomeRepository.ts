import { Types } from 'mongoose';
import { IBaseRepository } from './IBaseRepository';
import { IIncome, IncomeFilters, PaginatedResult } from '../../types';

export interface IIncomeRepository extends IBaseRepository<IIncome> {
  findWithFilters(walletId: string | Types.ObjectId, filters: IncomeFilters): Promise<PaginatedResult<IIncome>>;
  getTotalIncome(walletId: string | Types.ObjectId, startDate?: Date, endDate?: Date): Promise<number>;
}
