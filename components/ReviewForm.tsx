"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { reviewSchema, ReviewInput, Review, Restaurant, Dish } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";

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
  const [uploading, setUploading] = useState(false);
  const [dishInput, setDishInput] = useState("");
  const [dishRating, setDishRating] = useState<number>(8);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [content, setContent] = useState("");
  const [similarRestaurantIds, setSimilarRestaurantIds] = useState<number[]>([]);

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
    overall_rating?: number | null;
    rating_interior?: number | null;
    rating_service?: number | null;
    rating_food?: number | null;
    total_spent?: number | null;
    dishes?: Dish[] | null;
    similar_restaurant_ids?: number[] | null;
  }>({
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: {
      images: [],
      is_featured: false,
      display_order: 0,
      overall_rating: null,
      rating_interior: null,
      rating_service: null,
      rating_food: null,
      total_spent: null,
      dishes: [],
      similar_restaurant_ids: [],
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
            overall_rating: data.overall_rating,
            rating_interior: data.rating_interior,
            rating_service: data.rating_service,
            rating_food: data.rating_food,
            total_spent: data.total_spent,
            dishes: data.dishes || [],
            similar_restaurant_ids: data.similar_restaurant_ids || [],
          });
          setImages(data.images || []);
          setDishes(data.dishes || []);
          setContent(data.content || "");
          setSimilarRestaurantIds(data.similar_restaurant_ids || []);
        })
        .catch((err) => {
          console.error("Error fetching review:", err);
          setError("Nepodařilo se načíst data recenze");
        });
    }
  }, [reviewId, reset]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nepodařilo se nahrát obrázek");
      }

      // Add uploaded image URL to list
      const newImages = [...images, data.url];
      setImages(newImages);
      setValue("images", newImages, { shouldValidate: true, shouldDirty: true });

      // Reset file input
      event.target.value = "";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      const newImages = [...images, imageUrl.trim()];
      setImages(newImages);
      setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
      setImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setValue("images", newImages);
  };

  const handleAddDish = () => {
    if (dishInput.trim() && dishRating >= 1 && dishRating <= 10) {
      const newDishes = [...dishes, { name: dishInput.trim(), rating: dishRating }];
      setDishes(newDishes);
      setValue("dishes", newDishes, { shouldValidate: true, shouldDirty: true });
      setDishInput("");
      setDishRating(8); // Reset to default
    }
  };

  const handleRemoveDish = (index: number) => {
    const newDishes = dishes.filter((_, i) => i !== index);
    setDishes(newDishes);
    setValue("dishes", newDishes);
  };

  const handleImageUploadForEditor = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Nepodařilo se nahrát obrázek");
    }

    // Also add to images list so it appears in the gallery
    const newImages = [...images, data.url];
    setImages(newImages);
    setValue("images", newImages, { shouldValidate: true, shouldDirty: true });

    return data.url;
  };

  const handleImageUrlAdd = (url: string) => {
    // Add URL to images list if not already there
    if (!images.includes(url)) {
      const newImages = [...images, url];
      setImages(newImages);
      setValue("images", newImages, { shouldValidate: true, shouldDirty: true });
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError("");

    try {
      // Ensure images, dishes, and content are included
      const reviewData = {
        ...data,
        content: content,
        images: images,
        dishes: dishes.length > 0 ? dishes : null,
        similar_restaurant_ids: similarRestaurantIds.length > 0 ? similarRestaurantIds : null,
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
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Restaurant selection */}
        <div>
          <label htmlFor="restaurant_id" className="block text-sm font-medium text-gray-700 mb-1">
            Restaurace *
          </label>
          <select
            id="restaurant_id"
            {...register("restaurant_id", { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Vyber restauraci</option>
            {restaurants.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name} ({restaurant.location})
              </option>
            ))}
          </select>
          {errors.restaurant_id && (
            <p className="mt-1 text-sm text-red-600">{errors.restaurant_id.message}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Název recenze *
          </label>
          <input
            type="text"
            id="title"
            {...register("title")}
            placeholder="např. Perfektní italská kuchyně v srdci Prahy"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Visit date */}
        <div>
          <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700 mb-1">
            Datum návštěvy *
          </label>
          <input
            type="date"
            id="visit_date"
            {...register("visit_date")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.visit_date && (
            <p className="mt-1 text-sm text-red-600">{errors.visit_date.message}</p>
          )}
        </div>

        {/* Ratings */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">⭐ Hodnocení a útrata</h3>

          {/* Overall Rating and Total Spent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-300">
            <div>
              <label htmlFor="overall_rating" className="block text-sm font-semibold text-gray-700 mb-1">
                ⭐ Celkové hodnocení (1-10)
              </label>
              <input
                type="number"
                id="overall_rating"
                {...register("overall_rating", { valueAsNumber: true })}
                min="1"
                max="10"
                placeholder="1-10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="total_spent" className="block text-sm font-semibold text-gray-700 mb-1">
                💰 Celková útrata (Kč)
              </label>
              <input
                type="number"
                id="total_spent"
                {...register("total_spent", { valueAsNumber: true })}
                min="0"
                placeholder="např. 1900"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Interior Rating */}
            <div>
              <label htmlFor="rating_interior" className="block text-sm text-gray-600 mb-1">
                Interiér
              </label>
              <input
                type="number"
                id="rating_interior"
                {...register("rating_interior", { valueAsNumber: true })}
                min="1"
                max="10"
                placeholder="1-10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Service Rating */}
            <div>
              <label htmlFor="rating_service" className="block text-sm text-gray-600 mb-1">
                Obsluha
              </label>
              <input
                type="number"
                id="rating_service"
                {...register("rating_service", { valueAsNumber: true })}
                min="1"
                max="10"
                placeholder="1-10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Food Rating */}
            <div>
              <label htmlFor="rating_food" className="block text-sm text-gray-600 mb-1">
                Jídlo
              </label>
              <input
                type="number"
                id="rating_food"
                {...register("rating_food", { valueAsNumber: true })}
                min="1"
                max="10"
                placeholder="1-10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Dishes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jídla, která jsem měl
          </label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={dishInput}
                onChange={(e) => setDishInput(e.target.value)}
                placeholder="např. Svíčková na smetaně"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDish();
                  }
                }}
              />
              <input
                type="number"
                value={dishRating}
                onChange={(e) => setDishRating(Number(e.target.value))}
                min="1"
                max="10"
                placeholder="1-10"
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddDish}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium whitespace-nowrap"
              >
                + Přidat
              </button>
            </div>

            {/* Dishes list */}
            {dishes.length > 0 && (
              <div className="space-y-2">
                {dishes.map((dish, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-green-700">{dish.rating}</span>
                        <span className="text-sm text-gray-500">/10</span>
                      </div>
                      <span className="text-gray-800 font-medium">{dish.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDish(index)}
                      className="px-3 py-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded transition-colors text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Obsah recenze *
          </label>
          <div className="mb-2 text-sm text-gray-500">
            💡 Použij tlačítka nahoře pro formátování textu, vkládání odkazů a obrázků
          </div>
          <RichTextEditor
            content={content}
            onChange={(newContent) => {
              setContent(newContent);
              setValue("content", newContent, { shouldValidate: true, shouldDirty: true });
            }}
            placeholder="Napište svůj zážitek z návštěvy..."
            uploadedImages={images}
            onImageUpload={handleImageUploadForEditor}
            onImageUrlAdd={handleImageUrlAdd}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fotky z návštěvy
          </label>
          <div className="space-y-3">
            {/* File upload button */}
            <div className="flex gap-2">
              <label className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer text-center">
                {uploading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Nahrávám...
                  </>
                ) : (
                  <>📤 Nahrát obrázek z počítače</>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Or add URL manually */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">nebo zadej URL</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL fotky nebo /images/restaurants/..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Přidat URL
              </button>
            </div>

            {/* Image list */}
            {images.length > 0 && (
              <div className="space-y-2">
                {images.map((img, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                    <span className="flex-1 text-sm text-gray-700 truncate">{img}</span>
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
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              ✨ Zobrazit na homepage (featured)
            </span>
          </label>
        </div>

        {/* Similar Restaurants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Podobné restaurace (doporučení)
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Vyber restaurace, které se zobrazí jako doporučení pod touto recenzí
          </p>
          <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-2">
            {restaurants
              .filter((r) => r.id !== Number(register("restaurant_id")._f.value))
              .map((restaurant) => (
                <label
                  key={restaurant.id}
                  className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={similarRestaurantIds.includes(restaurant.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newIds = [...similarRestaurantIds, restaurant.id];
                        setSimilarRestaurantIds(newIds);
                        setValue("similar_restaurant_ids", newIds, { shouldValidate: true, shouldDirty: true });
                      } else {
                        const newIds = similarRestaurantIds.filter((id) => id !== restaurant.id);
                        setSimilarRestaurantIds(newIds);
                        setValue("similar_restaurant_ids", newIds, { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{restaurant.name}</div>
                    <div className="text-sm text-gray-500">
                      {restaurant.location} • {restaurant.cuisine_type} • {restaurant.price}Kč
                    </div>
                  </div>
                </label>
              ))}
          </div>
          {similarRestaurantIds.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              Vybráno: {similarRestaurantIds.length} {similarRestaurantIds.length === 1 ? 'restaurace' : similarRestaurantIds.length < 5 ? 'restaurace' : 'restaurací'}
            </p>
          )}
        </div>

        {/* Display order */}
        <div>
          <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
            Pořadí zobrazení
          </label>
          <input
            type="number"
            id="display_order"
            {...register("display_order", { valueAsNumber: true })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">
            Nižší číslo = vyšší pozice na homepage
          </p>
          {errors.display_order && (
            <p className="mt-1 text-sm text-red-600">{errors.display_order.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {loading ? "Ukládám..." : reviewId ? "Aktualizovat recenzi" : "Vytvořit recenzi"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium text-sm"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
}
