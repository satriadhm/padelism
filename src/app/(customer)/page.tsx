import Link from 'next/link';
import Image from 'next/image';
import { Search, MapPin, Star, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import { SPORT_COLORS } from '@/lib/utils';

interface Sport {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

interface Venue {
  _id: string;
  slug: string;
  name: string;
  address: { city: string };
  images: string[];
  rating: number;
  reviewCount: number;
}

async function getSports(): Promise<Sport[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/admin/sports`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getVenues(): Promise<Venue[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/venues?limit=6`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

const sportEmoji: Record<string, string> = {
  badminton: '🏸',
  futsal: '⚽',
  basketball: '🏀',
  tennis: '🎾',
  volleyball: '🏐',
  'table-tennis': '🏓',
};

export default async function HomePage() {
  const [sports, venues] = await Promise.all([getSports(), getVenues()]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-brand-600)] via-[var(--color-brand-700)] to-[#0f3d27] px-4 pb-16 pt-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white" />
          <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            Book Your Court Instantly
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-green-100 sm:text-lg">
            Temukan dan pesan lapangan olahraga favoritmu. Badminton, futsal, basket, dan lainnya — semua dalam satu platform.
          </p>

          {/* Search bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <Link
              href="/venues"
              className="flex items-center gap-3 rounded-xl bg-white/95 px-5 py-4 shadow-lg backdrop-blur transition-shadow hover:shadow-xl"
            >
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <span className="text-left text-gray-500">
                Cari venue, olahraga, atau kota...
              </span>
              <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-[var(--color-brand-700)]" />
            </Link>
          </div>
        </div>
      </section>

      {/* Sport Pills */}
      {sports.length > 0 && (
        <section className="px-4 py-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Pilih Olahraga</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {sports.map((sport) => {
                const color = SPORT_COLORS[sport.slug] ?? sport.color ?? '#6B7280';
                return (
                  <Link
                    key={sport._id}
                    href={`/venues?sport=${sport.slug}`}
                    className="flex shrink-0 items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-semibold transition-colors hover:shadow-md"
                    style={{
                      borderColor: color,
                      color,
                      backgroundColor: `${color}10`,
                    }}
                  >
                    <span className="text-lg">{sportEmoji[sport.slug] ?? '🏅'}</span>
                    {sport.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Venues */}
      <section className="px-4 pb-24 pt-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Venue Populer</h2>
            <Link
              href="/venues"
              className="flex items-center gap-1 text-sm font-medium text-[var(--color-brand-700)] hover:underline"
            >
              Lihat semua
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {venues.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {venues.map((venue) => (
                <Link key={venue._id} href={`/venues/${venue.slug}`} className="block">
                  <Card padding="none" className="overflow-hidden">
                    <div className="relative aspect-[16/10] w-full bg-gray-200">
                      {venue.images?.[0] ? (
                        <Image
                          src={venue.images[0]}
                          alt={venue.name}
                          fill
                          className="object-cover"
                          sizes="(max-width:768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">
                          <MapPin className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{venue.name}</h3>
                      <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3.5 w-3.5" />
                        <span>{venue.address?.city ?? 'Indonesia'}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{(venue.rating ?? 0).toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({venue.reviewCount ?? 0})</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="py-12 text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-gray-500">Belum ada venue tersedia.</p>
              <p className="text-sm text-gray-400">Venue akan muncul di sini setelah disetujui admin.</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
