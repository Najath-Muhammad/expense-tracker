import webpush from 'web-push';
import User from '../../models/User';
import logger from '../../utils/logger';

// Configure VAPID — keys come from env vars
webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'admin@expensetracker.app'),
  process.env.VAPID_PUBLIC_KEY  as string,
  process.env.VAPID_PRIVATE_KEY as string,
);

export type PushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export class NotificationService {
  // ── Subscribe ──────────────────────────────────────────────────────────
  async subscribe(userId: string, subscription: PushSubscription): Promise<void> {
    const user = await User.findById(userId).select('+pushSubscriptions');
    if (!user) return;

    // Avoid duplicates by endpoint
    const already = (user.pushSubscriptions || []).some(
      (s) => s.endpoint === subscription.endpoint,
    );
    if (!already) {
      (user.pushSubscriptions as any[]).push(subscription);
      await user.save();
    }
  }

  // ── Unsubscribe ────────────────────────────────────────────────────────
  async unsubscribe(userId: string, endpoint: string): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      $pull: { pushSubscriptions: { endpoint } },
    });
  }

  // ── Send to a single user ──────────────────────────────────────────────
  async sendToUser(
    userId: string,
    payload: { title: string; body: string; icon?: string; tag?: string },
  ): Promise<void> {
    try {
      const user = await User.findById(userId).select('+pushSubscriptions');
      if (!user || !user.pushSubscriptions?.length) return;

      const data = JSON.stringify(payload);
      const staleEndpoints: string[] = [];

      await Promise.all(
        user.pushSubscriptions.map(async (sub) => {
          try {
            await webpush.sendNotification(sub as any, data);
          } catch (err: any) {
            // 410 Gone = subscription expired / user unsubscribed
            if (err.statusCode === 410 || err.statusCode === 404) {
              staleEndpoints.push(sub.endpoint);
            } else {
              logger.warn(`Push failed for ${sub.endpoint}: ${err.message}`);
            }
          }
        }),
      );

      // Prune stale subscriptions
      if (staleEndpoints.length) {
        await User.findByIdAndUpdate(userId, {
          $pull: { pushSubscriptions: { endpoint: { $in: staleEndpoints } } },
        });
      }
    } catch (err: any) {
      logger.error(`NotificationService.sendToUser: ${err.message}`);
    }
  }
}

// Singleton
export const notificationService = new NotificationService();
