'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, Copy, CalendarDays } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface BookingDetail {
  _id: string;
  bookingCode: string;
  courtId: { name?: string } | string;
  venueId: { name?: string } | string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  qrCode?: string;
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id');

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) throw new Error('Booking not found');
        const data = await res.json();
        setBooking(data);
      } catch {
        // Booking not found
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  function handleCopyCode() {
    if (booking?.bookingCode) {
      navigator.clipboard.writeText(booking.bookingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const courtName =
    typeof booking?.courtId === 'object' ? booking.courtId.name : 'Lapangan';
  const venueName =
    typeof booking?.venueId === 'object' ? booking.venueId.name : 'Venue';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#16a34a] border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <CalendarDays className="h-16 w-16 text-gray-300" />
        <h2 className="mt-4 text-lg font-semibold text-gray-700">Booking tidak ditemukan</h2>
        <Link href="/">
          <Button variant="secondary" className="mt-4">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Success header */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-9 w-9 text-[#16a34a]" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Booking Berhasil!</h1>
          <p className="mt-1 text-sm text-gray-500">
            Booking Anda telah dibuat. Simpan kode booking berikut.
          </p>
        </div>

        {/* Booking Code Card */}
        <Card padding="lg" className="mb-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Kode Booking</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="text-3xl font-bold tracking-wider text-gray-900">
              {booking.bookingCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              title="Salin kode"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
          {copied && (
            <p className="mt-1 text-xs text-[#16a34a]">Kode berhasil disalin!</p>
          )}

          {/* QR Code display */}
          {booking.qrCode ? (
            <div className="mt-4">
              <Image
                src={booking.qrCode}
                alt="QR Code Booking"
                width={128}
                height={128}
                className="mx-auto"
              />
            </div>
          ) : (
            <div className="mx-auto mt-4 flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
              <div className="text-center">
                <p className="text-[10px] font-mono text-gray-400">QR</p>
                <p className="text-lg font-bold text-gray-400">{booking.bookingCode}</p>
              </div>
            </div>
          )}
        </Card>

        {/* Details Card */}
        <Card padding="lg" className="mb-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">Detail Booking</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Lapangan</dt>
              <dd className="font-medium text-gray-900">{courtName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Venue</dt>
              <dd className="font-medium text-gray-900">{venueName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Tanggal</dt>
              <dd className="font-medium text-gray-900">{formatDate(booking.date)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Waktu</dt>
              <dd className="font-medium text-gray-900">
                {booking.startTime} - {booking.endTime} WIB
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Durasi</dt>
              <dd className="font-medium text-gray-900">{booking.durationMinutes} menit</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status</dt>
              <dd><Badge status={booking.status} /></dd>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between">
              <dt className="font-semibold text-gray-900">Total</dt>
              <dd className="font-bold text-[#16a34a]">{formatCurrency(booking.totalAmount)}</dd>
            </div>
          </dl>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Link href="/my-bookings" className="block">
            <Button className="w-full">
              <CalendarDays className="h-4 w-4" />
              Lihat Booking Saya
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="secondary" className="w-full">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
