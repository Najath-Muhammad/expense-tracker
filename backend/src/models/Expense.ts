import mongoose, { Schema } from 'mongoose';
import { IExpense } from '../types';
import { ExpenseCategory } from '../enums';

const expenseSchema = new Schema<IExpense>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
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
    receipt: {
      type: String,
      default: null,
    },
    receiptPublicId: {
      type: String,
      default: null,
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

// Compound index for quick dashboard queries (Wallet -> Date)
expenseSchema.index({ wallet: 1, date: -1 });

export default mongoose.model<IExpense>('Expense', expenseSchema);
