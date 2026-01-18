# 📸 Správa obrázků

Utility scripty pro stahování a migraci obrázků z externích URL na lokální úložiště.

## 🎯 Proč lokální úložiště?

Obrázky z externích URL často mizí (majitelé je stahují, linky expirují, atd.). Lokální úložiště zajišťuje:
- ✅ Stabilitu - obrázky nikdy nezmizí
- ✅ Rychlost - rychlejší načítání
- ✅ Kontrolu - máme plnou kontrolu nad obsahem
- ✅ Backup - obrázky jsou součástí git repozitáře

## 📥 Stažení jednotlivého obrázku

Pro stažení jednotlivého obrázku z URL:

```bash
node scripts/download-image.mjs <URL> [název-souboru] [typ]
```

### Příklady:

```bash
# Základní použití
node scripts/download-image.mjs https://example.com/photo.jpg

# S vlastním názvem
node scripts/download-image.mjs https://example.com/photo.jpg moje-restaurace

# S vlastním názvem a typem
node scripts/download-image.mjs https://example.com/photo.jpg campo-de-fiori restaurants

# Pro kavárnu
node scripts/download-image.mjs https://example.com/cafe.jpg kavarna-liberica cafes

# Pro cukrárnu
node scripts/download-image.mjs https://example.com/cake.jpg cukrarna-mysak bakeries

# Pro trending
node scripts/download-image.mjs https://example.com/trend.jpg novy-podnik trendings

# Pro Michelin
node scripts/download-image.mjs https://example.com/restaurant.jpg field michelin
```

### Dostupné typy:
- `restaurants` (výchozí) - restaurace
- `cafes` - kavárny
- `bakeries` - cukrárny
- `trendings` - TOP 10 trendy
- `michelin` - Michelin restaurace

### Výstup:

Script vrátí lokální cestu, kterou použiješ v databázi:

```
✅ Obrázek úspěšně stažen a uložen!
📁 Název souboru: campo-de-fiori-123.jpg
📍 Lokální cesta: /images/restaurants/campo-de-fiori-123.jpg

💡 Použij tuto cestu v databázi místo URL:
   /images/restaurants/campo-de-fiori-123.jpg
```

## 🔄 Migrace všech existujících obrázků

Pro migraci všech existujících obrázků z databáze:

```bash
# Migruje všechny tabulky
node scripts/migrate-images.mjs all

# Migruje pouze restaurace
node scripts/migrate-images.mjs restaurants

# Migruje pouze kavárny
node scripts/migrate-images.mjs cafes

# Migruje pouze cukrárny
node scripts/migrate-images.mjs bakeries

# Migruje pouze trendingy
node scripts/migrate-images.mjs trendings

# Migruje pouze Michelin
node scripts/migrate-images.mjs michelin_restaurants
```

### Co script dělá:

1. 📊 Načte všechny záznamy z vybrané tabulky
2. 📥 Stáhne obrázky z externích URL
3. 💾 Uloží je do `public/images/[typ]/`
4. 🔄 Aktualizuje databázi s novou lokální cestou
5. ⏭️  Přeskočí již migrované obrázky

### Výstup:

```
🚀 Migrace obrázků z externích URL na lokální storage
═══════════════════════════════════════════════════════

📊 Migrace tabulky: restaurants
────────────────────────────────────────────────────────
📋 Nalezeno záznamů: 150
📥 Campo de Fiori: Stahuji...
✅ Campo de Fiori: OK -> /images/restaurants/campo-de-fiori-1.jpg
📥 Naše maso: Stahuji...
✅ Naše maso: OK -> /images/restaurants/nase-maso-2.jpg
⏭️  U Kulinářů: Již migrováno
────────────────────────────────────────────────────────
✅ Úspěšně migrováno: 148
⏭️  Přeskočeno: 1
❌ Selhalo: 1

🎉 Migrace dokončena!
```

## 📁 Struktura složek

```
public/
  images/
    restaurants/    # Obrázky restaurací
    cafes/         # Obrázky kaváren
    bakeries/      # Obrázky cukráren
    trendings/     # Obrázky TOP 10 trendů
    michelin/      # Obrázky Michelin restaurací
```

## 🔧 Jak to funguje

### Normalizace názvů souborů:
- Odstraní diakritiku: `Naše Maso` → `nase-maso`
- Nahradí mezery: `Campo de Fiori` → `campo-de-fiori`
- Přidá ID záznamu: `campo-de-fiori-1.jpg`

### Detekce formátu:
- Automaticky detekuje formát z URL
- Podporuje: JPG, PNG, WEBP, GIF
- Fallback na JPG pokud není jasné

### Ochrana před duplikáty:
- Pokud soubor existuje, přidá timestamp
- Nepřepíše existující soubory

## ⚠️ Důležité poznámky

1. **Po migraci commitni obrázky do git:**
   ```bash
   git add public/images/
   git commit -m "feat: migrate images to local storage"
   git push
   ```

2. **Velké soubory**: Git není ideální pro velké binární soubory. Pokud máš hodně obrázků, zvaž:
   - Git LFS (Large File Storage)
   - Cloud storage (AWS S3, Cloudflare R2, atd.)

3. **Migrace databáze**: Script automaticky aktualizuje `image_url` v databázi z externího URL na lokální cestu.

## 🐛 Řešení problémů

### Script selhává s chybou "Failed to download"
- Zkontroluj, zda je URL dostupné
- Některé servery blokují automatické stahování
- Zkus stáhnout obrázek ručně a použít jej lokálně

### "Permission denied"
- Ujisti se, že máš práva na zápis do `public/images/`
- Spusť: `chmod +x scripts/download-image.mjs`

### Obrázky se nezobrazují
- Ujisti se, že cesta začíná `/images/` (ne `public/images/`)
- Zkontroluj, že soubor skutečně existuje v `public/images/[typ]/`
- Restartuj dev server po přidání nových obrázků
