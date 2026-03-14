'use client';

import Badge from '@/components/ui/Badge';
import { formatDate, formatTime, type STATUS_COLORS } from '@/lib/utils';

export interface BookingRow {
  id: string;
  bookingCode: string;
  customerName: string;
  courtName: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  status: keyof typeof STATUS_COLORS;
}

export interface BookingTableProps {
  bookings: BookingRow[];
  onAction?: (id: string, action: string) => void;
  className?: string;
}

export default function BookingTable({ bookings, onAction, className }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-500">Belum ada booking.</div>
    );
  }

  return (
    <div className={className}>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
              <th className="px-4 py-3 font-medium">Kode</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Lapangan</th>
              <th className="px-4 py-3 font-medium">Tanggal</th>
              <th className="px-4 py-3 font-medium">Waktu</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{b.bookingCode}</td>
                <td className="px-4 py-3">{b.customerName}</td>
                <td className="px-4 py-3">{b.courtName}</td>
                <td className="whitespace-nowrap px-4 py-3">{formatDate(b.date)}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {formatTime(b.startTime)} – {formatTime(b.endTime)}
                </td>
                <td className="px-4 py-3">
                  <Badge status={b.status} />
                </td>
                <td className="px-4 py-3">
                  {onAction && (
                    <button
                      type="button"
                      onClick={() => onAction(b.id, 'view')}
                      className="text-[#16a34a] hover:underline"
                    >
                      Detail
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {bookings.map((b) => (
          <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-500">{b.bookingCode}</span>
              <Badge status={b.status} />
            </div>
            <p className="mt-2 font-medium text-gray-900">{b.customerName}</p>
            <p className="text-sm text-gray-600">{b.courtName}</p>
            <div className="mt-2 text-xs text-gray-500">
              <p>{formatDate(b.date)}</p>
              <p>
                {formatTime(b.startTime)} – {formatTime(b.endTime)}
              </p>
            </div>
            {onAction && (
              <button
                type="button"
                onClick={() => onAction(b.id, 'view')}
                className="mt-3 text-sm font-medium text-[#16a34a] hover:underline"
              >
                Lihat Detail
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
