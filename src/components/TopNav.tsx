'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';

type Item = { href: string; label: string; icon: React.ReactNode };

const items: Item[] = [
  { href: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
  { href: '/venues', label: 'Cari', icon: <Search className="h-4 w-4" /> },
  { href: '/my-bookings', label: 'Booking', icon: <CalendarDays className="h-4 w-4" /> },
  { href: '/profile', label: 'Profil', icon: <User className="h-4 w-4" /> },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 hidden border-b border-gray-200 bg-white/90 backdrop-blur md:block">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-brand-600)] text-sm font-bold text-white">
            P
          </span>
          <span className="text-sm tracking-wide">Padelism</span>
        </Link>

        <nav className="flex items-center gap-1">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

