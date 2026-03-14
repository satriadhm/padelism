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
                'border-green-200 bg-green-50 text-gray-800 hover:border-green-400',
              isSelected && 'border-[#16a34a] bg-blue-50 text-[#16a34a] ring-2 ring-[#16a34a]/30',
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
