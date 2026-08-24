"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { restaurantSchema, RestaurantInput, Restaurant } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";
import LocationAddressFields from "@/components/LocationAddressFields";

interface RestaurantFormProps {
  restaurantId?: number | null;
  onSave: (restaurant: Restaurant) => void;
  onCancel: () => void;
}

export default function RestaurantForm({
  restaurantId,
  onSave,
  onCancel,
}: RestaurantFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RestaurantInput>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      specialty: "",
      addresses: null,
      website_url: "",
      image_url: "",
    },
  });

  const imageUrl = watch("image_url");
  const restaurantLocation = watch("location");
  const restaurantAddresses = watch("addresses");
  const restaurantCoordinates = watch("coordinates");

  useEffect(() => {
    if (restaurantId) {
      // Fetch restaurant data for editing
      fetch(getApiUrl(`/api/restaurants/${restaurantId}`))
        .then((res) => res.json())
        .then((data) => {
          reset({
            name: data.name,
            location: data.location,
            addresses: data.addresses || null,
            coordinates: data.coordinates || null,
            cuisine_type: data.cuisine_type,
            specialty: data.specialty || "",
            price: data.price,
            rating: data.rating,
            website_url: data.website_url || "",
            image_url: data.image_url || "",
          });
        })
        .catch((err) => {
          console.error("Error fetching restaurant:", err);
          setError("Nepodařilo se načíst data restaurace");
        });
    }
  }, [restaurantId, reset]);

  const onSubmit = async (data: RestaurantInput) => {
    setLoading(true);
    setError("");

    try {
      // Clean up empty strings
      const cleanData = {
        ...data,
        specialty: data.specialty || null,
        addresses: data.addresses || null,
        coordinates: data.coordinates || null,
        website_url: data.website_url || null,
        image_url: data.image_url || null,
      };

      const url = restaurantId
        ? `/api/restaurants/${restaurantId}`
        : "/api/restaurants";

      const method = restaurantId ? "PATCH" : "POST";

      const response = await fetch(getApiUrl(url), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      if (response.ok) {
        const savedRestaurant = await response.json();
        onSave(savedRestaurant);
        reset();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Chyba při ukládání");
      }
    } catch (err) {
      console.error("Error saving restaurant:", err);
      setError("Nepodařilo se uložit restauraci");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        {restaurantId ? "Upravit restauraci" : "Přidat restauraci"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Název restaurace *
            </label>
            <input
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lokality * (oddělené čárkou pro více poboček)
            </label>
            <input
              {...register("location")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Anděl, Letná, Vinohrady"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Pro restaurace s více pobočkami zadej lokality oddělené čárkou
            </p>
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Addresses + auto-geocoded coordinates */}
          <LocationAddressFields
            key={restaurantId || "new"}
            location={restaurantLocation || ""}
            addresses={restaurantAddresses}
            coordinates={restaurantCoordinates}
            onAddressesChange={(value) => setValue("addresses", value)}
            onCoordinatesChange={(value) => setValue("coordinates", value)}
          />
          {errors.addresses?.message && (
            <p className="text-red-600 text-sm -mt-2 md:col-span-2">{String(errors.addresses.message)}</p>
          )}

          {/* Cuisine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ kuchyně *
            </label>
            <input
              {...register("cuisine_type")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.cuisine_type && (
              <p className="text-red-600 text-sm mt-1">{errors.cuisine_type.message}</p>
            )}
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specializace (nepovinné)
            </label>
            <input
              {...register("specialty")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="např. steaky, sushi..."
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cena za osobu (Kč) *
            </label>
            <input
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.price && (
              <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hodnocení (1-10) *
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              {...register("rating", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.rating && (
              <p className="text-red-600 text-sm mt-1">{errors.rating.message}</p>
            )}
          </div>

          {/* Website URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Web / Instagram odkaz (nepovinné)
            </label>
            <input
              type="url"
              {...register("website_url")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://..."
            />
            {errors.website_url && (
              <p className="text-red-600 text-sm mt-1">{errors.website_url.message}</p>
            )}
          </div>

          {/* Image URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL fotky (nepovinné)
            </label>
            <input
              type="text"
              {...register("image_url")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://... nebo /images/..."
            />
            {errors.image_url && (
              <p className="text-red-600 text-sm mt-1">{errors.image_url.message}</p>
            )}
            {imageUrl && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Vybraná fotka:</p>
                <img
                  src={imageUrl}
                  alt="Restaurant preview"
                  className="w-full max-w-md h-48 object-cover rounded-md border border-gray-300"
                  onError={(e) => {
                    e.currentTarget.src = "";
                    e.currentTarget.alt = "Nepodařilo se načíst obrázek";
                    e.currentTarget.className = "w-full max-w-md h-48 flex items-center justify-center bg-gray-100 rounded-md border border-gray-300 text-gray-500 text-sm";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Zrušit
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {loading ? "Ukládám..." : "Uložit"}
          </button>
        </div>
      </form>
    </div>
  );
}
