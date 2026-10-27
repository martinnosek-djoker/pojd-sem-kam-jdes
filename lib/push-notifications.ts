import { getApiUrl } from './api-config';
import { openDetail } from './app-detail';

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
          if (data.type) {
            // Otevřít detail položky (restaurace / kavárna), jinak příslušnou sekci
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

async function handleNotificationNavigation(type: string, itemId?: string) {
  // Nová recenze: otevřít její detail (návštěva i s podnikem)
  const visitId = Number(itemId);
  if (type === 'visit' && Number.isInteger(visitId) && visitId > 0) {
    try {
      const response = await fetch(getApiUrl(`/api/detail/visit?id=${visitId}`));
      if (response.ok) {
        const data = await response.json();
        if (data?.visit) {
          const locale = window.location.pathname.startsWith('/en') ? 'en' : 'cs';
          openDetail({ type: 'visit', visit: data.visit, locale });
          return;
        }
      }
    } catch (error) {
      console.error('Could not open visit from notification:', error);
    }
    // Recenzi se nepodařilo načíst: spadne to na úvodní stránku níže
  }

  // Nový podnik: otevřít jeho kartičku v dialogu přes aktuální stránku (stejný detail jako na webu).
  // Při studeném startu appky z notifikace se dialog otevře nad úvodní stránkou.
  const id = Number(itemId);
  if ((type === 'restaurant' || type === 'cafe') && Number.isInteger(id) && id > 0) {
    try {
      const response = await fetch(getApiUrl(`/api/detail/place?kind=${type}&id=${id}`));
      if (response.ok) {
        const data = await response.json();
        if (data?.place) {
          const locale = window.location.pathname.startsWith('/en') ? 'en' : 'cs';
          openDetail({ type: 'place', kind: type, place: data.place, locale });
          return;
        }
      }
    } catch (error) {
      console.error('Could not open place from notification:', error);
    }
    // Podnik se nepodařilo načíst (offline, smazán…): spadne to na sekci níže
  }

  // Navigace podle typu notifikace (bez ID nebo pro ostatní typy)
  const routes: Record<string, string> = {
    restaurant: '/',      // Restaurace → homepage
    cafe: '/kavarny',     // Kavárny → sekce kavárny
    bakery: '/cukrarny',  // Cukrárny → sekce cukrárny
    trending: '/',        // Trendings → homepage
    visit: '/',           // Recenze → homepage (karusel nejnovějších návštěv)
    event: '/akce',       // Gastro akce → sekce gastro akce
  };

  const route = routes[type];
  if (route) {
    window.location.href = route;
  }
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
