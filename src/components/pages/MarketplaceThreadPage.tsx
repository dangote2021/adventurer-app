'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';

export default function MarketplaceThreadPage({ threadId }: { threadId: string }) {
  const { closeSubPage, language, marketplaceThreads, sendMarketplaceMessage, userName } = useStore();
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const thread = marketplaceThreads.find(th => th.id === threadId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages.length]);

  if (!thread) {
    return (
      <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto p-8 text-center">
        <button type="button" onClick={closeSubPage} className="mb-4 text-gray-400">← {t('common.back', language)}</button>
        <p>{t('mp.notFoundThread', language)}</p>
      </div>
    );
  }

  const handleSend = () => {
    const cleaned = text.trim();
    if (!cleaned) return;
    sendMarketplaceMessage(thread.id, userName || t('common.me', language), cleaned);
    setText('');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto flex flex-col">
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button type="button" onClick={closeSubPage} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition" aria-label={t('common.back', language)}>←</button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{thread.sellerName}</p>
          <p className="text-gray-400 text-[11px] truncate">{t('mp.aboutItem', language)} {thread.itemTitle} · {thread.itemPrice}€</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-2" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {thread.messages.map(msg => {
          const isMe = msg.senderId === 'me';
          const time = new Date(msg.createdAt).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${isMe ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-white'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-0.5 ${isMe ? 'text-white/70' : 'text-gray-400'}`}>{time}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={t('mp.messagePlaceholder', language)}
          className="flex-1 bg-white/5 rounded-full px-4 py-2 text-sm focus:outline-2 focus:outline-[var(--accent)]"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center ${text.trim() ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-500'}`}
          aria-label={t('mp.send', language)}
        >→</button>
      </div>
    </div>
  );
}
