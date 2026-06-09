import mongoose, { Schema } from 'mongoose';
import { IActivity } from '../types';
import { ActivityType } from '../enums';

const activitySchema = new Schema<IActivity>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      index: true,
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    refModel: {
      type: String,
      enum: ['Expense', 'Income', 'Wallet', 'Budget', 'SavingsGoal', null],
      default: null,
    },
    refId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ wallet: 1, createdAt: -1 });

export default mongoose.model<IActivity>('Activity', activitySchema);
