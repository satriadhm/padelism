'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import BookingTable, { type BookingRow } from '@/components/dashboard/BookingTable';
import Input from '@/components/ui/Input';
import { cn } from '@/lib/utils';

const STATUS_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'confirmed', label: 'Dikonfirmasi' },
  { key: 'pending_payment', label: 'Menunggu Bayar' },
  { key: 'checked_in', label: 'Check-in' },
  { key: 'completed', label: 'Selesai' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

interface BookingRaw {
  _id: string;
  bookingCode: string;
  customerId: { name: string } | string;
  courtId: { name: string } | string;
  venueId: { name: string } | string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [venueFilter, setVenueFilter] = useState('');

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch('/api/admin/bookings');
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings ?? data ?? []);
        }
      } catch { /* silently fail */ } finally { setLoading(false); }
    }
    fetchBookings();
  }, []);

  let filtered = activeTab === 'all' ? bookings : bookings.filter((b) => b.status === activeTab);
  if (dateFilter) filtered = filtered.filter((b) => b.date?.split('T')[0] === dateFilter);
  if (venueFilter) {
    const q = venueFilter.toLowerCase();
    filtered = filtered.filter((b) => {
      const name = typeof b.venueId === 'object' ? b.venueId.name : '';
      return name.toLowerCase().includes(q);
    });
  }

  const rows: BookingRow[] = filtered.map((b) => ({
    id: b._id, bookingCode: b.bookingCode,
    customerName: typeof b.customerId === 'object' ? b.customerId.name : '-',
    courtName: typeof b.courtId === 'object' ? b.courtId.name : '-',
    date: b.date, startTime: b.startTime, endTime: b.endTime,
    status: b.status as BookingRow['status'],
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Semua Booking</h1>
      <div className="flex flex-wrap gap-3">
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-auto" />
        <Input placeholder="Cari venue..." value={venueFilter} onChange={(e) => setVenueFilter(e.target.value)} className="w-48" />
      </div>
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-gray-100 p-1">
        {STATUS_TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn('whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900')}>
            {tab.label}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="text" className="h-14" />)}</div>
      ) : (
        <Card padding="none"><BookingTable bookings={rows} /></Card>
      )}
    </div>
  );
}
