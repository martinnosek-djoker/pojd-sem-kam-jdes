"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { trendingSchema, TrendingInput, Trending } from "@/lib/types";

interface TrendingFormProps {
  trendingId?: number | null;
  onSave: (trending: Trending) => void;
  onCancel: () => void;
}

export default function TrendingForm({
  trendingId,
  onSave,
  onCancel,
}: TrendingFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingPhoto, setFetchingPhoto] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TrendingInput>({
    resolver: zodResolver(trendingSchema),
    defaultValues: {
      name: "",
      address: "",
      website_url: "",
      image_url: "",
      display_order: 0,
    },
  });

  const imageUrl = watch("image_url");
  const trendingName = watch("name");
  const trendingAddress = watch("address");

  useEffect(() => {
    if (trendingId) {
      // Fetch trending data for editing
      fetch(`/api/trendings/${trendingId}`)
        .then((res) => res.json())
        .then((data) => {
          reset({
            name: data.name,
            address: data.address || "",
            website_url: data.website_url || "",
            image_url: data.image_url || "",
            display_order: data.display_order || 0,
          });
        })
        .catch((err) => {
          console.error("Error fetching trending:", err);
          setError("Nepodařilo se načíst data trending podniku");
        });
    }
  }, [trendingId, reset]);

  const handleFetchPhoto = async () => {
    if (!trendingName) {
      setError("Vyplň nejdřív název podniku");
      return;
    }

    setFetchingPhoto(true);
    setError("");

    try {
      const params = new URLSearchParams({
        name: trendingName,
        location: "Praha", // Default to Prague for trendings
      });

      const response = await fetch(`/api/places/photo?${params}`);
      const data = await response.json();

      if (response.ok) {
        if (data.photoUrl) {
          setValue("image_url", data.photoUrl);
        }
        // Also set address if available (from addresses object for Praha)
        if (data.addresses && data.addresses["Praha"]) {
          setValue("address", data.addresses["Praha"]);
        }
      } else {
        setError(data.error || "Nepodařilo se načíst data");
      }
    } catch (err) {
      console.error("Error fetching photo:", err);
      setError("Nepodařilo se načíst fotografii");
    } finally {
      setFetchingPhoto(false);
    }
  };

  const onSubmit = async (data: TrendingInput) => {
    setLoading(true);
    setError("");

    try {
      // Clean up empty strings
      const cleanData = {
        ...data,
        address: data.address || null,
        website_url: data.website_url || null,
        image_url: data.image_url || null,
      };

      const url = trendingId
        ? `/api/trendings/${trendingId}`
        : "/api/trendings";

      const method = trendingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      if (response.ok) {
        const savedTrending = await response.json();
        onSave(savedTrending);
        reset();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Chyba při ukládání");
      }
    } catch (err) {
      console.error("Error saving trending:", err);
      setError("Nepodařilo se uložit trending podnik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900">
        {trendingId ? "Upravit trending podnik" : "Přidat trending podnik"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Název podniku *
            </label>
            <input
              {...register("name")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Display Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pořadí (0-9 pro TOP 10) *
            </label>
            <input
              type="number"
              min="0"
              {...register("display_order", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.display_order && (
              <p className="text-red-600 text-sm mt-1">{errors.display_order.message}</p>
            )}
          </div>

          {/* Address - Display only, filled by auto-fetch */}
          {trendingAddress && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Načtená adresa:
              </label>
              <div className="text-sm bg-green-50 p-2 rounded border border-green-200">
                <span className="text-gray-700">{trendingAddress as string}</span>
              </div>
            </div>
          )}

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

          {/* Image URL with Auto-fetch */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL fotky (nepovinné)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                {...register("image_url")}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
              <button
                type="button"
                onClick={handleFetchPhoto}
                disabled={fetchingPhoto || !trendingName}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
              >
                {fetchingPhoto ? "Načítám..." : "🔍 Auto-fetch"}
              </button>
            </div>
            {errors.image_url && (
              <p className="text-red-600 text-sm mt-1">{errors.image_url.message}</p>
            )}
            {imageUrl && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-2">Náhled:</p>
                <img
                  src={imageUrl}
                  alt="Preview"
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
