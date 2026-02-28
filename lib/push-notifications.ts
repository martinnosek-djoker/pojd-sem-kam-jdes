import { getApiUrl } from './api-config';

export async function initializePushNotifications() {
  console.log('🔔 [Push Notifications] Initializing...');

  // Dynamicky importovat Capacitor jen pokud je dostupný
  let Capacitor: any;
  let PushNotifications: any;

  try {
    // Dynamické importy - Capacitor balíčky jsou v devDependencies pro type checking
    const capacitorCore = await import('@capacitor/core');
    Capacitor = capacitorCore.Capacitor;
    const pushNotificationsModule = await import('@capacitor/push-notifications');
    PushNotifications = pushNotificationsModule.PushNotifications;
  } catch (error) {
    console.log('🔔 [Push Notifications] Capacitor not available (running on web)');
    return;
  }

  console.log('🔔 [Push Notifications] Capacitor:', Capacitor);
  console.log('🔔 [Push Notifications] isNativePlatform:', Capacitor.isNativePlatform());

  // Pouze pro native platformy (Android/iOS)
  if (!Capacitor.isNativePlatform()) {
    console.log('🔔 [Push Notifications] NOT on native platform, skipping');
    return;
  }

  console.log('🔔 [Push Notifications] On native platform, continuing...');

  try {
    // Požádat o povolení pro notifikace
    console.log('🔔 [Push Notifications] Requesting permissions...');
    const permStatus = await PushNotifications.requestPermissions();
    console.log('🔔 [Push Notifications] Permission status:', permStatus);

    if (permStatus.receive === 'granted') {
      console.log('🔔 [Push Notifications] Permission granted! Registering...');
      // Registrovat zařízení pro push notifikace
      await PushNotifications.register();
      console.log('🔔 [Push Notifications] Register called');

      // Listener pro úspěšnou registraci
      await PushNotifications.addListener('registration', async (token: any) => {
        console.log('Push registration success, token:', token.value);

        // Uložit token na server
        try {
          const response = await fetch(getApiUrl('/api/notifications/register'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: token.value,
              platform: Capacitor.getPlatform(),
            }),
          });

          if (response.ok) {
            console.log('Device token registered successfully');
          } else {
            console.error('Failed to register device token');
          }
        } catch (error) {
          console.error('Error registering device token:', error);
        }
      });

      // Listener pro chybu při registraci
      await PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration:', error);
      });

      // Listener pro příchozí notifikaci (když je app aktivní)
      await PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: any) => {
          console.log('Push notification received:', notification);
          // Můžeš zde zobrazit vlastní UI pro notifikaci
        }
      );

      // Listener pro kliknutí na notifikaci
      await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        (notification: any) => {
          console.log('Push notification action performed:', notification);

          // Zpracovat kliknutí podle typu notifikace
          const data = notification.notification.data;
          if (data.type && data.itemId) {
            // Navigovat na detail položky
            handleNotificationNavigation(data.type, data.itemId);
          }
        }
      );
    } else {
      console.log('🔔 [Push Notifications] Permission NOT granted:', permStatus);
    }
  } catch (error) {
    console.error('🔔 [Push Notifications] ❌ Error initializing:', error);
  }
}

async function handleNotificationNavigation(type: string, itemId: string) {
  // Pro recenze potřebujeme načíst data a sestavit slug
  if (type === 'review') {
    try {
      const response = await fetch(getApiUrl(`/api/reviews/${itemId}`));
      if (response.ok) {
        const review = await response.json();
        const placeName = review.restaurant?.name || review.cafe?.name || 'review';
        const slug = createReviewSlug(parseInt(itemId, 10), placeName);
        window.location.href = `/recenze/${slug}`;
        return;
      }
    } catch (error) {
      console.error('Error loading review for notification:', error);
      // Fallback na homepage
      window.location.href = '/';
      return;
    }
  }

  // Navigace podle typu notifikace
  const routes: Record<string, string> = {
    restaurant: '/',      // Restaurace → homepage
    cafe: '/kavarny',     // Kavárny → sekce kavárny
    bakery: '/cukrarny',  // Cukrárny → sekce cukrárny
    trending: '/',        // Trendings → homepage
    event: '/akce',       // Gastro akce → sekce gastro akce
  };

  const route = routes[type];
  if (route) {
    window.location.href = route;
  }
}

// Helper function to create review slug
function createReviewSlug(id: number, name: string): string {
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/[áä]/g, 'a')
    .replace(/[éěë]/g, 'e')
    .replace(/[íï]/g, 'i')
    .replace(/[óö]/g, 'o')
    .replace(/[úůü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/č/g, 'c')
    .replace(/ď/g, 'd')
    .replace(/ň/g, 'n')
    .replace(/ř/g, 'r')
    .replace(/š/g, 's')
    .replace(/ť/g, 't')
    .replace(/ž/g, 'z')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/[-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${id}-${normalized}`;
}

export async function unregisterPushNotifications() {
  try {
    // Použít string interpolaci pro obejití TypeScript type checking
    const capacitorCore = await import(/* @vite-ignore */ `@capacitor/core`);
    const Capacitor = capacitorCore.Capacitor;

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const pushNotificationsModule = await import(/* @vite-ignore */ `@capacitor/push-notifications`);
    const PushNotifications = pushNotificationsModule.PushNotifications;

    await PushNotifications.removeAllListeners();
    // Note: Capacitor doesn't provide unregister, but we can remove listeners
    console.log('Push notification listeners removed');
  } catch (error) {
    console.error('Error unregistering push notifications:', error);
  }
}
