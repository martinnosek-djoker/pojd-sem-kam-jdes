"use client";

interface RestaurantFilterProps {
  locations: string[];
  cuisineTypes: string[];
  selectedLocation: string;
  selectedCuisineType: string;
  onLocationChange: (location: string) => void;
  onCuisineTypeChange: (cuisineType: string) => void;
  onReset: () => void;
}

export default function RestaurantFilter({
  locations,
  cuisineTypes,
  selectedLocation,
  selectedCuisineType,
  onLocationChange,
  onCuisineTypeChange,
  onReset,
}: RestaurantFilterProps) {
  const hasActiveFilters = selectedLocation || selectedCuisineType;

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-sm border border-purple-600/20 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg">
      <div className="flex flex-col gap-3 sm:gap-4">
        {/* Filters in row on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Location filter */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <select
              id="location"
              value={selectedLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 border border-purple-600/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-black/50 text-purple-200 focus:outline-none transition-all duration-200 appearance-none bg-no-repeat bg-right font-medium"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="">Všechny lokality</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Cuisine type filter */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {/* Fork (left side) */}
                <line x1="6" y1="3" x2="6" y2="8" strokeWidth={1.5} strokeLinecap="round" />
                <line x1="8" y1="3" x2="8" y2="8" strokeWidth={1.5} strokeLinecap="round" />
                <line x1="10" y1="3" x2="10" y2="8" strokeWidth={1.5} strokeLinecap="round" />
                <line x1="8" y1="8" x2="8" y2="21" strokeWidth={2} strokeLinecap="round" />

                {/* Knife (right side) */}
                <path d="M16 3 L18 8 L14 8 Z" fill="currentColor" />
                <line x1="16" y1="8" x2="16" y2="21" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </div>
            <select
              id="cuisine"
              value={selectedCuisineType}
              onChange={(e) => onCuisineTypeChange(e.target.value)}
              className="w-full pl-11 pr-10 py-3 sm:py-3.5 border border-purple-600/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-black/50 text-purple-200 focus:outline-none transition-all duration-200 appearance-none bg-no-repeat bg-right font-medium"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a78bfa' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.75rem center", backgroundSize: "1.5em 1.5em" }}
            >
              <option value="">Všechny typy</option>
              {cuisineTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button - only show if filters active */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-4 py-3 sm:py-3.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 active:scale-95 transition-all duration-200 font-medium shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Zrušit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
