import { Router } from 'express';
import { body } from 'express-validator';
import asyncHandler from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import container from '../di/container';
import { ROUTE_PATHS } from '../constants';

const router = Router({ mergeParams: true });

const budgetRules = [
  body('amount').isNumeric().custom(v => v > 0).withMessage('Budget must be a positive number'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be 1-12'),
  body('year').isInt({ min: 2020 }).withMessage('Valid year required'),
];

router.use(authenticate);

router.get(ROUTE_PATHS.CURRENT, asyncHandler(container.budgetController.getBudget.bind(container.budgetController)) as any);
router.get(ROUTE_PATHS.ROOT, asyncHandler(container.budgetController.getBudgets.bind(container.budgetController)) as any);
router.post(ROUTE_PATHS.ROOT, budgetRules, validate, asyncHandler(container.budgetController.setBudget.bind(container.budgetController)) as any);

export default router;
