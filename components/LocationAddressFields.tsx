"use client";

import { useRef, useState } from "react";
import { getApiUrl } from "@/lib/api-config";
import { Coordinates } from "@/lib/types";

interface LocationAddressFieldsProps {
  location: string;
  addresses: Record<string, string> | null | undefined;
  coordinates: Record<string, Coordinates> | null | undefined;
  onAddressesChange: (addresses: Record<string, string> | null) => void;
  onCoordinatesChange: (coordinates: Record<string, Coordinates> | null) => void;
}

type GeocodeStatus = "idle" | "loading" | "success" | "error";

export default function LocationAddressFields({
  location,
  addresses,
  coordinates,
  onAddressesChange,
  onCoordinatesChange,
}: LocationAddressFieldsProps) {
  const [statuses, setStatuses] = useState<Record<string, GeocodeStatus>>({});
  const focusValueRef = useRef<Record<string, string>>({});

  const locations = (location || "")
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

  if (locations.length === 0) {
    return (
      <div className="md:col-span-2 col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Adresy poboček
        </label>
        <p className="text-xs text-gray-400">
          Nejdřív vyplň lokality výše — pak se tu objeví pole pro adresy.
        </p>
      </div>
    );
  }

  const handleAddressChange = (loc: string, value: string) => {
    const next = { ...(addresses || {}) };
    if (value) {
      next[loc] = value;
    } else {
      delete next[loc];
    }
    onAddressesChange(Object.keys(next).length ? next : null);
  };

  const handleBlur = async (loc: string, value: string) => {
    const previous = focusValueRef.current[loc];
    if (!value.trim() || value === previous) return;

    setStatuses((s) => ({ ...s, [loc]: "loading" }));
    try {
      const res = await fetch(getApiUrl(`/api/geocode?address=${encodeURIComponent(value)}`));
      if (!res.ok) throw new Error();
      const data = await res.json();
      const next = { ...(coordinates || {}), [loc]: data.coordinates };
      onCoordinatesChange(next);
      setStatuses((s) => ({ ...s, [loc]: "success" }));
    } catch {
      setStatuses((s) => ({ ...s, [loc]: "error" }));
    }
  };

  return (
    <div className="md:col-span-2 col-span-2 space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Adresy poboček
      </label>
      <p className="text-xs text-gray-500">
        Zadej adresu ke každé lokalitě — GPS souřadnice pro sekci &quot;V okolí&quot; se dopočítají automaticky.
      </p>
      {locations.map((loc) => {
        const status = statuses[loc] ?? (coordinates?.[loc] ? "success" : "idle");
        return (
          <div key={loc} className="flex items-start gap-3">
            <div className="w-28 flex-shrink-0 pt-2 text-sm font-medium text-gray-600 truncate" title={loc}>
              {loc}
            </div>
            <div className="flex-1">
              <input
                type="text"
                defaultValue={addresses?.[loc] || ""}
                onFocus={(e) => {
                  focusValueRef.current[loc] = e.target.value;
                }}
                onChange={(e) => handleAddressChange(loc, e.target.value)}
                onBlur={(e) => handleBlur(loc, e.target.value)}
                placeholder="Ulice a číslo, Praha"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs mt-1 h-4">
                {status === "loading" && <span className="text-gray-400">📍 Hledám souřadnice…</span>}
                {status === "success" && <span className="text-green-600">✓ Souřadnice nalezeny</span>}
                {status === "error" && (
                  <span className="text-amber-600">⚠️ Souřadnice se nepodařilo najít, zkus adresu upřesnit</span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
