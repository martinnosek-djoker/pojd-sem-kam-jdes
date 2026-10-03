"use client";

import { useEffect, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import CafeCard from "@/components/CafeCard";
import Logo from "@/components/Logo";
import { Restaurant, Cafe, Coordinates } from "@/lib/types";
import { calculateDistance, formatDistance, getCurrentPosition, geocodeAddress } from "@/lib/geolocation";
import { getApiUrl, IS_MOBILE } from "@/lib/api-config";
import { Locale, LocaleProvider } from "@/lib/i18n/LocaleContext";
import { getDictionary } from "@/lib/i18n/dictionaries";

interface RestaurantWithDistance extends Restaurant {
  distance: number;
  displayLocation?: string;
  type: 'restaurant';
}

interface CafeWithDistance extends Cafe {
  distance: number;
  displayLocation?: string;
  type: 'cafe';
}

type PlaceWithDistance = RestaurantWithDistance | CafeWithDistance;

interface NearbyPageClientProps {
  locale?: Locale;
  initialRestaurants: Restaurant[];
  initialCafes: Cafe[];
}

export default function NearbyPageClient({ locale = "cs", initialRestaurants, initialCafes }: NearbyPageClientProps) {
  const t = getDictionary(locale).pobliz;

  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [cafes, setCafes] = useState<Cafe[]>(initialCafes);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceWithDistance[]>([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [radiusKm, setRadiusKm] = useState(2);
  const [error, setError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  // New states for address search
  const [searchMode, setSearchMode] = useState<'gps' | 'address'>('gps');
  const [searchAddress, setSearchAddress] = useState('');
  const [locationDisplayName, setLocationDisplayName] = useState<string | null>(null);

  // Get next radius option for "enlarge" button
  const getNextRadius = (current: number) => {
    const options = [0.5, 1, 2, 5, 10];
    const currentIndex = options.indexOf(current);
    if (currentIndex === -1 || currentIndex === options.length - 1) {
      return options[options.length - 1];
    }
    return options[currentIndex + 1];
  };

  // In the native app, refresh with a live fetch after the initial (build-time) data paints,
  // since a static mobile build can otherwise go stale between app releases.
  useEffect(() => {
    if (!IS_MOBILE) return;

    async function refreshData() {
      try {
        const [restaurantsRes, cafesRes] = await Promise.all([
          fetch(getApiUrl("/api/restaurants")),
          fetch(getApiUrl("/api/cafes")),
        ]);

        const restaurantsData = await restaurantsRes.json();
        const cafesData = await cafesRes.json();

        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
        }
        if (Array.isArray(cafesData)) {
          setCafes(cafesData);
        }
      } catch (error) {
        console.error("[NearbyPageClient] Error refreshing data:", error);
      }
    }

    refreshData();
  }, []);

  // Calculate nearby places (restaurants and cafes) when user location or radius changes
  useEffect(() => {
    if (!userLocation || (!restaurants.length && !cafes.length)) {
      setNearbyPlaces([]);
      return;
    }

    // Flatten restaurants by location and calculate distance
    const placesWithDistance: PlaceWithDistance[] = [];

    // Process restaurants
    restaurants.forEach((restaurant) => {
      if (!restaurant.coordinates) return;

      // Split locations and process each branch
      const locations = restaurant.location.split(',').map(l => l.trim());

      locations.forEach((location) => {
        const coords = restaurant.coordinates![location];
        if (!coords) return;

        const distance = calculateDistance(userLocation, coords);

        if (distance <= radiusKm) {
          placesWithDistance.push({
            ...restaurant,
            distance,
            displayLocation: location,
            type: 'restaurant',
          });
        }
      });
    });

    // Process cafes
    cafes.forEach((cafe) => {
      if (!cafe.coordinates) return;

      // Split locations and process each branch
      const locations = cafe.location.split(',').map(l => l.trim());

      locations.forEach((location) => {
        const coords = cafe.coordinates![location];
        if (!coords) return;

        const distance = calculateDistance(userLocation, coords);

        if (distance <= radiusKm) {
          placesWithDistance.push({
            ...cafe,
            distance,
            displayLocation: location,
            type: 'cafe',
          });
        }
      });
    });

    // Sort by distance
    placesWithDistance.sort((a, b) => a.distance - b.distance);

    // Deduplicate - keep only the closest occurrence of each place
    // Use name for deduplication since same place can be in multiple tables (restaurants/cafes)
    const seenNames = new Set<string>();
    const deduplicatedPlaces = placesWithDistance.filter(place => {
      if (seenNames.has(place.name)) {
        return false; // Skip - already have a closer occurrence
      }
      seenNames.add(place.name);
      return true;
    });

    setNearbyPlaces(deduplicatedPlaces);
  }, [userLocation, radiusKm, restaurants, cafes]);

  const handleGetLocation = async () => {
    setGettingLocation(true);
    setError(null);
    setIsPermissionDenied(false);

    try {
      const position = await getCurrentPosition(locale);
      setUserLocation(position);
      setLocationDisplayName(null); // Clear any previous address search
      setIsPermissionDenied(false);
    } catch (error: any) {
      const errorMsg = error.message || t.errorGenericTitle;
      setError(errorMsg);

      // Detekovat jestli byl přístup zamítnut
      if (errorMsg.includes("zamítnut") || errorMsg.includes("denied")) {
        setIsPermissionDenied(true);
      }

      console.error("Error getting location:", error);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) {
      setError(t.addressRequired);
      return;
    }

    setGettingLocation(true);
    setError(null);
    setIsPermissionDenied(false);

    try {
      const result = await geocodeAddress(searchAddress, locale);
      setUserLocation(result.coordinates);
      setLocationDisplayName(result.displayName);
    } catch (error: any) {
      const errorMsg = error.message || t.errorGenericTitle;
      setError(errorMsg);
      console.error("Error geocoding address:", error);
    } finally {
      setGettingLocation(false);
    }
  };

  return (
    <LocaleProvider locale={locale}>
    <main className="min-h-screen px-8 pb-8 bg-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-10 md:pt-8 mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-hairline pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-ink mt-4 md:mt-6">
            {t.title}
          </h1>
          <p className="text-sm md:text-lg text-text-muted mt-2">
            {t.subtitle}
          </p>
        </div>

        {/* Location Controls */}
        <div className="mb-8 p-6 bg-surface border border-hairline rounded-lg">
          {/* Mode Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setSearchMode('gps')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                searchMode === 'gps'
                  ? 'bg-terracotta text-white border-2 border-terracotta-dark'
                  : 'bg-surface-2 text-text-muted border-2 border-hairline hover:border-ink-mid'
              }`}
            >
              {t.modeGps}
            </button>
            <button
              onClick={() => setSearchMode('address')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                searchMode === 'address'
                  ? 'bg-terracotta text-white border-2 border-terracotta-dark'
                  : 'bg-surface-2 text-text-muted border-2 border-hairline hover:border-ink-mid'
              }`}
            >
              {t.modeAddress}
            </button>
          </div>

          <div className="flex flex-col gap-6 items-center">
            {/* GPS Mode */}
            {searchMode === 'gps' && (
              <div className="w-full flex justify-center">
                <button
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="w-full max-w-md px-8 py-4 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-all duration-300 border border-terracotta-dark shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  {gettingLocation ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      {t.gettingLocation}
                    </span>
                  ) : userLocation && !locationDisplayName ? (
                    t.updateLocation
                  ) : (
                    t.findNearby
                  )}
                </button>
              </div>
            )}

            {/* Address Search Mode */}
            {searchMode === 'address' && (
              <div className="w-full max-w-md">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddressSearch();
                      }
                    }}
                    placeholder={t.addressPlaceholder}
                    className="flex-1 px-4 py-3 border border-hairline rounded-lg bg-surface text-ink placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                  <button
                    onClick={handleAddressSearch}
                    disabled={gettingLocation || !searchAddress.trim()}
                    className="px-6 py-3 bg-terracotta text-white rounded-lg hover:bg-terracotta-dark transition-all duration-300 border border-terracotta-dark shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {gettingLocation ? (
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      t.search
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-text-muted text-center">
                  {t.addressHint}
                </p>
              </div>
            )}

            {/* Radius Selector */}
            {userLocation && (
              <div className="w-full flex justify-center items-center gap-4">
                <label className="text-ink font-medium">{t.radiusLabel}</label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="px-4 py-2 pr-10 border border-hairline rounded-md bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent appearance-none bg-no-repeat bg-right cursor-pointer"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238A6A56' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.5rem center",
                    backgroundSize: "1.5em 1.5em"
                  }}
                >
                  <option value={0.5}>0.5 km</option>
                  <option value={1}>1 km</option>
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                </select>
              </div>
            )}
          </div>

          {/* User Location Display */}
          {userLocation && (
            <div className="mt-4 text-sm text-text-muted text-center">
              {locationDisplayName ? (
                <>
                  <div className="font-medium text-terracotta mb-1">{t.foundAddressLabel}</div>
                  <div>{locationDisplayName}</div>
                </>
              ) : (
                <>{t.yourLocation(userLocation.lat.toFixed(4), userLocation.lng.toFixed(4))}</>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-5 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-start gap-3">
                <div className="text-2xl flex-shrink-0">📍</div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-red-800 font-serif font-semibold mb-1">
                    {isPermissionDenied ? t.errorPermissionTitle : t.errorGenericTitle}
                  </h3>
                  <p className="text-red-700 text-sm mb-4">{error}</p>

                  {isPermissionDenied && (
                    <div className="bg-white/60 border border-red-100 p-4 rounded-xl mb-4">
                      <p className="text-red-800 text-xs font-semibold mb-3">{t.howToAllow}</p>

                      {/* Instrukce pro WEB */}
                      <div className="mb-3">
                        <p className="text-red-700 text-xs font-semibold mb-1.5">{t.webInstructionsTitle}</p>
                        <ol className="text-red-700/80 text-xs space-y-1 list-decimal list-inside ml-1">
                          <li>{t.webStep1}</li>
                          <li>{t.webStep2}</li>
                          <li>{t.webStep3}</li>
                          <li>{t.webStep4}</li>
                        </ol>
                      </div>

                      {/* Instrukce pro MOBIL */}
                      <div>
                        <p className="text-red-700 text-xs font-semibold mb-1.5">{t.mobileInstructionsTitle}</p>
                        <ul className="text-red-700/80 text-xs space-y-1 list-disc list-inside ml-1">
                          <li>{t.mobileIphone}</li>
                          <li>{t.mobileAndroid}</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {!isPermissionDenied && (
                    <div className="bg-white/60 border border-red-100 p-4 rounded-xl mb-4">
                      <p className="text-red-800 text-xs font-semibold mb-2">{t.whatToTryTitle}</p>
                      <ul className="text-red-700/80 text-xs space-y-1 list-disc list-inside">
                        <li>{t.tryTip1}</li>
                        <li>{t.tryTip2}</li>
                        <li>{t.tryTip3}</li>
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setError(null);
                        setIsPermissionDenied(false);
                        handleGetLocation();
                      }}
                      className="px-4 py-2 bg-terracotta hover:bg-terracotta-dark text-white rounded-lg transition-colors text-sm font-medium shadow-sm"
                    >
                      {isPermissionDenied ? t.retryPermission : t.retryGeneric}
                    </button>
                    <button
                      onClick={() => {
                        setError(null);
                        setIsPermissionDenied(false);
                        setSearchMode('address');
                      }}
                      className="px-4 py-2 bg-white text-red-800 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                    >
                      {t.enterAddressManually}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {!userLocation ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📍</div>
            <p className="text-xl text-text-muted mb-4">
              {t.emptyPromptTitle}
            </p>
            <p className="text-sm text-text-muted">
              {t.emptyPromptSubtitle}
            </p>
          </div>
        ) : nearbyPlaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-text-muted mb-4">
              {t.noResultsInRadius(radiusKm)}
            </p>
            <p className="text-sm text-text-muted mb-6">
              {t.tryLargerRadius}
            </p>
            <button
              onClick={() => setRadiusKm(getNextRadius(radiusKm))}
              disabled={radiusKm >= 10}
              className="px-6 py-3 bg-terracotta text-white rounded-md hover:bg-terracotta-dark transition-all duration-300 border border-terracotta-dark shadow-lg shadow-black/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t.expandTo(getNextRadius(radiusKm))}
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 text-center">
              <p className="text-text-muted">
                {t.resultsCount(nearbyPlaces.length, radiusKm)}
              </p>
            </div>

            {/* Places Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nearbyPlaces.map((place, index) => (
                <div key={`${place.type}-${place.id}-${place.displayLocation}-${index}`} className="relative">
                  {/* Distance Badge */}
                  <div className="absolute top-4 right-4 z-10 bg-terracotta text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    📍 {formatDistance(place.distance)}
                  </div>
                  {place.type === 'restaurant' ? (
                    <RestaurantCard
                      restaurant={place}
                      forceLocation={place.displayLocation}
                    />
                  ) : (
                    <CafeCard
                      cafe={place}
                      forceLocation={place.displayLocation}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
    </LocaleProvider>
  );
}
