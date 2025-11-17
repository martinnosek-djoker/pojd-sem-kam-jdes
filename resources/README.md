# Mobile App Assets - Ikony a Splash Screen

Tento adresář obsahuje source soubory pro mobilní aplikaci.

## 📁 Struktura

```
resources/
├── app-icon.svg      # Source pro app ikonu (1024x1024)
├── splash.svg        # Source pro splash screen (2732x2732)
├── icon.png          # Vygenerovaná app ikona (vytvoř z app-icon.svg)
└── splash.png        # Vygenerovaný splash screen (vytvoř z splash.svg)
```

## 🎨 Jak vytvořit finální PNG soubory

### Možnost 1: Online konvertor (nejjednodušší)

1. **App Icon (icon.png)**:
   - Jdi na https://cloudconvert.com/svg-to-png
   - Nahraj `app-icon.svg`
   - Nastav rozměry: **1024 x 1024 px**
   - Stáhni jako `icon.png` a ulož do této složky

2. **Splash Screen (splash.png)**:
   - Jdi na https://cloudconvert.com/svg-to-png
   - Nahraj `splash.svg`
   - Nastav rozměry: **2732 x 2732 px**
   - Stáhni jako `splash.png` a ulož do této složky

### Možnost 2: Figma/Adobe Illustrator

1. Otevři SVG soubor
2. Exportuj jako PNG s požadovanými rozměry
3. Ulož do této složky

### Možnost 3: Inkscape (zdarma)

1. Otevři SVG v Inkscape
2. File → Export PNG Image
3. Nastav rozměry (1024x1024 nebo 2732x2732)
4. Export

### Možnost 4: Příkazová řádka (ImageMagick)

```bash
# Nainstaluj ImageMagick
brew install imagemagick  # macOS
# sudo apt-get install imagemagick  # Linux

# Konvertuj app icon
convert app-icon.svg -resize 1024x1024 icon.png

# Konvertuj splash screen
convert splash.svg -resize 2732x2732 splash.png
```

## 🚀 Po vytvoření PNG souborů

1. Ujisti se, že máš v této složce:
   - `icon.png` (1024x1024 px)
   - `splash.png` (2732x2732 px)

2. Spusť generování assets pro Capacitor:
   ```bash
   npm install -g @capacitor/assets
   npx capacitor-assets generate --iconPath resources/icon.png --splashPath resources/splash.png
   ```

3. Tím se automaticky vygenerují všechny potřebné velikosti pro Android a iOS

## ✅ Checklist

- [ ] Vytvořit `icon.png` (1024x1024)
- [ ] Vytvořit `splash.png` (2732x2732)
- [ ] Spustit `npx capacitor-assets generate`
- [ ] Ověřit že se vygenerovaly soubory v `android/` a `ios/` složkách

## 🎨 Design specifikace

### App Icon
- **Rozměry**: 1024 x 1024 px
- **Formát**: PNG
- **Pozadí**: Černé (#000000)
- **Logo**: Dva šipky s centrálním fialovým puntíkem
- **Barvy**: Purple gradient (#9333ea → #a78bfa)

### Splash Screen
- **Rozměry**: 2732 x 2732 px
- **Formát**: PNG
- **Pozadí**: Černé (#000000)
- **Logo**: Vycentrované, stejné jako icon

## 📝 Poznámky

- PNG soubory **nejsou** v git repozitáři (.gitignore)
- SVG soubory jsou source of truth
- Po každé změně loga aktualizuj SVG a regeneruj PNG
- Capacitor assets tool automaticky vytvoří všechny potřebné velikosti

## 🔗 Užitečné odkazy

- [Capacitor Assets Documentation](https://github.com/ionic-team/capacitor-assets)
- [iOS Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Android Icon Guidelines](https://developer.android.com/distribute/google-play/resources/icon-design-specifications)
