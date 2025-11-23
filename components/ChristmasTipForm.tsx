"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { christmasTipSchema, ChristmasTipInput, ChristmasTip, CHRISTMAS_CATEGORY_LABELS, ChristmasCategory } from "@/lib/types";

interface ChristmasTipFormProps {
  tipId?: number | null;
  onSave: (tip: ChristmasTip) => void;
  onCancel: () => void;
}

export default function ChristmasTipForm({
  tipId,
  onSave,
  onCancel,
}: ChristmasTipFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ChristmasTipInput>({
    resolver: zodResolver(christmasTipSchema),
    defaultValues: {
      name: "",
      category: "cukrovi",
      image_url: "",
      shop_url: "",
      description: "",
      display_order: 0,
    },
  });

  const imageUrl = watch("image_url");

  useEffect(() => {
    if (tipId) {
      // Fetch tip data for editing
      fetch(`/api/christmas-tips/${tipId}`)
        .then((res) => res.json())
        .then((data) => {
          reset({
            name: data.name,
            category: data.category,
            image_url: data.image_url || "",
            shop_url: data.shop_url,
            description: data.description || "",
            display_order: data.display_order || 0,
          });
        })
        .catch((err) => {
          console.error("Error fetching Christmas tip:", err);
          setError("Nepodařilo se načíst data");
        });
    }
  }, [tipId, reset]);

  const onSubmit = async (data: ChristmasTipInput) => {
    setLoading(true);
    setError("");

    try {
      const url = tipId
        ? `/api/christmas-tips/${tipId}`
        : "/api/christmas-tips";
      const method = tipId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nepodařilo se uložit tip");
      }

      const savedTip = await response.json();
      onSave(savedTip);
      reset();
    } catch (err: any) {
      setError(err.message || "Nepodařilo se uložit tip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Název <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("name")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="např. Cukrárna U Anděla"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Kategorie <span className="text-red-500">*</span>
        </label>
        <select
          {...register("category")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          {Object.entries(CHRISTMAS_CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
        )}
      </div>

      {/* Shop URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL eshopu <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          {...register("shop_url")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="https://example.com"
        />
        {errors.shop_url && (
          <p className="text-red-500 text-sm mt-1">{errors.shop_url.message}</p>
        )}
      </div>

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL obrázku
        </label>
        <input
          type="url"
          {...register("image_url")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="https://example.com/image.jpg"
        />
        {errors.image_url && (
          <p className="text-red-500 text-sm mt-1">{errors.image_url.message}</p>
        )}
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-32 h-32 object-cover rounded-md border border-gray-300"
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Popis
        </label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Krátký popis podniku..."
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Display Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Pořadí zobrazení
        </label>
        <input
          type="number"
          {...register("display_order", { valueAsNumber: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="0"
        />
        {errors.display_order && (
          <p className="text-red-500 text-sm mt-1">{errors.display_order.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "Ukládám..." : tipId ? "Uložit změny" : "Přidat tip"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Zrušit
        </button>
      </div>
    </form>
  );
}
