import mongoose, { Schema } from 'mongoose';
import { IIncome } from '../types';
import { IncomeSource } from '../enums';

const incomeSchema = new Schema<IIncome>(
  {
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    source: {
      type: String,
      enum: Object.values(IncomeSource),
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringId: {
      type: Schema.Types.ObjectId,
      ref: 'Recurring',
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
  },
  {
    timestamps: true,
  }
);

incomeSchema.index({ wallet: 1, date: -1 });

export default mongoose.model<IIncome>('Income', incomeSchema);
