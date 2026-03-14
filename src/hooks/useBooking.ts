'use client';

import { useState } from 'react';

interface CreateBookingParams {
  courtId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  paymentMethod: 'midtrans' | 'cash';
  notes?: string;
}

interface BookingResult {
  _id: string;
  bookingCode: string;
  status: string;
  totalAmount: number;
}

export function useBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (params: CreateBookingParams): Promise<BookingResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'SLOT_TAKEN') {
          setError('Slot sudah dipesan oleh orang lain. Silakan pilih slot lain.');
        } else {
          setError(data.error || 'Gagal membuat booking');
        }
        return null;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, reason?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Gagal membatalkan booking');
        return false;
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, cancelBooking, loading, error };
}
