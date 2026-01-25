# iOS Setup Instructions

## Prerequisites

1. **Xcode** - Nainstaluj z App Store (zdarma)
2. **Firebase iOS Configuration** - Potřebuješ `GoogleService-Info.plist`

## Kroky k nastavení iOS appky

### 1. Firebase iOS App

1. Jdi na [Firebase Console](https://console.firebase.google.com/project/gastro-tips-23c2e/overview)
2. Klikni na iOS ikonu nebo "Add app"
3. Zadej Bundle ID: `cz.pojdsemkamjdes.app`
4. Zadej App nickname: `Pojď sem! Kam jdeš? (iOS)`
5. Stáhni `GoogleService-Info.plist`
6. Přesuň `GoogleService-Info.plist` do: `ios/App/App/GoogleService-Info.plist`

### 2. Push Notifications Setup (volitelné pro testování)

Push notifikace budou fungovat bez Apple Developer účtu v development módu, ale nebudou fungovat v produkci.

Pro production push notifikace budeš potřebovat:
- Apple Developer účet ($99/rok)
- APNs Key z Apple Developer Console
- Nahrát APNs key do Firebase Console

### 3. Build a Test

```bash
# 1. Build Next.js pro mobile
npm run build:mobile

# 2. Otevři Xcode projekt
npx cap open ios

# 3. V Xcode:
#    - Vyber "App" scheme
#    - Vyber simulátor (např. iPhone 15 Pro)
#    - Klikni Run (▶️)
```

### 4. Test na fyzickém zařízení (FREE)

1. V Xcode jdi na "Signing & Capabilities"
2. V Team vyber "Add Account..." a přidej svůj Apple ID (zdarma)
3. V Team vyber "Personal Team"
4. Připoj iPhone kabelem
5. Vyber svoje zařízení v Xcode
6. Klikni Run

**Poznámka:** Free provisioning vyprší po 7 dnech, musíš rebuildat appku.

### 5. Pro publikaci do App Store

Budeš potřebovat:
- Apple Developer Program členství ($99/rok)
- Vytvořit App ID v Apple Developer Console
- Vytvořit Provisioning Profile
- Vytvořit APNs Key pro push notifikace
- Vytvořit App Store listing

## Troubleshooting

### "No provisioning profile"
- Jdi do Xcode → Signing & Capabilities
- Změň Bundle Identifier na něco unikátního (např. `com.tvojejmeno.pojdsemkamjdes`)
- Vyber Team

### Push notifikace nefungují
- V simulátoru push notifikace nefungují vůbec
- Na fyzickém zařízení s Free Provisioning push notifikace budou fungovat částečně
- Pro plné push notifikace potřebuješ Apple Developer Program

## Další kroky

Až budeš mít GoogleService-Info.plist z Firebase, spusť:
```bash
npm run build:mobile
npx cap sync ios
npx cap open ios
```
