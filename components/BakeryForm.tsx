"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bakerySchema, BakeryInput, Bakery } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";
import LocationAddressFields from "@/components/LocationAddressFields";

interface BakeryFormProps {
  bakeryId?: number | null;
  onSave: (bakery: Bakery) => void;
  onCancel: () => void;
}

export default function BakeryForm({
  bakeryId,
  onSave,
  onCancel,
}: BakeryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BakeryInput>({
    resolver: zodResolver(bakerySchema),
    defaultValues: {
      addresses: null,
      website_url: "",
      image_url: "",
    },
  });

  const imageUrl = watch("image_url");
  const bakeryLocation = watch("location");
  const bakeryAddresses = watch("addresses");
  const bakeryCoordinates = watch("coordinates");

  useEffect(() => {
    if (bakeryId) {
      // Fetch bakery data for editing
      fetch(getApiUrl(`/api/bakeries/${bakeryId}`))
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
          console.error("Error fetching bakery:", err);
          setError("Nepodařilo se načíst data cukrárny");
        });
    }
  }, [bakeryId, reset]);

  const onSubmit = async (data: BakeryInput) => {
    setLoading(true);
    setError("");

    const payload = {
      ...data,
      addresses: data.addresses || null,
      coordinates: data.coordinates || null,
    };

    try {
      const url = bakeryId
        ? `/api/bakeries/${bakeryId}`
        : "/api/bakeries";

      const method = bakeryId ? "PUT" : "POST";

      const response = await fetch(getApiUrl(url), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const savedBakeryData = await response.json();
        onSave(savedBakeryData);
        reset();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Nepodařilo se uložit cukrárnu");
      }
    } catch (err) {
      console.error("Error saving bakery:", err);
      setError("Nepodařilo se uložit cukrárnu");
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
        {bakeryId ? "Upravit cukrárnu" : "Přidat novou cukrárnu"}
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
          key={bakeryId || "new"}
          location={bakeryLocation || ""}
          addresses={bakeryAddresses}
          coordinates={bakeryCoordinates}
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
