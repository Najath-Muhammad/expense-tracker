import mongoose, { Schema } from 'mongoose';
import { IBudget } from '../types';
import { BudgetStatus } from '../enums';

const budgetSchema = new Schema<IBudget>(
  {
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
    },
    spent: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(BudgetStatus),
      default: BudgetStatus.SAFE,
    },
    notifiedAt50: { type: Boolean, default: false },
    notifiedAt75: { type: Boolean, default: false },
    notifiedAt90: { type: Boolean, default: false },
    notifiedAt100: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One budget per wallet per month/year
budgetSchema.index({ wallet: 1, month: 1, year: 1 }, { unique: true });

budgetSchema.virtual('remaining').get(function () {
  return Math.max(0, this.amount - this.spent);
});

budgetSchema.virtual('percentage').get(function () {
  if (this.amount === 0) return 0;
  return Number(((this.spent / this.amount) * 100).toFixed(2));
});

export default mongoose.model<IBudget>('Budget', budgetSchema);
