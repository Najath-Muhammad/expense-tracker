import { Response } from 'express';
import { notificationService } from '../../services/implementations/NotificationService';
import ApiResponse from '../../utils/apiResponse';
import { StatusCode } from '../../enums';
import { AuthenticatedRequest } from '../../types';
import logger from '../../utils/logger';

export class NotificationController {
  /** POST /api/v1/notifications/subscribe */
  async subscribe(req: AuthenticatedRequest, res: Response) {
    try {
      const { endpoint, keys } = req.body;
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(StatusCode.BAD_REQUEST).json({ success: false, message: 'Invalid subscription object' });
      }
      await notificationService.subscribe(req.user._id.toString(), { endpoint, keys });
      return ApiResponse.success(res, StatusCode.OK, 'Subscribed to push notifications');
    } catch (err: any) {
      logger.error(`NotificationController.subscribe: ${err.message}`);
      throw err;
    }
  }

  /** DELETE /api/v1/notifications/unsubscribe */
  async unsubscribe(req: AuthenticatedRequest, res: Response) {
    try {
      const { endpoint } = req.body;
      await notificationService.unsubscribe(req.user._id.toString(), endpoint);
      return ApiResponse.success(res, StatusCode.OK, 'Unsubscribed from push notifications');
    } catch (err: any) {
      logger.error(`NotificationController.unsubscribe: ${err.message}`);
      throw err;
    }
  }

  /** GET /api/v1/notifications/vapid-public-key */
  async getVapidKey(_req: AuthenticatedRequest, res: Response) {
    return res.json({ success: true, data: { publicKey: process.env.VAPID_PUBLIC_KEY } });
  }
}

export const notificationController = new NotificationController();
