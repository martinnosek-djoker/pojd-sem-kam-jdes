"use client";

import { useState, useEffect } from "react";
import ReviewForm from "./ReviewForm";
import { Review } from "@/lib/types";

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
      const res = await fetch("/api/reviews");
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
      const res = await fetch(`/api/reviews/${id}`, {
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-purple-400">Správa recenzí</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300 font-semibold"
        >
          + Nová recenze
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400 mb-8">Zatím nejsou žádné recenze</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all duration-300"
          >
            Vytvořit první recenzi
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-gray-900/50 border border-purple-500/30 rounded-lg p-6 hover:border-purple-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {review.title}
                    </h3>
                    {review.is_featured && (
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                        ✨ Featured
                      </span>
                    )}
                  </div>

                  {review.restaurant && (
                    <p className="text-purple-400 mb-2">
                      {review.restaurant.name} • {review.restaurant.location}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span>
                      📅 {new Date(review.visit_date).toLocaleDateString("cs-CZ")}
                    </span>
                    {review.images && review.images.length > 0 && (
                      <span>📸 {review.images.length} fotek</span>
                    )}
                    <span>🔢 Pořadí: {review.display_order}</span>
                  </div>

                  <p className="text-gray-300 text-sm line-clamp-2">
                    {review.content.replace(/\*\*/g, "").substring(0, 150)}...
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(review.id)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                  >
                    Upravit
                  </button>
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                  >
                    Smazat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
