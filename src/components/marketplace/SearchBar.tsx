'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchBarProps {
  city: string;
  onCityChange: (value: string) => void;
  sport: string;
  onSportChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
}

const sportOptions = [
  { label: 'Semua Olahraga', value: '' },
  { label: 'Badminton', value: 'badminton' },
  { label: 'Futsal', value: 'futsal' },
  { label: 'Basket', value: 'basketball' },
  { label: 'Tenis', value: 'tennis' },
  { label: 'Voli', value: 'volleyball' },
  { label: 'Tenis Meja', value: 'table-tennis' },
];

export default function SearchBar({
  city,
  onCityChange,
  sport,
  onSportChange,
  date,
  onDateChange,
  onSubmit,
  className,
}: SearchBarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-end',
        className,
      )}
    >
      <div className="flex-1">
        <label htmlFor="search-city" className="mb-1 block text-sm font-medium text-gray-700">
          Kota
        </label>
        <input
          id="search-city"
          type="text"
          placeholder="Cari kota..."
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
        />
      </div>

      <div className="flex-1">
        <label htmlFor="search-sport" className="mb-1 block text-sm font-medium text-gray-700">
          Jenis Olahraga
        </label>
        <select
          id="search-sport"
          value={sport}
          onChange={(e) => onSportChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
        >
          {sportOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label htmlFor="search-date" className="mb-1 block text-sm font-medium text-gray-700">
          Tanggal
        </label>
        <input
          id="search-date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/30"
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#16a34a] px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-[#15803d]"
      >
        <Search className="h-4 w-4" />
        Cari
      </button>
    </div>
  );
}
