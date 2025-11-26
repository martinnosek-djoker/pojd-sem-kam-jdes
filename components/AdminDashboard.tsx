"use client";

import React, { useState } from "react";
import { Restaurant } from "@/lib/types";
import RestaurantForm from "./RestaurantForm";
import NotificationDialog from "./NotificationDialog";
import { getApiUrl } from "@/lib/api-config";

interface AdminDashboardProps {
  initialRestaurants: Restaurant[];
}

export default function AdminDashboard({ initialRestaurants }: AdminDashboardProps) {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [savedRestaurant, setSavedRestaurant] = useState<Restaurant | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tuto restauraci?")) return;

    try {
      const response = await fetch(getApiUrl(`/api/restaurants/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setRestaurants(restaurants.filter((r) => r.id !== id));
      } else {
        alert("Chyba při mazání restaurace");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Chyba při mazání restaurace");
    }
  };

  const handleSave = (restaurant: Restaurant) => {
    if (editingId) {
      setRestaurants(restaurants.map((r) => (r.id === restaurant.id ? restaurant : r)));
    } else {
      setRestaurants([restaurant, ...restaurants]);
      // Zobrazit notifikační dialog pro nově přidanou restauraci
      setSavedRestaurant(restaurant);
      setShowNotificationDialog(true);
    }
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🍴 Restaurace</h2>
          <p className="text-gray-600 mt-1">Celkem {restaurants.length} restaurací</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + Přidat restauraci
        </button>
      </div>

        {/* Form for adding new restaurant (only when not editing existing) */}
        {showForm && !editingId && (
          <div className="mb-6">
            <RestaurantForm
              restaurantId={null}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            />
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Název
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokalita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kuchyně
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cena
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hodnocení
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...restaurants].sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((restaurant) => (
                <React.Fragment key={restaurant.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                        {(!restaurant.coordinates || Object.keys(restaurant.coordinates).length === 0) && (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-800" title="Chybí GPS souřadnice pro sekci 'V okolí'">
                            ⚠️ Bez GPS
                          </span>
                        )}
                      </div>
                      {restaurant.specialty && (
                        <div className="text-xs text-gray-500">{restaurant.specialty}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {restaurant.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {restaurant.cuisine_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {restaurant.price} Kč
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {restaurant.rating}/10
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingId(restaurant.id);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Upravit
                      </button>
                      <button
                        onClick={() => handleDelete(restaurant.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                  {editingId === restaurant.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <RestaurantForm
                          restaurantId={restaurant.id}
                          onSave={handleSave}
                          onCancel={() => {
                            setShowForm(false);
                            setEditingId(null);
                          }}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {restaurants.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Zatím nemáte žádné restaurace. Přidejte první restauraci nebo importujte CSV.
            </div>
          )}
        </div>

        {/* Notification Dialog */}
        {savedRestaurant && (
          <NotificationDialog
            isOpen={showNotificationDialog}
            onClose={() => setShowNotificationDialog(false)}
            itemName={savedRestaurant.name}
            itemType="restaurant"
            itemId={savedRestaurant.id}
          />
        )}
      </div>
  );
}
