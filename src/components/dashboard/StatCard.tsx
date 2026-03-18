'use client';

import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  trend?: { value: number; label: string };
  className?: string;
}

export default function StatCard({ icon, label, value, trend, className }: StatCardProps) {
  const trendUp = trend && trend.value >= 0;

  return (
    <Card className={cn('flex items-start gap-4', className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>

        {trend && (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-xs font-medium',
              trendUp ? 'text-green-600' : 'text-red-600',
            )}
          >
            {trendUp ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            <span>
              {trend.value > 0 ? '+' : ''}
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
