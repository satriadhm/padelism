import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(time: string): string {
  return `${time} WIB`;
}

export const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending_payment: 'bg-yellow-100 text-yellow-800',
  pending_cash: 'bg-yellow-100 text-yellow-800',
  checked_in: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-500',
};

export const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Dikonfirmasi',
  pending_payment: 'Menunggu Pembayaran',
  pending_cash: 'Bayar di Tempat',
  checked_in: 'Check-in',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
};

export const SPORT_COLORS: Record<string, string> = {
  badminton: '#3B82F6',
  futsal: '#F59E0B',
  basketball: '#EF4444',
  tennis: '#8B5CF6',
  volleyball: '#EC4899',
  'table-tennis': '#06B6D4',
};
