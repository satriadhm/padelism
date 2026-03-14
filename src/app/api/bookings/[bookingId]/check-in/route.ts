import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Venue from '@/models/Venue';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await params;
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only staff or venue_owner of the venue can check in
    const venue = await Venue.findById(booking.venueId);
    const isStaff =
      session.user.role === 'staff' &&
      session.user.venueId === booking.venueId.toString();
    const isVenueOwner =
      session.user.role === 'venue_owner' &&
      venue?.ownerId.toString() === session.user.id;

    if (!isStaff && !isVenueOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['confirmed', 'pending_cash'].includes(booking.status)) {
      return NextResponse.json(
        {
          error: `Cannot check in a booking with status '${booking.status}'. Must be 'confirmed' or 'pending_cash'.`,
        },
        { status: 400 }
      );
    }

    booking.status = 'checked_in';
    await booking.save();

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error checking in booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
