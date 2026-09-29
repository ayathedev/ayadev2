import { useState, useEffect, useCallback } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [isSupported, setIsSupported] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const result = await Notification.requestPermission();
        setPermission(result);
        return result === 'granted';
      } catch (err) {
        console.warn('Push notification permission request error:', err);
        return false;
      }
    }
    return false;
  }, []);

  const sendPushAlert = useCallback(
    (title: string, options?: { body?: string; icon?: string; tag?: string; data?: any }) => {
      // Vibrate mobile device if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200, 100, 300]);
        } catch (_) {}
      }

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          const notification = new Notification(title, {
            body: options?.body,
            icon: options?.icon || '/icons/icon-192x192.png',
            tag: options?.tag || 'ayasec-alert',
            badge: '/icons/icon-192x192.png',
            requireInteraction: true,
            data: options?.data,
          } as NotificationOptions);

          notification.onclick = () => {
            window.focus();
            notification.close();
          };

          return notification;
        } catch (err) {
          console.warn('Native notification trigger error:', err);
        }
      }
      return null;
    },
    []
  );

  return {
    isSupported,
    permission,
    isGranted: permission === 'granted',
    requestPermission,
    sendPushAlert,
  };
}
