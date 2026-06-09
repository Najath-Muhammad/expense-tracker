import { Types } from 'mongoose';
import { BaseRepository } from './BaseRepository';
import { IWalletRepository } from '../interfaces/IWalletRepository';
import Wallet from '../../models/Wallet';
import { IWallet } from '../../types';

export class WalletRepository extends BaseRepository<IWallet> implements IWalletRepository {
  constructor() {
    super(Wallet);
  }

  async findUserWallets(userId: string | Types.ObjectId): Promise<IWallet[]> {
    return this.find(
      {
        $or: [
          { owner: userId },
          { 'members.user': userId },
        ],
        isActive: true,
      },
      {
        populate: [
          { path: 'owner', select: 'name email avatar' },
          { path: 'members.user', select: 'name email avatar' },
        ],
        sort: { updatedAt: -1 },
      }
    );
  }

  async findByInviteCode(code: string): Promise<IWallet | null> {
    return this.findOne({ inviteCode: code, isActive: true });
  }

  async addMember(walletId: string | Types.ObjectId, memberData: any): Promise<IWallet | null> {
    return this._model.findByIdAndUpdate(
      walletId,
      { $push: { members: memberData } },
      { new: true, runValidators: true }
    ).exec();
  }

  async removeMember(walletId: string | Types.ObjectId, userId: string | Types.ObjectId): Promise<IWallet | null> {
    return this._model.findByIdAndUpdate(
      walletId,
      { $pull: { members: { user: userId } } },
      { new: true }
    ).exec();
  }

  async updateMemberRole(walletId: string | Types.ObjectId, userId: string | Types.ObjectId, role: string): Promise<IWallet | null> {
    return this._model.findOneAndUpdate(
      { _id: walletId, 'members.user': userId },
      { $set: { 'members.$.role': role } },
      { new: true, runValidators: true }
    ).exec();
  }
}
