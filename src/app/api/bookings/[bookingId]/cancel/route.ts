import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Types } from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import User from '@/models/User';
import Venue from '@/models/Venue';
import { sendBookingCancellation } from '@/lib/notifications';

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

    // Check permissions: customer who owns it, venue owner, or super_admin
    const isCustomer = booking.customerId.toString() === session.user.id;
    let isVenueOwner = false;
    if (!isCustomer && session.user.role === 'venue_owner') {
      const venue = await Venue.findById(booking.venueId);
      isVenueOwner = venue?.ownerId.toString() === session.user.id;
    }
    const isSuperAdmin = session.user.role === 'super_admin';

    if (!isCustomer && !isVenueOwner && !isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    const { cancellationReason } = await request.json().catch(() => ({
      cancellationReason: undefined,
    }));

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelledBy = new Types.ObjectId(session.user.id);
    booking.cancellationReason = cancellationReason;
    await booking.save();

    try {
      const customer = await User.findById(booking.customerId);
      await sendBookingCancellation({
        bookingCode: booking.bookingCode,
        customerEmail: customer?.email || '',
        customerName: customer?.name || '',
        customerId: booking.customerId.toString(),
        bookingId: booking._id.toString(),
      });
    } catch (notifError) {
      console.error('Failed to send cancellation notification:', notifError);
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
