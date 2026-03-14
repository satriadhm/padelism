'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import BookingTable, { type BookingRow } from '@/components/dashboard/BookingTable';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

const STATUS_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'confirmed', label: 'Dikonfirmasi' },
  { key: 'pending_cash', label: 'Bayar di Tempat' },
  { key: 'checked_in', label: 'Check-in' },
];

interface BookingRaw {
  _id: string;
  bookingCode: string;
  customerId: { name: string } | string;
  courtId: { name: string } | string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function StaffDashboardPage() {
  const [bookings, setBookings] = useState<BookingRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings ?? data ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todaysBookings = bookings
    .filter((b) => b.date?.split('T')[0] === today)
    .sort((a, b) => (a.startTime < b.startTime ? -1 : 1));

  const filtered =
    activeTab === 'all'
      ? todaysBookings
      : todaysBookings.filter((b) => b.status === activeTab);

  const rows: BookingRow[] = filtered.map((b) => ({
    id: b._id,
    bookingCode: b.bookingCode,
    customerName: typeof b.customerId === 'object' ? b.customerId.name : '-',
    courtName: typeof b.courtId === 'object' ? b.courtId.name : '-',
    date: b.date,
    startTime: b.startTime,
    endTime: b.endTime,
    status: b.status as BookingRow['status'],
  }));

  const pendingCheckIns = todaysBookings.filter((b) => b.status === 'confirmed').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton variant="card" className="h-28" />
          <Skeleton variant="card" className="h-28" />
        </div>
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Booking Hari Ini"
          value={todaysBookings.length}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Menunggu Check-in"
          value={pendingCheckIns}
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Booking Hari Ini – {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
        </div>
        <BookingTable bookings={rows} />
      </Card>
    </div>
  );
}
