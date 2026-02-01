"use client";

import React, { useState } from "react";
import { Breakfast } from "@/lib/types";
import BreakfastForm from "./BreakfastForm";
import NotificationDialog from "./NotificationDialog";
import { getApiUrl } from "@/lib/api-config";

interface BreakfastsAdminProps {
  initialBreakfasts: Breakfast[];
}

export default function BreakfastsAdmin({ initialBreakfasts }: BreakfastsAdminProps) {
  const [breakfasts, setBreakfasts] = useState(initialBreakfasts);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [savedBreakfast, setSavedBreakfast] = useState<Breakfast | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tento podnik?")) return;

    try {
      const response = await fetch(getApiUrl(`/api/breakfasts/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setBreakfasts(breakfasts.filter((b) => b.id !== id));
      } else {
        alert("Chyba při mazání");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Chyba při mazání");
    }
  };

  const handleSave = (breakfast: Breakfast) => {
    if (editingId) {
      setBreakfasts(breakfasts.map((b) => (b.id === breakfast.id ? breakfast : b)));
    } else {
      setBreakfasts([breakfast, ...breakfasts]);
      // Zobrazit notifikační dialog pro nově přidanou snídani
      setSavedBreakfast(breakfast);
      setShowNotificationDialog(true);
    }
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🍳 Snídaně</h2>
          <p className="text-gray-600 mt-1">Celkem {breakfasts.length} podniků</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + Přidat snídani
        </button>
      </div>

      {/* Form for adding new breakfast (only when not editing existing) */}
      {showForm && !editingId && (
        <div className="mb-6">
          <BreakfastForm
            breakfastId={null}
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
            {[...breakfasts].sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((breakfast) => (
              <React.Fragment key={breakfast.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{breakfast.name}</div>
                      {(!breakfast.coordinates || Object.keys(breakfast.coordinates).length === 0) && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-800" title="Chybí GPS souřadnice pro sekci 'V okolí'">
                          ⚠️ Bez GPS
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {breakfast.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {breakfast.website_url ? (
                      <a
                        href={breakfast.website_url}
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
                    {breakfast.image_url ? (
                      <span className="text-green-600">✓ Ano</span>
                    ) : (
                      <span className="text-gray-400">Bez fotky</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingId(breakfast.id);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(breakfast.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Smazat
                    </button>
                  </td>
                </tr>
                {editingId === breakfast.id && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 bg-gray-50">
                      <BreakfastForm
                        breakfastId={breakfast.id}
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

        {breakfasts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Zatím nemáte žádné snídaně. Přidejte první podnik nebo zkopírujte z Kaváren/Cukráren.
          </div>
        )}
      </div>

      {/* Notification Dialog */}
      {savedBreakfast && (
        <NotificationDialog
          isOpen={showNotificationDialog}
          onClose={() => setShowNotificationDialog(false)}
          itemName={savedBreakfast.name}
          itemType="breakfast"
          itemId={savedBreakfast.id}
        />
      )}
    </div>
  );
}
