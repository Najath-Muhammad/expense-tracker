import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import asyncHandler from '../middlewares/asyncHandler';
import { notificationController } from '../controllers/implementations/NotificationController';

const router = Router();

router.use(authenticate);

router.get('/vapid-public-key', asyncHandler(notificationController.getVapidKey.bind(notificationController)) as any);
router.post('/subscribe',       asyncHandler(notificationController.subscribe.bind(notificationController)) as any);
router.delete('/unsubscribe',   asyncHandler(notificationController.unsubscribe.bind(notificationController)) as any);

export default router;
