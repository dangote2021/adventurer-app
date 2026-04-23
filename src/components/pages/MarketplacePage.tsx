'use client';
import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { getMarketItems, type MarketItem } from '@/lib/supabase/queries';

interface Item {
  id: string;
  title: string;
  price: number;
  condition: string;
  sport: string;
  seller: { id: string; name: string; avatar: string };
  emoji: string;
  image: string;
}

const FALLBACK_ITEMS: Item[] = [
  {
    id: 'item-1',
    title: 'Chaussures Trail Salomon S/LAB 45 Neuves',
    price: 120,
    condition: 'Neuf',
    sport: 'Trail',
    seller: { id: 'user-1', name: 'Alex Vaillant', avatar: '👨‍🏃' },
    emoji: '👟',
    image: 'Neuves',
  },
  {
    id: 'item-2',
    title: 'Baudrier escalade Petzl Avao 41-47',
    price: 85,
    condition: 'Très bon',
    sport: 'Escalade',
    seller: { id: 'user-2', name: 'Marie Rouche', avatar: '👩‍🧗' },
    emoji: '🪂',
    image: 'Très bon état',
  },
  {
    id: 'item-3',
    title: 'Aile kitesurf Liquid Shiv 17m Occasion',
    price: 450,
    condition: 'Bon',
    sport: 'Kitesurf',
    seller: { id: 'user-3', name: 'Thomas Wave', avatar: '🏄' },
    emoji: '🪁',
    image: 'Bon état',
  },
  {
    id: 'item-4',
    title: 'Montre GPS Garmin Fenix 7',
    price: 280,
    condition: 'Neuf',
    sport: 'Multi',
    seller: { id: 'user-4', name: 'Sophie Track', avatar: '👩‍💻' },
    emoji: '⌚',
    image: 'Neuf',
  },
  {
    id: 'item-5',
    title: 'Sac à dos Arcteryx Brize 32L',
    price: 95,
    condition: 'Très bon',
    sport: 'Multi',
    seller: { id: 'user-5', name: 'Pierre Errant', avatar: '🎒' },
    emoji: '🎒',
    image: 'Très bon',
  },
  {
    id: 'item-6',
    title: 'Cordes escalade Beal 9.8mm x2',
    price: 180,
    condition: 'Bon',
    sport: 'Escalade',
    seller: { id: 'user-6', name: 'Luc Grip', avatar: '🧗‍♂️' },
    emoji: '🪢',
    image: 'Bon',
  },
];

function mapMarketItemToItem(mi: MarketItem): Item {
  return {
    id: mi.id,
    title: mi.title,
    price: mi.price,
    condition: mi.condition,
    sport: mi.sport,
    seller: { id: mi.seller_id, name: 'Vendeur Adventurer', avatar: '🏔️' },
    emoji: mi.emoji,
    image: mi.condition,
  };
}

export default function MarketplacePage() {
  const { closeSubPage, openUserProfile, showToast, setSubPage, setPage, marketplaceThreads, language } = useStore();
  const [tab, setTab] = useState<'buy' | 'rent' | 'sell'>('buy');
  const [search, setSearch] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [items, setItems] = useState<Item[]>(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(true);
  // C3 — filtres enrichis
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getMarketItems();
        if (!cancelled) {
          if (data.length > 0) {
            const mapped = data.map(mapMarketItemToItem);
            setItems(mapped);
            // C3 — auto-calibrer le slider sur le prix max réel
            const m = Math.max(...mapped.map(i => i.price));
            setMaxPrice(m);
          } else {
            const m = Math.max(...FALLBACK_ITEMS.map(i => i.price));
            setMaxPrice(m);
          }
        }
      } catch (err) {
        console.error('[MarketplacePage] fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const sports = useMemo(() => {
    const unique = Array.from(new Set(items.map(i => i.sport)));
    unique.sort();
    return unique;
  }, [items]);

  const conditions = useMemo(() => {
    const unique = Array.from(new Set(items.map(i => i.condition)));
    return unique;
  }, [items]);

  const maxItemPrice = useMemo(() => {
    return items.length > 0 ? Math.max(...items.map(i => i.price)) : 1000;
  }, [items]);

  const filteredItems = useMemo(() => {
    const arr = items.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesSport = !selectedSport || item.sport === selectedSport;
      const matchesCondition = !selectedCondition || item.condition === selectedCondition;
      const matchesPrice = item.price <= maxPrice;
      return matchesSearch && matchesSport && matchesCondition && matchesPrice;
    });
    if (sortBy === 'price-asc') arr.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') arr.sort((a, b) => b.price - a.price);
    // 'newest' = insertion order (default), no sort needed
    return arr;
  }, [items, search, selectedSport, selectedCondition, maxPrice, sortBy]);

  const activeFiltersCount = (selectedCondition ? 1 : 0) + (maxPrice < maxItemPrice ? 1 : 0) + (sortBy !== 'newest' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] max-w-[430px] mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 flex items-center gap-3 border-b border-white/5">
        <button
          type="button"
          onClick={closeSubPage}
          className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
          aria-label={t('common.backAria', language)}
        >
          ←
        </button>
        <h2 className="font-semibold text-base">🛍️ Marketplace</h2>
      </div>

      {/* Tabs */}
      <div className="sticky top-12 z-30 bg-[var(--bg)]/95 backdrop-blur-sm px-4 py-3 border-b border-white/5 flex gap-2">
        {(['buy', 'rent', 'sell'] as const).map(k => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={`flex-1 py-2 font-medium transition rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 text-center text-sm ${
              tab === k
                ? 'bg-[var(--accent)] text-white focus-visible:outline-[var(--accent)]'
                : 'text-gray-400 hover:text-white focus-visible:outline-white/20'
            }`}
            aria-label={k === 'buy' ? t('mp.buyTab', language) : k === 'rent' ? t('mp.rentTab', language) : t('mp.sellTab', language)}
            aria-selected={tab === k}
          >
            {k === 'buy' && `🛒 ${t('mp.buyTab', language)}`} {k === 'rent' && `🔄 ${t('mp.rentTab', language)}`} {k === 'sell' && `📤 ${t('mp.sellTab', language)}`}
          </button>
        ))}
      </div>

      {/* My conversations shortcut */}
      {marketplaceThreads.length > 0 && (
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={() => { setPage('messages'); }}
            className="w-full bg-gradient-to-r from-blue-500/20 to-[var(--accent)]/20 border border-blue-500/30 rounded-xl p-3 flex items-center justify-between hover:opacity-90 transition text-sm"
          >
            <span>💬 {t('mp.myConversations', language)} ({marketplaceThreads.length})</span>
            <span>→</span>
          </button>
        </div>
      )}

      <div className="px-4 py-4">
        {tab === 'buy' && (
          <div className="space-y-4">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('mp.searchPlaceholder', language)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-[var(--accent)] focus:outline-none focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 text-sm"
              aria-label="Rechercher un article"
            />

            {/* Sport filters + advanced filter toggle */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setShowFilters(s => !s)}
                className={`relative px-3 py-1 rounded-full font-medium whitespace-nowrap transition text-[13px] ${activeFiltersCount > 0 ? 'bg-[var(--accent)] text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                aria-label={language === 'fr' ? 'Filtres avancés' : 'Advanced filters'}
              >
                ⚙️ {language === 'fr' ? 'Filtres' : 'Filters'}
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[10px] font-bold">{activeFiltersCount}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setSelectedSport(null)}
                className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 ${ !selectedSport ? 'bg-[var(--accent)] text-white focus-visible:outline-[var(--accent)]' : 'bg-white/10 text-gray-300 hover:bg-white/20 focus-visible:outline-white/20' } text-[13px]`}
                aria-label="Montrer tous les articles"
                aria-pressed={!selectedSport}
              >
                {t('common.all', language)}
              </button>
              {sports.map(sport => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSelectedSport(sport)}
                  className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition focus-visible:outline-2 focus-visible:outline-offset-2 ${ selectedSport === sport ? 'bg-[var(--accent)] text-white focus-visible:outline-[var(--accent)]' : 'bg-white/10 text-gray-300 hover:bg-white/20 focus-visible:outline-white/20' } text-[13px]`}
                  aria-label={`Filtrer par ${sport}`}
                  aria-pressed={selectedSport === sport}
                >
                  {sport}
                </button>
              ))}
            </div>

            {/* Advanced filters panel */}
            {showFilters && (
              <div className="bg-[var(--card)] rounded-2xl p-4 space-y-4 border border-white/5">
                {/* Sort */}
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-2">
                    {language === 'fr' ? 'Trier par' : 'Sort by'}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: 'newest', label: language === 'fr' ? 'Récents' : 'Newest' },
                      { id: 'price-asc', label: language === 'fr' ? 'Prix ↑' : 'Price ↑' },
                      { id: 'price-desc', label: language === 'fr' ? 'Prix ↓' : 'Price ↓' },
                    ] as const).map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSortBy(opt.id)}
                        className={`py-2 rounded-lg text-xs font-medium transition ${sortBy === opt.id ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold mb-2">
                    {language === 'fr' ? 'État' : 'Condition'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCondition(null)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${!selectedCondition ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                    >
                      {t('common.all', language)}
                    </button>
                    {conditions.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCondition(c)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${selectedCondition === c ? 'bg-[var(--accent)] text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">
                      {language === 'fr' ? 'Prix max' : 'Max price'}
                    </p>
                    <p className="text-sm font-bold text-[var(--accent)]">{maxPrice}€</p>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={maxItemPrice}
                    step={10}
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[var(--accent)]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>10€</span>
                    <span>{maxItemPrice}€</span>
                  </div>
                </div>

                {/* Reset */}
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => { setMaxPrice(maxItemPrice); setSelectedCondition(null); setSortBy('newest'); }}
                    className="w-full py-2 bg-white/5 text-gray-300 rounded-lg text-xs font-medium hover:bg-white/10 transition"
                  >
                    {language === 'fr' ? '✕ Réinitialiser les filtres' : '✕ Reset filters'}
                  </button>
                )}
              </div>
            )}

            {/* Active filters summary */}
            {filteredItems.length > 0 && (search || selectedSport || activeFiltersCount > 0) && (
              <p className="text-xs text-gray-400">
                {filteredItems.length} {language === 'fr' ? (filteredItems.length > 1 ? 'articles trouvés' : 'article trouvé') : (filteredItems.length > 1 ? 'items found' : 'item found')}
              </p>
            )}

            {/* Item cards */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[var(--card)] rounded-2xl overflow-hidden animate-pulse">
                    <div className="h-32 bg-white/5" />
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3 justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/10 rounded w-3/4" />
                          <div className="h-5 bg-white/10 rounded w-16" />
                        </div>
                        <div className="h-6 bg-white/10 rounded w-12" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded-full" />
                        <div className="h-4 bg-white/10 rounded w-24" />
                      </div>
                      <div className="h-9 bg-white/10 rounded-lg w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="space-y-3">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-[var(--card)] rounded-2xl overflow-hidden">
                    {/* P14: Photo placeholder area */}
                    <div className={`h-32 bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center relative`}>
                      <span className="text-6xl opacity-80">{item.emoji}</span>
                      {/* Discount badge */}
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        -{Math.round((1 - item.price / (item.price * 1.8)) * 100)}%
                      </div>
                      <div className="absolute bottom-2 left-2 flex items-center gap-1">
                        <span className="text-xs bg-black/40 backdrop-blur-sm text-white/80 px-2 py-0.5 rounded-full">{item.sport}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                    {/* Item title & condition */}
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold line-clamp-2 text-sm">{item.title}</h3>
                        <span className={`inline-block px-2 py-1 rounded font-medium mt-1 ${ item.condition === 'Neuf' ? 'bg-green-900/30 text-green-300' : item.condition === 'Très bon' ? 'bg-blue-900/30 text-blue-300' : 'bg-yellow-900/30 text-yellow-300' } text-xs`} aria-label={`État: ${item.condition}`}>
                          {item.condition}
                        </span>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-lg font-bold text-[var(--accent)]">{item.price}€</p>
                        <p className="text-xs text-gray-500 line-through">{Math.round(item.price * 1.8)}€</p>
                      </div>
                    </div>

                    {/* Seller */}
                    <button
                      type="button"
                      onClick={() => openUserProfile(item.seller.id)}
                      className="flex items-center gap-2 text-left hover:opacity-80 transition focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 rounded"
                      aria-label={`Profil de ${item.seller.name}`}
                    >
                      <span className="text-2xl flex-shrink-0">{item.seller.avatar}</span>
                      <p className="text-gray-300 text-sm">{item.seller.name}</p>
                    </button>

                    {/* CTA */}
                    <button
                      type="button"
                      onClick={() => setSubPage({ type: 'marketplace-item', itemId: item.id })}
                      className="w-full py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
                      aria-label={`Voir ${item.title}`}
                    >
                      {t('mp.viewListing', language)}
                    </button>
                    </div>
                  </div>
                ))}

                {/* View all button */}
                <button
                  type="button"
                  onClick={() => showToast(t('mp.loadingMore', language), 'info', '📋')}
                  className="w-full py-3 bg-white/5 text-white rounded-xl font-medium hover:bg-white/10 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/20 text-sm"
                  aria-label="Voir tous les articles"
                >
                  {t('mp.viewAll', language)}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">{t('mp.noItems', language)}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'rent' && (
          <div className="text-center py-8 space-y-4">
            <p className="text-4xl">🔄</p>
            <h3 className="text-lg font-bold">{t('mp.rentTitle', language)}</h3>
            <p className="text-gray-400 text-sm">{t('mp.rentDesc', language)}</p>
            <button
              type="button"
              onClick={() => showToast(t('mp.notifyToast', language), 'info', '📬')}
              className="mx-auto px-4 py-2 bg-[var(--accent)] text-white rounded-lg font-medium hover:opacity-90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
              aria-label={t('mp.notifyMe', language)}
            >
              {t('mp.notifyMe', language)}
            </button>
          </div>
        )}

        {tab === 'sell' && (
          <div className="space-y-4 py-4">
            <div className="text-center space-y-4">
              <p className="text-5xl">📤</p>
              <h3 className="font-bold text-lg">{t('mp.sellTitle', language)}</h3>
              <p className="text-gray-400 text-sm">{t('mp.sellDesc', language)}</p>
            </div>

            <div className="space-y-3">
              <div className="bg-[var(--card)] rounded-xl p-4">
                <h4 className="font-bold mb-2 text-sm">📸 {t('mp.steps', language)}</h4>
                <ol className="space-y-2">
                  {[
                    t('mp.step1', language),
                    t('mp.step2', language),
                    t('mp.step3', language),
                    t('mp.step4', language),
                    t('mp.step5', language),
                  ].map((step, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-xl p-4">
                <h4 className="font-bold text-emerald-400 mb-2 text-sm">✓ {t('mp.advantages', language)}</h4>
                <ul className="space-y-1">
                  {[
                    t('mp.adv1', language),
                    t('mp.adv2', language),
                    t('mp.adv3', language),
                    t('mp.adv4', language),
                  ].map((item, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5 flex-shrink-0">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast(t('mp.createdToast', language), 'success', '✅')}
              className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold hover:opacity-90 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] text-sm"
              aria-label={t('mp.createListing', language)}
            >
              {t('mp.createListing', language)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
