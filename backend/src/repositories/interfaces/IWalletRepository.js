const IBaseRepository = require('./IBaseRepository');

class IWalletRepository extends IBaseRepository {
  async findByUser(userId) { throw new Error('findByUser() not implemented'); }
  async findByInviteCode(code) { throw new Error('findByInviteCode() not implemented'); }
  async addMember(walletId, userId, role, addedBy) { throw new Error('addMember() not implemented'); }
  async removeMember(walletId, userId) { throw new Error('removeMember() not implemented'); }
  async updateMemberRole(walletId, userId, role) { throw new Error('updateMemberRole() not implemented'); }
  async transferOwnership(walletId, newOwnerId) { throw new Error('transferOwnership() not implemented'); }
  async isMember(walletId, userId) { throw new Error('isMember() not implemented'); }
}

module.exports = IWalletRepository;
