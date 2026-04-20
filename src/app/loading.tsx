export default function Loading() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Pulsing logo */}
        <div className="w-16 h-16 rounded-2xl bg-[#2D6A4F] flex items-center justify-center animate-pulse">
          <span className="text-3xl">🏔️</span>
        </div>
        {/* Loading bar */}
        <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2D6A4F] rounded-full animate-loading-bar"
            style={{
              animation: 'loading-bar 1.2s ease-in-out infinite',
            }}
          />
        </div>
        <style>{`
          @keyframes loading-bar {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 60%; margin-left: 20%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
      </div>
    </div>
  );
}
