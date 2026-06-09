const mongoose = require('mongoose');
const { RecurringFrequency, TransactionType, ExpenseCategory, IncomeSource } = require('../enums');

const recurringSchema = new mongoose.Schema(
  {
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
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
      enum: [...Object.values(ExpenseCategory), ...Object.values(IncomeSource)],
      default: null,
    },
    frequency: {
      type: String,
      enum: Object.values(RecurringFrequency),
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    nextRunDate: {
      type: Date,
      required: true,
    },
    lastRunDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },
    // Count of times this has been executed
    executionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

recurringSchema.index({ nextRunDate: 1, isActive: 1 });

const Recurring = mongoose.model('Recurring', recurringSchema);
module.exports = Recurring;
