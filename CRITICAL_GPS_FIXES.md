# CRITICAL GPS FIXES REQUIRED

## Immediate Action Items - 4 Locations with >2km GPS Errors

These establishments have critically incorrect GPS coordinates and need to be fixed immediately:

---

## 1. Místo (Bakery - Dejvice)
**ERROR: 4,406 meters (4.4 km) - WORST CASE**

- **Database:** bakeries
- **ID:** 3
- **Location:** Dejvice
- **Address:** Bubenečská 12, 160 00 Praha 6, Czechia

**Current GPS (WRONG):**
```
Latitude:  50.13509285
Longitude: 14.37880820020478
```

**Correct GPS (from geocoding):**
```
Latitude:  50.0990304
Longitude: 14.4044095
```

**SQL Update:**
```sql
UPDATE bakeries
SET coordinates = jsonb_set(
  coordinates,
  '{Dejvice}',
  '{"lat": 50.0990304, "lng": 14.4044095}'::jsonb
)
WHERE id = 3;
```

---

## 2. Typika (Cafe - Karlín)
**ERROR: 2,975 meters (3.0 km)**

- **Database:** cafes
- **ID:** 27
- **Location:** Karlín
- **Address:** Typika, Karlín, Praha (NOTE: Address is too vague - needs street address!)

**Current GPS (WRONG):**
```
Latitude:  50.0864234
Longitude: 14.4156772
```

**Correct GPS (from geocoding):**
```
Latitude:  50.0930983
Longitude: 14.4560654
```

**Actual Address Needed:** Šaldova 419/16, 186 00 Praha 8-Karlín

**SQL Update:**
```sql
UPDATE cafes
SET
  addresses = jsonb_set(
    addresses,
    '{Karlín}',
    '"Šaldova 419/16, 186 00 Praha 8-Karlín, Czechia"'::jsonb
  ),
  coordinates = jsonb_set(
    coordinates,
    '{Karlín}',
    '{"lat": 50.0930983, "lng": 14.4560654}'::jsonb
  )
WHERE id = 27;
```

---

## 3. Aluha (Restaurant - Břevnov)
**ERROR: 2,876 meters (2.9 km)**

- **Database:** restaurants
- **ID:** 2332
- **Location:** Břevnov
- **Address:** Bělohorská 245/71, 169 00 Praha 6, Czechia

**Current GPS (WRONG):**
```
Latitude:  50.0756518
Longitude: 14.3320879
```

**Correct GPS (from geocoding):**
```
Latitude:  50.0837642
Longitude: 14.3703579
```

**SQL Update:**
```sql
UPDATE restaurants
SET coordinates = jsonb_set(
  coordinates,
  '{Břevnov}',
  '{"lat": 50.0837642, "lng": 14.3703579}'::jsonb
)
WHERE id = 2332;
```

---

## 4. Grosseto (Restaurant - Náměstí Míru)
**ERROR: 2,546 meters (2.5 km)**

- **Database:** restaurants
- **ID:** 951
- **Location:** Náměstí Míru
- **Address:** Francouzská 79/2, 120 00 Praha 2-Vinohrady, Czechia

**Current GPS (WRONG):**
```
Latitude:  50.0859028
Longitude: 14.4065097
```

**Correct GPS (from geocoding):**
```
Latitude:  50.0746317
Longitude: 14.4375603
```

**SQL Update:**
```sql
UPDATE restaurants
SET coordinates = jsonb_set(
  coordinates,
  '{Náměstí Míru}',
  '{"lat": 50.0746317, "lng": 14.4375603}'::jsonb
)
WHERE id = 951;
```

---

## Apply All Fixes at Once

```sql
-- Fix Místo bakery
UPDATE bakeries
SET coordinates = jsonb_set(coordinates, '{Dejvice}', '{"lat": 50.0990304, "lng": 14.4044095}'::jsonb)
WHERE id = 3;

-- Fix Typika cafe
UPDATE cafes
SET
  addresses = jsonb_set(addresses, '{Karlín}', '"Šaldova 419/16, 186 00 Praha 8-Karlín, Czechia"'::jsonb),
  coordinates = jsonb_set(coordinates, '{Karlín}', '{"lat": 50.0930983, "lng": 14.4560654}'::jsonb)
WHERE id = 27;

-- Fix Aluha restaurant
UPDATE restaurants
SET coordinates = jsonb_set(coordinates, '{Břevnov}', '{"lat": 50.0837642, "lng": 14.3703579}'::jsonb)
WHERE id = 2332;

-- Fix Grosseto restaurant
UPDATE restaurants
SET coordinates = jsonb_set(coordinates, '{Náměstí Míru}', '{"lat": 50.0746317, "lng": 14.4375603}'::jsonb)
WHERE id = 951;
```

---

## Verification

After applying fixes, you can verify by checking on Google Maps:

1. **Místo:** https://www.google.com/maps?q=50.0990304,14.4044095
2. **Typika:** https://www.google.com/maps?q=50.0930983,14.4560654
3. **Aluha:** https://www.google.com/maps?q=50.0837642,14.3703579
4. **Grosseto:** https://www.google.com/maps?q=50.0746317,14.4375603

---

**Next:** After fixing these critical issues, review the 24 MAJOR issues (500m-2km errors) in the main GPS_AUDIT_SUMMARY.md report.
