'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react';
import VenueCard, { type VenueCardProps } from '@/components/marketplace/VenueCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { SPORT_COLORS } from '@/lib/utils';

const sportOptions = [
  { label: 'Badminton', value: 'badminton' },
  { label: 'Futsal', value: 'futsal' },
  { label: 'Basket', value: 'basketball' },
  { label: 'Tenis', value: 'tennis' },
  { label: 'Voli', value: 'volleyball' },
  { label: 'Tenis Meja', value: 'table-tennis' },
];

function VenuesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [venues, setVenues] = useState<VenueCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [searchText, setSearchText] = useState(searchParams.get('search') ?? '');
  const [selectedSports, setSelectedSports] = useState<string[]>(
    searchParams.get('sport') ? [searchParams.get('sport')!] : [],
  );
  const [showFilters, setShowFilters] = useState(false);

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.set('city', city);
      if (searchText) params.set('search', searchText);
      if (selectedSports.length === 1) params.set('sport', selectedSports[0]);

      const res = await fetch(`/api/venues?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      const mapped: VenueCardProps[] = (Array.isArray(data) ? data : []).map(
        (v: Record<string, unknown>) => ({
          id: String(v._id ?? ''),
          slug: String(v.slug ?? ''),
          name: String(v.name ?? ''),
          city: (v.address as Record<string, unknown>)?.city
            ? String((v.address as Record<string, unknown>).city)
            : 'Indonesia',
          image: Array.isArray(v.images) && v.images.length > 0 ? String(v.images[0]) : undefined,
          sports: Array.isArray(v.courts)
            ? (v.courts as Record<string, string>[]).map((c) => ({
                name: c.sportType ?? '',
                slug: c.sportType ?? '',
              }))
            : [],
          rating: Number(v.rating ?? 0),
          reviewCount: Number(v.reviewCount ?? 0),
          startingPrice: Number(v.startingPrice ?? 0),
        }),
      );

      setVenues(mapped);
    } catch {
      setVenues([]);
    } finally {
      setLoading(false);
    }
  }, [city, searchText, selectedSports]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  function toggleSport(slug: string) {
    setSelectedSports((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (searchText) params.set('search', searchText);
    if (selectedSports.length === 1) params.set('sport', selectedSports[0]);
    router.push(`/venues?${params.toString()}`);
    fetchVenues();
  }

  function clearFilters() {
    setCity('');
    setSearchText('');
    setSelectedSports([]);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari venue..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside
            className={`${
              showFilters ? 'block' : 'hidden'
            } w-full shrink-0 sm:block sm:w-56`}
          >
            <Card padding="md" className="sticky top-20 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Filter</h3>
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#16a34a] hover:underline"
                >
                  Reset
                </button>
              </div>

              <Input
                label="Kota"
                name="city"
                placeholder="Contoh: Jakarta"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">Jenis Olahraga</p>
                <div className="space-y-2">
                  {sportOptions.map((sport) => (
                    <label
                      key={sport.value}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSports.includes(sport.value)}
                        onChange={() => toggleSport(sport.value)}
                        className="h-4 w-4 rounded border-gray-300 text-[#16a34a] focus:ring-[#16a34a]"
                      />
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: SPORT_COLORS[sport.value] ?? '#6B7280' }}
                      />
                      {sport.label}
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full" size="sm">
                Terapkan Filter
              </Button>
            </Card>
          </aside>

          {/* Venue Grid */}
          <div className="flex-1">
            {/* Active filter chips */}
            {(city || selectedSports.length > 0) && (
              <div className="mb-4 flex flex-wrap gap-2">
                {city && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-[#16a34a]">
                    📍 {city}
                    <button onClick={() => setCity('')}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedSports.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-[#16a34a]"
                  >
                    {sportOptions.find((o) => o.value === s)?.label ?? s}
                    <button onClick={() => toggleSport(s)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 animate-pulse rounded-xl bg-gray-200"
                  />
                ))}
              </div>
            ) : venues.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {venues.map((venue) => (
                  <VenueCard key={venue.id} {...venue} />
                ))}
              </div>
            ) : (
              <Card className="py-16 text-center">
                <MapPin className="mx-auto h-14 w-14 text-gray-300" />
                <h3 className="mt-4 text-lg font-semibold text-gray-700">
                  Tidak ada venue ditemukan
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Coba ubah filter pencarian atau cari di kota lain.
                </p>
                <Button variant="secondary" className="mt-4" onClick={clearFilters}>
                  Reset Filter
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VenuesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#16a34a] border-t-transparent" />
        </div>
      }
    >
      <VenuesContent />
    </Suspense>
  );
}
