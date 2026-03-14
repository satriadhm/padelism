import { cn, SPORT_COLORS } from '@/lib/utils';

export interface SportBadgeProps {
  name: string;
  slug: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function SportBadge({ name, slug, size = 'md', className }: SportBadgeProps) {
  const color = SPORT_COLORS[slug] ?? '#6B7280';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
      style={{ backgroundColor: `${color}15`, color }}
    >
      <span
        className="inline-block rounded-full"
        style={{ backgroundColor: color, width: size === 'sm' ? 6 : 8, height: size === 'sm' ? 6 : 8 }}
        aria-hidden="true"
      />
      {name}
    </span>
  );
}
