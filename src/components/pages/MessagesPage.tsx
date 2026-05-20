'use client';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { CONVERSATIONS, getConversationMessages } from '@/lib/mock-data';

interface MessagesPageProps {
  conversationId?: string;
}

const translations = {
  fr: {
    'messages.title': 'Messages',
    'messages.new': 'Nouveau',
    'messages.newHint': 'Choisis un aventurier depuis son profil pour commencer une conversation',
    'messages.sent': 'Message envoyé',
    'messages.placeholder': 'Écrire un message...',
    'messages.justNow': 'À l\'instant',
    'messages.autoReply': 'Super, j\'ai bien noté ! 👍',
    'messages.autoReplyLabel': 'Réponse auto (démo)',
    'messages.group': 'Groupe',
    'messages.backAriaLabel': 'Retour aux conversations',
    'messages.profileAriaLabel': 'Profil de {name}',
    'messages.newConvAriaLabel': 'Nouveau message',
    'messages.sendAriaLabel': 'Envoyer le message',
    'messages.notRead': '{count} non lus',
    'messages.options': 'Options de la conversation',
    'messages.report': 'Signaler',
    'messages.block': 'Bloquer',
    'messages.reportTitle': 'Signaler la conversation',
    'messages.reportSub': 'Aide-nous à garder Adventurer sûr. Choisis un motif :',
    'messages.reportSpam': 'Spam ou publicité',
    'messages.reportHarass': 'Harcèlement ou insultes',
    'messages.reportInappropriate': 'Contenu inapproprié',
    'messages.reportScam': 'Arnaque ou fraude',
    'messages.reportOther': 'Autre',
    'messages.reportSent': 'Signalement envoyé. Merci, on regarde ça.',
    'messages.blockTitle': 'Bloquer {name} ?',
    'messages.blockSub': 'Vous ne pourrez plus vous écrire. {name} ne sera pas prévenu·e.',
    'messages.blockConfirm': 'Bloquer',
    'messages.blockDone': '{name} est bloqué·e.',
    'messages.cancel': 'Annuler',
  },
  en: {
    'messages.title': 'Messages',
    'messages.new': 'New',
    'messages.newHint': 'Pick an adventurer from their profile to start a conversation',
    'messages.sent': 'Message sent',
    'messages.placeholder': 'Write a message...',
    'messages.justNow': 'Just now',
    'messages.autoReply': 'Great, noted! 👍',
    'messages.autoReplyLabel': 'Auto-reply (demo)',
    'messages.group': 'Group',
    'messages.backAriaLabel': 'Back to conversations',
    'messages.profileAriaLabel': 'Profile of {name}',
    'messages.newConvAriaLabel': 'New message',
    'messages.sendAriaLabel': 'Send message',
    'messages.notRead': '{count} unread',
    'messages.options': 'Conversation options',
    'messages.report': 'Report',
    'messages.block': 'Block',
    'messages.reportTitle': 'Report this conversation',
    'messages.reportSub': 'Help us keep Adventurer safe. Pick a reason:',
    'messages.reportSpam': 'Spam or advertising',
    'messages.reportHarass': 'Harassment or abuse',
    'messages.reportInappropriate': 'Inappropriate content',
    'messages.reportScam': 'Scam or fraud',
    'messages.reportOther': 'Other',
    'messages.reportSent': 'Report sent. Thanks, we\'ll look into it.',
    'messages.blockTitle': 'Block {name}?',
    'messages.blockSub': 'You won\'t be able to message each other. {name} won\'t be notified.',
    'messages.blockConfirm': 'Block',
    'messages.blockDone': '{name} is blocked.',
    'messages.cancel': 'Cancel',
  },
};

const t = (key: string, language: string = 'fr', params?: Record<string, string>): string => {
  const translationDict = (translations as Record<string, Record<string, string>>)[language] || translations.fr;
  let text = translationDict[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, v);
    });
  }

  return text;
};

export default function MessagesPage({ conversationId }: MessagesPageProps) {
  const { closeSubPage, setSubPage, showToast, language, marketplaceThreads, activityLog,
    blockUser, isUserBlocked, reportContent } = useStore();
  // Menu options + modales modération
  const [showConvMenu, setShowConvMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  // B1 — Messages activity-centric : on ne montre les conversations démo
  // QUE si l'utilisateur a déjà une activité ou des threads marketplace (= contexte social réel).
  // Sinon on évite un feed de faux messages qui fait app morte au premier lancement.
  const hasActivityContext = marketplaceThreads.length > 0 || activityLog.length > 0;
  const showDemoConversations = hasActivityContext;
  const [activeConv, setActiveConv] = useState(conversationId || null);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<Array<{id:string;from:string;content:string;time:string;isMe:boolean;isAuto?:boolean}>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conv = activeConv ? CONVERSATIONS.find(c => c.id === activeConv) : null;
  const messages = activeConv ? [...getConversationMessages(activeConv), ...localMessages] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setLocalMessages(prev => [...prev, {
      id: Date.now().toString(),
      from: 'Me',
      content: input,
      time: t('messages.justNow', language),
      isMe: true
    }]);
    showToast(t('messages.sent', language), 'success', '✓');
    setInput('');

    // Auto-reply simulation (demo mode)
    setTimeout(() => {
      setLocalMessages(prev => [...prev, {
        id: (Date.now()+1).toString(),
        from: conv?.participantName || '',
        content: t('messages.autoReply', language),
        time: t('messages.justNow', language),
        isMe: false,
        isAuto: true
      }]);
    }, 2000);
  };

  // Chat view
  if (conv && activeConv) {
    return (
      <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <button
            type="button"
            onClick={() => conversationId ? closeSubPage() : setActiveConv(null)}
            className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label={t('messages.backAriaLabel', language)}
          >
            ←
          </button>
          <button
            type="button"
            className="flex items-center gap-2 flex-1 rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            onClick={() => !conv.isGroup && setSubPage({ type: 'user-profile', userId: conv.participantId })}
            aria-label={t('messages.profileAriaLabel', language, { name: conv.participantName })}
          >
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">{conv.participantAvatar}</div>
            <div>
              <p className="font-medium text-sm">{conv.participantName}</p>
              {conv.isGroup && <p className="text-xs text-gray-500">{conv.groupEmoji} {t('messages.group', language)}</p>}
            </div>
          </button>
          {/* Menu options conversation — signaler / bloquer (modération Play Store) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowConvMenu(v => !v)}
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              aria-label={t('messages.options', language)}
              aria-haspopup="true"
              aria-expanded={showConvMenu}
            >
              ⋯
            </button>
            {showConvMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowConvMenu(false)} aria-hidden="true" />
                <div className="absolute right-0 top-11 z-50 w-52 bg-[var(--card)] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                  <button
                    type="button"
                    onClick={() => { setShowConvMenu(false); setShowReportModal(true); }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-200 hover:bg-white/5 transition flex items-center gap-2"
                  >
                    🚩 {t('messages.report', language)}
                  </button>
                  {!conv.isGroup && (
                    <button
                      type="button"
                      onClick={() => { setShowConvMenu(false); setShowBlockModal(true); }}
                      className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition flex items-center gap-2 border-t border-white/5"
                    >
                      🚫 {t('messages.block', language)} {conv.participantName}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modale de signalement */}
        {showReportModal && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-[var(--card)] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 space-y-3">
              <h3 className="text-lg font-bold text-white">{t('messages.reportTitle', language)}</h3>
              <p className="text-sm text-gray-400">{t('messages.reportSub', language)}</p>
              <div className="space-y-1.5 pt-1">
                {[
                  t('messages.reportSpam', language),
                  t('messages.reportHarass', language),
                  t('messages.reportInappropriate', language),
                  t('messages.reportScam', language),
                  t('messages.reportOther', language),
                ].map(reason => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => {
                      reportContent({
                        type: 'message',
                        targetId: conv.participantId || activeConv || 'conversation',
                        targetLabel: conv.participantName,
                        reason,
                      });
                      setShowReportModal(false);
                      showToast(t('messages.reportSent', language), 'success', '🚩');
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-200 bg-white/5 rounded-lg hover:bg-white/10 transition"
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="w-full py-3 text-sm text-gray-400 hover:text-gray-200 transition"
              >
                {t('messages.cancel', language)}
              </button>
            </div>
          </div>
        )}

        {/* Modale de blocage */}
        {showBlockModal && (
          <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="bg-[var(--card)] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🚫</div>
                <h3 className="text-lg font-bold text-white">{t('messages.blockTitle', language, { name: conv.participantName })}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{t('messages.blockSub', language, { name: conv.participantName })}</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 text-sm font-semibold hover:bg-white/10 transition"
                >
                  {t('messages.cancel', language)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    blockUser(conv.participantId);
                    setShowBlockModal(false);
                    showToast(t('messages.blockDone', language, { name: conv.participantName }), 'success', '🚫');
                    if (conversationId) closeSubPage(); else setActiveConv(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
                >
                  {t('messages.blockConfirm', language)}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map(msg => {
            const anyMsg = msg as typeof msg & { isAuto?: boolean };
            return (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl ${msg.isMe ? 'bg-[var(--accent)] text-white rounded-br-md' : 'bg-[var(--card)] text-gray-200 rounded-bl-md'}`}>
                  {conv.isGroup && !msg.isMe && <p className="text-xs font-medium text-[var(--accent)] mb-0.5">{msg.from}</p>}
                  {anyMsg.isAuto && (
                    <p className="text-[10px] font-medium text-amber-400 mb-0.5 uppercase tracking-wide">🤖 {t('messages.autoReplyLabel', language)}</p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.isMe ? 'text-white/50' : 'text-gray-500'}`}>{msg.time}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="sticky bottom-0 bg-[var(--bg)] border-t border-white/5 px-4 py-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={t('messages.placeholder', language)}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            aria-label={t('messages.newConvAriaLabel', language)}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!input.trim()}
            className={`px-4 py-2.5 rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${input.trim() ? 'bg-[var(--accent)] text-white hover:opacity-90' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
            aria-label={t('messages.sendAriaLabel', language)}
          >
            →
          </button>
        </div>
      </div>
    );
  }

  // Conversation list
  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-24">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">{t('messages.title', language)}</h2>
          <button
            type="button"
            className="px-3 py-1.5 bg-[var(--accent)] text-white rounded-full text-sm font-medium hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={t('messages.newConvAriaLabel', language)}
            onClick={() => {
              showToast(t('messages.newHint', language), 'info', '💬');
              setSubPage('quick-match-list');
            }}
          >
            + {t('messages.new', language)}
          </button>
        </div>
        {/* Marketplace conversations — liées à tes annonces */}
        {marketplaceThreads.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-2 px-1">🛍️ {language === 'fr' ? 'Marketplace — liées à tes annonces' : 'Marketplace — linked to your listings'}</p>
            <div className="space-y-1">
              {marketplaceThreads.map(thread => {
                const last = thread.messages[thread.messages.length - 1];
                const lastTime = new Date(last.createdAt).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
                return (
                  <button
                    key={thread.id}
                    type="button"
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition text-left"
                    onClick={() => setSubPage({ type: 'marketplace-thread', threadId: thread.id })}
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-2xl">🛍️</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">{thread.sellerName}</p>
                        <span className="text-xs text-gray-500 shrink-0 ml-2">{lastTime}</span>
                      </div>
                      <p className="text-xs text-amber-300 truncate">📦 {thread.itemTitle} · {thread.itemPrice}€</p>
                      <p className="text-sm text-gray-400 truncate">{last.text}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Welcome banner — community onboarding */}
        <div className="mb-4 bg-gradient-to-r from-[#1B4332]/40 to-[#2D6A4F]/30 border border-green-500/20 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl shrink-0">🏔️</div>
            <div>
              <p className="font-bold text-sm text-white mb-1">
                {language === 'fr' ? 'Bienvenue sur Adventurer !' : 'Welcome to Adventurer!'}
              </p>
              <p className="text-xs text-gray-400 leading-relaxed">
                {language === 'fr'
                  ? 'Ta communauté outdoor t\'attend. Contacte des coachs, échange avec d\'autres pratiquants, et trouve tes prochains partenaires de sortie.'
                  : 'Your outdoor community awaits. Contact coaches, chat with other practitioners, and find your next outing partners.'}
              </p>
            </div>
          </div>
        </div>

        {/* CTA: Trouver des partenaires — retention + engagement */}
        <div className="mb-4 bg-gradient-to-r from-[#2D6A4F]/30 to-[#023E8A]/30 border border-white/10 rounded-2xl p-4">
          <p className="font-bold text-sm text-white mb-1">
            {language === 'fr' ? '🤝 Trouve un partenaire d\'aventure' : '🤝 Find an adventure partner'}
          </p>
          <p className="text-xs text-gray-400 mb-3">
            {language === 'fr'
              ? 'Propose une sortie ou rejoins un groupe près de chez toi.'
              : 'Suggest an outing or join a group near you.'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSubPage('quick-match-list')}
              className="flex-1 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:opacity-90 transition"
            >
              {language === 'fr' ? 'Quick Match →' : 'Quick Match →'}
            </button>
            <button
              type="button"
              onClick={() => setSubPage('teams')}
              className="flex-1 py-2 bg-white/10 text-white text-xs font-medium rounded-lg hover:bg-white/15 transition"
            >
              {language === 'fr' ? 'Groupes →' : 'Groups →'}
            </button>
          </div>
        </div>

        {/* Conversations communauté — masquées au premier lancement (pas de contexte) */}
        {showDemoConversations && (
          <>
            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium mb-2 px-1">
              🤝 {language === 'fr' ? 'Communauté outdoor' : 'Outdoor community'}
            </p>
            <div className="space-y-1">
              {CONVERSATIONS.filter(c => !isUserBlocked(c.participantId)).map(c => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  onClick={() => setActiveConv(c.id)}
                  aria-label={`${t('messages.group', language)}: ${c.participantName}${c.unread > 0 ? `, ${t('messages.notRead', language, { count: c.unread.toString() })}` : ''}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-[var(--card)] flex items-center justify-center text-2xl">{c.participantAvatar}</div>
                    {c.isGroup && <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[var(--accent)] rounded-full flex items-center justify-center text-xs">👥</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{c.participantName}</p>
                      <span className="text-xs text-gray-500 shrink-0 ml-2">{c.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{c.lastMessage}</p>
                  </div>
                  {c.unread > 0 && <span className="w-5 h-5 bg-[var(--accent)] rounded-full text-xs text-white flex items-center justify-center font-bold shrink-0" aria-label={t('messages.notRead', language, { count: c.unread.toString() })}>{c.unread}</span>}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Empty state : personne n'a encore écrit */}
        {!showDemoConversations && marketplaceThreads.length === 0 && (
          <div className="text-center py-10 px-4 text-gray-400">
            <p className="text-5xl mb-3">💬</p>
            <p className="text-sm font-medium text-white mb-2">
              {language === 'fr' ? 'Aucun message pour l\'instant' : 'No messages yet'}
            </p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
              {language === 'fr'
                ? 'Les conversations apparaissent quand tu contactes un coach, rejoins un défi ou échanges sur une annonce du marketplace.'
                : 'Conversations show up when you reach out to a coach, join a challenge or chat on a marketplace listing.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
