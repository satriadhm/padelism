import { TimeSlot } from '@/types';

interface SlotConfig {
  allowedDurations: number[];
  slotStartTimes: string[];
}

interface PricingRule {
  name: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  durationPricing: { durationMinutes: number; price: number }[];
}

interface CourtForSlots {
  slotConfig: SlotConfig;
  pricing: {
    basePrice: number;
    pricingRules: PricingRule[];
  };
}

interface OperatingHour {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface ExistingBooking {
  startTime: string;
  endTime: string;
  status: string;
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function addMinutesToTime(time: string, minutes: number): string {
  return minutesToTime(timeToMinutes(time) + minutes);
}

function hasTimeOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

export function calculatePrice(
  court: CourtForSlots,
  date: Date,
  startTime: string,
  durationMinutes: number
): number {
  const dayOfWeek = date.getDay();

  for (const rule of court.pricing.pricingRules) {
    if (
      rule.daysOfWeek.includes(dayOfWeek) &&
      timeToMinutes(startTime) >= timeToMinutes(rule.startTime) &&
      timeToMinutes(startTime) < timeToMinutes(rule.endTime)
    ) {
      const dp = rule.durationPricing.find(
        (d) => d.durationMinutes === durationMinutes
      );
      if (dp) return dp.price;
    }
  }

  return court.pricing.basePrice * (durationMinutes / 60);
}

export function generateSlots(
  court: CourtForSlots,
  date: Date,
  operatingHours: Record<string, OperatingHour>,
  existingBookings: ExistingBooking[]
): TimeSlot[] {
  const dayName = DAY_NAMES[date.getDay()];
  const hours = operatingHours[dayName];
  if (!hours || !hours.isOpen) return [];

  const BLOCKING_STATUSES = [
    'confirmed',
    'pending_cash',
    'checked_in',
    'pending_payment',
  ];

  const slots: TimeSlot[] = [];

  for (const duration of court.slotConfig.allowedDurations) {
    for (const startTime of court.slotConfig.slotStartTimes) {
      const endTime = addMinutesToTime(startTime, duration);

      if (timeToMinutes(startTime) < timeToMinutes(hours.openTime)) continue;
      if (timeToMinutes(endTime) > timeToMinutes(hours.closeTime)) continue;

      const isAvailable = !existingBookings.some(
        (b) =>
          hasTimeOverlap(b.startTime, b.endTime, startTime, endTime) &&
          BLOCKING_STATUSES.includes(b.status)
      );

      slots.push({
        startTime,
        endTime,
        durationMinutes: duration,
        isAvailable,
        price: calculatePrice(court, date, startTime, duration),
      });
    }
  }

  return slots;
}

export { timeToMinutes, minutesToTime, addMinutesToTime, hasTimeOverlap };
