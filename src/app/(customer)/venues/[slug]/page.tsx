import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Clock, Phone, Mail, ChevronRight, Wifi, Car, Coffee } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SportBadge from '@/components/marketplace/SportBadge';
import { formatCurrency } from '@/lib/utils';

interface OperatingHour {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface Court {
  _id: string;
  name: string;
  sportType: string;
  description?: string;
  isIndoor: boolean;
  floorType?: string;
  capacity?: number;
  isActive: boolean;
  pricing: { basePrice: number }[];
}

interface Venue {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  address: { street?: string; city: string; state?: string; zipCode?: string };
  phone?: string;
  email?: string;
  images: string[];
  facilities: string[];
  operatingHours: OperatingHour[];
  rating: number;
  reviewCount: number;
  courts?: Court[];
}

const facilityIcons: Record<string, React.ReactNode> = {
  wifi: <Wifi className="h-4 w-4" />,
  parking: <Car className="h-4 w-4" />,
  kantin: <Coffee className="h-4 w-4" />,
  cafeteria: <Coffee className="h-4 w-4" />,
};

const dayLabels: Record<string, string> = {
  monday: 'Senin',
  tuesday: 'Selasa',
  wednesday: 'Rabu',
  thursday: 'Kamis',
  friday: 'Jumat',
  saturday: 'Sabtu',
  sunday: 'Minggu',
};

async function getVenue(slug: string): Promise<Venue | null> {
  try {
    // Try fetching by slug first, then by ID as fallback
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/venues/${slug}`, { cache: 'no-store' });
    if (res.ok) return res.json();

    // The API expects venueId (MongoDB _id), so the slug approach may fail.
    // Return null if not found.
    return null;
  } catch {
    return null;
  }
}

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const venue = await getVenue(slug);

  if (!venue) notFound();

  const fullAddress = [venue.address?.street, venue.address?.city, venue.address?.state]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Hero Image */}
      <div className="relative h-56 w-full bg-gray-200 sm:h-72 md:h-80">
        {venue.images?.length > 0 ? (
          <Image
            src={venue.images[0]}
            alt={venue.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            <MapPin className="h-16 w-16" />
          </div>
        )}
        {/* Image gallery dots */}
        {venue.images?.length > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
            {venue.images.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === 0 ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4">
        {/* Venue Info */}
        <Card className="-mt-8 relative z-10" padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{fullAddress}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{(venue.rating ?? 0).toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({venue.reviewCount ?? 0} ulasan)</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              {venue.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  {venue.phone}
                </div>
              )}
              {venue.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {venue.email}
                </div>
              )}
            </div>
          </div>

          {venue.description && (
            <p className="mt-4 text-sm leading-relaxed text-gray-600">{venue.description}</p>
          )}
        </Card>

        {/* Facilities */}
        {venue.facilities?.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Fasilitas</h2>
            <div className="flex flex-wrap gap-2">
              {venue.facilities.map((facility) => (
                <span
                  key={facility}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
                >
                  {facilityIcons[facility.toLowerCase()] ?? (
                    <span className="h-4 w-4 text-center text-xs">✓</span>
                  )}
                  {facility}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Operating Hours */}
        {venue.operatingHours?.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Jam Operasional</h2>
            <Card padding="none">
              <table className="w-full text-sm">
                <tbody>
                  {venue.operatingHours.map((oh) => (
                    <tr key={oh.day} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-2.5 font-medium text-gray-700">
                        {dayLabels[oh.day.toLowerCase()] ?? oh.day}
                      </td>
                      <td className="px-4 py-2.5 text-right text-gray-600">
                        {oh.isClosed ? (
                          <span className="text-red-500">Tutup</span>
                        ) : (
                          <span className="flex items-center justify-end gap-1">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {oh.openTime} - {oh.closeTime}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        )}

        {/* Courts */}
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Lapangan Tersedia</h2>
          {venue.courts && venue.courts.length > 0 ? (
            <div className="space-y-3">
              {venue.courts
                .filter((c) => c.isActive)
                .map((court) => {
                  const lowestPrice =
                    court.pricing?.length > 0
                      ? Math.min(...court.pricing.map((p) => p.basePrice))
                      : 0;

                  return (
                    <Card key={court._id} padding="md">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{court.name}</h3>
                            <SportBadge name={court.sportType} slug={court.sportType} size="sm" />
                          </div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                            {court.isIndoor && <Badge variant="info">Indoor</Badge>}
                            {court.floorType && (
                              <span className="rounded bg-gray-100 px-2 py-0.5">
                                {court.floorType}
                              </span>
                            )}
                            {court.capacity && (
                              <span className="rounded bg-gray-100 px-2 py-0.5">
                                Maks {court.capacity} orang
                              </span>
                            )}
                          </div>
                          {court.description && (
                            <p className="mt-1 text-sm text-gray-500">{court.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          {lowestPrice > 0 && (
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Mulai dari</p>
                              <p className="font-semibold text-[var(--color-brand-700)]">
                                {formatCurrency(lowestPrice)}
                              </p>
                            </div>
                          )}
                          <Link href={`/booking/${court._id}`}>
                            <Button size="sm">
                              Pesan
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card className="py-8 text-center">
              <p className="text-gray-500">Belum ada lapangan tersedia di venue ini.</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
