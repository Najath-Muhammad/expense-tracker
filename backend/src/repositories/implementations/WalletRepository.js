const BaseRepository = require('./BaseRepository');
const Wallet = require('../../models/Wallet');
const { WalletRole } = require('../../enums');

class WalletRepository extends BaseRepository {
  constructor() {
    super(Wallet);
  }

  async findByUser(userId) {
    return Wallet.find({
      $or: [{ owner: userId }, { 'members.user': userId }],
      isActive: true,
    })
      .populate('owner', 'name avatar email')
      .populate('members.user', 'name avatar email')
      .lean()
      .exec();
  }

  async findByInviteCode(code) {
    return Wallet.findOne({ inviteCode: code, isActive: true })
      .populate('owner', 'name avatar email')
      .populate('members.user', 'name avatar email')
      .lean()
      .exec();
  }

  async addMember(walletId, userId, role = WalletRole.MEMBER, addedBy = null) {
    return Wallet.findByIdAndUpdate(
      walletId,
      {
        $push: {
          members: { user: userId, role, joinedAt: new Date(), addedBy },
        },
      },
      { new: true }
    )
      .populate('members.user', 'name avatar email')
      .lean()
      .exec();
  }

  async removeMember(walletId, userId) {
    return Wallet.findByIdAndUpdate(
      walletId,
      { $pull: { members: { user: userId } } },
      { new: true }
    ).lean().exec();
  }

  async updateMemberRole(walletId, userId, role) {
    return Wallet.findOneAndUpdate(
      { _id: walletId, 'members.user': userId },
      { $set: { 'members.$.role': role } },
      { new: true }
    ).lean().exec();
  }

  async transferOwnership(walletId, newOwnerId) {
    return Wallet.findByIdAndUpdate(
      walletId,
      { $set: { owner: newOwnerId } },
      { new: true }
    ).lean().exec();
  }

  async isMember(walletId, userId) {
    const wallet = await Wallet.findOne({
      _id: walletId,
      $or: [{ owner: userId }, { 'members.user': userId }],
    }).lean();
    return !!wallet;
  }
}

module.exports = WalletRepository;
