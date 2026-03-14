'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import SportBadge from '@/components/marketplace/SportBadge';
import { formatCurrency } from '@/lib/utils';

export interface VenueCardProps {
  id: string;
  slug: string;
  name: string;
  city: string;
  image?: string;
  sports: { name: string; slug: string }[];
  rating: number;
  reviewCount: number;
  startingPrice: number;
}

export default function VenueCard({
  slug,
  name,
  city,
  image,
  sports,
  rating,
  reviewCount,
  startingPrice,
}: VenueCardProps) {
  return (
    <Link href={`/venues/${slug}`} className="block">
      <Card padding="none" className="overflow-hidden">
        <div className="relative aspect-[16/10] w-full bg-gray-100">
          {image ? (
            <Image src={image} alt={name} fill className="object-cover" sizes="(max-width:768px) 100vw, 33vw" />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <MapPin className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{name}</h3>

          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            <span>{city}</span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {sports.map((sport) => (
              <SportBadge key={sport.slug} name={sport.name} slug={sport.slug} size="sm" />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              <span className="text-xs text-gray-400">({reviewCount})</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500">Mulai </span>
              <span className="font-semibold text-[#16a34a]">{formatCurrency(startingPrice)}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
