'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { cn, formatTime } from '@/lib/utils';

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const HOURS = Array.from({ length: 15 }, (_, i) => {
  const h = (7 + i).toString().padStart(2, '0');
  return `${h}:00`;
});

const STATUS_COLOR_MAP: Record<string, string> = {
  confirmed: 'bg-green-200 border-green-400 text-green-900',
  pending_cash: 'bg-yellow-200 border-yellow-400 text-yellow-900',
  checked_in: 'bg-blue-200 border-blue-400 text-blue-900',
};

interface BookingRaw {
  _id: string;
  bookingCode: string;
  courtId: { name: string } | string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  customerName?: string;
  customerId?: { name: string } | string;
}

function getWeekDates(): Date[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function SchedulePage() {
  const [bookings, setBookings] = useState<BookingRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const weekDates = getWeekDates();

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

  // Filter bookings to current week
  const weekStart = weekDates[0].toISOString().split('T')[0];
  const weekEnd = weekDates[6].toISOString().split('T')[0];
  const weekBookings = bookings.filter((b) => {
    const d = b.date?.split('T')[0];
    return d && d >= weekStart && d <= weekEnd;
  });

  function getBookingAt(dayIndex: number, hour: string): BookingRaw | undefined {
    const dateStr = weekDates[dayIndex].toISOString().split('T')[0];
    return weekBookings.find((b) => {
      const bDate = b.date?.split('T')[0];
      return bDate === dateStr && b.startTime <= hour && b.endTime > hour;
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Jadwal Mingguan</h1>
        <Skeleton variant="card" className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Jadwal Mingguan</h1>
        <p className="text-sm text-gray-500">
          {weekDates[0].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} –{' '}
          {weekDates[6].toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-green-200 border border-green-400" />
          <span className="text-gray-600">Dikonfirmasi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-yellow-200 border border-yellow-400" />
          <span className="text-gray-600">Bayar di Tempat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-blue-200 border border-blue-400" />
          <span className="text-gray-600">Check-in</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded bg-gray-100 border border-gray-300" />
          <span className="text-gray-600">Kosong</span>
        </div>
      </div>

      <Card padding="none" className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-xs">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="sticky left-0 z-10 bg-white px-3 py-2 text-left font-medium text-gray-500">
                Waktu
              </th>
              {DAYS.map((day, i) => (
                <th key={day} className="px-2 py-2 text-center font-medium text-gray-500">
                  <div>{day}</div>
                  <div className="text-[10px] text-gray-400">
                    {weekDates[i].toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour} className="border-b border-gray-100">
                <td className="sticky left-0 z-10 bg-white px-3 py-2 font-mono text-gray-500">
                  {hour}
                </td>
                {DAYS.map((_, dayIndex) => {
                  const booking = getBookingAt(dayIndex, hour);
                  const colorClass = booking
                    ? STATUS_COLOR_MAP[booking.status] ?? 'bg-gray-200 border-gray-400 text-gray-700'
                    : '';
                  return (
                    <td key={dayIndex} className="px-1 py-1">
                      {booking ? (
                        <div
                          className={cn(
                            'rounded border px-1.5 py-1 text-[10px] leading-tight',
                            colorClass,
                          )}
                          title={`${booking.bookingCode} · ${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`}
                        >
                          <span className="font-medium">{booking.bookingCode}</span>
                        </div>
                      ) : (
                        <div className="h-7 rounded bg-gray-50" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
