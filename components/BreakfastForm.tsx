"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { breakfastSchema, BreakfastInput, Breakfast } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";
import LocationAddressFields from "@/components/LocationAddressFields";

interface BreakfastFormProps {
  breakfastId?: number | null;
  onSave: (breakfast: Breakfast) => void;
  onCancel: () => void;
}

export default function BreakfastForm({
  breakfastId,
  onSave,
  onCancel,
}: BreakfastFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BreakfastInput>({
    resolver: zodResolver(breakfastSchema),
    defaultValues: {
      addresses: null,
      website_url: "",
      image_url: "",
    },
  });

  const imageUrl = watch("image_url");
  const breakfastLocation = watch("location");
  const breakfastAddresses = watch("addresses");
  const breakfastCoordinates = watch("coordinates");

  useEffect(() => {
    if (breakfastId) {
      // Fetch breakfast data for editing
      fetch(getApiUrl(`/api/breakfasts/${breakfastId}`))
        .then((res) => res.json())
        .then((data) => {
          reset({
            name: data.name,
            location: data.location,
            addresses: data.addresses || null,
            coordinates: data.coordinates || null,
            website_url: data.website_url || "",
            image_url: data.image_url || "",
          });
        })
        .catch((err) => {
          console.error("Error fetching breakfast:", err);
          setError("Nepodařilo se načíst data snídaně");
        });
    }
  }, [breakfastId, reset]);

  const onSubmit = async (data: BreakfastInput) => {
    setLoading(true);
    setError("");

    const payload = {
      ...data,
      addresses: data.addresses || null,
      coordinates: data.coordinates || null,
    };

    try {
      const url = breakfastId
        ? `/api/breakfasts/${breakfastId}`
        : "/api/breakfasts";

      const method = breakfastId ? "PUT" : "POST";

      const response = await fetch(getApiUrl(url), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedBreakfastData = await response.json();
        onSave(savedBreakfastData);
        reset();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Nepodařilo se uložit snídani");
      }
    } catch (err) {
      console.error("Error saving breakfast:", err);
      setError("Nepodařilo se uložit snídani");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded-lg border border-gray-200"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        {breakfastId ? "Upravit snídani" : "Přidat novou snídani"}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Název *
          </label>
          <input
            {...register("name")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lokalita * <span className="text-xs text-gray-500">(oddělené čárkami)</span>
          </label>
          <input
            {...register("location")}
            placeholder="Anděl, Letná"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.location && (
            <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Website URL */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Web / Instagram URL
          </label>
          <input
            {...register("website_url")}
            type="url"
            placeholder="https://instagram.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.website_url && (
            <p className="mt-1 text-xs text-red-600">{errors.website_url.message}</p>
          )}
        </div>

        {/* Addresses + auto-geocoded coordinates */}
        <LocationAddressFields
          key={breakfastId || "new"}
          location={breakfastLocation || ""}
          addresses={breakfastAddresses}
          coordinates={breakfastCoordinates}
          onAddressesChange={(value) => setValue("addresses", value)}
          onCoordinatesChange={(value) => setValue("coordinates", value)}
        />

        {/* Image URL */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL obrázku
          </label>
          <input
            {...register("image_url")}
            type="url"
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.image_url && (
            <p className="mt-1 text-xs text-red-600">{errors.image_url.message}</p>
          )}

          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="h-32 w-auto rounded border border-gray-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
        >
          {loading ? "Ukládám..." : "Uložit"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Zrušit
        </button>
      </div>
    </form>
  );
}
