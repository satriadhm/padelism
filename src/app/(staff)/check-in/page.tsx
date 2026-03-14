'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, QrCode, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate, formatTime, formatCurrency } from '@/lib/utils';

interface BookingDetail {
  _id: string;
  bookingCode: string;
  customerId: { name: string; email: string } | string;
  courtId: { name: string } | string;
  venueId: { name: string } | string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: string;
  paymentMethod: string;
  totalAmount: number;
}

export default function CheckInPage() {
  const [code, setCode] = useState('');
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [searching, setSearching] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Masukkan kode booking');
      return;
    }
    setSearching(true);
    setBooking(null);
    setSuccess(false);
    try {
      const res = await fetch(`/api/bookings?code=${encodeURIComponent(code.trim())}`);
      if (!res.ok) throw new Error('Booking tidak ditemukan');
      const data = await res.json();
      const found = data.bookings?.[0] ?? data.booking ?? data;
      if (!found?._id) throw new Error('Booking tidak ditemukan');
      setBooking(found);
    } catch {
      toast.error('Booking tidak ditemukan');
    } finally {
      setSearching(false);
    }
  }

  async function handleCheckIn() {
    if (!booking) return;
    setCheckingIn(true);
    try {
      const res = await fetch(`/api/bookings/${booking._id}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Gagal melakukan check-in');
      }
      setSuccess(true);
      setBooking((prev) => (prev ? { ...prev, status: 'checked_in' } : prev));
      toast.success('Check-in berhasil!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal melakukan check-in');
    } finally {
      setCheckingIn(false);
    }
  }

  const customerName = booking && typeof booking.customerId === 'object' ? booking.customerId.name : '-';
  const courtName = booking && typeof booking.courtId === 'object' ? booking.courtId.name : '-';
  const canCheckIn = booking && ['confirmed', 'pending_cash'].includes(booking.status);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <QrCode className="mx-auto mb-2 h-10 w-10 text-[#16a34a]" />
        <h1 className="text-2xl font-bold text-gray-900">Check-in</h1>
        <p className="text-sm text-gray-500">Masukkan kode booking untuk melakukan check-in</p>
      </div>

      {/* Search */}
      <Card padding="lg">
        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Kode Booking (misal: BK-XXXXXX)"
            className="font-mono"
          />
          <Button type="submit" loading={searching} className="shrink-0">
            <Search className="h-4 w-4" />
            Cari
          </Button>
        </form>
      </Card>

      {/* Booking Detail */}
      {booking && (
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-lg font-bold text-gray-900">{booking.bookingCode}</h2>
            <Badge status={booking.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Customer</p>
              <p className="font-medium text-gray-900">{customerName}</p>
            </div>
            <div>
              <p className="text-gray-500">Lapangan</p>
              <p className="font-medium text-gray-900">{courtName}</p>
            </div>
            <div>
              <p className="text-gray-500">Tanggal</p>
              <p className="font-medium text-gray-900">{formatDate(booking.date)}</p>
            </div>
            <div>
              <p className="text-gray-500">Waktu</p>
              <p className="font-medium text-gray-900">
                {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Pembayaran</p>
              <p className="font-medium text-gray-900">
                {booking.paymentMethod === 'cash' ? 'Bayar di Tempat' : 'Online'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Total</p>
              <p className="font-medium text-gray-900">{formatCurrency(booking.totalAmount)}</p>
            </div>
          </div>

          {success ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 p-4 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Check-in berhasil!</span>
            </div>
          ) : canCheckIn ? (
            <Button
              onClick={handleCheckIn}
              loading={checkingIn}
              className="w-full"
              size="lg"
            >
              <CheckCircle2 className="h-5 w-5" />
              Konfirmasi Check-in
            </Button>
          ) : (
            <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
              {booking.status === 'checked_in'
                ? 'Customer sudah check-in'
                : 'Booking tidak dapat di-check-in dengan status saat ini'}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
