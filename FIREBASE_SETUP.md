# Firebase Cloud Messaging Setup

Tento dokument popisuje, jak nastavit Firebase Cloud Messaging pro push notifikace v Android aplikaci.

## Krok 1: Vytvoření Firebase projektu

1. Jdi na [Firebase Console](https://console.firebase.google.com/)
2. Klikni na "Add project" nebo "Přidat projekt"
3. Zadej název projektu (např. "Gastro Tips")
4. Pokračuj přes wizard (můžeš vypnout Google Analytics, pokud nechceš)
5. Po vytvoření projektu klikni na ikonu Android (⚙️) pro přidání Android aplikace

## Krok 2: Registrace Android aplikace

1. V Firebase konzoli klikni na "Add app" > Android
2. Zadej Android package name: **`cz.pojdsemkamjdes.app`** (nebo tvůj package name z `android/app/build.gradle`)
3. App nickname (volitelné): "Gastro Tips Android"
4. Debug signing certificate SHA-1 (volitelné pro development)
5. Klikni na "Register app"

## Krok 3: Stažení google-services.json

1. Stáhni soubor `google-services.json`
2. Zkopíruj ho do složky: **`android/app/`**
   ```
   gastro-tips/
   └── android/
       └── app/
           └── google-services.json  <-- sem
   ```

## Krok 4: Přidání Firebase SDK do Android projektu

Firebase plugin by měl být automaticky přidán při synchronizaci Capacitoru. Pokud ne, ověř následující:

### 4.1 V souboru `android/build.gradle` (projekt-level):

```gradle
buildscript {
    dependencies {
        // ...
        classpath 'com.google.gms:google-services:4.3.15'  // Google Services plugin
    }
}
```

### 4.2 V souboru `android/app/build.gradle` (app-level):

Na konci souboru přidej:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## Krok 5: Získání Service Account JSON (pro V1 API)

V1 API používá Service Account místo Legacy Server Key, což je bezpečnější a doporučený přístup.

1. V Firebase Console jdi do **Project Settings** (⚙️ > Project settings)
2. Klikni na záložku **"Service accounts"**
3. Klikni na tlačítko **"Generate new private key"**
4. Potvrd a stáhni JSON soubor
5. **DŮLEŽITÉ:** Tento soubor obsahuje citlivé údaje, nikdy ho necommituj do git!

### Jak nastavit Service Account:

**Varianta A - Jako environment variable (doporučeno pro production):**

1. Otevři stažený JSON soubor
2. Celý jeho obsah zkopíruj (včetně složených závorek)
3. Přidej do `.env.local`:
   ```env
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
   ```
   Pozor: celý JSON musí být v jednoduchých uvozovkách jako jeden string!

**Varianta B - Jako soubor (jednodušší pro development):**

1. Přejmenuj stažený soubor na `firebase-service-account.json`
2. Přesuň ho do root složky projektu (vedle `.env.local`)
3. Přidej `firebase-service-account.json` do `.gitignore`!

## Krok 6: Nastavení Android Manifestu

Soubor `android/app/src/main/AndroidManifest.xml` by měl obsahovat:

```xml
<manifest>
    <application>
        <!-- ... -->

        <!-- Firebase Cloud Messaging -->
        <service
            android:name="com.google.firebase.messaging.FirebaseMessagingService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <!-- Default notification channel -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="@string/default_notification_channel_id" />
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
</manifest>
```

## Krok 7: Vytvoření databázové tabulky v Supabase

Spusť SQL skript v Supabase SQL editoru:
```bash
# Obsah souboru: scripts/create-device-tokens-table.sql
```

Nebo v Supabase Dashboard:
1. Jdi do SQL Editor
2. Zkopíruj obsah `scripts/create-device-tokens-table.sql`
3. Spusť query

## Krok 8: Nastavení environment variables

Vytvoř soubor `.env.local` (pokud ještě neexistuje) a přidej:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tvoje-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tvůj-anon-key
SUPABASE_SERVICE_ROLE_KEY=tvůj-service-role-key

# Firebase Cloud Messaging (V1 API)
FIREBASE_PROJECT_ID=tvůj-firebase-project-id
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...",...}'
```

### Kde najít FIREBASE_PROJECT_ID:

V Firebase Console → Project Settings → Project ID (nahoře na stránce)

Nebo v `google-services.json`:
```json
{
  "project_info": {
    "project_id": "tvuj-project-id"  ← toto
  }
}
```

## Krok 9: Build a spuštění aplikace

```bash
# Synchronizovat Capacitor
npm run build:mobile
npx cap sync

# Otevřít Android Studio
npx cap open android

# V Android Studio:
# - Build > Build Bundle(s) / APK(s) > Build APK(s)
# - Nebo spusť na zařízení/emulátoru pomocí Run
```

## Testování notifikací

1. Spusť aplikaci na Android zařízení/emulátoru
2. Aplikace automaticky zaregistruje zařízení a získá FCM token
3. Token se uloží do Supabase tabulky `device_tokens`
4. V admin rozhraní přidej novou kavárnu/cukrárnu/trending/event
5. Po úspěšném uložení se zobrazí dialog s dotazem na odeslání notifikace
6. Klikni na "Ano, odeslat"
7. Notifikace by měla dorazit na všechna registrovaná zařízení

## Troubleshooting

### Notifikace nedorazí
- Zkontroluj, že FIREBASE_PROJECT_ID a FIREBASE_SERVICE_ACCOUNT jsou správně nastaveny
- Ověř v Supabase, že se token zařízení uložil do `device_tokens`
- Zkontroluj konzoli v prohlížeči a Android logcat pro chybové hlášky
- Zkontroluj API logs (`/api/notifications/send`) pro chybové zprávy

### "Firebase configuration not found"
- Zkontroluj, že máš nastavené obě environment variables:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_SERVICE_ACCOUNT`
- Restartuj dev server (`npm run dev`) po změně `.env.local`

### "Failed to get Firebase access token"
- Zkontroluj formát FIREBASE_SERVICE_ACCOUNT - musí být celý JSON jako string
- Ujisti se, že private_key obsahuje správné řádkové oddělovače (\n)
- Zkontroluj, že Service Account má správná oprávnění v Firebase

### "google-services.json" nenalezen
- Ujisti se, že soubor je ve složce `android/app/`
- Po přidání souboru znovu synchronizuj: `npx cap sync`

### Build chyby v Android Studio
- Zkontroluj, že `google-services` plugin je správně přidán v `build.gradle`
- Zkus Gradle sync: File > Sync Project with Gradle Files
- Případně Clean Build: Build > Clean Project, pak Build > Rebuild Project

## Další zdroje

- [Capacitor Push Notifications](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Android Push Notifications Guide](https://capacitorjs.com/docs/guides/push-notifications-firebase)
