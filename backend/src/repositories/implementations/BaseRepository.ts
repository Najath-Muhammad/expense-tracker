import mongoose, { Model, Document, Types } from 'mongoose';
import { IBaseRepository } from '../interfaces/IBaseRepository';

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  protected _model: Model<T>;

  constructor(model: Model<T>) {
    this._model = model;
  }

  async findById(id: string | Types.ObjectId): Promise<T | null> {
    return this._model.findById(id).exec();
  }

  async findOne(filter: any): Promise<T | null> {
    return this._model.findOne(filter).exec();
  }

  async find(
    filter: any = {},
    options: {
      sort?: any;
      skip?: number;
      limit?: number;
      populate?: any;
      select?: string;
    } = {}
  ): Promise<T[]> {
    let query: any = this._model.find(filter);

    if (options.sort) {
      query = query.sort(options.sort);
    }
    if (options.skip) {
      query = query.skip(options.skip);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.populate) {
      query = query.populate(options.populate);
    }
    if (options.select) {
      query = query.select(options.select);
    }

    return query.exec() as any as Promise<T[]>;
  }

  async create(data: Partial<T> | any): Promise<T> {
    const document = new this._model(data);
    return document.save() as Promise<T>;
  }

  async update(id: string | Types.ObjectId, data: any): Promise<T | null> {
    return this._model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec() as Promise<T | null>;
  }

  async delete(id: string | Types.ObjectId): Promise<T | null> {
    return this._model.findByIdAndDelete(id).exec() as Promise<T | null>;
  }

  async count(filter: any = {}): Promise<number> {
    return this._model.countDocuments(filter).exec();
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    return this._model.aggregate(pipeline).exec();
  }
}
