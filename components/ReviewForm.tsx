"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, ReviewInput, Review, Restaurant } from "@/lib/types";

interface ReviewFormProps {
  reviewId?: number | null;
  onSave: (review: Review) => void;
  onCancel: () => void;
}

export default function ReviewForm({
  reviewId,
  onSave,
  onCancel,
}: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<{
    restaurant_id: number;
    title: string;
    content: string;
    visit_date: string;
    images: string[];
    is_featured: boolean;
    display_order: number;
  }>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: {
      images: [],
      is_featured: false,
      display_order: 0,
    },
  });

  // Fetch restaurants for dropdown
  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const res = await fetch("/api/restaurants");
        const data = await res.json();
        if (Array.isArray(data)) {
          // Sort alphabetically
          setRestaurants(data.sort((a, b) => a.name.localeCompare(b.name)));
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      }
    }
    fetchRestaurants();
  }, []);

  // Load review data if editing
  useEffect(() => {
    if (reviewId) {
      fetch(`/api/reviews/${reviewId}`)
        .then((res) => res.json())
        .then((data) => {
          reset({
            restaurant_id: data.restaurant_id,
            title: data.title,
            content: data.content,
            visit_date: data.visit_date,
            images: data.images || [],
            is_featured: data.is_featured,
            display_order: data.display_order,
          });
          setImages(data.images || []);
        })
        .catch((err) => {
          console.error("Error fetching review:", err);
          setError("Nepodařilo se načíst data recenze");
        });
    }
  }, [reviewId, reset]);

  const handleAddImage = () => {
    console.log("handleAddImage called, imageUrl:", imageUrl);
    console.log("Current images:", images);
    if (imageUrl.trim()) {
      const newImages = [...images, imageUrl.trim()];
      console.log("New images array:", newImages);
      setImages(newImages);
      setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
      setImageUrl("");
    } else {
      console.log("imageUrl is empty or whitespace");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue("images", newImages);
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      // Ensure images are included
      const reviewData = {
        ...data,
        images: images,
      };

      const url = reviewId ? `/api/reviews/${reviewId}` : "/api/reviews";
      const method = reviewId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Nepodařilo se uložit recenzi");
      }

      const savedReview = await response.json();
      onSave(savedReview);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Restaurant selection */}
      <div>
        <label htmlFor="restaurant_id" className="block text-sm font-medium text-gray-300 mb-2">
          Restaurace *
        </label>
        <select
          id="restaurant_id"
          {...register("restaurant_id", { valueAsNumber: true })}
          className="w-full px-4 py-2 border border-purple-600 rounded-md bg-black text-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Vyber restauraci</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name} ({restaurant.location})
            </option>
          ))}
        </select>
        {errors.restaurant_id && (
          <p className="mt-1 text-sm text-red-400">{errors.restaurant_id.message}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
          Název recenze *
        </label>
        <input
          type="text"
          id="title"
          {...register("title")}
          placeholder="např. Perfektní italská kuchyně v srdci Prahy"
          className="w-full px-4 py-2 border border-purple-600 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
        )}
      </div>

      {/* Visit date */}
      <div>
        <label htmlFor="visit_date" className="block text-sm font-medium text-gray-300 mb-2">
          Datum návštěvy *
        </label>
        <input
          type="date"
          id="visit_date"
          {...register("visit_date")}
          className="w-full px-4 py-2 border border-purple-600 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errors.visit_date && (
          <p className="mt-1 text-sm text-red-400">{errors.visit_date.message}</p>
        )}
      </div>

      {/* Content */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
          Obsah recenze *
        </label>
        <div className="mb-2 text-sm text-gray-400">
          💡 Pro tučný text použij <code className="bg-gray-800 px-1 rounded">**text**</code>
        </div>
        <textarea
          id="content"
          {...register("content")}
          rows={12}
          placeholder="Napište svůj zážitek z návštěvy...&#10;&#10;Použijte **tučný text** pro zvýraznění důležitých informací."
          className="w-full px-4 py-2 border border-purple-600 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-400">{errors.content.message}</p>
        )}
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Fotky z návštěvy
        </label>
        <div className="space-y-3">
          {/* Add image input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="URL fotky nebo /images/restaurants/..."
              className="flex-1 px-4 py-2 border border-purple-600 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddImage();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Přidat
            </button>
          </div>

          {/* Image list */}
          {images.length > 0 && (
            <div className="space-y-2">
              {images.map((img, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-800 rounded-md">
                  <span className="flex-1 text-sm text-gray-300 truncate">{img}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Odebrat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Featured checkbox */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register("is_featured")}
            className="w-5 h-5 rounded border-purple-600 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm text-gray-300">
            ✨ Zobrazit na homepage (featured)
          </span>
        </label>
      </div>

      {/* Display order */}
      <div>
        <label htmlFor="display_order" className="block text-sm font-medium text-gray-300 mb-2">
          Pořadí zobrazení
        </label>
        <input
          type="number"
          id="display_order"
          {...register("display_order", { valueAsNumber: true })}
          min="0"
          className="w-full px-4 py-2 border border-purple-600 rounded-md bg-black text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <p className="mt-1 text-sm text-gray-400">
          Nižší číslo = vyšší pozice na homepage
        </p>
        {errors.display_order && (
          <p className="mt-1 text-sm text-red-400">{errors.display_order.message}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? "Ukládám..." : reviewId ? "Aktualizovat recenzi" : "Vytvořit recenzi"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Zrušit
        </button>
      </div>
    </form>
  );
}
