"use client";

import { useState } from "react";
import { Event } from "@/lib/types";
import EventForm from "./EventForm";
import NotificationDialog from "./NotificationDialog";
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

interface EventsAdminProps {
  initialEvents: Event[];
}

interface SortableRowProps {
  event: Event;
  rank: number;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  editForm?: React.ReactNode;
}

function SortableRow({ event, rank, onEdit, onDelete, isEditing, editForm }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

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
        <td className="px-6 py-4">
          <div className="text-sm font-medium text-gray-900">{event.name}</div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {event.location || <span className="text-gray-400">—</span>}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {event.date || <span className="text-gray-400">—</span>}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {event.start_date ? (
            <span className="text-green-600">
              {event.start_date.slice(0, 16).replace('T', ' ')}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {event.end_date ? (
            <span className="text-red-600">
              {event.end_date.slice(0, 16).replace('T', ' ')}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">
          {event.link ? (
            <a
              href={event.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-900 truncate block max-w-xs"
            >
              {event.link}
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
      {isEditing && editForm && (
        <tr>
          <td colSpan={8} className="px-6 py-4 bg-gray-50">
            {editForm}
          </td>
        </tr>
      )}
    </>
  );
}

export default function EventsAdmin({ initialEvents }: EventsAdminProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const [savedEvent, setSavedEvent] = useState<Event | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setEvents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);

        // Update display_order in database
        updateDisplayOrders(newItems);

        return newItems;
      });
    }
  };

  const updateDisplayOrders = async (orderedEvents: Event[]) => {
    try {
      const updates = orderedEvents.map((evt, index) => ({
        id: evt.id,
        display_order: index + 1,
      }));

      const response = await fetch("/api/admin/events/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }
    } catch (error) {
      console.error("Error updating display orders:", error);
      alert("Chyba při aktualizaci pořadí");
    }
  };

  const handleAdd = async (data: any) => {
    try {
      console.log("Sending event data:", data);
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.error || "Failed to add event");
      }

      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      setShowForm(false);

      // Zobrazit notifikační dialog pro nově přidanou akci
      setSavedEvent(newEvent);
      setShowNotificationDialog(true);
    } catch (error: any) {
      console.error("Error adding event:", error);
      alert(`Chyba při přidávání akce: ${error.message}`);
    }
  };

  const handleEdit = async (data: any) => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/admin/events/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update event");
      }

      const updatedEvent = await response.json();
      setEvents(events.map((evt) => (evt.id === editingId ? updatedEvent : evt)));
      setEditingId(null);
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Chyba při úpravě akce");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Opravdu chcete smazat tuto akci?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setEvents(events.filter((evt) => evt.id !== id));
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Chyba při mazání akce");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Správa akcí</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          {showForm ? "Zrušit" : "Přidat akci"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-lg font-semibold mb-4">Nová akce</h3>
          <EventForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
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
                Místo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Termín (text)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Začátek
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Konec
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Odkaz
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akce
              </th>
            </tr>
          </thead>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={events.map((e) => e.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event, index) => (
                  <SortableRow
                    key={event.id}
                    event={event}
                    rank={index + 1}
                    onEdit={() => setEditingId(event.id)}
                    onDelete={() => handleDelete(event.id)}
                    isEditing={editingId === event.id}
                    editForm={
                      editingId === event.id ? (
                        <EventForm
                          onSubmit={handleEdit}
                          initialData={event}
                          onCancel={() => setEditingId(null)}
                        />
                      ) : undefined
                    }
                  />
                ))}
              </tbody>
            </SortableContext>
          </DndContext>
        </table>

        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Zatím nejsou přidány žádné akce.
          </div>
        )}
      </div>

      {/* Notification Dialog */}
      {savedEvent && (
        <NotificationDialog
          isOpen={showNotificationDialog}
          onClose={() => setShowNotificationDialog(false)}
          itemName={savedEvent.name}
          itemType="event"
          itemId={savedEvent.id}
        />
      )}
    </div>
  );
}
