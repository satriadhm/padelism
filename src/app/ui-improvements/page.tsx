'use client';

import { useMemo, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

type Item = {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  problem: string;
  fix: string[];
};

export default function UiImprovementsPage() {
  const items = useMemo<Item[]>(
    () => [
      {
        id: 'desktop-nav',
        title: 'Desktop navigation missing',
        severity: 'critical',
        problem: 'Customer experience on md+ had no persistent navigation; BottomNav is mobile-only.',
        fix: [
          'Add a sticky TopNav on md+ (role-aware primary links).',
          'Keep BottomNav for mobile.',
        ],
      },
      {
        id: 'broken-owner-routes',
        title: 'Broken venue-owner links',
        severity: 'critical',
        problem: 'Some nav items pointed to non-existent routes, causing 404s and dead-ends.',
        fix: [
          'Align nav hrefs with actual app routes (/dashboard, /courts, /bookings, /schedule, /settings).',
        ],
      },
      {
        id: 'profile-404',
        title: 'Profile route missing',
        severity: 'critical',
        problem: 'The “Profil” destination existed in navigation but /profile didn’t exist.',
        fix: ['Create /profile page with session-aware details and sign-out.'],
      },
      {
        id: 'hero-search-decorative',
        title: 'Hero search was decorative',
        severity: 'critical',
        problem: 'Home hero “search” looked interactive but was just a link (no input).',
        fix: ['Replace with a real input that navigates to /venues with query params.'],
      },
      {
        id: 'quiet-theme',
        title: 'Calmer visual baseline',
        severity: 'medium',
        problem: 'Brand greens were hardcoded and visually intense across pages/components.',
        fix: [
          'Introduce muted brand CSS tokens in globals.css.',
          'Refactor components/pages to reference tokens instead of hex values.',
        ],
      },
    ],
    [],
  );

  const [active, setActive] = useState<Item | null>(null);

  function badge(sev: Item['severity']) {
    switch (sev) {
      case 'critical':
        return 'bg-red-50 text-red-700';
      case 'high':
        return 'bg-orange-50 text-orange-700';
      case 'medium':
        return 'bg-amber-50 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="border-b border-gray-200 bg-white px-4 py-5">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-xl font-bold text-gray-900">UI Improvements Overview</h1>
          <p className="mt-1 text-sm text-gray-600">
            Click a card to see the specific problem and the fix.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <button key={it.id} type="button" className="text-left" onClick={() => setActive(it)}>
            <Card padding="lg" className="h-full hover:shadow-[var(--shadow-quiet-2)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{it.title}</p>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-3">{it.problem}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${badge(it.severity)}`}>
                  {it.severity}
                </span>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {active && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl">
            <Card padding="lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{active.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{active.problem}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badge(active.severity)}`}>
                  {active.severity}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-900">Fix</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  {active.fix.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setActive(null)}>
                  Close
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

