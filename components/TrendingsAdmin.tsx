"use client";

import { useState } from "react";
import { Trending } from "@/lib/types";
import TrendingForm from "./TrendingForm";

interface TrendingsAdminProps {
  initialTrendings: Trending[];
}

export default function TrendingsAdmin({ initialTrendings }: TrendingsAdminProps) {
  const [trendings, setTrendings] = useState(initialTrendings);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tento trending podnik?")) return;

    try {
      const response = await fetch(`/api/trendings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTrendings(trendings.filter((t) => t.id !== id));
      } else {
        alert("Chyba při mazání trending podniku");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Chyba při mazání trending podniku");
    }
  };

  const handleSave = (trending: Trending) => {
    if (editingId) {
      setTrendings(trendings.map((t) => (t.id === trending.id ? trending : t)));
    } else {
      setTrendings([...trendings, trending]);
    }
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔥 TOP 10 Trendingy</h2>
          <p className="text-gray-600 mt-1">Celkem {trendings.length} trending podniků</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
          }}
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
        >
          + Přidat trending podnik
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6">
          <TrendingForm
            trendingId={editingId}
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
                Pořadí
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Název
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Odkaz
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akce
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...trendings].sort((a, b) => a.display_order - b.display_order).map((trending) => (
              <tr key={trending.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">#{trending.display_order + 1}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{trending.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trending.website_url ? (
                    <a
                      href={trending.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-900 truncate block max-w-xs"
                    >
                      {trending.website_url}
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingId(trending.id);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => handleDelete(trending.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {trendings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Zatím nemáte žádné trendingy. Přidejte první trending podnik nebo importujte CSV.
          </div>
        )}
      </div>
    </div>
  );
}
