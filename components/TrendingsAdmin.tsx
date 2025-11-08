"use client";

import { useState } from "react";
import { Trending } from "@/lib/types";
import TrendingForm from "./TrendingForm";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TrendingsAdminProps {
  initialTrendings: Trending[];
}

interface SortableRowProps {
  trending: Trending;
  rank: number;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableRow({ trending, rank, onEdit, onDelete, isEditing, editForm }: SortableRowProps & { isEditing: boolean; editForm?: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: trending.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <tr ref={setNodeRef} style={style} className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Drag to reorder"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </button>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <span className="text-sm font-bold text-white">#{rank}</span>
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
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-900 mr-4"
          >
            Upravit
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-900"
          >
            Smazat
          </button>
        </td>
      </tr>
      {isEditing && (
        <tr>
          <td colSpan={4} className="px-6 py-4 bg-gray-50">
            {editForm}
          </td>
        </tr>
      )}
    </>
  );
}

export default function TrendingsAdmin({ initialTrendings }: TrendingsAdminProps) {
  const [trendings, setTrendings] = useState(initialTrendings);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = sortedTrendings.findIndex((t) => t.id === active.id);
    const newIndex = sortedTrendings.findIndex((t) => t.id === over.id);

    const reorderedTrendings = arrayMove(sortedTrendings, oldIndex, newIndex);

    // Update display_order for all items
    const updatedTrendings = reorderedTrendings.map((trending, index) => ({
      ...trending,
      display_order: index,
    }));

    // Optimistically update UI
    setTrendings(updatedTrendings);

    // Save to database
    try {
      await Promise.all(
        updatedTrendings.map((trending) =>
          fetch(`/api/trendings/${trending.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: trending.name,
              website_url: trending.website_url,
              display_order: trending.display_order,
            }),
          })
        )
      );
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Chyba při ukládání pořadí');
      // Revert on error
      setTrendings(trendings);
    }
  };

  const sortedTrendings = [...trendings].sort((a, b) => a.display_order - b.display_order);

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

      {/* Form for adding new trending (only when not editing existing) */}
      {showForm && !editingId && (
        <div className="mb-6">
          <TrendingForm
            trendingId={null}
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
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
              <SortableContext
                items={sortedTrendings.map(t => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedTrendings.map((trending, index) => (
                  <SortableRow
                    key={trending.id}
                    trending={trending}
                    rank={index + 1}
                    onEdit={() => {
                      setEditingId(trending.id);
                      setShowForm(true);
                    }}
                    onDelete={() => handleDelete(trending.id)}
                    isEditing={editingId === trending.id}
                    editForm={
                      <TrendingForm
                        trendingId={trending.id}
                        onSave={handleSave}
                        onCancel={() => {
                          setShowForm(false);
                          setEditingId(null);
                        }}
                      />
                    }
                  />
                ))}
              </SortableContext>
            </tbody>
          </table>
        </DndContext>

        {trendings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Zatím nemáte žádné trendingy. Přidejte první trending podnik nebo importujte CSV.
          </div>
        )}
      </div>
    </div>
  );
}
