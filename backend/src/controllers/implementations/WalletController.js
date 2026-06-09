const ApiResponse = require('../../utils/apiResponse');
const { StatusCode } = require('../../enums');
const asyncHandler = require('../../middlewares/asyncHandler');

class WalletController {
  constructor(walletService) {
    this._walletService = walletService;

    this.createWallet = asyncHandler(this.createWallet.bind(this));
    this.getWallets = asyncHandler(this.getWallets.bind(this));
    this.getWallet = asyncHandler(this.getWallet.bind(this));
    this.updateWallet = asyncHandler(this.updateWallet.bind(this));
    this.deleteWallet = asyncHandler(this.deleteWallet.bind(this));
    this.generateInviteCode = asyncHandler(this.generateInviteCode.bind(this));
    this.joinWallet = asyncHandler(this.joinWallet.bind(this));
    this.removeMember = asyncHandler(this.removeMember.bind(this));
    this.updateMemberRole = asyncHandler(this.updateMemberRole.bind(this));
    this.transferOwnership = asyncHandler(this.transferOwnership.bind(this));
    this.setActiveWallet = asyncHandler(this.setActiveWallet.bind(this));
  }

  async createWallet(req, res) {
    const wallet = await this._walletService.createWallet(req.user._id, req.body);
    return ApiResponse.created(res, 'Wallet created successfully', { wallet });
  }

  async getWallets(req, res) {
    const wallets = await this._walletService.getUserWallets(req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Wallets fetched', { wallets });
  }

  async getWallet(req, res) {
    const wallet = await this._walletService.getWalletById(req.params.id, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Wallet fetched', { wallet });
  }

  async updateWallet(req, res) {
    const wallet = await this._walletService.updateWallet(req.params.id, req.user._id, req.body);
    return ApiResponse.success(res, StatusCode.OK, 'Wallet updated', { wallet });
  }

  async deleteWallet(req, res) {
    await this._walletService.deleteWallet(req.params.id, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Wallet deleted');
  }

  async generateInviteCode(req, res) {
    const code = await this._walletService.generateInviteCode(req.params.id, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Invite code generated', { inviteCode: code });
  }

  async joinWallet(req, res) {
    const wallet = await this._walletService.joinWallet(req.body.inviteCode, req.user._id);
    return ApiResponse.success(res, StatusCode.OK, 'Joined wallet successfully', { wallet });
  }

  async removeMember(req, res) {
    await this._walletService.removeMember(req.params.id, req.user._id, req.params.memberId);
    return ApiResponse.success(res, StatusCode.OK, 'Member removed');
  }

  async updateMemberRole(req, res) {
    const wallet = await this._walletService.updateMemberRole(
      req.params.id, req.user._id, req.params.memberId, req.body.role
    );
    return ApiResponse.success(res, StatusCode.OK, 'Role updated', { wallet });
  }

  async transferOwnership(req, res) {
    const wallet = await this._walletService.transferOwnership(
      req.params.id, req.user._id, req.body.newOwnerId
    );
    return ApiResponse.success(res, StatusCode.OK, 'Ownership transferred', { wallet });
  }

  async setActiveWallet(req, res) {
    await this._walletService.setActiveWallet(req.user._id, req.params.id);
    return ApiResponse.success(res, StatusCode.OK, 'Active wallet set');
  }
}

module.exports = WalletController;
