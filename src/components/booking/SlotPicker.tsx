'use client';

import { cn, formatCurrency } from '@/lib/utils';

export interface Slot {
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
}

export interface SlotPickerProps {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelect: (slot: Slot) => void;
  className?: string;
}

export default function SlotPicker({ slots, selectedSlot, onSelect, className }: SlotPickerProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4', className)}>
      {slots.map((slot) => {
        const isSelected =
          selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;

        return (
          <button
            key={`${slot.startTime}-${slot.endTime}`}
            type="button"
            disabled={!slot.isAvailable}
            onClick={() => onSelect(slot)}
            className={cn(
              'flex flex-col items-center rounded-lg border px-3 py-2.5 text-sm transition-colors',
              !slot.isAvailable && 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400',
              slot.isAvailable &&
                !isSelected &&
                'border-gray-200 bg-[var(--color-brand-50)] text-gray-800 hover:border-gray-300',
              isSelected &&
                'border-[var(--color-brand-600)] bg-[var(--color-brand-100)] text-gray-900 ring-2 ring-[var(--color-brand-ring)]',
            )}
          >
            <span className="font-medium">
              {slot.startTime} – {slot.endTime}
            </span>
            <span className="mt-0.5 text-xs">
              {slot.isAvailable ? formatCurrency(slot.price) : 'Terisi'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
