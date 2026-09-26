"use client";

interface AdminRowActionsProps {
  onVisit?: () => void;
  visitLabel?: string;
  onEdit: () => void;
  onDelete: () => void;
}

// Compact icon-button row used instead of stacked text links ("Upravit" / "Smazat" / ...)
// so the actions column stays narrow on desktop and works as touch targets on mobile.
export default function AdminRowActions({
  onVisit,
  visitLabel = "Byl jsem tu",
  onEdit,
  onDelete,
}: AdminRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onVisit && (
        <button
          type="button"
          onClick={onVisit}
          title={visitLabel}
          aria-label={visitLabel}
          className="p-2 rounded-md text-purple-600 hover:bg-purple-50 active:bg-purple-100 transition-colors"
        >
          <span className="text-base leading-none">📝</span>
        </button>
      )}
      <button
        type="button"
        onClick={onEdit}
        title="Upravit"
        aria-label="Upravit"
        className="p-2 rounded-md text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={onDelete}
        title="Smazat"
        aria-label="Smazat"
        className="p-2 rounded-md text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
