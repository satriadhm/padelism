'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  CalendarDays,
  DollarSign,
  MapPin,
  UserCheck,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '@/components/dashboard/StatCard';
import BookingTable, { type BookingRow } from '@/components/dashboard/BookingTable';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';

interface BookingRaw {
  _id: string;
  bookingCode: string;
  customerId: { name: string } | string;
  courtId: { name: string } | string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
}

export default function VenueOwnerDashboardPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<BookingRaw[]>([]);
  const [loading, setLoading] = useState(true);

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

  const todaysBookings = bookings.filter(
    (b) => b.date?.split('T')[0] === today,
  );
  const monthlyRevenue = bookings
    .filter((b) => {
      const d = new Date(b.date);
      const now = new Date();
      return (
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear() &&
        ['confirmed', 'checked_in', 'completed'].includes(b.status)
      );
    })
    .reduce((sum, b) => sum + (b.totalAmount ?? 0), 0);
  const activeCourts = new Set(bookings.map((b) => typeof b.courtId === 'object' ? (b.courtId as { name: string }).name : b.courtId)).size;
  const pendingCheckIns = bookings.filter((b) => b.status === 'confirmed' && b.date?.split('T')[0] === today).length;

  // 7-day revenue chart
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short' });
    const revenue = bookings
      .filter(
        (b) =>
          b.date?.split('T')[0] === dateStr &&
          ['confirmed', 'checked_in', 'completed'].includes(b.status),
      )
      .reduce((sum, b) => sum + (b.totalAmount ?? 0), 0);
    return { day: dayLabel, revenue };
  });

  const recentBookings: BookingRow[] = bookings
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
    .map((b) => ({
      id: b._id,
      bookingCode: b.bookingCode,
      customerName: typeof b.customerId === 'object' ? b.customerId.name : '-',
      courtName: typeof b.courtId === 'object' ? b.courtId.name : '-',
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status as BookingRow['status'],
    }));

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Booking Hari Ini"
          value={todaysBookings.length}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Pendapatan Bulan Ini"
          value={formatCurrency(monthlyRevenue)}
        />
        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label="Lapangan Aktif"
          value={activeCourts}
        />
        <StatCard
          icon={<UserCheck className="h-5 w-5" />}
          label="Menunggu Check-in"
          value={pendingCheckIns}
        />
      </div>

      {/* Revenue Chart */}
      <Card padding="lg">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Pendapatan 7 Hari Terakhir</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Pendapatan']}
              />
              <Bar dataKey="revenue" fill="var(--color-brand-600)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Bookings */}
      <Card padding="none">
        <div className="border-b border-gray-200 px-4 py-4 md:px-6">
          <h2 className="text-lg font-semibold text-gray-900">Booking Terbaru</h2>
        </div>
        <BookingTable bookings={recentBookings} />
      </Card>
    </div>
  );
}
