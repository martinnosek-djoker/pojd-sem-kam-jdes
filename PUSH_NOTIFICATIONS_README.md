# Push Notifikace - Implementace

Tato dokumentace popisuje, jak byly implementovány push notifikace do Android aplikace Gastro Tips.

## Přehled funkcionalit

Když admin přidá novou položku (kavárnu, cukrárnu, trending podnik nebo gastro akci), zobrazí se mu dialog s dotazem, zda chce odeslat push notifikaci všem uživatelům aplikace.

## Architektura

```
┌─────────────────┐
│  Admin Web UI   │
│  (přidá položku)│
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ NotificationDialog  │
│ (Ano/Ne na notif?)  │
└─────────┬───────────┘
          │
          ▼ ANO
┌─────────────────────────┐
│ /api/notifications/send │  ◄── Service Account Auth
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Supabase: device_tokens │  ◄── Získá všechny FCM tokeny
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ OAuth2 Access Token     │  ◄── Autentizace přes Service Account
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ Firebase Cloud          │
│ Messaging V1 API        │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│  Android Zařízení       │
│  (push notification)    │
└─────────────────────────┘
```

## Co bylo implementováno

### 1. **Databázová tabulka** (`device_tokens`)
- Ukládá FCM tokeny všech registrovaných zařízení
- Lokace: `scripts/create-device-tokens-table.sql`
- Sloupce:
  - `id` - primární klíč
  - `token` - FCM token (unique)
  - `platform` - 'android' nebo 'ios'
  - `created_at`, `updated_at`, `last_used_at` - časové značky

### 2. **API Endpointy**

#### `/api/notifications/register` (POST)
- Registruje FCM token zařízení do databáze
- Volá se automaticky při spuštění mobile app
- Lokace: `app/api/notifications/register/route.ts`

#### `/api/notifications/send` (POST)
- Odesílá push notifikace přes Firebase Cloud Messaging
- Volá se z admin UI po kliknutí na "Ano, odeslat"
- Lokace: `app/api/notifications/send/route.ts`
- Parametry:
  ```typescript
  {
    title: string,        // "☕ Nová kavárna!"
    body: string,         // "Přidali jsme novou kavárnu: Café Noir"
    type: 'cafe' | 'bakery' | 'trending' | 'event',
    itemId: number
  }
  ```

### 3. **Push Notifications Handler**

#### `lib/push-notifications.ts`
Utility funkce pro správu push notifikací:
- `initializePushNotifications()` - inicializace, získání FCM tokenu, registrace
- `unregisterPushNotifications()` - zrušení registrace

#### `components/PushNotificationHandler.tsx`
Client-side komponenta, která inicializuje push notifikace při spuštění app.
- Přidána do `app/layout.tsx`
- Spouští se pouze na native platformách (Android/iOS)

### 4. **Admin UI komponenty**

#### `components/NotificationDialog.tsx`
Dialog, který se zobrazí po přidání nové položky v adminu:
- Ptá se uživatele, zda chce odeslat notifikaci
- Tlačítka: "Ano, odeslat" / "Ne, přeskočit"
- Zobrazuje feedback o úspěchu/chybě

#### Upravené formuláře
Všechny admin formuláře byly rozšířeny o notifikační dialog:
- `components/CafeForm.tsx` - kavárny
- `components/BakeryForm.tsx` - cukrárny
- `components/TrendingForm.tsx` - trending podniky
- `components/EventsAdmin.tsx` - gastro akce

Po úspěšném přidání NOVÉ položky (ne editaci!) se automaticky zobrazí `NotificationDialog`.

## Jak to funguje - krok za krokem

### Registrace zařízení (při spuštění app)

1. Uživatel otevře mobile app
2. `PushNotificationHandler` se spustí v `useEffect`
3. Zavolá se `initializePushNotifications()`:
   - Požádá o povolení pro notifikace
   - Zaregistruje zařízení u Firebase Cloud Messaging
   - Získá FCM token
   - Odešle token na `/api/notifications/register`
   - Token se uloží do Supabase tabulky `device_tokens`

### Odeslání notifikace (z admin UI)

1. Admin přidá novou kavárnu/cukrárnu/trending/event
2. Po úspěšném uložení se zobrazí `NotificationDialog`
3. Admin klikne "Ano, odeslat"
4. Zavolá se `/api/notifications/send` s daty:
   - Získá všechny FCM tokeny z `device_tokens`
   - Odešle notifikaci přes Firebase Cloud Messaging API
   - Firebase doručí notifikaci na všechna zařízení
5. Uživatelé vidí push notifikaci na svých zařízeních

### Příjem notifikace (na zařízení)

1. Zařízení obdrží push notifikaci
2. Pokud je app v pozadí → zobrazí se systémová notifikace
3. Pokud je app aktivní → zavolá se listener `pushNotificationReceived`
4. Při kliknutí na notifikaci → zavolá se listener `pushNotificationActionPerformed`
5. App může navigovat na detail položky podle `type` a `itemId`

## Co je potřeba nastavit

### 1. Firebase projekt
- Vytvořit Firebase projekt
- Přidat Android app s package name
- Stáhnout `google-services.json` → `android/app/`
- Získat FCM Server Key

📋 **Detailní návod:** `FIREBASE_SETUP.md`

### 2. Environment variables

V `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FIREBASE_PROJECT_ID=tvůj-firebase-project-id
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...celý JSON...}'
```

**Poznámka:** Používáme Firebase Cloud Messaging V1 API (nejnovější), nikoli Legacy API.

### 3. Databáze

Spustit SQL skript v Supabase:
```bash
# Otevřít Supabase SQL Editor
# Zkopírovat obsah scripts/create-device-tokens-table.sql
# Spustit query
```

### 4. Android build

```bash
# Build web assets
npm run build:mobile

# Sync with native platforms
npx cap sync

# Open Android Studio
npx cap open android

# Build APK nebo spusť na zařízení
```

## Testování

### Manuální test flow:

1. **Spustit app na Android zařízení/emulátoru**
   - Při prvním spuštění se zobrazí dialog pro povolení notifikací
   - Povolit notifikace
   - Zkontrolovat v Supabase, že se token uložil do `device_tokens`

2. **Přidat novou položku v admin UI**
   - Jít do admin rozhraní (např. `/admin`)
   - Přidat novou kavárnu/cukrárnu/trending/event
   - Po uložení se zobrazí dialog "Odeslat notifikaci?"

3. **Odeslat notifikaci**
   - Kliknout "Ano, odeslat"
   - Měla by se zobrazit zpráva "Notifikace byla úspěšně odeslána na X zařízení"

4. **Zkontrolovat notifikaci na zařízení**
   - Na Android zařízení by měla dorazit push notifikace
   - Kliknutím na notifikaci se může app otevřít

### Debugging

**Logování v app:**
```javascript
// V PushNotificationHandler se loguje:
console.log('Push registration success, token:', token.value)
console.log('Push notification received:', notification)
```

**Android logcat:**
```bash
adb logcat | grep -i "fcm\|firebase\|notification"
```

**Supabase:**
```sql
-- Zkontrolovat registrované tokeny
SELECT * FROM device_tokens;
```

**API response:**
```json
{
  "success": true,
  "sentCount": 2,
  "failureCount": 0,
  "totalDevices": 2
}
```

## Bezpečnost

- **Service Account JSON** je pouze v `.env.local` (nikdy v repo!)
- Private key obsahuje citlivé údaje - musí být chráněn
- V1 API používá OAuth2 tokeny místo statického klíče → bezpečnější
- `/api/notifications/send` by měl být chráněn autentizací admina (TODO)
- RLS policy na `device_tokens` - anonymní mohou jen INSERT/UPDATE, SELECT pouze pro authenticated users
- Access tokeny jsou generovány on-demand a mají krátkou životnost

## Budoucí vylepšení

- [ ] Přidat autentizaci pro `/api/notifications/send` endpoint
- [ ] Umožnit adminu vybrat, které typy položek chtějí uživatelé dostávat
- [ ] Přidat UI pro správu tokenů (smazat neplatné, statistiky)
- [ ] Podpora pro iOS push notifikace (APNS)
- [ ] Notifikace s obrázkem (rich notifications)
- [ ] Deep linking - přímý odkaz na detail položky po kliknutí na notifikaci
- [ ] A/B testování notifikací
- [ ] Plánované notifikace (schedule notifications)

## Soubory které byly vytvořeny/upraveny

### Nové soubory:
- `app/api/notifications/register/route.ts`
- `app/api/notifications/send/route.ts`
- `lib/push-notifications.ts`
- `components/PushNotificationHandler.tsx`
- `components/NotificationDialog.tsx`
- `scripts/create-device-tokens-table.sql`
- `FIREBASE_SETUP.md`
- `PUSH_NOTIFICATIONS_README.md`

### Upravené soubory:
- `app/layout.tsx` - přidán PushNotificationHandler
- `components/CafeForm.tsx` - přidán NotificationDialog
- `components/BakeryForm.tsx` - přidán NotificationDialog
- `components/TrendingForm.tsx` - přidán NotificationDialog
- `components/EventsAdmin.tsx` - přidán NotificationDialog
- `package.json` - přidán @capacitor/push-notifications

## Kontakt a podpora

Pokud narazíš na problém:
1. Zkontroluj `FIREBASE_SETUP.md` pro setup instrukce
2. Zkontroluj console logy v prohlížeči a Android logcat
3. Ověř, že všechny environment variables jsou správně nastaveny
4. Zkontroluj, že `google-services.json` je na správném místě
