"use client";

import { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";
import { Review } from "@/lib/types";
import { getApiUrl } from "@/lib/api-config";

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch(getApiUrl("/api/reviews"));
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (review: Review) => {
    setShowForm(false);
    setEditingId(null);
    fetchReviews();
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tuto recenzi?")) {
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/reviews/${id}`), {
        method: "DELETE",
      });

      if (res.ok) {
        fetchReviews();
      } else {
        alert("Nepodařilo se smazat recenzi");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Nepodařilo se smazat recenzi");
    }
  };

  if (showForm) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-purple-400 mb-6">
          {editingId ? "Upravit recenzi" : "Nová recenze"}
        </h2>
        <ReviewForm
          reviewId={editingId}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📝 Recenze</h2>
          <p className="text-gray-600 mt-1">Celkem {reviews.length} recenzí</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          + Přidat recenzi
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600 mb-8">Zatím nejsou žádné recenze</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Vytvořit první recenzi
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recenze
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Restaurace
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
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
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">{review.title}</div>
                      {review.is_featured && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                          ✨ Featured
                        </span>
                      )}
                    </div>
                    {review.images && review.images.length > 0 && (
                      <div className="text-xs text-gray-500">📸 {review.images.length} fotek</div>
                    )}
                    <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                      {review.content.replace(/\*\*/g, "").substring(0, 100)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {review.restaurant && (
                      <>
                        <div className="text-sm text-gray-900">{review.restaurant.name}</div>
                        <div className="text-xs text-gray-500">{review.restaurant.location}</div>
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(review.visit_date).toLocaleDateString("cs-CZ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {review.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(review.id)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Upravit
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Smazat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
