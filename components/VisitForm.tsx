"use client";

import { useState } from "react";
import { Visit } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

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

export default function VisitForm({
  restaurantId,
  cafeId,
  placeName,
  visit,
  onSave,
  onCancel,
}: VisitFormProps) {
  const [visitDate, setVisitDate] = useState(visit?.visit_date?.slice(0, 10) || todayISO());
  const [dishesText, setDishesText] = useState(visit?.dishes?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const dishes = dishesText
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    try {
      const url = visit ? `/api/visits/${visit.id}` : "/api/visits";
      const method = visit ? "PUT" : "POST";
      const body = visit
        ? { visit_date: visitDate, dishes }
        : {
            restaurant_id: restaurantId || null,
            cafe_id: cafeId || null,
            visit_date: visitDate,
            dishes,
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
              Co jsi tam měl? <span className="text-xs text-gray-500">(odděl čárkou)</span>
            </label>
            <input
              type="text"
              value={dishesText}
              onChange={(e) => setDishesText(e.target.value)}
              placeholder="Tatarák, Burger, Tiramisu"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
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
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300 transition-colors"
            >
              {loading ? "Ukládám..." : "Uložit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
