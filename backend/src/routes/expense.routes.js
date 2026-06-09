const { Router } = require('express');
const { body } = require('express-validator');
const container = require('../di/container');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router({ mergeParams: true });
const ctrl = container.expenseController;

const expenseRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
  body('amount').isNumeric({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category').isIn([
    'food', 'fuel', 'rent', 'shopping', 'bills',
    'entertainment', 'travel', 'health', 'education', 'investment', 'others'
  ]).withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Date must be a valid ISO date'),
];

router.use(authenticate);

// Wallet-specific expense routes: /wallets/:walletId/expenses
router.post('/', expenseRules, validate, ctrl.addExpense);
router.get('/', ctrl.getExpenses);
router.get('/dashboard', ctrl.getDashboard);

// Individual expense routes
router.get('/:id', ctrl.getExpense);
router.patch('/:id', ctrl.updateExpense);
router.delete('/:id', ctrl.deleteExpense);

module.exports = router;
