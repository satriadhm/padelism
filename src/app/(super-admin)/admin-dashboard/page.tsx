'use client';

import { useEffect, useState } from 'react';
import { Building2, CalendarDays, Users, Clock } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import Skeleton from '@/components/ui/Skeleton';

interface Stats {
  totalVenues: number;
  approvedVenues: number;
  pendingVenues: number;
  todaysBookings: number;
  totalUsers: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalVenues: 0,
    approvedVenues: 0,
    pendingVenues: 0,
    todaysBookings: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [venuesRes, bookingsRes, usersRes] = await Promise.all([
          fetch('/api/admin/venues'),
          fetch('/api/admin/bookings'),
          fetch('/api/admin/users'),
        ]);

        const venuesData = venuesRes.ok ? await venuesRes.json() : { venues: [] };
        const bookingsData = bookingsRes.ok ? await bookingsRes.json() : { bookings: [] };
        const usersData = usersRes.ok ? await usersRes.json() : { users: [] };

        const venues = venuesData.venues ?? venuesData ?? [];
        const bookingsList = bookingsData.bookings ?? bookingsData ?? [];
        const users = usersData.users ?? usersData ?? [];

        const today = new Date().toISOString().split('T')[0];

        setStats({
          totalVenues: venues.length,
          approvedVenues: venues.filter((v: { isApproved: boolean }) => v.isApproved).length,
          pendingVenues: venues.filter((v: { isApproved: boolean }) => !v.isApproved).length,
          todaysBookings: bookingsList.filter((b: { date: string }) => b.date?.split('T')[0] === today).length,
          totalUsers: users.length,
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Total Venue"
          value={stats.totalVenues}
          trend={{
            value: stats.approvedVenues,
            label: `disetujui, ${stats.pendingVenues} pending`,
          }}
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Venue Pending"
          value={stats.pendingVenues}
        />
        <StatCard
          icon={<CalendarDays className="h-5 w-5" />}
          label="Booking Hari Ini"
          value={stats.todaysBookings}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Pengguna"
          value={stats.totalUsers}
        />
      </div>
    </div>
  );
}
