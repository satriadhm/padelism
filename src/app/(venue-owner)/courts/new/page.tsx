'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface SportType {
  _id: string;
  name: string;
  icon: string;
}

interface DurationPricing {
  durationMinutes: number;
  price: number;
}

interface PricingRule {
  name: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  durationPricing: DurationPricing[];
}

const DAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const DURATION_OPTIONS = [60, 90, 120];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];

function generateSlotTimes(start = '07:00', end = '21:00'): string[] {
  const times: string[] = [];
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let mins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  while (mins <= endMins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    times.push(`${h}:${m}`);
    mins += 60;
  }
  return times;
}

const EMPTY_RULE: PricingRule = {
  name: '',
  daysOfWeek: [],
  startTime: '07:00',
  endTime: '21:00',
  durationPricing: DURATION_OPTIONS.map((d) => ({ durationMinutes: d, price: 0 })),
};

export default function NewCourtPage() {
  const router = useRouter();
  const [sports, setSports] = useState<SportType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [sportTypeId, setSportTypeId] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [floorType, setFloorType] = useState('');
  const [isIndoor, setIsIndoor] = useState(true);
  const [cashOnArrival, setCashOnArrival] = useState(false);
  const [allowedDurations, setAllowedDurations] = useState<number[]>([60]);
  const [bufferTime, setBufferTime] = useState(0);
  const [minAdvanceBooking, setMinAdvanceBooking] = useState(1);
  const [maxAdvanceBooking, setMaxAdvanceBooking] = useState(14);
  const [slotStartTimes, setSlotStartTimes] = useState<string[]>(generateSlotTimes());
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([{ ...EMPTY_RULE, name: 'Reguler' }]);

  useEffect(() => {
    fetch('/api/admin/sports')
      .then((r) => r.json())
      .then((d) => setSports(d.sports ?? d ?? []))
      .catch(() => {});
  }, []);

  function toggleDuration(dur: number) {
    setAllowedDurations((prev) =>
      prev.includes(dur) ? prev.filter((d) => d !== dur) : [...prev, dur].sort(),
    );
  }

  function toggleSlotTime(time: string) {
    setSlotStartTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time].sort(),
    );
  }

  function updateRule(index: number, field: string, value: unknown) {
    setPricingRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  }

  function toggleRuleDay(index: number, day: number) {
    setPricingRules((prev) =>
      prev.map((r, i) =>
        i === index
          ? {
              ...r,
              daysOfWeek: r.daysOfWeek.includes(day)
                ? r.daysOfWeek.filter((d) => d !== day)
                : [...r.daysOfWeek, day].sort(),
            }
          : r,
      ),
    );
  }

  function updateDurationPrice(ruleIndex: number, durIndex: number, price: number) {
    setPricingRules((prev) =>
      prev.map((r, i) =>
        i === ruleIndex
          ? {
              ...r,
              durationPricing: r.durationPricing.map((dp, j) =>
                j === durIndex ? { ...dp, price } : dp,
              ),
            }
          : r,
      ),
    );
  }

  function addRule() {
    setPricingRules((prev) => [...prev, { ...EMPTY_RULE }]);
  }

  function removeRule(index: number) {
    setPricingRules((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !sportTypeId) {
      toast.error('Nama dan jenis olahraga wajib diisi');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name,
        sportType: sportTypeId,
        description,
        capacity,
        floorType,
        isIndoor,
        cashOnArrival,
        slotConfig: {
          allowedDurations,
          defaultDuration: allowedDurations[0],
          slotStartTimes,
          bufferTime,
          minAdvanceBooking,
          maxAdvanceBooking,
        },
        pricing: {
          basePrice: pricingRules[0]?.durationPricing[0]?.price ?? 0,
          pricingRules,
        },
      };
      const res = await fetch('/api/courts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Gagal menyimpan');
      }
      toast.success('Lapangan berhasil ditambahkan!');
      router.push('/courts');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Lapangan</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card padding="lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Dasar</h2>
          <div className="space-y-4">
            <Input label="Nama Lapangan" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">Jenis Olahraga</label>
              <select
                value={sportTypeId}
                onChange={(e) => setSportTypeId(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-ring)]"
                required
              >
                <option value="">Pilih olahraga</option>
                {sports.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-ring)]"
              />
            </div>
          </div>
        </Card>

        {/* Physical Details */}
        <Card padding="lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Detail Fisik</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Kapasitas"
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
            />
            <Input
              label="Jenis Lantai"
              value={floorType}
              onChange={(e) => setFloorType(e.target.value)}
              placeholder="Vinyl, Semen, Rumput Sintetis..."
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={isIndoor}
                onChange={(e) => setIsIndoor(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-ring)]"
              />
              Indoor
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={cashOnArrival}
                onChange={(e) => setCashOnArrival(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-ring)]"
              />
              Bayar di Tempat (Cash)
            </label>
          </div>
        </Card>

        {/* Slot Configuration */}
        <Card padding="lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Konfigurasi Slot</h2>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Durasi yang Diizinkan</label>
              <div className="flex flex-wrap gap-3">
                {DURATION_OPTIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => toggleDuration(dur)}
                    className={cn(
                      'rounded-lg border px-4 py-2 text-sm font-medium transition-colors',
                      allowedDurations.includes(dur)
                        ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                        : 'border-gray-300 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {dur} menit
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Waktu Buffer</label>
                <select
                  value={bufferTime}
                  onChange={(e) => setBufferTime(Number(e.target.value))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-ring)]"
                >
                  {BUFFER_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b} menit
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Min. Booking Muka (hari)"
                type="number"
                min={0}
                value={minAdvanceBooking}
                onChange={(e) => setMinAdvanceBooking(Number(e.target.value))}
              />
              <Input
                label="Max. Booking Muka (hari)"
                type="number"
                min={1}
                value={maxAdvanceBooking}
                onChange={(e) => setMaxAdvanceBooking(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Jam Mulai Slot</label>
              <div className="flex flex-wrap gap-2">
                {generateSlotTimes().map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => toggleSlotTime(time)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                      slotStartTimes.includes(time)
                        ? 'border-[var(--color-brand-600)] bg-[var(--color-brand-50)] text-[var(--color-brand-700)]'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-50',
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Pricing Rules */}
        <Card padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Aturan Harga</h2>
            <Button type="button" variant="secondary" size="sm" onClick={addRule}>
              + Tambah Aturan
            </Button>
          </div>

          <div className="space-y-6">
            {pricingRules.map((rule, ri) => (
              <div key={ri} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Input
                    value={rule.name}
                    onChange={(e) => updateRule(ri, 'name', e.target.value)}
                    placeholder="Nama aturan (misal: Weekend)"
                    className="max-w-xs"
                  />
                  {pricingRules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(ri)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium text-gray-500">Hari</label>
                  <div className="flex flex-wrap gap-2">
                    {DAY_LABELS.map((day, di) => (
                      <button
                        key={di}
                        type="button"
                        onClick={() => toggleRuleDay(ri, di)}
                        className={cn(
                          'h-9 w-9 rounded-full text-xs font-medium transition-colors',
                          rule.daysOfWeek.includes(di)
                            ? 'bg-[var(--color-brand-600)] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-4">
                  <Input
                    label="Jam Mulai"
                    type="time"
                    value={rule.startTime}
                    onChange={(e) => updateRule(ri, 'startTime', e.target.value)}
                  />
                  <Input
                    label="Jam Selesai"
                    type="time"
                    value={rule.endTime}
                    onChange={(e) => updateRule(ri, 'endTime', e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Harga per Durasi</label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {rule.durationPricing.map((dp, di) => (
                      <Input
                        key={di}
                        label={`${dp.durationMinutes} menit`}
                        type="number"
                        min={0}
                        value={dp.price || ''}
                        onChange={(e) => updateDurationPrice(ri, di, Number(e.target.value))}
                        placeholder="Rp"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" loading={submitting}>
            Simpan Lapangan
          </Button>
        </div>
      </form>
    </div>
  );
}
