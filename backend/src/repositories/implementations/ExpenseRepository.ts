import mongoose, { Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { IExpenseRepository } from '../interfaces/IExpenseRepository';
import Expense from '../../models/Expense';
import { IExpense, ExpenseFilters, PaginatedResult } from '../../types';

export class ExpenseRepository extends BaseRepository<IExpense> implements IExpenseRepository {
  constructor() {
    super(Expense);
  }

  async findWithFilters(walletId: string | Types.ObjectId, filters: ExpenseFilters): Promise<PaginatedResult<IExpense>> {
    const query: any = { wallet: new mongoose.Types.ObjectId(walletId.toString()) };

    // Search
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Category
    if (filters.category) {
      query.category = filters.category;
    }

    // Date range
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    // Amount range
    if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
      query.amount = {};
      if (filters.minAmount !== undefined) query.amount.$gte = Number(filters.minAmount);
      if (filters.maxAmount !== undefined) query.amount.$lte = Number(filters.maxAmount);
    }

    // Pagination & Sorting
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

  async getDashboardStats(walletId: string | Types.ObjectId, startDate: Date, endDate: Date): Promise<any> {
    const objectId = new mongoose.Types.ObjectId(walletId.toString());

    return this.aggregate([
      {
        $match: {
          wallet: objectId,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
          ],
          byCategory: [
            {
              $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
              },
            },
            { $sort: { total: -1 } },
          ],
          recent: [
            { $sort: { date: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            {
              $project: {
                title: 1,
                amount: 1,
                category: 1,
                date: 1,
                'user.name': 1,
                'user.avatar': 1,
              },
            },
          ],
        },
      },
    ]);
  }
}
