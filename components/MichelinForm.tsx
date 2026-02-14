"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { michelinRestaurantSchema, MichelinRestaurantInput, MichelinRestaurant, MICHELIN_AWARD_LABELS } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

interface MichelinFormProps {
  restaurantId?: number | null;
  onSave: (restaurant: MichelinRestaurant) => void;
  onCancel: () => void;
}

export default function MichelinForm({
  restaurantId,
  onSave,
  onCancel,
}: MichelinFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addressesText, setAddressesText] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MichelinRestaurantInput>({
    resolver: zodResolver(michelinRestaurantSchema),
    defaultValues: {
      addresses: null,
      coordinates: null,
      cuisine_type: "",
      description: "",
      website_url: "",
      image_url: "",
      display_order: 0,
    },
  });

  const restaurantAddresses = watch("addresses");

  useEffect(() => {
    if (restaurantId) {
      // Fetch restaurant data for editing
      fetch(getApiUrl(`/api/michelin/${restaurantId}`))
        .then((res) => res.json())
        .then((data) => {
          reset({
            name: data.name,
            award_type: data.award_type,
            location: data.location,
            addresses: data.addresses || null,
            coordinates: data.coordinates || null,
            cuisine_type: data.cuisine_type || "",
            description: data.description || "",
            website_url: data.website_url || "",
            image_url: data.image_url || "",
            display_order: data.display_order,
          });
          setAddressesText(data.addresses ? JSON.stringify(data.addresses, null, 2) : "");
        })
        .catch((err) => {
          console.error("Error fetching restaurant:", err);
          setError("Nepodařilo se načíst data restaurace");
        });
    }
  }, [restaurantId, reset]);

  useEffect(() => {
    if (restaurantAddresses) {
      setAddressesText(JSON.stringify(restaurantAddresses, null, 2));
    }
  }, [restaurantAddresses]);

  const onSubmit = async (data: MichelinRestaurantInput) => {
    setLoading(true);
    setError("");

    try {
      // Parse addresses JSON if provided
      if (addressesText.trim()) {
        try {
          data.addresses = JSON.parse(addressesText);
        } catch (e) {
          setError("Neplatný JSON formát pro adresy");
          setLoading(false);
          return;
        }
      }

      const url = restaurantId
        ? `/api/michelin/${restaurantId}`
        : "/api/michelin";
      const method = restaurantId ? "PUT" : "POST";

      const response = await fetch(getApiUrl(url), {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error("API Error:", errorMessage, errorData);
        throw new Error(errorMessage);
      }

      const savedRestaurant = await response.json();
      onSave(savedRestaurant);
      reset();
      setAddressesText("");
    } catch (err) {
      console.error("Error saving restaurant:", err);
      const errorMessage = err instanceof Error ? err.message : "Nepodařilo se uložit restauraci";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">
        {restaurantId ? "Upravit" : "Přidat"} Michelinskou restauraci
      </h3>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Název *
        </label>
        <input
          {...register("name")}
          type="text"
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="award_type" className="block text-sm font-medium text-gray-700">
          Typ ocenění *
        </label>
        <select
          {...register("award_type")}
          id="award_type"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        >
          <option value="">-- Vyber typ ocenění --</option>
          {Object.entries(MICHELIN_AWARD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.award_type && (
          <p className="mt-1 text-sm text-red-600">{errors.award_type.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Lokalita *
        </label>
        <input
          {...register("location")}
          type="text"
          id="location"
          placeholder="Např.: Vinohrady, Žižkov"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="addressesText" className="block text-sm font-medium text-gray-700">
          Adresy (JSON)
        </label>
        <textarea
          id="addressesText"
          value={addressesText}
          onChange={(e) => setAddressesText(e.target.value)}
          rows={3}
          placeholder='{"Vinohrady": "Korunní 2569/100, Praha 10"}'
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 font-mono text-sm"
        />
      </div>

      <div>
        <label htmlFor="cuisine_type" className="block text-sm font-medium text-gray-700">
          Typ kuchyně
        </label>
        <input
          {...register("cuisine_type")}
          type="text"
          id="cuisine_type"
          placeholder="Např.: Moderní evropská"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
        {errors.cuisine_type && (
          <p className="mt-1 text-sm text-red-600">{errors.cuisine_type.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Popis
        </label>
        <textarea
          {...register("description")}
          id="description"
          rows={3}
          placeholder="Krátký popis restaurace..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
          URL webu
        </label>
        <input
          {...register("website_url")}
          type="text"
          id="website_url"
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
        {errors.website_url && (
          <p className="mt-1 text-sm text-red-600">{errors.website_url.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
          URL obrázku
        </label>
        <input
          {...register("image_url")}
          type="text"
          id="image_url"
          placeholder="https://..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
        {errors.image_url && (
          <p className="mt-1 text-sm text-red-600">{errors.image_url.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">
          Pořadí *
        </label>
        <input
          {...register("display_order", { valueAsNumber: true })}
          type="number"
          id="display_order"
          min="0"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
        />
        {errors.display_order && (
          <p className="mt-1 text-sm text-red-600">{errors.display_order.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
        >
          {loading ? "Ukládám..." : "Uložit"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
        >
          Zrušit
        </button>
      </div>
    </form>
  );
}
