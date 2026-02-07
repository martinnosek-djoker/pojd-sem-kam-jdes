"use client";

import { useEffect, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import BakeryCard from "@/components/BakeryCard";
import CafeCard from "@/components/CafeCard";
import Logo from "@/components/Logo";
import LoadingPot from "@/components/LoadingPot";
import { Restaurant, Bakery, Cafe, Coordinates } from "@/lib/types";
import { calculateDistance, formatDistance, getCurrentPosition, geocodeAddress } from "@/lib/geolocation";
import { getApiUrl } from "@/lib/api-config";

interface RestaurantWithDistance extends Restaurant {
  distance: number;
  displayLocation?: string;
  type: 'restaurant';
}

interface BakeryWithDistance extends Bakery {
  distance: number;
  displayLocation?: string;
  type: 'bakery';
}

interface CafeWithDistance extends Cafe {
  distance: number;
  displayLocation?: string;
  type: 'cafe';
}

type PlaceWithDistance = RestaurantWithDistance | BakeryWithDistance | CafeWithDistance;

export default function NearbyRestaurants() {
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch all restaurants, bakeries and cafes
  useEffect(() => {
    async function fetchData() {
      try {
        const [restaurantsRes, bakeriesRes, cafesRes] = await Promise.all([
          fetch(getApiUrl("/api/restaurants")),
          fetch(getApiUrl("/api/bakeries")),
          fetch(getApiUrl("/api/cafes")),
        ]);

        const restaurantsData = await restaurantsRes.json();
        const bakeriesData = await bakeriesRes.json();
        const cafesData = await cafesRes.json();

        if (Array.isArray(restaurantsData)) {
          setRestaurants(restaurantsData);
        }

        if (Array.isArray(bakeriesData)) {
          setBakeries(bakeriesData);
        }

        if (Array.isArray(cafesData)) {
          setCafes(cafesData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate nearby places (restaurants, bakeries and cafes) when user location or radius changes
  useEffect(() => {
    if (!userLocation || (!restaurants.length && !bakeries.length && !cafes.length)) {
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

    // Process bakeries
    bakeries.forEach((bakery) => {
      if (!bakery.coordinates) return;

      // Split locations and process each branch
      const locations = bakery.location.split(',').map(l => l.trim());

      locations.forEach((location) => {
        const coords = bakery.coordinates![location];
        if (!coords) return;

        const distance = calculateDistance(userLocation, coords);

        if (distance <= radiusKm) {
          placesWithDistance.push({
            ...bakery,
            distance,
            displayLocation: location,
            type: 'bakery',
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

    setNearbyPlaces(placesWithDistance);
  }, [userLocation, radiusKm, restaurants, bakeries, cafes]);

  const handleGetLocation = async () => {
    setGettingLocation(true);
    setError(null);
    setIsPermissionDenied(false);

    try {
      const position = await getCurrentPosition();
      setUserLocation(position);
      setLocationDisplayName(null); // Clear any previous address search
      setIsPermissionDenied(false);
    } catch (error: any) {
      const errorMsg = error.message || "Nepodařilo se získat polohu";
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
      setError("Zadej prosím adresu nebo místo");
      return;
    }

    setGettingLocation(true);
    setError(null);
    setIsPermissionDenied(false);

    try {
      const result = await geocodeAddress(searchAddress);
      setUserLocation(result.coordinates);
      setLocationDisplayName(result.displayName);
    } catch (error: any) {
      const errorMsg = error.message || "Nepodařilo se najít adresu";
      setError(errorMsg);
      console.error("Error geocoding address:", error);
    } finally {
      setGettingLocation(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen px-8 pb-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="pt-10 md:pt-8 mb-8">
            <Logo />
          </div>
          <LoadingPot />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-8 pb-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="pt-10 md:pt-8 mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mt-4 md:mt-6">
            V okolí
          </h1>
          <p className="text-sm md:text-lg text-gray-300 mt-2">
            Najdi skvělá místa poblíž tvé polohy
          </p>
        </div>

        {/* Location Controls */}
        <div className="mb-8 p-6 bg-gray-900/50 border border-purple-500/30 rounded-lg">
          {/* Mode Toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setSearchMode('gps')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                searchMode === 'gps'
                  ? 'bg-purple-600 text-white border-2 border-purple-400'
                  : 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              📍 Moje poloha
            </button>
            <button
              onClick={() => setSearchMode('address')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 ${
                searchMode === 'address'
                  ? 'bg-purple-600 text-white border-2 border-purple-400'
                  : 'bg-gray-800 text-gray-400 border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              🔍 Hledat adresu
            </button>
          </div>

          <div className="flex flex-col gap-6 items-center">
            {/* GPS Mode */}
            {searchMode === 'gps' && (
              <div className="w-full flex justify-center">
                <button
                  onClick={handleGetLocation}
                  disabled={gettingLocation}
                  className="w-full max-w-md px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
                >
                  {gettingLocation ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Zjišťuji polohu...
                    </span>
                  ) : userLocation && !locationDisplayName ? (
                    "Aktualizovat polohu"
                  ) : (
                    "Najít restaurace v okolí"
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
                    placeholder="např. Václavské náměstí, Praha"
                    className="flex-1 px-4 py-3 border border-purple-600 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAddressSearch}
                    disabled={gettingLocation || !searchAddress.trim()}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    {gettingLocation ? (
                      <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      "Hledat"
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-400 text-center">
                  Zadej adresu, ulici, náměstí nebo městskou část
                </p>
              </div>
            )}

            {/* Radius Selector */}
            {userLocation && (
              <div className="w-full flex justify-center items-center gap-4">
                <label className="text-gray-300 font-medium">Poloměr hledání:</label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className="px-4 py-2 pr-10 border border-purple-600 rounded-md bg-black text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-no-repeat bg-right cursor-pointer"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
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
            <div className="mt-4 text-sm text-gray-400 text-center">
              {locationDisplayName ? (
                <>
                  <div className="font-medium text-purple-300 mb-1">📍 Vyhledaná adresa:</div>
                  <div>{locationDisplayName}</div>
                </>
              ) : (
                <>Tvá poloha: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-red-300 font-semibold mb-1">
                    {isPermissionDenied ? "Přístup k poloze není povolen" : "Nepodařilo se získat tvou polohu"}
                  </h3>
                  <p className="text-red-200 text-sm mb-3">{error}</p>

                  {isPermissionDenied && (
                    <div className="bg-red-900/20 p-3 rounded mb-3">
                      <p className="text-red-200/90 text-xs font-semibold mb-2">💡 Jak povolit přístup k poloze:</p>

                      {/* Instrukce pro WEB */}
                      <div className="bg-red-800/30 p-2 rounded mb-2">
                        <p className="text-red-200 text-xs font-semibold mb-1">🌐 Na webu (Chrome, Safari, Firefox):</p>
                        <ol className="text-red-200/70 text-xs space-y-1 list-decimal list-inside ml-2">
                          <li>Klikni na <strong>🔒 zámek</strong> nebo <strong>ⓘ info ikonu</strong> vlevo od URL v horní liště</li>
                          <li>Najdi nastavení <strong>"Poloha"</strong> nebo <strong>"Location"</strong></li>
                          <li>Vyber <strong>"Povolit"</strong> nebo <strong>"Allow"</strong></li>
                          <li>Stránka se může obnovit - klikni znovu na tlačítko níže</li>
                        </ol>
                      </div>

                      {/* Instrukce pro MOBIL */}
                      <div className="bg-red-800/30 p-2 rounded">
                        <p className="text-red-200 text-xs font-semibold mb-1">📱 V mobilní aplikaci:</p>
                        <ul className="text-red-200/70 text-xs space-y-1 list-disc list-inside ml-2">
                          <li><strong>iPhone:</strong> Nastavení → Soukromí → Polohové služby → Gastro Tips → Povolit</li>
                          <li><strong>Android:</strong> Nastavení → Aplikace → Gastro Tips → Oprávnění → Poloha → Povolit</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {!isPermissionDenied && (
                    <div className="bg-red-900/20 p-3 rounded mb-3">
                      <p className="text-red-200/90 text-xs font-semibold mb-2">💡 Co zkusit:</p>
                      <ul className="text-red-200/70 text-xs space-y-1 list-disc list-inside">
                        <li>Zkontroluj, že máš zapnutou GPS na zařízení</li>
                        <li>Zkus se přesunout blíž k oknu (lepší GPS signál)</li>
                        <li>Zkus to za chvíli znovu</li>
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setError(null);
                      setIsPermissionDenied(false);
                      handleGetLocation();
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm font-medium"
                  >
                    {isPermissionDenied ? "🔓 Zkusit povolit znovu" : "🔄 Zkusit znovu"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {!userLocation ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📍</div>
            <p className="text-xl text-gray-400 mb-4">
              Použij svou GPS polohu nebo vyhledej adresu
            </p>
            <p className="text-sm text-gray-500">
              Najdeme ti nejbližší restaurace, kavárny a cukrárny
            </p>
          </div>
        ) : nearbyPlaces.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-400 mb-4">
              {`V okruhu ${radiusKm} km nenalezena žádná místa`}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Zkus zvětšit poloměr hledání
            </p>
            <button
              onClick={() => setRadiusKm(getNextRadius(radiusKm))}
              disabled={radiusKm >= 10}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {`Zvětšit na ${getNextRadius(radiusKm)} km`}
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 text-center">
              <p className="text-gray-400">
                Nalezeno{" "}
                <span className="font-semibold text-purple-400">
                  {nearbyPlaces.length}
                </span>{" "}
                {nearbyPlaces.length === 1 ? "místo" : nearbyPlaces.length < 5 ? "místa" : "míst"}{" "}
                v okruhu <span className="font-semibold text-purple-400">{radiusKm} km</span>
              </p>
            </div>

            {/* Places Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nearbyPlaces.map((place, index) => (
                <div key={`${place.type}-${place.id}-${place.displayLocation}-${index}`} className="relative">
                  {/* Distance Badge */}
                  <div className="absolute top-4 right-4 z-10 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    📍 {formatDistance(place.distance)}
                  </div>
                  {place.type === 'restaurant' ? (
                    <RestaurantCard
                      restaurant={place}
                      forceLocation={place.displayLocation}
                    />
                  ) : place.type === 'bakery' ? (
                    <BakeryCard
                      bakery={place}
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
  );
}
