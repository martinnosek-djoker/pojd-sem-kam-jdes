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
  return (
    <div className="bg-black border border-purple-600/30 rounded-lg shadow-xl shadow-purple-900/20 p-8 mb-8 backdrop-blur-sm">
      <h2 className="text-lg font-semibold mb-6 text-purple-300 tracking-wide border-b border-purple-900/50 pb-3">
        Filtrovat restaurace
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location filter */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-2 tracking-wide">
            Lokalita
          </label>
          <select
            id="location"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full pl-4 pr-12 py-3 border border-purple-700/50 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-900 text-purple-200 focus:outline-none transition-all duration-300 appearance-none bg-no-repeat bg-right"
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
        <div>
          <label htmlFor="cuisine" className="block text-sm font-medium text-gray-400 mb-2 tracking-wide">
            Typ kuchyně
          </label>
          <select
            id="cuisine"
            value={selectedCuisineType}
            onChange={(e) => onCuisineTypeChange(e.target.value)}
            className="w-full pl-4 pr-12 py-3 border border-purple-700/50 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-900 text-purple-200 focus:outline-none transition-all duration-300 appearance-none bg-no-repeat bg-right"
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

        {/* Reset button */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full px-4 py-3 bg-purple-600/20 text-purple-300 rounded-md hover:bg-purple-600/40 border border-purple-600/50 transition-all duration-300 font-medium tracking-wide hover:shadow-lg hover:shadow-purple-900/30"
          >
            Vymazat filtry
          </button>
        </div>
      </div>
    </div>
  );
}
