"use client";

import { useRef, useState } from "react";
import { Visit, VisitDish } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";
import { resizeImageFile } from "@/lib/image-resize";

interface VisitFormProps {
  restaurantId?: number | null;
  cafeId?: number | null;
  placeName: string;
  visit?: Visit | null; // when set, edits this visit instead of creating a new one
  onSave: (visit: Visit) => void;
  onCancel: () => void;
}

function todayISO(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// One dish per line (or comma-separated on a single line, for the old habit),
// optionally ending in a 1-10 rating: "Tatarák 9", "Burger - 7", or just "Wellington".
function parseDishesText(text: string): VisitDish[] {
  const lines = text.includes("\n") ? text.split("\n") : text.split(",");

  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): VisitDish => {
      const match = line.match(/^(.+?)[\s\-–:]*\s*(\d{1,2})\s*(?:\/\s*10)?$/);
      if (match) {
        const rating = Number(match[2]);
        const name = match[1].trim().replace(/[-–:]+$/, "").trim();
        if (name && rating >= 1 && rating <= 10) {
          return { name, rating };
        }
      }
      return { name: line, rating: null };
    })
    .filter((d) => d.name.length > 0);
}

function formatDishesText(dishes: VisitDish[]): string {
  return dishes.map((d) => (d.rating ? `${d.name} ${d.rating}` : d.name)).join("\n");
}

export default function VisitForm({
  restaurantId,
  cafeId,
  placeName,
  visit,
  onSave,
  onCancel,
}: VisitFormProps) {
  const [visitDate, setVisitDate] = useState(visit?.visit_date?.slice(0, 10) || todayISO());
  const [dishesText, setDishesText] = useState(visit ? formatDishesText(visit.dishes || []) : "");
  const [overallRating, setOverallRating] = useState<string>(
    visit?.overall_rating != null ? String(visit.overall_rating) : ""
  );
  const [comment, setComment] = useState(visit?.comment || "");
  const [images, setImages] = useState<string[]>(visit?.images || []);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow picking the same file again later
    if (files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      for (const file of files) {
        const resized = await resizeImageFile(file);
        const formData = new FormData();
        formData.append("file", resized, file.name.replace(/\.\w+$/, ".jpg"));

        const response = await fetch(getApiUrl("/api/upload-image"), {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setImages((prev) => [...prev, data.url]);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Nepodařilo se nahrát fotku");
        }
      }
    } catch (err) {
      console.error("Error uploading photo:", err);
      setError("Nepodařilo se nahrát fotku");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const dishes = parseDishesText(dishesText);
    const overall_rating = overallRating === "" ? null : Number(overallRating);

    try {
      const url = visit ? `/api/visits/${visit.id}` : "/api/visits";
      const method = visit ? "PUT" : "POST";
      const body = visit
        ? { visit_date: visitDate, dishes, overall_rating, comment: comment.trim() || null, images }
        : {
            restaurant_id: restaurantId || null,
            cafe_id: cafeId || null,
            visit_date: visitDate,
            dishes,
            overall_rating,
            comment: comment.trim() || null,
            images,
          };

      const response = await fetch(getApiUrl(url), {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const saved = await response.json();
        onSave(saved);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Nepodařilo se uložit návštěvu");
      }
    } catch (err) {
      console.error("Error saving visit:", err);
      setError("Nepodařilo se uložit návštěvu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-1 text-gray-900">
          {visit ? "Upravit návštěvu" : "📝 Byl jsem tu"}
        </h3>
        <p className="text-sm text-gray-600 mb-4">{placeName}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datum návštěvy
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              max={todayISO()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Co jsi tam měl?{" "}
              <span className="text-xs text-gray-500">(jedno jídlo na řádek, hodnocení 1-10 nepovinné)</span>
            </label>
            <textarea
              value={dishesText}
              onChange={(e) => setDishesText(e.target.value)}
              placeholder={"Tatarák 9\nBurger 7\nTiramisu"}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Celkové hodnocení návštěvy <span className="text-xs text-gray-500">(nepovinné, 1-10)</span>
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={overallRating}
              onChange={(e) => setOverallRating(e.target.value)}
              placeholder="9"
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poznámka k návštěvě <span className="text-xs text-gray-500">(nepovinné, 1-2 věty)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Skvělá atmosféra, ale trochu pomalejší obsluha."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fotky z návštěvy <span className="text-xs text-gray-500">(nepovinné)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="relative w-16 h-16">
                  <img
                    src={url}
                    alt="Fotka z návštěvy"
                    className="w-full h-full object-cover rounded-md border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    aria-label="Odebrat fotku"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center bg-red-600 text-white rounded-full text-xs leading-none hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-16 h-16 flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 text-gray-400 hover:border-purple-400 hover:text-purple-500 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-2xl leading-none">📷</span>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
            >
              {loading ? "Ukládám..." : uploading ? "Nahrávám fotky..." : "Uložit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
