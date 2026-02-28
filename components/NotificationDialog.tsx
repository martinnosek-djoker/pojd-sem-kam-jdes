"use client";

import { useState } from "react";

interface NotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemType: 'restaurant' | 'cafe' | 'bakery' | 'breakfast' | 'trending' | 'event' | 'review';
  itemId?: number;
}

const itemTypeLabels = {
  restaurant: 'restaurace',
  cafe: 'kavárna',
  bakery: 'cukrárna',
  breakfast: 'snídaně',
  trending: 'trending podnik',
  event: 'gastro akce',
  review: 'recenze',
};

const itemTypeTitlePrefix = {
  restaurant: 'Nová',
  cafe: 'Nová',
  bakery: 'Nová',
  breakfast: 'Nová',
  trending: 'Nový',
  event: 'Nová',
  review: 'Nová',
};

const itemTypeBodyPrefix = {
  restaurant: 'novou',
  cafe: 'novou',
  bakery: 'novou',
  breakfast: 'novou',
  trending: 'nový',
  event: 'novou',
  review: 'novou',
};

const itemTypeAccusative = {
  restaurant: 'restauraci',
  cafe: 'kavárnu',
  bakery: 'cukrárnu',
  breakfast: 'snídani',
  trending: 'trending podnik',
  event: 'gastro akci',
  review: 'recenzi',
};

const itemTypeEmojis = {
  restaurant: '🍽️',
  cafe: '☕',
  bakery: '🍰',
  breakfast: '🍳',
  trending: '🔥',
  event: '🎉',
  review: '✨',
};

export default function NotificationDialog({
  isOpen,
  onClose,
  itemName,
  itemType,
  itemId,
}: NotificationDialogProps) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSendNotification = async () => {
    setSending(true);
    setResult(null);

    const emoji = itemTypeEmojis[itemType];
    const label = itemTypeLabels[itemType];
    const titlePrefix = itemTypeTitlePrefix[itemType];
    const bodyPrefix = itemTypeBodyPrefix[itemType];
    const accusative = itemTypeAccusative[itemType];

    console.log('Sending notification:', {
      itemName,
      itemType,
      itemId,
    });

    // Special text for reviews
    const title = itemType === 'review'
      ? `${emoji} ${titlePrefix} ${label}!`
      : `${emoji} ${titlePrefix} ${label}!`;

    const body = itemType === 'review'
      ? `Přidána nová recenze na podnik ${itemName}`
      : `Přidali jsme ${bodyPrefix} ${accusative}: ${itemName}`;

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          body,
          type: itemType,
          itemId,
        }),
      });

      const data = await response.json();
      console.log('Response:', { status: response.status, data });

      if (response.ok && data.success) {
        setResult({
          success: true,
          message: `Notifikace byla úspěšně odeslána na ${data.sentCount} zařízení!`,
        });

        // Automaticky zavřít dialog po 2 sekundách
        setTimeout(() => {
          onClose();
          setResult(null);
        }, 2000);
      } else {
        console.error('Failed to send notification:', data);
        setResult({
          success: false,
          message: data.error || 'Nepodařilo se odeslat notifikaci',
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setResult({
        success: false,
        message: `Chyba při odesílání notifikace: ${error instanceof Error ? error.message : 'Neznámá chyba'}`,
      });
    } finally {
      setSending(false);
    }
  };

  const handleSkip = () => {
    onClose();
    setResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          📢 Odeslat notifikaci?
        </h3>

        <p className="text-gray-700 mb-6">
          Chcete odeslat push notifikaci všem uživatelům o nové položce{' '}
          <strong className="text-gray-900">{itemName}</strong>?
        </p>

        {result && (
          <div
            className={`mb-4 p-3 rounded ${
              result.success
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {result.message}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleSendNotification}
            disabled={sending || result?.success}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium"
          >
            {sending ? '📤 Odesílám...' : result?.success ? '✓ Odesláno' : '📤 Ano, odeslat'}
          </button>
          <button
            onClick={handleSkip}
            disabled={sending}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 transition-colors font-medium"
          >
            Ne, přeskočit
          </button>
        </div>
      </div>
    </div>
  );
}
