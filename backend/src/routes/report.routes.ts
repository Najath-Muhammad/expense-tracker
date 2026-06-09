import { Router } from 'express';
import asyncHandler from '../middlewares/asyncHandler';
import { authenticate } from '../middlewares/auth.middleware';
import container from '../di/container';
import { ROUTE_PATHS } from '../constants';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get(ROUTE_PATHS.DASHBOARD, asyncHandler(container.reportController.getDashboard.bind(container.reportController)) as any);
router.get(ROUTE_PATHS.MONTHLY, asyncHandler(container.reportController.getMonthlyReport.bind(container.reportController)) as any);
router.get(ROUTE_PATHS.YEARLY, asyncHandler(container.reportController.getYearlyReport.bind(container.reportController)) as any);

export default router;
