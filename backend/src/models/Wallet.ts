import mongoose, { Schema } from 'mongoose';
import crypto from 'crypto';
import { IWallet } from '../types';
import { WalletType, WalletRole } from '../enums';

const memberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: false }
);

const walletSchema = new Schema<IWallet>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    type: {
      type: String,
      enum: Object.values(WalletType),
      default: WalletType.PERSONAL,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
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
      type: Schema.Types.ObjectId,
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
    monthlyBudget: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Method to generate a unique invite code
walletSchema.methods.generateInviteCode = function (): string {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  this.inviteCode = code;
  return code;
};

// Check if user is member
walletSchema.methods.isMember = function (userId: mongoose.Types.ObjectId | string): boolean {
  const idStr = userId.toString();
  if (this.owner.toString() === idStr) return true;
  return this.members.some((m: any) => m.user.toString() === idStr);
};

// Get member role
walletSchema.methods.getMemberRole = function (userId: mongoose.Types.ObjectId | string): string | null {
  const idStr = userId.toString();
  if (this.owner.toString() === idStr) return WalletRole.OWNER;
  const member = this.members.find((m: any) => m.user.toString() === idStr);
  return member ? member.role : null;
};

// Pre-save hook
walletSchema.pre('save', function () {
  this.isShared = this.members && this.members.length > 0;
});

export default mongoose.model<IWallet>('Wallet', walletSchema);
