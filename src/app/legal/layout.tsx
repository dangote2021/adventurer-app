import Link from 'next/link';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-screen bg-[#FEFAE0] text-gray-900"
      style={{ colorScheme: 'light' }}
    >
      <header className="bg-[#1B4332] text-white px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">Adventurer</Link>
        <nav className="flex gap-4 text-sm">
          <Link href="/legal/privacy" className="hover:underline">Confidentialité</Link>
          <Link href="/legal/terms" className="hover:underline">CGU</Link>
          <Link href="/legal/mentions" className="hover:underline">Mentions</Link>
        </nav>
      </header>
      <article className="max-w-3xl mx-auto px-6 py-10 prose prose-sm md:prose-base">
        {children}
      </article>
      <footer className="text-center text-xs text-gray-500 py-8 border-t border-gray-200 mt-10">
        © {new Date().getFullYear()} Adventurer — Toutes aventures garanties.
      </footer>
    </main>
  );
}
