const { NotFoundError, ForbiddenError, ConflictError } = require('../../errors');
const { WalletRole, WalletType, ActivityType } = require('../../enums');
const { PERMISSIONS } = require('../../constants');
const logger = require('../../utils/logger');

/**
 * WalletService - Business logic for wallet management
 */
class WalletService {
  constructor(walletRepository, activityRepository, userRepository) {
    this._walletRepo = walletRepository;
    this._activityRepo = activityRepository;
    this._userRepo = userRepository;
  }

  async createWallet(userId, data) {
    const { name, type = WalletType.PERSONAL, description, icon, color, currency, monthlyBudget } = data;

    const wallet = await this._walletRepo.create({
      name, type, description, icon, color, currency,
      monthlyBudget: monthlyBudget || null,
      owner: userId,
      members: [],
    });

    // Set as user's active wallet if they don't have one
    const user = await this._userRepo.findById(userId);
    if (!user.activeWallet) {
      await this._userRepo.updateById(userId, { activeWallet: wallet._id });
    }

    await this._logActivity(userId, wallet._id, ActivityType.WALLET_CREATED,
      `Created wallet "${name}"`);

    return wallet;
  }

  async getUserWallets(userId) {
    return this._walletRepo.findByUser(userId);
  }

  async getWalletById(walletId, userId) {
    const wallet = await this._walletRepo.findById(walletId, [
      { path: 'owner', select: 'name avatar email' },
      { path: 'members.user', select: 'name avatar email' },
    ]);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const hasAccess = wallet.owner._id.toString() === userId.toString() ||
      wallet.members.some((m) => m.user._id.toString() === userId.toString());
    if (!hasAccess) throw new ForbiddenError('Access denied to this wallet');

    return wallet;
  }

  async updateWallet(walletId, userId, data) {
    const wallet = await this._ensureOwnerOrAdmin(walletId, userId);
    const updated = await this._walletRepo.updateById(walletId, data);
    await this._logActivity(userId, walletId, ActivityType.WALLET_UPDATED, `Updated wallet "${wallet.name}"`);
    return updated;
  }

  async deleteWallet(walletId, userId) {
    const wallet = await this._ensureOwner(walletId, userId);
    await this._walletRepo.deleteById(walletId);
    await this._logActivity(userId, walletId, ActivityType.WALLET_DELETED, `Deleted wallet "${wallet.name}"`);
  }

  async generateInviteCode(walletId, userId) {
    const wallet = await this._ensureOwnerOrAdmin(walletId, userId);
    const { v4: uuidv4 } = require('uuid');
    const code = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 9);
    await this._walletRepo.updateById(walletId, { inviteCode: code, isShared: true });
    return code;
  }

  async joinWallet(inviteCode, userId) {
    const wallet = await this._walletRepo.findByInviteCode(inviteCode);
    if (!wallet) throw new NotFoundError('Invalid or expired invite code');

    const alreadyMember = await this._walletRepo.isMember(wallet._id, userId);
    if (alreadyMember) throw new ConflictError('You are already a member of this wallet');

    await this._walletRepo.addMember(wallet._id, userId, WalletRole.MEMBER, null);

    const user = await this._userRepo.findById(userId);
    await this._logActivity(userId, wallet._id, ActivityType.MEMBER_JOINED,
      `${user.name} joined wallet "${wallet.name}"`);

    return this._walletRepo.findById(wallet._id, [
      { path: 'owner', select: 'name avatar email' },
      { path: 'members.user', select: 'name avatar email' },
    ]);
  }

  async removeMember(walletId, ownerId, memberId) {
    await this._ensureOwnerOrAdmin(walletId, ownerId);
    const member = await this._userRepo.findById(memberId);
    await this._walletRepo.removeMember(walletId, memberId);

    const wallet = await this._walletRepo.findById(walletId);
    await this._logActivity(ownerId, walletId, ActivityType.MEMBER_REMOVED,
      `Removed ${member?.name || memberId} from wallet "${wallet?.name}"`);
  }

  async updateMemberRole(walletId, ownerId, memberId, role) {
    await this._ensureOwner(walletId, ownerId);
    if (!Object.values(WalletRole).includes(role)) {
      throw new ConflictError(`Invalid role: ${role}`);
    }
    return this._walletRepo.updateMemberRole(walletId, memberId, role);
  }

  async transferOwnership(walletId, currentOwnerId, newOwnerId) {
    await this._ensureOwner(walletId, currentOwnerId);
    return this._walletRepo.transferOwnership(walletId, newOwnerId);
  }

  async setActiveWallet(userId, walletId) {
    const isMember = await this._walletRepo.isMember(walletId, userId);
    if (!isMember) throw new ForbiddenError('You do not have access to this wallet');
    await this._userRepo.updateById(userId, { activeWallet: walletId });
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  async _ensureOwner(walletId, userId) {
    const wallet = await this._walletRepo.findById(walletId);
    if (!wallet) throw new NotFoundError('Wallet not found');
    if (wallet.owner.toString() !== userId.toString()) {
      throw new ForbiddenError('Only the owner can perform this action');
    }
    return wallet;
  }

  async _ensureOwnerOrAdmin(walletId, userId) {
    const wallet = await this._walletRepo.findById(walletId, [
      { path: 'members.user', select: '_id' }
    ]);
    if (!wallet) throw new NotFoundError('Wallet not found');

    const isOwner = wallet.owner.toString() === userId.toString();
    const member = wallet.members?.find((m) => m.user._id.toString() === userId.toString());
    const isAdmin = member?.role === WalletRole.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Insufficient permissions');
    }
    return wallet;
  }

  async _logActivity(userId, walletId, type, message) {
    try {
      await this._activityRepo.create({ user: userId, wallet: walletId, type, message });
    } catch (err) {
      logger.error(`Activity log failed: ${err.message}`);
    }
  }
}

module.exports = WalletService;
