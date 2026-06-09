import { Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { IUserRepository } from '../interfaces/IUserRepository';
import User from '../../models/User';
import { IUser } from '../../types';

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email: string, includePassword = false): Promise<IUser | null> {
    const query = this._model.findOne({ email });
    if (includePassword) {
      query.select('+password +refreshToken');
    }
    return query.exec();
  }

  async findByResetToken(token: string): Promise<IUser | null> {
    return this._model.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).exec();
  }

  async updateLastLogin(id: string | Types.ObjectId): Promise<void> {
    await this.update(id, { lastLogin: new Date() });
  }
}
