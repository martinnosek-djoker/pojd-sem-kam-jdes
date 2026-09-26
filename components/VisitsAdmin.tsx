"use client";

import { useState } from "react";
import { Visit } from "@/lib/types";
import VisitForm from "./VisitForm";
import { getApiUrl } from "@/lib/api-config";

interface VisitsAdminProps {
  initialVisits: Visit[];
}

function placeName(visit: Visit): string {
  return visit.restaurant?.name || visit.cafe?.name || "Neznámý podnik";
}

export default function VisitsAdmin({ initialVisits }: VisitsAdminProps) {
  const [visits, setVisits] = useState(initialVisits);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu smazat tuto návštěvu?")) return;

    try {
      const response = await fetch(getApiUrl(`/api/visits/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setVisits(visits.filter((v) => v.id !== id));
      } else {
        alert("Chyba při mazání návštěvy");
      }
    } catch (error) {
      console.error("Error deleting visit:", error);
      alert("Chyba při mazání návštěvy");
    }
  };

  const handleSave = (visit: Visit) => {
    setVisits(visits.map((v) => (v.id === visit.id ? visit : v)));
    setEditingVisit(null);
  };

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📝 Nejnovější návštěvy</h2>
          <p className="text-gray-600 mt-1">
            Celkem {visits.length} návštěv — přidávají se tlačítkem &quot;📝 Byl jsem tu&quot; u restaurace nebo kavárny níže
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Podnik
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jídla
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hodnocení podniku
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akce
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {visits.map((visit) => (
              <tr key={visit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {placeName(visit)}{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    ({visit.restaurant ? "restaurace" : "kavárna"})
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(visit.visit_date).toLocaleDateString("cs-CZ")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {visit.dishes && visit.dishes.length > 0 ? (
                    visit.dishes
                      .map((d) => (d.rating ? `${d.name} (${d.rating}/10)` : d.name))
                      .join(", ")
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs italic">
                  {visit.comment || <span className="text-gray-400 not-italic">—</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setEditingVisit(visit)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => handleDelete(visit.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Smazat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visits.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Zatím žádné návštěvy. Klikni na &quot;📝 Byl jsem tu&quot; u restaurace nebo kavárny níže.
          </div>
        )}
      </div>

      {editingVisit && (
        <VisitForm
          placeName={placeName(editingVisit)}
          visit={editingVisit}
          onSave={handleSave}
          onCancel={() => setEditingVisit(null)}
        />
      )}
    </div>
  );
}
