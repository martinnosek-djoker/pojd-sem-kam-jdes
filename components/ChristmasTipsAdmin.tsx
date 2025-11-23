"use client";

import { useState } from "react";
import { ChristmasTip, CHRISTMAS_CATEGORY_LABELS } from "@/lib/types";
import ChristmasTipForm from "./ChristmasTipForm";

interface ChristmasTipsAdminProps {
  initialTips: ChristmasTip[];
}

export default function ChristmasTipsAdmin({ initialTips }: ChristmasTipsAdminProps) {
  const [tips, setTips] = useState<ChristmasTip[]>(initialTips);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSave = (tip: ChristmasTip) => {
    if (editingId) {
      // Update existing
      setTips(tips.map((t) => (t.id === tip.id ? tip : t)));
      alert("Vánoční tip byl úspěšně upraven");
    } else {
      // Add new
      setTips([...tips, tip]);
      alert("Vánoční tip byl úspěšně přidán");
    }
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tento vánoční tip?")) {
      return;
    }

    try {
      const response = await fetch(`/api/christmas-tips/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Nepodařilo se smazat tip");
      }

      setTips(tips.filter((t) => t.id !== id));
      alert("Vánoční tip byl úspěšně smazán");
    } catch (error: any) {
      alert(error.message || "Nepodařilo se smazat tip");
    }
  };

  // Group tips by category
  const tipsByCategory = tips.reduce((acc, tip) => {
    if (!acc[tip.category]) {
      acc[tip.category] = [];
    }
    acc[tip.category].push(tip);
    return acc;
  }, {} as Record<string, ChristmasTip[]>);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            🎄 Vánoční tipy
          </h2>
          <p className="text-gray-600 mt-1">
            Celkem {tips.length} tipů ve {Object.keys(tipsByCategory).length} kategoriích
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          {showAddForm ? "Zrušit" : "+ Přidat tip"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Přidat nový vánoční tip</h3>
          <ChristmasTipForm
            onSave={handleSave}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Tips by Category */}
      {Object.entries(tipsByCategory).map(([category, categoryTips]) => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            {CHRISTMAS_CATEGORY_LABELS[category as keyof typeof CHRISTMAS_CATEGORY_LABELS]}
            <span className="text-sm font-normal text-gray-500">({categoryTips.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Název
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eshop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Obrázek
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pořadí
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryTips
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((tip) => (
                    <tr key={tip.id}>
                      {editingId === tip.id ? (
                        <td colSpan={5} className="px-6 py-4">
                          <ChristmasTipForm
                            tipId={tip.id}
                            onSave={handleSave}
                            onCancel={() => setEditingId(null)}
                          />
                        </td>
                      ) : (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {tip.name}
                            </div>
                            {tip.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {tip.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <a
                              href={tip.shop_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:text-red-900 truncate block max-w-xs"
                            >
                              {tip.shop_url}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tip.image_url ? (
                              <img
                                src={tip.image_url}
                                alt={tip.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            ) : (
                              <span className="text-gray-400 text-sm">Bez obrázku</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {tip.display_order}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setEditingId(tip.id)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Upravit
                            </button>
                            <button
                              onClick={() => handleDelete(tip.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Smazat
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Empty State */}
      {tips.length === 0 && !showAddForm && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">Zatím nemáte žádné vánoční tipy</p>
          <p className="text-sm">Klikněte na "Přidat tip" pro vytvoření prvního tipu</p>
        </div>
      )}
    </div>
  );
}
