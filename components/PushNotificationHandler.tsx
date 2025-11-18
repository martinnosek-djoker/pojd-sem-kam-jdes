"use client";

import { useEffect } from 'react';
import { initializePushNotifications } from '@/lib/push-notifications';

export default function PushNotificationHandler() {
  useEffect(() => {
    console.log('🔔 [PushNotificationHandler] Component mounted, calling initializePushNotifications()');
    // Inicializovat push notifikace pouze pro mobile app
    initializePushNotifications();
  }, []);

  // Tato komponenta nerendruje nic
  return null;
}
