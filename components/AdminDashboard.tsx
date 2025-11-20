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
  const [fetchingPhotos, setFetchingPhotos] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);
  const [fetchingCoordinates, setFetchingCoordinates] = useState(false);
  const [fetchResults, setFetchResults] = useState<any>(null);
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

  const handleFetchAllPhotos = async () => {
    if (!confirm("Chceš automaticky načíst fotky pro všechny restaurace bez obrázku? Může to trvat několik minut.")) {
      return;
    }

    setFetchingPhotos(true);
    setFetchResults(null);

    try {
      const response = await fetch(getApiUrl("/api/admin/fetch-all-photos"), {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setFetchResults(data);
        // Reload restaurants to show new images
        const reloadResponse = await fetch(getApiUrl("/api/restaurants"));
        const updatedRestaurants = await reloadResponse.json();
        setRestaurants(updatedRestaurants);
      } else {
        alert(data.error || "Chyba při načítání fotek");
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      alert("Chyba při načítání fotek");
    } finally {
      setFetchingPhotos(false);
    }
  };

  const handleFetchAllAddresses = async () => {
    if (!confirm("Chceš automaticky doplnit adresy pro všechny restaurace bez adresy? Může to trvat několik minut.")) {
      return;
    }

    setFetchingAddresses(true);
    setFetchResults(null);

    try {
      const response = await fetch(getApiUrl("/api/admin/fetch-all-addresses"), {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setFetchResults(data);
        // Reload restaurants to show new addresses
        const reloadResponse = await fetch(getApiUrl("/api/restaurants"));
        const updatedRestaurants = await reloadResponse.json();
        setRestaurants(updatedRestaurants);
      } else {
        alert(data.error || "Chyba při načítání adres");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      alert("Chyba při načítání adres");
    } finally {
      setFetchingAddresses(false);
    }
  };

  const handleFetchAllCoordinates = async () => {
    if (!confirm("Chceš automaticky geocodovat adresy všech restaurací? Může to trvat několik minut.")) {
      return;
    }

    setFetchingCoordinates(true);
    setFetchResults(null);

    try {
      const response = await fetch(getApiUrl("/api/admin/fetch-all-coordinates"), {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setFetchResults(data);
        // Reload restaurants to show new coordinates
        const reloadResponse = await fetch(getApiUrl("/api/restaurants"));
        const updatedRestaurants = await reloadResponse.json();
        setRestaurants(updatedRestaurants);
      } else {
        alert(data.error || "Chyba při načítání souřadnic");
      }
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      alert("Chyba při načítání souřadnic");
    } finally {
      setFetchingCoordinates(false);
    }
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🍴 Restaurace</h2>
          <p className="text-gray-600 mt-1">Celkem {restaurants.length} restaurací</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleFetchAllPhotos}
            disabled={fetchingPhotos || fetchingAddresses || fetchingCoordinates}
            className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors font-medium text-sm"
          >
            {fetchingPhotos ? "🔄 Načítám fotky..." : "📷 Načíst fotky"}
          </button>
          <button
            onClick={handleFetchAllAddresses}
            disabled={fetchingPhotos || fetchingAddresses || fetchingCoordinates}
            className="px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 transition-colors font-medium text-sm"
          >
            {fetchingAddresses ? "🔄 Načítám adresy..." : "📍 Doplnit adresy"}
          </button>
          <button
            onClick={handleFetchAllCoordinates}
            disabled={fetchingPhotos || fetchingAddresses || fetchingCoordinates}
            className="px-4 py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-orange-300 transition-colors font-medium text-sm"
          >
            {fetchingCoordinates ? "🔄 Geocoduji..." : "🗺️ Geocodovat adresy"}
          </button>
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
      </div>

      {/* Fetch Results */}
      {fetchResults && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-bold text-blue-900 mb-2">📊 Výsledky načítání fotek:</h3>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{fetchResults.success}</div>
              <div className="text-sm text-gray-600">Úspěšně načteno</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{fetchResults.skipped}</div>
              <div className="text-sm text-gray-600">Nenalezeno</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{fetchResults.failed}</div>
              <div className="text-sm text-gray-600">Chyby</div>
            </div>
          </div>
          <button
            onClick={() => setFetchResults(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Zavřít
          </button>
        </div>
      )}

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
                      <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
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
