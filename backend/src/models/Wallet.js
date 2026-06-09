const mongoose = require('mongoose');
const { WalletType, WalletRole } = require('../enums');
const { v4: uuidv4 } = require('uuid');

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(WalletRole),
      default: WalletRole.MEMBER,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: false }
);

const walletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Wallet name is required'],
      trim: true,
      maxlength: [50, 'Wallet name cannot exceed 50 characters'],
    },
    type: {
      type: String,
      enum: Object.values(WalletType),
      default: WalletType.PERSONAL,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot exceed 200 characters'],
      default: null,
    },
    icon: {
      type: String,
      default: '💰',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [memberSchema],
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
      default: null,
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    // Budget for this wallet
    monthlyBudget: {
      type: Number,
      default: null,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
walletSchema.index({ owner: 1 });
walletSchema.index({ inviteCode: 1 });
walletSchema.index({ 'members.user': 1 });

// Generate invite code for shared wallets
walletSchema.methods.generateInviteCode = function () {
  const code = uuidv4().replace(/-/g, '').toUpperCase().substring(0, 9);
  this.inviteCode = code;
  this.isShared = true;
  return code;
};

// Check if user is a member
walletSchema.methods.isMember = function (userId) {
  if (this.owner.toString() === userId.toString()) return true;
  return this.members.some((m) => m.user.toString() === userId.toString());
};

// Get member role
walletSchema.methods.getMemberRole = function (userId) {
  if (this.owner.toString() === userId.toString()) return WalletRole.OWNER;
  const member = this.members.find((m) => m.user.toString() === userId.toString());
  return member ? member.role : null;
};

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;
