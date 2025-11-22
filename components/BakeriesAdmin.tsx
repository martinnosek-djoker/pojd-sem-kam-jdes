"use client";

import React, { useState } from "react";
import { Bakery } from "@/lib/types";
import BakeryForm from "./BakeryForm";
import NotificationDialog from "./NotificationDialog";
import { getApiUrl } from "@/lib/api-config";

interface BakeriesAdminProps {
  initialBakeries: Bakery[];
}

export default function BakeriesAdmin({ initialBakeries }: BakeriesAdminProps) {
  const [bakeries, setBakeries] = useState(initialBakeries);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [savedBakery, setSavedBakery] = useState<Bakery | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tuto cukrárnu?")) return;

    try {
      const response = await fetch(getApiUrl(`/api/bakeries/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setBakeries(bakeries.filter((b) => b.id !== id));
      } else {
        alert("Chyba při mazání cukrárny");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Chyba při mazání cukrárny");
    }
  };

  const handleSave = (bakery: Bakery) => {
    if (editingId) {
      setBakeries(bakeries.map((b) => (b.id === bakery.id ? bakery : b)));
    } else {
      setBakeries([bakery, ...bakeries]);
      // Zobrazit notifikační dialog pro nově přidanou cukrárnu
      setSavedBakery(bakery);
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
          <h2 className="text-2xl font-bold text-gray-900">🍰 Cukrárny</h2>
          <p className="text-gray-600 mt-1">Celkem {bakeries.length} cukráren</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
          }}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + Přidat cukrárnu
        </button>
      </div>

      {/* Form for adding new bakery (only when not editing existing) */}
      {showForm && !editingId && (
        <div className="mb-6">
          <BakeryForm
            bakeryId={null}
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
            {[...bakeries].sort((a, b) => a.name.localeCompare(b.name, 'cs')).map((bakery) => (
              <React.Fragment key={bakery.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bakery.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bakery.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {bakery.website_url ? (
                      <a
                        href={bakery.website_url}
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
                    {bakery.image_url ? (
                      <span className="text-green-600">✓ Ano</span>
                    ) : (
                      <span className="text-gray-400">Bez fotky</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingId(bakery.id);
                        setShowForm(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(bakery.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Smazat
                    </button>
                  </td>
                </tr>
                {editingId === bakery.id && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 bg-gray-50">
                      <BakeryForm
                        bakeryId={bakery.id}
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

        {bakeries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Zatím nemáte žádné cukrárny. Přidejte první cukrárnu nebo importujte CSV.
          </div>
        )}
      </div>

      {/* Notification Dialog */}
      {savedBakery && (
        <NotificationDialog
          isOpen={showNotificationDialog}
          onClose={() => setShowNotificationDialog(false)}
          itemName={savedBakery.name}
          itemType="bakery"
          itemId={savedBakery.id}
        />
      )}
    </div>
  );
}
