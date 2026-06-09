const mongoose = require('mongoose');
const { BudgetStatus } = require('../enums');

const budgetSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget must be at least 1'],
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
    },
    // Current spending (calculated)
    spent: {
      type: Number,
      default: 0,
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

// Virtual: remaining
budgetSchema.virtual('remaining').get(function () {
  return Math.max(0, this.amount - this.spent);
});

// Virtual: percentage
budgetSchema.virtual('percentage').get(function () {
  return this.amount > 0 ? Math.min(100, ((this.spent / this.amount) * 100).toFixed(1)) : 0;
});

// Compound unique index: one budget per wallet per month/year
budgetSchema.index({ wallet: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
module.exports = Budget;
