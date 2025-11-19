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
    <div className="mb-6 sm:mb-8">
      <h3 className="text-sm font-semibold text-purple-300 mb-3 px-1">
        Rychlé filtry
      </h3>
      {/* Horizontal scrollable on mobile, wrapped on desktop */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex sm:flex-wrap gap-2 sm:gap-3 pb-2 sm:pb-0 min-w-max sm:min-w-0">
          {visibleFilters.map((filter) => {
            const isActive = selectedCuisineType === filter.value;
            return (
              <button
                key={filter.value}
                onClick={() => handleFilterClick(filter.value)}
                className={`
                  px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-medium text-sm sm:text-base
                  transition-all duration-200 border-2 whitespace-nowrap
                  active:scale-95 touch-manipulation
                  ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-600/40"
                      : "bg-black/40 text-purple-200 border-purple-600/30 hover:bg-purple-600/20 hover:border-purple-500/50"
                  }
                `}
              >
                <span className="mr-2">{filter.emoji}</span>
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
