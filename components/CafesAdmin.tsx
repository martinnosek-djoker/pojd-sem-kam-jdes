"use client";

import React, { useState } from "react";
import { Cafe } from "@/lib/types";
import CafeForm from "./CafeForm";

interface CafesAdminProps {
  initialCafes: Cafe[];
}

export default function CafesAdmin({ initialCafes }: CafesAdminProps) {
  const [cafes, setCafes] = useState(initialCafes);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [fetchingPhotos, setFetchingPhotos] = useState(false);
  const [fetchResults, setFetchResults] = useState<any>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tuto kavárnu?")) return;

    try {
      const response = await fetch(`/api/cafes/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCafes(cafes.filter((c) => c.id !== id));
      } else {
        alert("Chyba při mazání kavárny");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Chyba při mazání kavárny");
    }
  };

  const handleSave = (cafe: Cafe) => {
    if (editingId) {
      setCafes(cafes.map((c) => (c.id === cafe.id ? cafe : c)));
    } else {
      setCafes([cafe, ...cafes]);
    }
    setEditingId(null);
    setShowForm(false);
  };

  const handleFetchAllPhotos = async () => {
    if (!confirm("Chceš automaticky načíst fotky pro všechny kavárny bez obrázku? Může to trvat několik minut.")) {
      return;
    }

    setFetchingPhotos(true);
    setFetchResults(null);

    try {
      const response = await fetch("/api/admin/fetch-all-cafe-photos", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setFetchResults(data);
        // Reload cafes to show new images
        const reloadResponse = await fetch("/api/cafes");
        const updatedCafes = await reloadResponse.json();
        setCafes(updatedCafes);
      } else {
        alert(data.error || "Chyba při načítání fotek");
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
      alert("Chyba při načítání fotek");
    } finally {
      setFetchingPhotos(false);
    }
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">☕ Kavárny</h2>
          <p className="text-gray-600 mt-1">Celkem {cafes.length} kaváren</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleFetchAllPhotos}
            disabled={fetchingPhotos}
            className="px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300 transition-colors font-medium text-sm"
          >
            {fetchingPhotos ? "🔄 Načítám fotky..." : "📷 Načíst fotky"}
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            + Přidat kavárnu
          </button>
        </div>
      </div>

      {/* Fetch Results */}
      {fetchResults && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-bold text-blue-900 mb-2">📊 Výsledky načítání fotek:</h3>
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{fetchResults.success}</div>
              <div className="text-sm text-gray-600">Úspěšně načteno</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{fetchResults.skipped}</div>
              <div className="text-sm text-gray-600">Nenalezeno</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{fetchResults.failed}</div>
              <div className="text-sm text-gray-600">Chyby</div>
            </div>
          </div>
          <button
            onClick={() => setFetchResults(null)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Zavřít
          </button>
        </div>
      )}

      {/* Form for adding new cafe (only when not editing existing) */}
      {showForm && !editingId && (
        <div className="mb-6">
          <CafeForm
            cafeId={null}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Název
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lokalita
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Web/Instagram
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Foto
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akce
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...cafes].sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((cafe) => (
              <React.Fragment key={cafe.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{cafe.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cafe.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {cafe.website_url ? (
                      <a
                        href={cafe.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Odkaz
                      </a>
                    ) : (
                      <span className="text-gray-400">Bez URL</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {cafe.image_url ? (
                      <span className="text-green-600">✓ Ano</span>
                    ) : (
                      <span className="text-gray-400">Bez fotky</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingId(cafe.id);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(cafe.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Smazat
                    </button>
                  </td>
                </tr>
                {editingId === cafe.id && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 bg-gray-50">
                      <CafeForm
                        cafeId={cafe.id}
                        onSave={handleSave}
                        onCancel={() => {
                          setShowForm(false);
                          setEditingId(null);
                        }}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {cafes.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Zatím nemáte žádné kavárny. Přidejte první kavárnu nebo importujte CSV.
          </div>
        )}
      </div>
    </div>
  );
}
