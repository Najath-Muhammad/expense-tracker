const { Router } = require('express');
const { body, query } = require('express-validator');
const asyncHandler = require('../middlewares/asyncHandler');
const { authenticate } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const ApiResponse = require('../utils/apiResponse');
const { StatusCode } = require('../enums');

// Import service from DI
const container = require('../di/container');

const router = Router({ mergeParams: true });

const budgetRules = [
  body('amount').isNumeric({ min: 1 }).withMessage('Budget must be a positive number'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be 1-12'),
  body('year').isInt({ min: 2020 }).withMessage('Valid year required'),
];

router.use(authenticate);

// Get current month budget
router.get('/current', asyncHandler(async (req, res) => {
  const now = new Date();
  const budget = await container.budgetService.getBudget(
    req.params.walletId, req.user._id, now.getMonth() + 1, now.getFullYear()
  );
  return ApiResponse.success(res, StatusCode.OK, 'Budget fetched', budget);
}));

// Get all budgets for wallet
router.get('/', asyncHandler(async (req, res) => {
  const budgets = await container.budgetService.getBudgets(req.params.walletId, req.user._id);
  return ApiResponse.success(res, StatusCode.OK, 'Budgets fetched', { budgets });
}));

// Set budget
router.post('/', budgetRules, validate, asyncHandler(async (req, res) => {
  const { amount, month, year } = req.body;
  const budget = await container.budgetService.setBudget(
    req.user._id, req.params.walletId, amount, month, year
  );
  return ApiResponse.created(res, 'Budget set', { budget });
}));

module.exports = router;
