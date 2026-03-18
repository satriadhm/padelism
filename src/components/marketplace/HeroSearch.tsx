'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search } from 'lucide-react';

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const placeholder = useMemo(() => 'Cari venue, olahraga, atau kota…', []);

  function go() {
    const params = new URLSearchParams();
    if (q.trim()) params.set('search', q.trim());
    router.push(`/venues?${params.toString()}`);
  }

  return (
    <div className="mx-auto mt-8 max-w-2xl">
      <div className="flex items-center gap-3 rounded-xl bg-white/95 px-5 py-3 shadow-lg backdrop-blur transition-shadow hover:shadow-xl">
        <Search className="h-5 w-5 shrink-0 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none"
          aria-label="Cari venue"
        />
        <button
          type="button"
          onClick={go}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-brand-700)] transition-colors hover:bg-black/5"
        >
          Cari
          <ArrowRight className="h-5 w-5 shrink-0" />
        </button>
      </div>
    </div>
  );
}

