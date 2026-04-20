'use client';
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

const ITEMS: Record<string, { id: string; title: string; price: number; condition: string; sport: string; sellerId: string; sellerName: string; sellerAvatar: string; emoji: string; description: string }> = {
  'item-1': { id: 'item-1', title: 'Chaussures Trail Salomon S/LAB 45', price: 120, condition: 'Neuf', sport: 'Trail', sellerId: 'user-1', sellerName: 'Alex Vaillant', sellerAvatar: '👨‍🏃', emoji: '👟', description: 'Chaussures de trail S/LAB taille 45, neuves jamais portées, vendues avec boîte d\'origine.' },
  'item-2': { id: 'item-2', title: 'Baudrier escalade Petzl Avao 41-47', price: 85, condition: 'Très bon', sport: 'Escalade', sellerId: 'user-2', sellerName: 'Marie Rouche', sellerAvatar: '👩‍🧗', emoji: '🧗', description: 'Baudrier Petzl Avao en très bon état, utilisé en salle, pas d\'usure visible.' },
  'item-3': { id: 'item-3', title: 'Aile kitesurf Liquid Shiv 17m', price: 450, condition: 'Bon', sport: 'Kitesurf', sellerId: 'user-3', sellerName: 'Thomas Wave', sellerAvatar: '🏄', emoji: '🪁', description: 'Aile 17m polyvalente, parfaite pour vent léger, barre incluse.' },
  'item-4': { id: 'item-4', title: 'Montre GPS Garmin Fenix 7', price: 280, condition: 'Neuf', sport: 'Multi', sellerId: 'user-4', sellerName: 'Sophie Track', sellerAvatar: '👩‍💻', emoji: '⌚', description: 'Garmin Fenix 7 sous garantie, achetée en janvier 2026, double cadeau.' },
  'item-5': { id: 'item-5', title: 'Sac à dos Arcteryx Brize 32L', price: 95, condition: 'Très bon', sport: 'Multi', sellerId: 'user-5', sellerName: 'Pierre Errant', sellerAvatar: '🎒', emoji: '🎒', description: 'Sac 32L Arcteryx, utilisé 10 sorties, impeccable.' },
  'item-6': { id: 'item-6', title: 'Cordes escalade Beal 9.8mm x2', price: 180, condition: 'Bon', sport: 'Escalade', sellerId: 'user-6', sellerName: 'Luc Grip', sellerAvatar: '🧗‍♂️', emoji: '🪢', description: 'Deux cordes 70m 9.8mm Beal Booster, utilisées en voie, pas de chute dure.' },
};

export default function MarketplaceItemPage({ itemId }: { itemId: string }) {
  const { closeSubPage, setSubPage, showToast, language, openMarketplaceThread, userName, marketplaceThreads } = useStore();
  const [message, setMessage] = useState('');
  const item = ITEMS[itemId];

  if (!item) {
    return (
      <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto p-8 text-center">
        <button type="button" onClick={closeSubPage} className="mb-4 text-gray-400">← {t('common.back', language)}</button>
        <p>{t('mp.notFoundItem', language)}</p>
      </div>
    );
  }

  const existingThread = marketplaceThreads.find(th => th.itemId === itemId);

  const handleContact = () => {
    const firstMsg = message.trim() || t('mp.messagePlaceholder', language);
    const threadId = openMarketplaceThread({
      itemId: item.id,
      itemTitle: item.title,
      itemPrice: item.price,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      buyerName: userName || t('common.me', language),
      firstMessage: firstMsg,
    });
    showToast(`${t('mp.threadStarted', language)} ${item.sellerName}`, 'success', '💬');
    setSubPage({ type: 'marketplace-thread', threadId });
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button type="button" onClick={closeSubPage} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition" aria-label={t('common.back', language)}>←</button>
        <h2 className="font-semibold text-base truncate">🛍️ {item.title}</h2>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Hero */}
        <div className="aspect-square bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center">
          <span className="text-8xl">{item.emoji}</span>
        </div>

        {/* Title / price */}
        <div>
          <h1 className="text-xl font-bold">{item.title}</h1>
          <p className="text-3xl font-bold text-[var(--accent)] mt-1">{item.price}€</p>
          <div className="flex gap-2 mt-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${ item.condition === 'Neuf' ? 'bg-green-900/40 text-green-300' : item.condition === 'Très bon' ? 'bg-blue-900/40 text-blue-300' : 'bg-yellow-900/40 text-yellow-300' }`}>{item.condition}</span>
            <span className="px-2 py-1 rounded text-xs bg-white/5 text-gray-300">{item.sport}</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-[var(--card)] rounded-2xl p-4">
          <p className="text-sm text-gray-300">{item.description}</p>
        </div>

        {/* Seller */}
        <div className="bg-[var(--card)] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{item.sellerAvatar}</span>
            <div>
              <p className="font-bold text-sm">{item.sellerName}</p>
              <p className="text-xs text-gray-400">{t('mp.sellerLabel', language)}</p>
            </div>
          </div>
        </div>

        {/* Safe transaction badge */}
        <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-2xl p-3 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">🔒</span>
          <div>
            <p className="font-bold text-sm text-emerald-300">{t('mp.safeBadge', language)}</p>
            <p className="text-xs text-gray-300 mt-0.5">{t('mp.safeInfo', language)}</p>
          </div>
        </div>

        {/* Contact form */}
        {existingThread ? (
          <button
            type="button"
            onClick={() => setSubPage({ type: 'marketplace-thread', threadId: existingThread.id })}
            className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold hover:opacity-90 transition"
          >
            💬 {t('mp.viewConversation', language)} ({existingThread.messages.length})
          </button>
        ) : (
          <div className="bg-[var(--card)] rounded-2xl p-4 space-y-3">
            <label htmlFor="mp-msg" className="text-sm font-medium">{t('mp.contactSeller', language)}</label>
            <textarea
              id="mp-msg"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={t('mp.messagePlaceholder', language)}
              rows={3}
              className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm resize-none focus:outline-2 focus:outline-[var(--accent)]"
            />
            <button
              type="button"
              onClick={handleContact}
              className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold hover:opacity-90 transition"
            >
              💬 {t('mp.send', language)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
