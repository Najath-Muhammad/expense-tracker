import api from './axios';

export const notificationApi = {
  getVapidKey: () => api.get('/notifications/vapid-public-key'),
  subscribe:   (subscription) => api.post('/notifications/subscribe', subscription),
  unsubscribe: (endpoint) => api.delete('/notifications/unsubscribe', { data: { endpoint } }),
};

/** Convert a base64url VAPID public key to a Uint8Array for the browser API */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}
