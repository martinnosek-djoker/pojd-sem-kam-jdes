"use client";

import React, { useState } from "react";
import { Cafe } from "@/lib/types";
import CafeForm from "./CafeForm";
import NotificationDialog from "./NotificationDialog";
import VisitForm from "./VisitForm";
import AdminRowActions from "./AdminRowActions";
import { getApiUrl } from "@/lib/api-config";

interface CafesAdminProps {
  initialCafes: Cafe[];
}

export default function CafesAdmin({ initialCafes }: CafesAdminProps) {
  const [cafes, setCafes] = useState(initialCafes);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [savedCafe, setSavedCafe] = useState<Cafe | null>(null);
  const [visitFor, setVisitFor] = useState<Cafe | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tuto kavárnu?")) return;

    try {
      const response = await fetch(getApiUrl(`/api/cafes/${id}`), {
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
      // Zobrazit notifikační dialog pro nově přidanou kavárnu
      setSavedCafe(cafe);
      setShowNotificationDialog(true);
    }
    setEditingId(null);
    setShowForm(false);
  };

  const getTagBadgeColor = (tag: string): string => {
    switch (tag) {
      case 'dezert':
        return 'bg-orange-100 text-orange-800';
      case 'matcha':
        return 'bg-green-100 text-green-800';
      case 'snídaně':
        return 'bg-sky-100 text-sky-800';
      case 'top-kava':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagLabel = (tag: string): string => {
    if (tag === 'top-kava') return 'TOP káva';
    return tag;
  };

  const sortedCafes = [...cafes].sort((a, b) => a.name.localeCompare(b.name, 'cs'));

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">☕ Kavárny</h2>
          <p className="text-gray-600 mt-1">Celkem {cafes.length} kaváren</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm w-full sm:w-auto"
        >
          + Přidat kavárnu
        </button>
      </div>

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

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
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
                Kategorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hodnocení
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
            {sortedCafes.map((cafe) => (
              <React.Fragment key={cafe.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{cafe.name}</div>
                      {(!cafe.coordinates || Object.keys(cafe.coordinates).length === 0) && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-800" title="Chybí GPS souřadnice pro sekci 'V okolí'">
                          ⚠️ Bez GPS
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cafe.location}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {cafe.tags && cafe.tags.length > 0 ? (
                        cafe.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${getTagBadgeColor(tag)}`}
                          >
                            {getTagLabel(tag)}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs">Bez kategorie</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cafe.rating != null ? `★ ${cafe.rating}/10` : <span className="text-gray-400">—</span>}
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
                    <AdminRowActions
                      onVisit={() => setVisitFor(cafe)}
                      onEdit={() => {
                        setEditingId(cafe.id);
                        setShowForm(true);
                      }}
                      onDelete={() => handleDelete(cafe.id)}
                    />
                  </td>
                </tr>
                {editingId === cafe.id && (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 bg-gray-50">
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

      {/* Mobile card list */}
      <div className="md:hidden bg-white rounded-lg shadow-md divide-y divide-gray-200">
        {sortedCafes.map((cafe) => (
          <div key={cafe.id} className="p-4">
            <div className="flex items-start gap-2 flex-wrap">
              <span className="font-medium text-gray-900">{cafe.name}</span>
              {(!cafe.coordinates || Object.keys(cafe.coordinates).length === 0) && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                  ⚠️ Bez GPS
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-1">📍 {cafe.location}</div>

            <div className="flex flex-wrap gap-1 mt-2">
              {cafe.tags && cafe.tags.length > 0 ? (
                cafe.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 text-xs font-semibold rounded ${getTagBadgeColor(tag)}`}
                  >
                    {getTagLabel(tag)}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-xs">Bez kategorie</span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2 text-sm">
              {cafe.rating != null && (
                <span className="text-gray-700">★ {cafe.rating}/10</span>
              )}
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
              {cafe.image_url ? (
                <span className="text-green-600">✓ Foto</span>
              ) : (
                <span className="text-gray-400">Bez fotky</span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-end">
              <AdminRowActions
                onVisit={() => setVisitFor(cafe)}
                onEdit={() => {
                  setEditingId(cafe.id);
                  setShowForm(true);
                }}
                onDelete={() => handleDelete(cafe.id)}
              />
            </div>

            {editingId === cafe.id && (
              <div className="mt-3">
                <CafeForm
                  cafeId={cafe.id}
                  onSave={handleSave}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                />
              </div>
            )}
          </div>
        ))}

        {cafes.length === 0 && (
          <div className="text-center py-12 text-gray-500 px-4">
            Zatím nemáte žádné kavárny. Přidejte první kavárnu nebo importujte CSV.
          </div>
        )}
      </div>

      {/* Notification Dialog */}
      {savedCafe && (
        <NotificationDialog
          isOpen={showNotificationDialog}
          onClose={() => setShowNotificationDialog(false)}
          itemName={savedCafe.name}
          itemType="cafe"
          itemId={savedCafe.id}
        />
      )}

      {/* Log a visit */}
      {visitFor && (
        <VisitForm
          cafeId={visitFor.id}
          placeName={visitFor.name}
          onSave={() => setVisitFor(null)}
          onCancel={() => setVisitFor(null)}
        />
      )}
    </div>
  );
}
