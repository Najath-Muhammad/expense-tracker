const BaseRepository = require('./BaseRepository');
const IUserRepository = require('../interfaces/IUserRepository');
const User = require('../../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).lean().exec();
  }

  async findByEmailWithPassword(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  async findByRefreshToken(token) {
    return User.findOne({ refreshToken: token }).select('+refreshToken').lean().exec();
  }

  async updateRefreshToken(id, token) {
    return User.findByIdAndUpdate(id, { refreshToken: token }, { new: true }).lean().exec();
  }

  async setPasswordReset(id, token, expires) {
    return User.findByIdAndUpdate(
      id,
      { passwordResetToken: token, passwordResetExpires: expires },
      { new: true }
    ).lean().exec();
  }

  async findByPasswordResetToken(token) {
    return User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires').lean().exec();
  }

  async clearPasswordReset(id) {
    return User.findByIdAndUpdate(
      id,
      { passwordResetToken: null, passwordResetExpires: null },
      { new: true }
    ).lean().exec();
  }

  async updateLastLogin(id) {
    return User.findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true }).lean().exec();
  }

  async updateAvatar(id, url, publicId) {
    return User.findByIdAndUpdate(
      id,
      { avatar: url, avatarPublicId: publicId },
      { new: true }
    ).lean().exec();
  }

  async updatePassword(id, hashedPassword) {
    return User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).lean().exec();
  }
}

module.exports = UserRepository;
