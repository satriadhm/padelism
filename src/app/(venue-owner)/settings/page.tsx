'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import { X, Plus } from 'lucide-react';

const DAY_LABELS = [
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
  'Minggu',
];
const DAY_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

interface OperatingHour {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface VenueData {
  _id: string;
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  phone: string;
  email: string;
  facilities: string[];
  operatingHours: Record<string, OperatingHour>;
}

export default function VenueSettingsPage() {
  const { data: session } = useSession();
  const [venue, setVenue] = useState<VenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newFacility, setNewFacility] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [operatingHours, setOperatingHours] = useState<Record<string, OperatingHour>>({});

  useEffect(() => {
    const user = session?.user as { venueId?: string } | undefined;
    if (!user?.venueId) return;

    fetch(`/api/venues/${user.venueId}`)
      .then((r) => r.json())
      .then((data) => {
        const v = data.venue ?? data;
        setVenue(v);
        setName(v.name ?? '');
        setDescription(v.description ?? '');
        setStreet(v.address?.street ?? '');
        setCity(v.address?.city ?? '');
        setProvince(v.address?.province ?? '');
        setPostalCode(v.address?.postalCode ?? '');
        setPhone(v.phone ?? '');
        setEmail(v.email ?? '');
        setFacilities(v.facilities ?? []);
        // Initialize operating hours
        const hours: Record<string, OperatingHour> = {};
        DAY_KEYS.forEach((key) => {
          hours[key] = v.operatingHours?.[key] ?? {
            isOpen: true,
            openTime: '07:00',
            closeTime: '22:00',
          };
        });
        setOperatingHours(hours);
      })
      .catch(() => toast.error('Gagal memuat data venue'))
      .finally(() => setLoading(false));
  }, [session]);

  function updateHour(day: string, field: keyof OperatingHour, value: string | boolean) {
    setOperatingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  function addFacility() {
    const trimmed = newFacility.trim();
    if (trimmed && !facilities.includes(trimmed)) {
      setFacilities((prev) => [...prev, trimmed]);
      setNewFacility('');
    }
  }

  function removeFacility(facility: string) {
    setFacilities((prev) => prev.filter((f) => f !== facility));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!venue) return;
    setSaving(true);
    try {
      const body = {
        name,
        description,
        address: { street, city, province, postalCode },
        phone,
        email,
        facilities,
        operatingHours,
      };
      const res = await fetch(`/api/venues/${venue._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Gagal menyimpan');
      }
      toast.success('Pengaturan berhasil disimpan!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Venue</h1>
        <Skeleton variant="card" className="h-64" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan Venue</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card padding="lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Venue</h2>
          <div className="space-y-4">
            <Input label="Nama Venue" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="w-full">
              <label className="mb-1 block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-ring)]"
              />
            </div>
            <Input label="Alamat" value={street} onChange={(e) => setStreet(e.target.value)} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Kota" value={city} onChange={(e) => setCity(e.target.value)} />
              <Input label="Provinsi" value={province} onChange={(e) => setProvince(e.target.value)} />
              <Input label="Kode Pos" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Telepon" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
        </Card>

        {/* Operating Hours */}
        <Card padding="lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Jam Operasional</h2>
          <div className="space-y-3">
            {DAY_KEYS.map((key, i) => (
              <div key={key} className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-100 p-3">
                <label className="flex w-24 items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={operatingHours[key]?.isOpen ?? true}
                    onChange={(e) => updateHour(key, 'isOpen', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[var(--color-brand-600)] focus:ring-[var(--color-brand-ring)]"
                  />
                  {DAY_LABELS[i]}
                </label>
                {operatingHours[key]?.isOpen && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={operatingHours[key]?.openTime ?? '07:00'}
                      onChange={(e) => updateHour(key, 'openTime', e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-ring)]"
                    />
                    <span className="text-sm text-gray-400">–</span>
                    <input
                      type="time"
                      value={operatingHours[key]?.closeTime ?? '22:00'}
                      onChange={(e) => updateHour(key, 'closeTime', e.target.value)}
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-[var(--color-brand-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-ring)]"
                    />
                  </div>
                )}
                {!operatingHours[key]?.isOpen && (
                  <span className="text-sm text-gray-400">Tutup</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Facilities */}
        <Card padding="lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Fasilitas</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            {facilities.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-50)] px-3 py-1 text-sm text-[var(--color-brand-700)]"
              >
                {f}
                <button type="button" onClick={() => removeFacility(f)} className="hover:text-red-500">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newFacility}
              onChange={(e) => setNewFacility(e.target.value)}
              placeholder="Tambah fasilitas (misal: Parkir, WiFi, Kantin)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addFacility();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addFacility}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" loading={saving}>
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
