'use client';

/**
 * Admin Dashboard — /admin
 * Protected by ADMIN_TOKEN (passed via ?token=XXX or stored in memory after first entry).
 * Shows ambassadors, waitlist, revenue — admin overview for running Adventurer day-to-day.
 */

import { useEffect, useState } from 'react';

type Ambassador = {
  id: string;
  email: string;
  display_name: string | null;
  sport: string | null;
  city: string | null;
  country: string | null;
  instagram_handle: string | null;
  audience_size: number | null;
  referral_code: string | null;
  status: string;
  total_referrals: number | null;
  total_commission_cents: number | null;
  created_at: string;
};

type WaitlistEntry = {
  id: string;
  email: string;
  feature: string;
  locale: string | null;
  created_at: string;
};

type Stats = {
  ambassadorsCount: number;
  ambassadorsByStatus: Record<string, number>;
  waitlistCount: number;
  waitlistByFeature: Record<string, number>;
  bookingsCount: number;
  ordersCount: number;
  platformRevenueCents: number;
};

type ApiResponse = {
  ambassadors: Ambassador[];
  waitlist: WaitlistEntry[];
  stats: Stats;
};

export default function AdminDashboard() {
  const [token, setToken] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'ambassadors' | 'waitlist'>('overview');

  // Auto-load token from URL or sessionStorage on mount
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    const sessionToken = typeof window !== 'undefined' ? sessionStorage.getItem('adv_admin_token') : null;
    const t = urlToken || sessionToken || '';
    if (t) {
      setToken(t);
      setInputToken(t);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/stats?token=${encodeURIComponent(token)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
        if (!cancelled) {
          setData(json);
          if (typeof window !== 'undefined') sessionStorage.setItem('adv_admin_token', token);
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  function connect(e: React.FormEvent) {
    e.preventDefault();
    setToken(inputToken.trim());
  }

  function logout() {
    if (typeof window !== 'undefined') sessionStorage.removeItem('adv_admin_token');
    setToken('');
    setInputToken('');
    setData(null);
  }

  function downloadCsv<T extends Record<string, any>>(rows: T[], filename: string) {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const escape = (v: any) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n;]/.test(s) ? `"${s}"` : s;
    };
    const csv = [
      headers.join(','),
      ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
    ].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FEFAE0] p-6" style={{ colorScheme: 'light' }}>
        <form
          onSubmit={connect}
          className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-lg border border-[#2D6A4F]/20"
        >
          <h1 className="text-2xl font-bold text-[#1B4332] mb-2">Adventurer Admin</h1>
          <p className="text-sm text-gray-600 mb-6">Entre ton token pour accéder au dashboard.</p>
          <input
            type="password"
            value={inputToken}
            onChange={e => setInputToken(e.target.value)}
            placeholder="ADMIN_TOKEN"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#2D6A4F] bg-white text-gray-900 placeholder-gray-400 mb-3"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-[#1B4332] hover:bg-[#2D6A4F] text-white font-semibold py-3 rounded-xl transition"
          >
            Se connecter
          </button>
        </form>
      </main>
    );
  }

  if (loading && !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FEFAE0]">
        <p className="text-[#1B4332]">Chargement…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FEFAE0] p-6">
        <div className="bg-white rounded-2xl p-6 max-w-md text-center border border-red-200">
          <h2 className="text-red-600 font-bold mb-2">Erreur</h2>
          <p className="text-gray-700 text-sm mb-4">{error}</p>
          <button
            onClick={logout}
            className="bg-[#1B4332] text-white px-4 py-2 rounded-xl text-sm"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const { ambassadors, waitlist, stats } = data;

  const totalReferrals = ambassadors.reduce((s, a) => s + (a.total_referrals || 0), 0);
  const totalCommission = ambassadors.reduce((s, a) => s + (a.total_commission_cents || 0), 0);
  const topReferrers = [...ambassadors]
    .filter(a => (a.total_referrals || 0) > 0)
    .sort((a, b) => (b.total_referrals || 0) - (a.total_referrals || 0))
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-[#FEFAE0] text-gray-900" style={{ colorScheme: 'light' }}>
      <header className="bg-[#1B4332] text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Adventurer Admin</h1>
          <p className="text-xs text-white/70">Mis à jour {new Date().toLocaleTimeString('fr-FR')}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setToken(t => t)}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            ↻ Rafraîchir
          </button>
          <button
            onClick={logout}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 px-6 flex gap-1 overflow-x-auto">
        {(['overview', 'ambassadors', 'waitlist'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 ${
              tab === t
                ? 'border-[#2D6A4F] text-[#1B4332]'
                : 'border-transparent text-gray-500 hover:text-[#1B4332]'
            }`}
          >
            {t === 'overview' && 'Vue d\u2019ensemble'}
            {t === 'ambassadors' && `Ambassadeurs (${stats.ambassadorsCount})`}
            {t === 'waitlist' && `Waitlist (${stats.waitlistCount})`}
          </button>
        ))}
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        {tab === 'overview' && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Ambassadeurs" value={stats.ambassadorsCount} accent="#2D6A4F" />
            <StatCard label="Waitlist" value={stats.waitlistCount} accent="#023E8A" />
            <StatCard
              label="Revenu plateforme"
              value={`${(stats.platformRevenueCents / 100).toFixed(2)} €`}
              accent="#F77F00"
            />
            <StatCard label="Réservations coachs" value={stats.bookingsCount} accent="#2D6A4F" />
            <StatCard label="Commandes marketplace" value={stats.ordersCount} accent="#DDA15E" />
            <StatCard label="Filleuls trackés" value={totalReferrals} accent="#023E8A" />
            <StatCard label="Commissions dues" value={`${(totalCommission / 100).toFixed(2)} €`} accent="#F77F00" />

            {topReferrers.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100 md:col-span-3">
                <h3 className="font-bold text-[#1B4332] mb-3">🏆 Top référents</h3>
                <div className="space-y-2">
                  {topReferrers.map((a, i) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-[#FEFAE0] rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-[#F77F00] w-6">{i + 1}</span>
                        <div>
                          <div className="font-semibold text-[#1B4332]">{a.display_name || a.email}</div>
                          <div className="text-xs text-gray-500 font-mono">{a.referral_code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#2D6A4F]">{a.total_referrals} filleuls</div>
                        <div className="text-xs text-gray-500">{((a.total_commission_cents || 0) / 100).toFixed(2)} €</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 border border-gray-100 md:col-span-2">
              <h3 className="font-bold text-[#1B4332] mb-3">Ambassadeurs par statut</h3>
              {Object.keys(stats.ambassadorsByStatus).length === 0 ? (
                <p className="text-sm text-gray-500">Aucun ambassadeur encore.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.ambassadorsByStatus).map(([s, n]) => (
                    <span key={s} className="bg-[#1B4332]/10 text-[#1B4332] px-3 py-1 rounded-full text-sm">
                      {s}: <strong>{n}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 md:col-span-3">
              <h3 className="font-bold text-[#1B4332] mb-3">Waitlist par feature</h3>
              {Object.keys(stats.waitlistByFeature).length === 0 ? (
                <p className="text-sm text-gray-500">Aucune inscription encore.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.waitlistByFeature).map(([f, n]) => (
                    <span key={f} className="bg-[#023E8A]/10 text-[#023E8A] px-3 py-1 rounded-full text-sm">
                      {f}: <strong>{n}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'ambassadors' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">{ambassadors.length} ambassadeur{ambassadors.length > 1 ? 's' : ''}</span>
              <button
                onClick={() => downloadCsv(ambassadors, `adventurer-ambassadeurs-${new Date().toISOString().slice(0, 10)}.csv`)}
                disabled={ambassadors.length === 0}
                className="text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-3 py-1.5 rounded-lg disabled:opacity-40"
              >
                ⬇ Export CSV
              </button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#1B4332]/5 text-[#1B4332]">
                <tr>
                  <Th>Date</Th>
                  <Th>Nom</Th>
                  <Th>Email</Th>
                  <Th>Sport</Th>
                  <Th>Ville</Th>
                  <Th>Instagram</Th>
                  <Th>Audience</Th>
                  <Th>Code</Th>
                  <Th>Filleuls</Th>
                  <Th>Commission</Th>
                  <Th>Statut</Th>
                </tr>
              </thead>
              <tbody>
                {ambassadors.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center text-gray-500 py-8">
                      Aucune candidature pour le moment.
                    </td>
                  </tr>
                )}
                {ambassadors.map(a => (
                  <tr key={a.id} className="border-t border-gray-100 hover:bg-[#FEFAE0]/40">
                    <Td>{new Date(a.created_at).toLocaleDateString('fr-FR')}</Td>
                    <Td>{a.display_name || '—'}</Td>
                    <Td className="font-mono text-xs">{a.email}</Td>
                    <Td>{a.sport || '—'}</Td>
                    <Td>{[a.city, a.country].filter(Boolean).join(', ') || '—'}</Td>
                    <Td>
                      {a.instagram_handle ? (
                        <a
                          href={`https://instagram.com/${a.instagram_handle.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#023E8A] hover:underline"
                        >
                          @{a.instagram_handle.replace('@', '')}
                        </a>
                      ) : '—'}
                    </Td>
                    <Td>{a.audience_size?.toLocaleString('fr-FR') || '—'}</Td>
                    <Td className="font-mono text-xs">{a.referral_code || '—'}</Td>
                    <Td>
                      {(a.total_referrals || 0) > 0 ? (
                        <span className="bg-[#2D6A4F]/15 text-[#1B4332] px-2 py-0.5 rounded-full text-xs font-bold">
                          {a.total_referrals}
                        </span>
                      ) : '—'}
                    </Td>
                    <Td className="font-mono text-xs">
                      {(a.total_commission_cents || 0) > 0 ? `${((a.total_commission_cents || 0) / 100).toFixed(2)} €` : '—'}
                    </Td>
                    <Td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(a.status)}`}>
                        {a.status}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'waitlist' && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">{waitlist.length} inscription{waitlist.length > 1 ? 's' : ''}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const emails = waitlist.map(w => w.email).join(', ');
                    navigator.clipboard.writeText(emails);
                  }}
                  disabled={waitlist.length === 0}
                  className="text-xs bg-white border border-[#1B4332]/30 text-[#1B4332] hover:border-[#1B4332] px-3 py-1.5 rounded-lg disabled:opacity-40"
                >
                  📋 Copier tous les emails
                </button>
                <button
                  onClick={() => downloadCsv(waitlist, `adventurer-waitlist-${new Date().toISOString().slice(0, 10)}.csv`)}
                  disabled={waitlist.length === 0}
                  className="text-xs bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-3 py-1.5 rounded-lg disabled:opacity-40"
                >
                  ⬇ Export CSV
                </button>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#023E8A]/5 text-[#023E8A]">
                <tr>
                  <Th>Date</Th>
                  <Th>Email</Th>
                  <Th>Feature</Th>
                  <Th>Langue</Th>
                </tr>
              </thead>
              <tbody>
                {waitlist.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-8">
                      Waitlist vide.
                    </td>
                  </tr>
                )}
                {waitlist.map(w => (
                  <tr key={w.id} className="border-t border-gray-100 hover:bg-[#FEFAE0]/40">
                    <Td>{new Date(w.created_at).toLocaleDateString('fr-FR')}</Td>
                    <Td className="font-mono text-xs">{w.email}</Td>
                    <Td>{w.feature}</Td>
                    <Td>{w.locale || '—'}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color: accent }}>{value}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">{children}</th>;
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function statusColor(status: string): string {
  switch (status) {
    case 'approved':
    case 'active':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'rejected':
    case 'inactive':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
}
