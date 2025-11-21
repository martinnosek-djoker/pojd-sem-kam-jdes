"use client";

import { useState } from "react";
import { Event, eventSchema, EventInput } from "@/lib/types";

interface EventFormProps {
  onSubmit: (data: EventInput) => Promise<void>;
  initialData?: Event;
  onCancel?: () => void;
}

export default function EventForm({ onSubmit, initialData, onCancel }: EventFormProps) {
  // Helper to extract datetime-local format from ISO string
  const toLocalDatetimeString = (isoString: string | null) => {
    if (!isoString) return "";
    // ISO format is YYYY-MM-DDTHH:mm:ss.sssZ
    // datetime-local needs YYYY-MM-DDTHH:mm
    return isoString.slice(0, 16);
  };

  const [formData, setFormData] = useState<EventInput>({
    name: initialData?.name || "",
    location: initialData?.location || "",
    date: initialData?.date || "",
    start_date: initialData?.start_date || "",
    end_date: initialData?.end_date || "",
    link: initialData?.link || "",
    display_order: initialData?.display_order || 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      const validatedData = eventSchema.parse(formData);
      await onSubmit(validatedData);
    } catch (error: any) {
      if (error.errors) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Název akce *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Místo konání
        </label>
        <input
          type="text"
          id="location"
          value={formData.location || ""}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
        />
        {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Termín (textový popis)
        </label>
        <input
          type="text"
          id="date"
          placeholder="např. 17. - 18.1.2026"
          value={formData.date || ""}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
        />
        {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
            Začátek akce
          </label>
          <input
            type="datetime-local"
            id="start_date"
            value={formData.start_date ? toLocalDatetimeString(formData.start_date) : ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                // Keep the datetime as entered, append timezone info for storage
                // This way "14:30" stays "14:30" in Czech timezone
                setFormData({
                  ...formData,
                  start_date: value + ":00.000Z"
                });
              } else {
                setFormData({
                  ...formData,
                  start_date: ""
                });
              }
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          />
          {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
        </div>

        <div>
          <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
            Konec akce
          </label>
          <input
            type="datetime-local"
            id="end_date"
            value={formData.end_date ? toLocalDatetimeString(formData.end_date) : ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                // Keep the datetime as entered, append timezone info for storage
                // This way "14:30" stays "14:30" in Czech timezone
                setFormData({
                  ...formData,
                  end_date: value + ":00.000Z"
                });
              } else {
                setFormData({
                  ...formData,
                  end_date: ""
                });
              }
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
          />
          {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="link" className="block text-sm font-medium text-gray-700">
          Odkaz na akci
        </label>
        <input
          type="url"
          id="link"
          placeholder="https://..."
          value={formData.link || ""}
          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
        />
        {errors.link && <p className="mt-1 text-sm text-red-600">{errors.link}</p>}
      </div>

      <div>
        <label htmlFor="display_order" className="block text-sm font-medium text-gray-700">
          Pořadí zobrazení
        </label>
        <input
          type="number"
          id="display_order"
          min="1"
          value={formData.display_order}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') {
              // Allow empty temporarily for editing
              setFormData({ ...formData, display_order: 1 });
            } else {
              const numVal = parseInt(val);
              if (!isNaN(numVal) && numVal >= 1) {
                setFormData({ ...formData, display_order: numVal });
              }
            }
          }}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
        />
        {errors.display_order && <p className="mt-1 text-sm text-red-600">{errors.display_order}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          {isSubmitting ? "Ukládám..." : initialData ? "Upravit akci" : "Přidat akci"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Zrušit
          </button>
        )}
      </div>
    </form>
  );
}
