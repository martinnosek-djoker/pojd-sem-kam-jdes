"use client";

import { Restaurant, cuisineMatchesFilter } from "@/lib/types";

interface QuickFiltersProps {
  selectedCuisineType: string;
  onCuisineTypeChange: (cuisineType: string) => void;
  restaurants: Restaurant[];
}

const QUICK_FILTERS = [
  { label: "Pizza", value: "Pizza", emoji: "🍕" },
  { label: "Burger", value: "Burger", emoji: "🍔" },
  { label: "Asijská", value: "Asijská", emoji: "🍜" },
  { label: "Italská", value: "Italská", emoji: "🍝" },
  { label: "Česká", value: "Česká", emoji: "🍺" },
  { label: "Mexická", value: "Mexická", emoji: "🌮" },
  { label: "Indická", value: "Indická", emoji: "🍛" },
  { label: "Sushi", value: "Sushi", emoji: "🍣" },
  { label: "BBQ", value: "Bbq", emoji: "🥩" },
];

export default function QuickFilters({
  selectedCuisineType,
  onCuisineTypeChange,
  restaurants,
}: QuickFiltersProps) {
  const handleFilterClick = (value: string) => {
    // Toggle filter - if already selected, deselect it
    if (selectedCuisineType === value) {
      onCuisineTypeChange("");
    } else {
      onCuisineTypeChange(value);
    }
  };

  // Count restaurants for each filter and only show filters with at least 3 restaurants
  const visibleFilters = QUICK_FILTERS.filter((filter) => {
    const count = restaurants.filter((restaurant) => {
      const cuisineTypes = restaurant.cuisine_type.split(',').map((type: string) => type.trim());
      return cuisineTypes.some((type: string) => cuisineMatchesFilter(type, filter.value));
    }).length;
    return count >= 3;
  });

  // Don't render anything if no filters meet the criteria
  if (visibleFilters.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium text-gray-400 mb-4 tracking-wide">
        Rychlé filtry
      </h3>
      <div className="flex flex-wrap gap-3">
        {visibleFilters.map((filter) => {
          const isActive = selectedCuisineType === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => handleFilterClick(filter.value)}
              className={`
                px-4 py-2 rounded-full font-medium text-sm tracking-wide
                transition-all duration-300 border
                ${
                  isActive
                    ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/50"
                    : "bg-gray-900/50 text-purple-300 border-purple-700/30 hover:bg-purple-600/20 hover:border-purple-600/50"
                }
              `}
            >
              <span className="mr-1.5">{filter.emoji}</span>
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
