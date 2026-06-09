const mongoose = require('mongoose');
const { ExpenseCategory } = require('../enums');

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    category: {
      type: String,
      enum: Object.values(ExpenseCategory),
      required: [true, 'Category is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true,
      index: true,
    },
    // Receipt image
    receipt: {
      type: String,
      default: null,
    },
    receiptPublicId: {
      type: String,
      default: null,
    },
    // For recurring expenses
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recurring',
      default: null,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient querying
expenseSchema.index({ wallet: 1, date: -1 });
expenseSchema.index({ wallet: 1, category: 1, date: -1 });
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ wallet: 1, user: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
