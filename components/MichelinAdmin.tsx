"use client";

import { useState } from "react";
import { MichelinRestaurant, MICHELIN_AWARD_LABELS } from "@/lib/types";
import MichelinForm from "./MichelinForm";

interface MichelinAdminProps {
  initialRestaurants: MichelinRestaurant[];
}

export default function MichelinAdmin({ initialRestaurants }: MichelinAdminProps) {
  const [restaurants, setRestaurants] = useState<MichelinRestaurant[]>(initialRestaurants);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = (restaurant: MichelinRestaurant) => {
    if (editingId) {
      setRestaurants(
        restaurants.map((r) => (r.id === editingId ? restaurant : r))
      );
      setEditingId(null);
    } else {
      setRestaurants([...restaurants, restaurant]);
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tuto restauraci?")) return;

    try {
      const response = await fetch(`/api/michelin/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setRestaurants(restaurants.filter((r) => r.id !== id));
      } else {
        alert("Nepodařilo se smazat restauraci");
      }
    } catch (error) {
      console.error("Error deleting restaurant:", error);
      alert("Chyba při mazání restaurace");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
  };

  // Group restaurants by award type
  const groupedRestaurants = restaurants.reduce((acc, restaurant) => {
    if (!acc[restaurant.award_type]) {
      acc[restaurant.award_type] = [];
    }
    acc[restaurant.award_type].push(restaurant);
    return acc;
  }, {} as Record<string, MichelinRestaurant[]>);

  // Sort each group by display_order
  Object.keys(groupedRestaurants).forEach(key => {
    groupedRestaurants[key].sort((a, b) => a.display_order - b.display_order);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">⭐ Michelin restaurace ({restaurants.length})</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          + Přidat restauraci
        </button>
      </div>

      {isAdding && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <MichelinForm onSave={handleSave} onCancel={handleCancel} />
        </div>
      )}

      {/* Display restaurants grouped by award type */}
      {Object.entries(groupedRestaurants).map(([awardType, groupRestaurants]) => (
        <div key={awardType} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {MICHELIN_AWARD_LABELS[awardType as keyof typeof MICHELIN_AWARD_LABELS]} ({groupRestaurants.length})
          </h3>
          <div className="grid gap-4">
            {groupRestaurants.map((restaurant) => (
              <div key={restaurant.id} className="bg-white p-6 rounded-lg shadow">
                {editingId === restaurant.id ? (
                  <MichelinForm
                    restaurantId={restaurant.id}
                    onSave={handleSave}
                    onCancel={handleCancel}
                  />
                ) : (
                  <div>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Lokalita:</span> {restaurant.location}
                        </p>
                        {restaurant.cuisine_type && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Typ kuchyně:</span> {restaurant.cuisine_type}
                          </p>
                        )}
                        {restaurant.description && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            {restaurant.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">
                          <span className="font-medium">Pořadí:</span> {restaurant.display_order}
                        </p>
                        {restaurant.website_url && (
                          <a
                            href={restaurant.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-purple-600 hover:text-purple-700 mt-1 inline-block"
                          >
                            🔗 Web
                          </a>
                        )}
                      </div>
                      {restaurant.image_url && (
                        <img
                          src={restaurant.image_url}
                          alt={restaurant.name}
                          className="w-24 h-24 object-cover rounded ml-4"
                        />
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setEditingId(restaurant.id)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Upravit
                      </button>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Smazat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {restaurants.length === 0 && !isAdding && (
        <p className="text-gray-500 text-center py-8">
          Zatím nejsou žádné Michelinské restaurace. Přidejte první!
        </p>
      )}
    </div>
  );
}
