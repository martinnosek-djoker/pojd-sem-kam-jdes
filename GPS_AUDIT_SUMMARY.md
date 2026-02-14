# GPS Audit Report - GastroTips Database

**Date:** February 9, 2026
**Database:** Supabase (kkqrumygyxuefrwbpyiy.supabase.co)
**Tables Audited:** restaurants, cafes, bakeries

---

## Executive Summary

A comprehensive GPS audit was performed on all 172 establishments across three database tables, validating 210 individual location coordinates against geocoded addresses using the Nominatim OpenStreetMap API.

### Overall Statistics

- **Total Establishments:** 172
- **Total Locations Audited:** 210 (some establishments have multiple branches)
- **Geocoding Success Rate:** 67.1% (141/210 locations successfully geocoded)

### Data Quality Assessment

| Category | Count | Percentage |
|----------|-------|------------|
| CRITICAL Issues (>2km) | 4 | 1.9% |
| MAJOR Issues (500m-2km) | 24 | 11.4% |
| MINOR Issues (100m-500m) | 21 | 10.0% |
| OK (<100m accuracy) | 92 | 43.8% |
| Geocoding Failed | 69 | 32.9% |

---

## Critical Issues (>2km GPS Error)

These locations have GPS coordinates that are critically incorrect and need immediate attention:

### 1. Grosseto - Náměstí Míru Branch
- **Table:** restaurants
- **ID:** 951
- **Error Distance:** 2,546 meters
- **Current GPS:** 50.0859028, 14.4065097
- **Expected GPS:** 50.0746317, 14.4375603
- **Address:** Francouzská 79/2, 120 00 Praha 2-Vinohrady
- **Issue:** GPS points to wrong location, likely copied from another branch

### 2. Aluha
- **Table:** restaurants
- **ID:** 2332
- **Error Distance:** 2,876 meters
- **Current GPS:** 50.0756518, 14.3320879
- **Expected GPS:** 50.0837642, 14.3703579
- **Address:** Bělohorská 245/71, 169 00 Praha 6
- **Issue:** Significant GPS coordinate error

### 3. Typika - Karlín Branch
- **Table:** cafes
- **ID:** 27
- **Error Distance:** 2,975 meters
- **Current GPS:** 50.0864234, 14.4156772
- **Expected GPS:** 50.0930983, 14.4560654
- **Address:** Typika, Karlín, Praha
- **Issue:** GPS appears to be generic placeholder coordinates

### 4. Místo - Dejvice Branch
- **Table:** bakeries
- **ID:** 3
- **Error Distance:** 4,406 meters (worst case)
- **Current GPS:** 50.13509285, 14.37880820020478
- **Expected GPS:** 50.0990304, 14.4044095
- **Address:** Bubenečská 12, 160 00 Praha 6
- **Issue:** Completely wrong GPS coordinates

---

## Major Issues (500m-2km GPS Error)

24 locations have significant GPS errors that should be corrected:

### High Priority (>1km error):
1. **Místo (bakeries, ID 3)** - 4,406m error
2. **Typika (cafes, ID 27)** - 2,975m error
3. **Aluha (restaurants, ID 2332)** - 2,876m error
4. **Grosseto (restaurants, ID 951)** - 2,546m error
5. **Café Sofa (bakeries/restaurants, ID 5/944)** - 1,801m error
6. **San Carlo - Holešovice (restaurants, ID 904)** - 1,385m error
7. **La Degustation (restaurants, ID 953)** - 1,304m error
8. **An Bistro Café (restaurants, ID 939)** - 1,218m error
9. **Sansho (restaurants, ID 965)** - 1,206m error
10. **Fuze Restaurant (restaurants, ID 1321)** - 1,117m error
11. **Loka (bakeries, ID 11)** - 1,117m error
12. **Sugo Pasta Bar (restaurants, ID 933)** - 1,017m error
13. **Lola Tapas (restaurants, ID 957)** - 982m error
14. **Masala - Letná (restaurants, ID 958)** - 992m error

### Medium Priority (500m-1km error):
15. **Bon Ramen - Anděl (restaurants, ID 943)** - 939m error
16. **Isaac's BBQ (restaurants, ID 920)** - 838m error
17. **Garage Poutine (restaurants, ID 950)** - 825m error
18. **FatFuck - Břevnov (restaurants, ID 915)** - 807m error
19. **Óda Restaurant (restaurants, ID 2336)** - 653m error
20. **Funwari Japanese Delights (cafes, ID 63)** - 647m error
21. **Pork's (restaurants, ID 961)** - 616m error
22. **IF Café - Kampa (cafes/bakeries, ID 54/1)** - 587m error
23. **Umámy Café (cafes, ID 62)** - 586m error
24. **Patê Bakery (restaurants, ID 2335)** - 544m error

---

## Minor Issues (100m-500m GPS Error)

21 locations have minor GPS inaccuracies (100-500 meters). While these may be acceptable for some use cases, they could cause confusion in dense urban areas:

Notable entries:
- **Miska Ramen - Václavské náměstí** - 490m
- **Dockhouse** - 487m (address points to Maryland, USA - likely wrong address in database!)
- **Dim Sum Spot - Letná** - 454m
- **Nha Hai Hanh** - 421m
- **Dian Prague** - 414m
- Multiple other establishments with 100-400m errors

---

## Geocoding Failures (69 locations)

69 locations could not be verified because their addresses are too vague (e.g., "Acid Coffee, Letná, Praha" or "Miners, Staroměstské náměstí, Praha"). These addresses need to include street names and numbers for accurate geocoding.

### Affected Establishments:
- Acid Coffee, An Prague, Místo (cafe), Ba Lam, Bjukitchen, Format Coffee, Café Sofa (cafe), mèmè & brunch, Cafedu, Hans by Solo, Francin, EMA Espresso Bar, Matilda, Moe, Vila 63, O-Mai Coffee, Miners (4 locations), Solo Bakery, Cafefin, May Café, Můj šálek kávy, Café Hrnek, Kavárna co hledá jméno, Kro Libeň, Šodó Bistro, Dos Mundos (2 locations), Pekárna Praktika, Etapa, Typika (2 locations), 20m2, Café Jen, Kro Coffee, Kopi Prague, Kiosek Coffee (2 locations), La Forme Bakery, Letec Espresso Bar, Loka (cafe), La Zmrzka, Naše maso (Holešovice branch)

---

## Data Quality Patterns

### Issues Identified:

1. **Generic Placeholder Coordinates**: Some multi-branch establishments appear to use the same GPS coordinates for different locations (e.g., many entries use 50.0864234, 14.4156772)

2. **Incomplete Addresses**: 69 locations (32.9%) have addresses that are too vague for geocoding (neighborhood names only, no street addresses)

3. **Multi-Branch Coordinate Sharing**: Establishments with multiple branches sometimes have incorrect GPS for one or more locations

4. **Address Format Inconsistency**: Mix of detailed addresses vs. generic location names makes validation difficult

### Recommendations:

1. **Immediate Action Required**: Fix the 4 CRITICAL issues (>2km error)
2. **High Priority**: Correct the 24 MAJOR issues (500m-2km error)
3. **Data Collection Improvement**: Add complete street addresses for the 69 locations with vague addresses
4. **Systematic Review**: Review all multi-branch establishments to ensure each branch has unique, accurate GPS coordinates
5. **Quality Assurance**: Implement validation checks to prevent generic coordinates from being assigned to specific locations

---

## Technical Details

**Geocoding Method:** Nominatim OpenStreetMap API
**User Agent:** GastroTips/1.0
**Rate Limiting:** 1 second delay between requests (1,000+ API calls made)
**Distance Calculation:** Haversine formula (Earth radius: 6,371 km)
**Coordinate Format:** WGS84 (latitude/longitude in decimal degrees)

---

## Files Generated

1. **gps-audit-output.log** - Complete console output with all geocoding results
2. **gps-audit-report.json** - Detailed JSON report with all audit results by category
3. **GPS_AUDIT_SUMMARY.md** - This executive summary document
4. **scripts/gps-audit.mjs** - Reusable audit script for future validations

---

## Next Steps

1. Review and correct the 4 CRITICAL issues immediately
2. Prioritize fixing the 14 MAJOR issues with >1km error
3. Collect complete street addresses for locations with geocoding failures
4. Consider implementing automated GPS validation in the data entry workflow
5. Schedule periodic audits to maintain data quality

---

**Report prepared by:** Automated GPS Audit System
**Script location:** /Users/martin.nosek/claude-projects/gastro-tips/scripts/gps-audit.mjs
