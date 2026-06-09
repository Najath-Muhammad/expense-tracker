import mongoose, { Document, Types } from 'mongoose';

export interface IBaseRepository<T extends Document> {
  findById(id: string | Types.ObjectId): Promise<T | null>;
  findOne(filter: any): Promise<T | null>;
  find(
    filter: any,
    options?: {
      sort?: any;
      skip?: number;
      limit?: number;
      populate?: any;
      select?: string;
    }
  ): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string | Types.ObjectId, data: any): Promise<T | null>;
  delete(id: string | Types.ObjectId): Promise<T | null>;
  count(filter: any): Promise<number>;
  aggregate(pipeline: any[]): Promise<any[]>;
}
