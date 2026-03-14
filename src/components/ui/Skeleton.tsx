import { cn } from '@/lib/utils';

export interface SkeletonProps {
  variant?: 'text' | 'card' | 'avatar';
  className?: string;
}

const variantClasses = {
  text: 'h-4 w-full rounded',
  card: 'h-48 w-full rounded-xl',
  avatar: 'h-10 w-10 rounded-full',
} as const;

export default function Skeleton({ variant = 'text', className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-gray-200', variantClasses[variant], className)}
      aria-hidden="true"
    />
  );
}
