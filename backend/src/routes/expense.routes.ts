import { Router } from 'express';
import { body } from 'express-validator';
import asyncHandler from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import container from '../di/container';
import { ROUTE_PATHS } from '../constants';
import { ExpenseCategory } from '../enums';

const router = Router({ mergeParams: true });

const expenseRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isNumeric().withMessage('Amount must be a number').custom((value) => value > 0).withMessage('Amount must be positive'),
  body('category').isIn(Object.values(ExpenseCategory)).withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
];

router.use(authenticate);

router.post(ROUTE_PATHS.ROOT, expenseRules, validate, asyncHandler(container.expenseController.addExpense.bind(container.expenseController)) as any);
router.get(ROUTE_PATHS.ROOT, asyncHandler(container.expenseController.getExpenses.bind(container.expenseController)) as any);
router.get(ROUTE_PATHS.BY_ID, asyncHandler(container.expenseController.getExpense.bind(container.expenseController)) as any);
router.patch(ROUTE_PATHS.BY_ID, asyncHandler(container.expenseController.updateExpense.bind(container.expenseController)) as any);
router.delete(ROUTE_PATHS.BY_ID, asyncHandler(container.expenseController.deleteExpense.bind(container.expenseController)) as any);

export default router;
