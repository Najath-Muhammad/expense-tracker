import { Types } from 'mongoose';
import { IBaseRepository } from './IBaseRepository';
import { IUser } from '../../types';

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string, includePassword?: boolean): Promise<IUser | null>;
  findByResetToken(token: string): Promise<IUser | null>;
  updateLastLogin(id: string | Types.ObjectId): Promise<void>;
}
