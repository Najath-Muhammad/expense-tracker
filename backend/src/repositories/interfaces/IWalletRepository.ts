import { Types } from 'mongoose';
import { IBaseRepository } from './IBaseRepository';
import { IWallet } from '../../types';

export interface IWalletRepository extends IBaseRepository<IWallet> {
  findUserWallets(userId: string | Types.ObjectId): Promise<IWallet[]>;
  findByInviteCode(code: string): Promise<IWallet | null>;
  addMember(walletId: string | Types.ObjectId, memberData: any): Promise<IWallet | null>;
  removeMember(walletId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<IWallet | null>;
  updateMemberRole(walletId: string | Types.ObjectId, userId: string | Types.ObjectId, role: string): Promise<IWallet | null>;
}
