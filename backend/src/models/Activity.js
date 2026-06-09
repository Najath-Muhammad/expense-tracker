const mongoose = require('mongoose');
const { ActivityType } = require('../enums');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      index: true,
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(ActivityType),
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    // Reference to the document (expense, income, etc.)
    refModel: {
      type: String,
      enum: ['Expense', 'Income', 'Wallet', 'Budget', 'SavingsGoal', 'Recurring', null],
      default: null,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

activitySchema.index({ wallet: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
