import mongoose, { Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { IIncomeRepository } from '../interfaces/IIncomeRepository';
import Income from '../../models/Income';
import { IIncome, IncomeFilters, PaginatedResult } from '../../types';

export class IncomeRepository extends BaseRepository<IIncome> implements IIncomeRepository {
  constructor() {
    super(Income);
  }

  async findWithFilters(walletId: string | Types.ObjectId, filters: IncomeFilters): Promise<PaginatedResult<IIncome>> {
    const query: any = { wallet: new mongoose.Types.ObjectId(walletId.toString()) };

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { note: { $regex: filters.search, $options: 'i' } },
      ];
    }

    if (filters.source) {
      query.source = filters.source;
    }

    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 10;
    const skip = (page - 1) * limit;
    
    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const sort: any = { [sortField]: sortOrder, createdAt: -1 };

    const [docs, total] = await Promise.all([
      this._model.find(query).sort(sort).skip(skip).limit(limit).populate('user', 'name avatar').exec(),
      this._model.countDocuments(query).exec(),
    ]);

    return { docs, total };
  }

  async getTotalIncome(walletId: string | Types.ObjectId, startDate?: Date, endDate?: Date): Promise<number> {
    const query: any = { wallet: new mongoose.Types.ObjectId(walletId.toString()) };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const result = await this.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    return result.length > 0 ? result[0].total : 0;
  }
}
