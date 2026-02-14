"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { breakfastSchema, BreakfastInput, Breakfast } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

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
  const [fetchingPhoto, setFetchingPhoto] = useState(false);
  const [addressesText, setAddressesText] = useState("");
  const [coordinatesText, setCoordinatesText] = useState("");
  const [availablePhotos, setAvailablePhotos] = useState<string[]>([]);

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
  const breakfastName = watch("name");
  const breakfastLocation = watch("location");
  const breakfastAddresses = watch("addresses");

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
            website_url: data.website_url || "",
            image_url: data.image_url || "",
          });
          // Set addresses text for textarea
          setAddressesText(data.addresses ? JSON.stringify(data.addresses, null, 2) : "");
          // Set coordinates text for textarea
          setCoordinatesText(data.coordinates ? JSON.stringify(data.coordinates, null, 2) : "");
          // Clear photo gallery when loading existing breakfast
          setAvailablePhotos([]);
        })
        .catch((err) => {
          console.error("Error fetching breakfast:", err);
          setError("Nepodařilo se načíst data snídaně");
        });
    } else {
      // Clear photo gallery when creating new breakfast
      setAvailablePhotos([]);
    }
  }, [breakfastId, reset]);

  // Sync addressesText when addresses are fetched via auto-fetch
  useEffect(() => {
    if (breakfastAddresses) {
      setAddressesText(JSON.stringify(breakfastAddresses, null, 2));
    }
  }, [breakfastAddresses]);

  const handleFetchPhoto = async () => {
    if (!breakfastName) {
      setError("Vyplň nejdřív název podniku");
      return;
    }

    setFetchingPhoto(true);
    setError("");

    try {
      const params = new URLSearchParams({
        name: breakfastName,
        ...(breakfastLocation && { location: breakfastLocation }),
      });

      const response = await fetch(getApiUrl(`/api/places/photo?${params.toString()}`));
      const data = await response.json();

      if (response.ok) {
        if (data.photoUrls && data.photoUrls.length > 0) {
          setAvailablePhotos(data.photoUrls);
          setValue("image_url", data.photoUrls[0]);
        } else {
          setError("Fotka nenalezena");
        }
      } else {
        setError(data.error || "Nepodařilo se načíst fotku");
      }
    } catch (err) {
      console.error("Error fetching photo:", err);
      setError("Nepodařilo se načíst fotku");
    } finally {
      setFetchingPhoto(false);
    }
  };

  const onSubmit = async (data: BreakfastInput) => {
    setLoading(true);
    setError("");

    // Parse addresses from textarea
    let parsedAddresses = null;
    if (addressesText.trim()) {
      try {
        parsedAddresses = JSON.parse(addressesText);
      } catch (e) {
        setError("Neplatný formát adres (JSON)");
        setLoading(false);
        return;
      }
    }

    // Parse coordinates from textarea
    let parsedCoordinates = null;
    if (coordinatesText.trim()) {
      try {
        parsedCoordinates = JSON.parse(coordinatesText);
      } catch (e) {
        setError("Neplatný formát GPS souřadnic (JSON)");
        setLoading(false);
        return;
      }
    }

    const payload = {
      ...data,
      addresses: parsedAddresses,
      coordinates: parsedCoordinates,
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
        setAddressesText("");
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

        {/* Addresses JSON */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Adresy (JSON) <span className="text-xs text-gray-500">např. {"{\"Anděl\": \"ulice 123, Praha\"}"}</span>
          </label>
          <textarea
            value={addressesText}
            onChange={(e) => setAddressesText(e.target.value)}
            placeholder='{"Anděl": "ulice 123, Praha", "Letná": "ulice 456, Praha"}'
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            rows={3}
          />
        </div>

        {/* Coordinates JSON */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GPS souřadnice (JSON) <span className="text-xs text-gray-500">pro sekci "V okolí"</span>
          </label>
          <textarea
            value={coordinatesText}
            onChange={(e) => setCoordinatesText(e.target.value)}
            placeholder='{"Anděl": {"lat": 50.0711, "lng": 14.4039}, "Letná": {"lat": 50.1011, "lng": 14.4282}}'
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            rows={3}
          />
          <p className="text-xs text-gray-400 mt-1">
            📍 Tip: Souřadnice najdeš na{" "}
            <a href="https://mapy.cz" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              mapy.cz
            </a>
            {" "}(klikni pravým → "Co je zde?")
          </p>
        </div>

        {/* Image URL + Fetch Button */}
        <div className="col-span-2">
          <div className="flex items-end gap-2">
            <div className="flex-1">
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
            </div>
            <button
              type="button"
              onClick={handleFetchPhoto}
              disabled={fetchingPhoto}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 transition-colors text-sm whitespace-nowrap"
            >
              {fetchingPhoto ? "Načítám..." : "📷 Načíst fotku"}
            </button>
          </div>

          {/* Photo Gallery */}
          {availablePhotos.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Dostupné fotky z Google Places:
              </p>
              <div className="grid grid-cols-4 gap-2">
                {availablePhotos.map((photoUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setValue("image_url", photoUrl)}
                    className={`relative aspect-square rounded border-2 overflow-hidden hover:border-purple-500 transition-colors ${
                      imageUrl === photoUrl ? "border-purple-600" : "border-gray-300"
                    }`}
                  >
                    <img
                      src={photoUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {imageUrl === photoUrl && (
                      <div className="absolute inset-0 bg-purple-600 bg-opacity-20 flex items-center justify-center">
                        <span className="text-white text-2xl">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
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
