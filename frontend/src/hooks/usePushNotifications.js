import { useState, useEffect, useCallback } from 'react';
import { notificationApi, urlBase64ToUint8Array } from '../api/notifications';
import toast from 'react-hot-toast';

/**
 * usePushNotifications
 * 
 * Handles service worker registration, permission requesting,
 * subscribing / unsubscribing from Web Push, and syncing with the backend.
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  );
  const [isSubscribed, setIsSubscribed]   = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const [registration, setRegistration]   = useState(null);

  // Register service worker once
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        setRegistration(reg);
        // Check if already subscribed
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub);
        });
      })
      .catch((err) => console.warn('SW registration failed:', err));
  }, []);

  const subscribe = useCallback(async () => {
    if (!registration) {
      toast.error('Browser not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Ask for permission
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result !== 'granted') {
        toast.error('Notification permission denied.');
        return;
      }

      // 2. Fetch VAPID public key from backend
      const { data: keyData } = await notificationApi.getVapidKey();
      const appServerKey = urlBase64ToUint8Array(keyData.data.publicKey);

      // 3. Subscribe via browser Push API
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      });

      // 4. Send subscription to backend
      const subJson = sub.toJSON();
      await notificationApi.subscribe({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth:   subJson.keys.auth,
        },
      });

      setIsSubscribed(true);
      toast.success('🔔 Push notifications enabled!');
    } catch (err) {
      console.error('Push subscription error:', err);
      toast.error('Failed to enable notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  const unsubscribe = useCallback(async () => {
    if (!registration) return;
    setIsLoading(true);
    try {
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await notificationApi.unsubscribe(sub.endpoint);
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      toast.success('🔕 Push notifications disabled.');
    } catch (err) {
      toast.error('Failed to disable notifications.');
    } finally {
      setIsLoading(false);
    }
  }, [registration]);

  const isSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;

  return { permission, isSubscribed, isLoading, isSupported, subscribe, unsubscribe };
}
