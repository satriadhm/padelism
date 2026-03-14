'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Calendar,
  Clock,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  MapPin,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SlotPicker, { type Slot } from '@/components/booking/SlotPicker';
import BookingSummary from '@/components/booking/BookingSummary';
import { use } from 'react';

interface CourtDetail {
  _id: string;
  name: string;
  sportType: string;
  venue?: { _id: string; name: string; slug: string };
}

const DURATION_OPTIONS = [
  { label: '60 menit', value: 60 },
  { label: '90 menit', value: 90 },
  { label: '120 menit', value: 120 },
];

const STEPS = [
  { label: 'Tanggal', icon: Calendar },
  { label: 'Durasi', icon: Clock },
  { label: 'Jam', icon: Clock },
  { label: 'Pembayaran', icon: CreditCard },
  { label: 'Konfirmasi', icon: CheckCircle2 },
];

export default function BookingPage({
  params,
}: {
  params: Promise<{ courtId: string }>;
}) {
  const { courtId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [court, setCourt] = useState<CourtDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Booking state
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(60);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'midtrans' | 'cash'>('midtrans');
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Fetch court details
  useEffect(() => {
    async function fetchCourt() {
      try {
        const res = await fetch(`/api/courts/${courtId}`);
        if (!res.ok) throw new Error('Court not found');
        const data = await res.json();
        setCourt(data);
      } catch {
        setError('Lapangan tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    }
    fetchCourt();
  }, [courtId]);

  // Fetch available slots when date + duration change
  const fetchSlots = useCallback(async () => {
    if (!date || !duration) return;
    setSlotsLoading(true);
    try {
      const params = new URLSearchParams({ date });
      const res = await fetch(`/api/courts/${courtId}/slots?${params}`);
      if (!res.ok) throw new Error('Failed to fetch slots');
      const data = await res.json();
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [courtId, date, duration]);

  useEffect(() => {
    if (date && duration) {
      setSelectedSlot(null);
      fetchSlots();
    }
  }, [date, duration, fetchSlots]);

  function canGoNext(): boolean {
    switch (step) {
      case 0: return !!date;
      case 1: return !!duration;
      case 2: return !!selectedSlot;
      case 3: return !!paymentMethod;
      default: return false;
    }
  }

  function goNext() {
    if (canGoNext() && step < STEPS.length - 1) setStep(step + 1);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  async function handleSubmit() {
    if (!session) {
      router.push('/login');
      return;
    }
    if (!selectedSlot || !court) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtId: court._id,
          date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          durationMinutes: duration,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Gagal membuat booking. Silakan coba lagi.');
        return;
      }

      router.push(`/booking/confirmation?id=${data._id ?? data.bookingId ?? ''}`);
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  // Today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#16a34a] border-t-transparent" />
      </div>
    );
  }

  if (error && !court) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <MapPin className="h-16 w-16 text-gray-300" />
        <p className="mt-4 text-lg font-semibold text-gray-700">{error}</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.back()}>
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft className="h-4 w-4" /> Kembali
          </button>
          <h1 className="text-xl font-bold text-gray-900">Pesan Lapangan</h1>
          {court && (
            <p className="text-sm text-gray-500">
              {court.name} — {court.venue?.name ?? ''}
            </p>
          )}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={`flex flex-1 flex-col items-center gap-1 text-xs font-medium ${
                  i <= step ? 'text-[#16a34a]' : 'text-gray-400'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    i < step
                      ? 'bg-[#16a34a] text-white'
                      : i === step
                        ? 'border-2 border-[#16a34a] text-[#16a34a]'
                        : 'border-2 border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="hidden sm:block">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="mx-auto max-w-2xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {/* Step 0: Date */}
        {step === 0 && (
          <Card padding="lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Pilih Tanggal</h2>
            <input
              type="date"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
            />
          </Card>
        )}

        {/* Step 1: Duration */}
        {step === 1 && (
          <Card padding="lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Pilih Durasi</h2>
            <div className="grid grid-cols-3 gap-3">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={`rounded-lg border-2 px-4 py-4 text-center text-sm font-medium transition-colors ${
                    duration === opt.value
                      ? 'border-[#16a34a] bg-green-50 text-[#16a34a]'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Clock className="mx-auto mb-1 h-5 w-5" />
                  {opt.label}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Step 2: Slot Selection */}
        {step === 2 && (
          <Card padding="lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Pilih Jam</h2>
            {slotsLoading ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-200" />
                ))}
              </div>
            ) : slots.length > 0 ? (
              <SlotPicker
                slots={slots}
                selectedSlot={selectedSlot}
                onSelect={setSelectedSlot}
              />
            ) : (
              <div className="py-8 text-center">
                <Clock className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-2 text-sm text-gray-500">
                  Tidak ada slot tersedia untuk tanggal dan durasi yang dipilih.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Step 3: Payment Method */}
        {step === 3 && (
          <div className="space-y-4">
            <Card padding="lg">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Metode Pembayaran</h2>
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                    paymentMethod === 'midtrans'
                      ? 'border-[#16a34a] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="midtrans"
                    checked={paymentMethod === 'midtrans'}
                    onChange={() => setPaymentMethod('midtrans')}
                    className="h-4 w-4 text-[#16a34a] focus:ring-[#16a34a]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Transfer Online (Midtrans)</p>
                    <p className="text-xs text-gray-500">
                      Bayar via bank transfer, e-wallet, atau kartu kredit
                    </p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                    paymentMethod === 'cash'
                      ? 'border-[#16a34a] bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="h-4 w-4 text-[#16a34a] focus:ring-[#16a34a]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bayar di Tempat (Cash)</p>
                    <p className="text-xs text-gray-500">
                      Bayar langsung saat datang ke venue
                    </p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Summary */}
            {selectedSlot && court && (
              <BookingSummary
                courtName={court.name}
                venueName={court.venue?.name ?? ''}
                date={date}
                startTime={selectedSlot.startTime}
                endTime={selectedSlot.endTime}
                durationMinutes={duration}
                paymentMethod={paymentMethod}
                totalPrice={selectedSlot.price}
              />
            )}
          </div>
        )}

        {/* Step 4: Final Confirmation */}
        {step === 4 && selectedSlot && court && (
          <div className="space-y-4">
            <BookingSummary
              courtName={court.name}
              venueName={court.venue?.name ?? ''}
              date={date}
              startTime={selectedSlot.startTime}
              endTime={selectedSlot.endTime}
              durationMinutes={duration}
              paymentMethod={paymentMethod}
              totalPrice={selectedSlot.price}
            />

            <Card padding="lg" className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-[#16a34a]" />
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                Konfirmasi Booking Anda
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Pastikan semua detail sudah benar sebelum melanjutkan.
              </p>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <Button variant="secondary" onClick={goBack}>
              <ChevronLeft className="h-4 w-4" /> Kembali
            </Button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <Button onClick={goNext} disabled={!canGoNext()}>
              Lanjut <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting}>
              Konfirmasi & Pesan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
