'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, CalendarDays, User, LayoutDashboard, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

export interface BottomNavProps {
  role?: UserRole;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const customerItems: NavItem[] = [
  { href: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
  { href: '/venues', label: 'Cari', icon: <Search className="h-5 w-5" /> },
  { href: '/bookings', label: 'Booking', icon: <CalendarDays className="h-5 w-5" /> },
  { href: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
];

const ownerItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/dashboard/bookings', label: 'Booking', icon: <CalendarDays className="h-5 w-5" /> },
  { href: '/dashboard/staff', label: 'Staff', icon: <Users className="h-5 w-5" /> },
  { href: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
];

const staffItems: NavItem[] = [
  { href: '/staff/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: '/staff/bookings', label: 'Booking', icon: <CalendarDays className="h-5 w-5" /> },
  { href: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
];

function getNavItems(role?: UserRole): NavItem[] {
  switch (role) {
    case 'venue_owner':
      return ownerItems;
    case 'staff':
      return staffItems;
    case 'super_admin':
      return ownerItems;
    default:
      return customerItems;
  }
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const items = getNavItems(role);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white md:hidden">
      <ul className="flex items-center justify-around">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors',
                  isActive ? 'text-[#16a34a]' : 'text-gray-400 hover:text-gray-600',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
