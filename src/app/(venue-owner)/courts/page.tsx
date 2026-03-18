'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, MapPin } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { formatCurrency } from '@/lib/utils';

interface Court {
  _id: string;
  name: string;
  sportType: { name: string; icon: string; color: string } | string;
  isActive: boolean;
  isIndoor: boolean;
  floorType: string;
  pricing: { basePrice: number; pricingRules: { durationPricing: { price: number }[] }[] };
}

export default function CourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourts() {
      try {
        const res = await fetch('/api/courts');
        if (res.ok) {
          const data = await res.json();
          setCourts(data.courts ?? data ?? []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchCourts();
  }, []);

  function getMinPrice(court: Court): number {
    const prices = court.pricing?.pricingRules?.flatMap((r) =>
      r.durationPricing?.map((d) => d.price) ?? [],
    ) ?? [];
    return prices.length > 0 ? Math.min(...prices) : court.pricing?.basePrice ?? 0;
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Lapangan</h1>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} variant="card" className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Lapangan</h1>
        <Link href="/courts/new">
          <Button size="md">
            <Plus className="h-4 w-4" />
            Tambah Lapangan
          </Button>
        </Link>
      </div>

      {courts.length === 0 ? (
        <Card className="py-16 text-center">
          <MapPin className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">Belum ada lapangan.</p>
          <Link
            href="/courts/new"
            className="mt-3 inline-block text-sm font-medium text-[var(--color-brand-700)] hover:underline"
          >
            Tambah lapangan pertama
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courts.map((court) => {
            const sport = typeof court.sportType === 'object' ? court.sportType : null;
            return (
              <Card key={court._id} className="flex flex-col justify-between">
                <div>
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{court.name}</h3>
                      {sport && (
                        <p className="mt-0.5 text-sm text-gray-500">
                          {sport.icon} {sport.name}
                        </p>
                      )}
                    </div>
                    <Badge variant={court.isActive ? 'success' : 'default'}>
                      {court.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <p>{court.isIndoor ? '🏠 Indoor' : '🌤️ Outdoor'}</p>
                    {court.floorType && <p>Lantai: {court.floorType}</p>}
                    <p className="font-medium text-gray-900">
                      Mulai {formatCurrency(getMinPrice(court))}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-3">
                  <Link href={`/courts/${court._id}/edit`}>
                    <Button variant="ghost" size="sm" className="w-full">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
