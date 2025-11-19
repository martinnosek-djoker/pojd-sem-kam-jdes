# Google Play Store Listing - Materiály

Tato složka obsahuje všechny materiály potřebné pro publikaci aplikace Pojďsemkamjdes v Google Play Store.

## ✅ Připravené materiály

### 1. Grafika

#### App Icon (512x512 px) ✅
- **Soubor:** `graphics/app-icon-512.png`
- **Rozměry:** 512x512 px
- **Formát:** PNG s průhledným pozadím
- **Použití:** Ikona aplikace v Play Store

#### Feature Graphic (1024x500 px) ✅
- **Soubor:** `graphics/feature-graphic.png`
- **Rozměry:** 1024x500 px
- **Formát:** PNG
- **Použití:** Banner v horní části stránky aplikace v Play Store

### 2. Textové popisy ✅

- **Soubor:** `store-descriptions.txt`
- **Obsahuje:**
  - Krátký popis (max 80 znaků)
  - Dlouhý popis (optimalizovaný pro SEO)

### 3. Privacy Policy ✅

- **Soubor:** `privacy-policy.html`
- **Jazyky:** Čeština + Angličtina
- **Použití:** Nahraj tento soubor na web nebo GitHub Pages a použij URL v Play Console

**Jak nahrát Privacy Policy:**
1. Nahraj `privacy-policy.html` do složky `public/` v projektu
2. Po deployi bude dostupná na: `https://pojdsemkamjdes.cz/privacy-policy.html`
3. Nebo použij GitHub Pages nebo jiný hosting

### 4. Release AAB ✅

- **Soubor:** `../android/app/release/app-release.aab`
- **Velikost:** 5.0 MB
- **Podepsáno:** Ano (keystore: pojdsemkamjdes.jks)
- **Verze:** 1.0 (versionCode: 1)

---

## 📸 Screenshots - TODO

Google Play vyžaduje minimálně 2 screenshots (doporučeno 3-8) pro telefony.

### Požadavky:
- **Formát:** PNG nebo JPG
- **Minimální rozměry:** 320 px
- **Maximální rozměry:** 3840 px
- **Poměr stran:** 16:9 nebo 9:16 (portrait doporučeno)

### Jak vytvořit screenshots:

#### Varianta A: Z fyzického telefonu
1. Nainstaluj APK na telefon (Samsung Galaxy S24)
2. Otevři aplikaci a vyfoť tyto obrazovky:
   - **Screenshot 1:** Úvodní stránka s trendy
   - **Screenshot 2:** Seznam kaváren (třeba Vinohrady)
   - **Screenshot 3:** Seznam pekáren
   - **Screenshot 4:** Hamburger menu (otevřené)
   - **Screenshot 5:** Kavárna s detaily (scroll dolů)
3. Přeneste screenshots z telefonu do `store-listing/screenshots/`
4. Přejmenuj je na: `screenshot-1.png`, `screenshot-2.png`, atd.

#### Varianta B: Z Android emulátoru v Android Studio
1. Spusť Android Studio
2. Otevři Android Virtual Device Manager
3. Spusť emulátor (ideálně Pixel 5 nebo podobný)
4. Nainstaluj APK pomocí drag & drop
5. Pořiď screenshots pomocí tlačítka "Camera" v panelu emulátoru
6. Screenshots se uloží do složky a můžeš je zkopírovat do `store-listing/screenshots/`

### Doporučené scény pro screenshots:
1. **Úvodní stránka** - zobrazující trendy a přehled
2. **Seznam kaváren** - Vinohrady nebo jiná lokace
3. **Seznam pekáren** - ukázka kategorie
4. **Detail podniku** - s adresou a webem
5. **Hamburger menu** - otevřené menu s navigací

---

## 📋 Checklist pro Google Play Console

### Před nahráním do Play Console:

- [x] App icon 512x512 připraven
- [x] Feature graphic 1024x500 připraven
- [x] Krátký popis napsán
- [x] Dlouhý popis napsán
- [x] Privacy policy vytvořena
- [x] Release AAB vytvořen a podepsán
- [ ] Screenshots (min. 2) vyfoceny
- [ ] Privacy policy nahrána na web a URL připravena

### Při nahrávání v Play Console:

1. **Vytvoř aplikaci:**
   - Jméno: Pojďsemkamjdes
   - Výchozí jazyk: Čeština
   - Typ: Aplikace

2. **Store presence → Main store listing:**
   - Krátký popis: zkopíruj z `store-descriptions.txt`
   - Dlouhý popis: zkopíruj z `store-descriptions.txt`
   - App icon: nahraj `graphics/app-icon-512.png`
   - Feature graphic: nahraj `graphics/feature-graphic.png`
   - Screenshots: nahraj minimálně 2 screenshots z `screenshots/`

3. **App content:**
   - Privacy policy URL: `https://pojdsemkamjdes.cz/privacy-policy.html`
   - Kategorie: Životní styl nebo Cestování a místní informace
   - Content rating: Vyplň dotazník (očekávaný rating: Všichni/Everyone)
   - Target audience: Věk 18+

4. **Release → Production:**
   - Nahraj AAB: `../android/app/release/app-release.aab`
   - Release name: 1.0
   - Release notes: "První verze aplikace Pojďsemkamjdes"

---

## 🚀 Další kroky po publikaci

1. Vyčkej na review (obvykle 1-3 dny)
2. Po schválení bude aplikace dostupná v Google Play
3. Link na aplikaci: `https://play.google.com/store/apps/details?id=cz.pojdsemkamjdes.app`

---

## 📝 Poznámky

- Všechny materiály jsou připraveny v češtině (primární trh)
- Privacy policy je v češtině i angličtině
- Aplikace podporuje i anglické rozhraní
- Keystore je zálohován v `~/keystores/pojdsemkamjdes.jks` - **ZÁLOHUJ SI HO!**
