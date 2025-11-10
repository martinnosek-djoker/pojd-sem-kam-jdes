"use client";

import { useEffect, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import Logo from "@/components/Logo";
import { Restaurant, Coordinates } from "@/lib/types";
import { calculateDistance, formatDistance, getCurrentPosition } from "@/lib/geolocation";

interface RestaurantWithDistance extends Restaurant {
  distance: number;
  displayLocation?: string;
}

export default function NearbyRestaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [radiusKm, setRadiusKm] = useState(2);
  const [error, setError] = useState<string | null>(null);

  // Get next radius option for "enlarge" button
  const getNextRadius = (current: number) => {
    const options = [0.5, 1, 2, 5, 10];
    const currentIndex = options.indexOf(current);
    if (currentIndex === -1 || currentIndex === options.length - 1) {
      return options[options.length - 1];
    }
    return options[currentIndex + 1];
  };

  // Fetch all restaurants
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const response = await fetch("/api/restaurants");
        const data = await response.json();
        if (Array.isArray(data)) {
          setRestaurants(data);
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRestaurants();
  }, []);

  // Calculate nearby restaurants when user location or radius changes
  useEffect(() => {
    if (!userLocation || !restaurants.length) {
      setNearbyRestaurants([]);
      return;
    }

    // Flatten restaurants by location and calculate distance
    const restaurantsWithDistance: RestaurantWithDistance[] = [];

    restaurants.forEach((restaurant) => {
      if (!restaurant.coordinates) return;

      // Split locations and process each branch
      const locations = restaurant.location.split(',').map(l => l.trim());

      locations.forEach((location) => {
        const coords = restaurant.coordinates![location];
        if (!coords) return;

        const distance = calculateDistance(userLocation, coords);

        if (distance <= radiusKm) {
          restaurantsWithDistance.push({
            ...restaurant,
            distance,
            displayLocation: location,
          });
        }
      });
    });

    // Sort by distance
    restaurantsWithDistance.sort((a, b) => a.distance - b.distance);

    setNearbyRestaurants(restaurantsWithDistance);
  }, [userLocation, radiusKm, restaurants]);

  const handleGetLocation = async () => {
    setGettingLocation(true);
    setError(null);

    try {
      const position = await getCurrentPosition();
      setUserLocation(position);
    } catch (error: any) {
      setError(error.message || "Nepodařilo se získat polohu");
      console.error("Error getting location:", error);
    } finally {
      setGettingLocation(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Logo />
          </div>
          <p className="text-lg text-gray-400 text-center">Načítám data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-12 text-center">
          <div className="inline-block border-b-2 border-purple-500 pb-3 md:pb-6 mb-2 md:mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-purple-400 mt-4 md:mt-6">
            📍 Restaurace poblíž
          </h1>
          <p className="text-sm md:text-lg text-gray-300 mt-2">
            Najdi nejlepší restaurace ve svém okolí
          </p>
        </div>

        {/* Location Controls */}
        <div className="mb-8 p-6 bg-gray-900/50 border border-purple-500/30 rounded-lg">
          <div className="flex flex-col gap-6 items-center">
            {/* Get Location Button - centered */}
            <div className="w-full flex justify-center">
              <button
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="w-full max-w-md px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {gettingLocation ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Získávám polohu...
                  </span>
                ) : userLocation ? (
                  "🎯 Aktualizovat polohu"
                ) : (
                  "📍 Získat moji polohu"
                )}
              </button>
            </div>

            {/* Radius Selector */}
            {userLocation && (
              <div className="w-full flex justify-center items-center gap-4">
                <label className="text-gray-300 font-medium">Poloměr:</label>
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
              ✓ Poloha získána: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-md text-red-300 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        {!userLocation ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📍</div>
            <p className="text-xl text-gray-400 mb-4">
              Klikni na tlačítko výše pro získání tvé polohy
            </p>
            <p className="text-sm text-gray-500">
              Potřebuješ povolit přístup k poloze ve svém prohlížeči
            </p>
          </div>
        ) : nearbyRestaurants.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-400 mb-4">
              Žádné restaurace v okruhu {radiusKm} km
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Zkus zvětšit poloměr vyhledávání
            </p>
            <button
              onClick={() => setRadiusKm(getNextRadius(radiusKm))}
              disabled={radiusKm >= 10}
              className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 border border-purple-500 shadow-lg shadow-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zvětšit poloměr na {getNextRadius(radiusKm)} km
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 text-center">
              <p className="text-gray-400">
                Nalezeno{" "}
                <span className="font-semibold text-purple-400">
                  {nearbyRestaurants.length}
                </span>{" "}
                {nearbyRestaurants.length === 1 ? "restaurace" : nearbyRestaurants.length < 5 ? "restaurace" : "restaurací"}{" "}
                v okruhu <span className="font-semibold text-purple-400">{radiusKm} km</span>
              </p>
            </div>

            {/* Restaurant Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nearbyRestaurants.map((restaurant, index) => (
                <div key={`${restaurant.id}-${restaurant.displayLocation}-${index}`} className="relative">
                  {/* Distance Badge */}
                  <div className="absolute top-4 right-4 z-10 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    📍 {formatDistance(restaurant.distance)}
                  </div>
                  <RestaurantCard
                    restaurant={restaurant}
                    forceLocation={restaurant.displayLocation}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
