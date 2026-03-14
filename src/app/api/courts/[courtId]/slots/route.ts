import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Court from '@/models/Court';
import Venue from '@/models/Venue';
import Booking from '@/models/Booking';
import { generateSlots } from '@/lib/slot-engine';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courtId: string }> }
) {
  try {
    await dbConnect();

    const { courtId } = await params;
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');

    if (!dateStr) {
      return NextResponse.json(
        { error: 'date query param is required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const court = await Court.findById(courtId);
    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    const venue = await Venue.findById(court.venueId);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    const dateObj = new Date(dateStr + 'T00:00:00.000Z');

    const existingBookings = await Booking.find({
      courtId,
      date: dateObj,
      status: { $in: ['confirmed', 'pending_cash', 'checked_in', 'pending_payment'] },
    });

    const operatingHoursMap: Record<string, { isOpen: boolean; openTime: string; closeTime: string }> = {};
    if (venue.operatingHours) {
      const hours = venue.operatingHours as unknown as Map<string, { isOpen: boolean; openTime: string; closeTime: string }>;
      for (const [day, h] of hours.entries()) {
        operatingHoursMap[day] = {
          isOpen: h.isOpen,
          openTime: h.openTime,
          closeTime: h.closeTime,
        };
      }
    }

    const slots = generateSlots(court, dateObj, operatingHoursMap, existingBookings);

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error generating slots:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
