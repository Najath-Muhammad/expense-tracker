import { Router } from 'express';
import { body } from 'express-validator';
import asyncHandler from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/auth.middleware';
import validate from '../middlewares/validate.middleware';
import container from '../di/container';
import { ROUTE_PATHS } from '../constants';
import { IncomeSource } from '../enums';

const router = Router({ mergeParams: true });

const incomeRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isNumeric().withMessage('Amount must be a number').custom((value) => value > 0).withMessage('Amount must be positive'),
  body('source').isIn(Object.values(IncomeSource)).withMessage('Invalid source'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
];

router.use(authenticate);

router.post(ROUTE_PATHS.ROOT, incomeRules, validate, asyncHandler(container.incomeController.addIncome.bind(container.incomeController)) as any);
router.get(ROUTE_PATHS.ROOT, asyncHandler(container.incomeController.getIncomeList.bind(container.incomeController)) as any);
router.get(ROUTE_PATHS.BALANCE, asyncHandler(container.incomeController.getBalance.bind(container.incomeController)) as any);
router.get(ROUTE_PATHS.BY_ID, asyncHandler(container.incomeController.getIncome.bind(container.incomeController)) as any);
router.patch(ROUTE_PATHS.BY_ID, asyncHandler(container.incomeController.updateIncome.bind(container.incomeController)) as any);
router.delete(ROUTE_PATHS.BY_ID, asyncHandler(container.incomeController.deleteIncome.bind(container.incomeController)) as any);

export default router;
