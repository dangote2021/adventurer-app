'use client';
import { useStore } from '@/lib/store';

const typeStyles = {
  success: 'bg-emerald-900/90 border-emerald-700/50 text-emerald-200',
  info: 'bg-blue-900/90 border-blue-700/50 text-blue-200',
  warning: 'bg-yellow-900/90 border-yellow-700/50 text-yellow-200',
  error: 'bg-red-900/90 border-red-700/50 text-red-200',
};

const defaultIcons = {
  success: '✅',
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
};

export default function Toast() {
  const { toast, hideToast } = useStore();

  if (!toast) return null;

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 max-w-[380px] w-[90%] z-[300] px-4 py-3 rounded-xl border backdrop-blur-sm flex items-center gap-3 animate-slide-up ${typeStyles[toast.type]}`}
      role="status"
      aria-live="polite"
      aria-label={`${toast.type === 'success' ? 'Succès' : toast.type === 'error' ? 'Erreur' : toast.type === 'warning' ? 'Attention' : 'Information'}: ${toast.message}`}
    >
      <span
        className="text-lg flex-shrink-0"
        aria-hidden="true"
      >
        {toast.icon || defaultIcons[toast.type]}
      </span>
      <p
        className="flex-1 font-medium text-sm"
      >
        {toast.message}
      </p>
      <button
        type="button"
        className="text-white/50 hover:text-white transition flex-shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
        onClick={hideToast}
        aria-label="Fermer la notification"
      >
        ✕
      </button>
    </div>
  );
}
