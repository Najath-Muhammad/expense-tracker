const IBaseRepository = require('./IBaseRepository');

class IUserRepository extends IBaseRepository {
  async findByEmail(email) { throw new Error('findByEmail() not implemented'); }
  async findByEmailWithPassword(email) { throw new Error('findByEmailWithPassword() not implemented'); }
  async findByRefreshToken(token) { throw new Error('findByRefreshToken() not implemented'); }
  async updateRefreshToken(id, token) { throw new Error('updateRefreshToken() not implemented'); }
  async setPasswordReset(id, token, expires) { throw new Error('setPasswordReset() not implemented'); }
  async findByPasswordResetToken(token) { throw new Error('findByPasswordResetToken() not implemented'); }
  async clearPasswordReset(id) { throw new Error('clearPasswordReset() not implemented'); }
  async updateLastLogin(id) { throw new Error('updateLastLogin() not implemented'); }
  async updateAvatar(id, url, publicId) { throw new Error('updateAvatar() not implemented'); }
}

module.exports = IUserRepository;
