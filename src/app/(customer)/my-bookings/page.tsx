'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, XCircle } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';

type Tab = 'upcoming' | 'past' | 'cancelled';

interface Booking {
  _id: string;
  bookingCode: string;
  courtId: { name?: string; sportType?: string } | string;
  venueId: { name?: string } | string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: string;
  paymentMethod: string;
  totalAmount: number;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'upcoming', label: 'Mendatang' },
  { key: 'past', label: 'Selesai' },
  { key: 'cancelled', label: 'Dibatalkan' },
];

function getStatusFilter(tab: Tab): string[] {
  switch (tab) {
    case 'upcoming':
      return ['confirmed', 'pending_payment', 'pending_cash', 'checked_in'];
    case 'past':
      return ['completed'];
    case 'cancelled':
      return ['cancelled', 'expired'];
  }
}

export default function MyBookingsPage() {
  const { status: authStatus } = useSession();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (authStatus === 'authenticated') {
      fetchBookings();
    }
  }, [authStatus, router, fetchBookings]);

  const filteredBookings = bookings.filter((b) =>
    getStatusFilter(tab).includes(b.status),
  );

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${cancelTarget}/cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        setCancelTarget(null);
        fetchBookings();
      }
    } catch {
      // error handled silently
    } finally {
      setCancelling(false);
    }
  }

  const courtName = (b: Booking) =>
    typeof b.courtId === 'object' ? b.courtId.name ?? 'Lapangan' : 'Lapangan';
  const venueName = (b: Booking) =>
    typeof b.venueId === 'object' ? b.venueId.name ?? 'Venue' : 'Venue';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-bold text-gray-900">Booking Saya</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4">
        <div className="mx-auto flex max-w-3xl">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 border-b-2 py-3 text-center text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-[#16a34a] text-[#16a34a]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-3">
            {filteredBookings.map((booking) => (
              <Card key={booking._id} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{courtName(booking)}</h3>
                      <Badge status={booking.status} />
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{venueName(booking)}</p>
                  </div>
                  <span className="text-xs font-mono text-gray-400">
                    {booking.bookingCode}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    {formatDate(booking.date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {booking.startTime} - {booking.endTime} WIB
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-[#16a34a]">
                    {formatCurrency(booking.totalAmount)}
                  </span>
                  {tab === 'upcoming' &&
                    ['confirmed', 'pending_payment', 'pending_cash'].includes(booking.status) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setCancelTarget(booking._id)}
                      >
                        <XCircle className="h-4 w-4" />
                        Batalkan
                      </Button>
                    )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-16 text-center">
            <CalendarDays className="mx-auto h-14 w-14 text-gray-300" />
            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              {tab === 'upcoming' && 'Belum ada booking mendatang'}
              {tab === 'past' && 'Belum ada booking yang selesai'}
              {tab === 'cancelled' && 'Tidak ada booking yang dibatalkan'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {tab === 'upcoming'
                ? 'Mulai pesan lapangan favoritmu sekarang!'
                : 'Riwayat booking Anda akan muncul di sini.'}
            </p>
            {tab === 'upcoming' && (
              <Button className="mt-4" onClick={() => router.push('/venues')}>
                Cari Venue
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        title="Batalkan Booking"
      >
        <p className="text-sm text-gray-600">
          Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.
        </p>
        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={() => setCancelTarget(null)}>
            Tidak
          </Button>
          <Button variant="danger" size="sm" loading={cancelling} onClick={handleCancel}>
            Ya, Batalkan
          </Button>
        </div>
      </Modal>
    </div>
  );
}
