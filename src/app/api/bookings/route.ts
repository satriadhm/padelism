import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Court from '@/models/Court';
import Venue from '@/models/Venue';
import { addMinutesToTime, calculatePrice } from '@/lib/slot-engine';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};

    if (status) {
      filter.status = status;
    }

    switch (session.user.role) {
      case 'customer':
        filter.customerId = session.user.id;
        break;
      case 'staff': {
        const staffVenueId = session.user.venueId;
        if (staffVenueId) {
          filter.venueId = staffVenueId;
        }
        break;
      }
      case 'venue_owner': {
        const ownedVenues = await Venue.find({ ownerId: session.user.id }).select('_id');
        const venueIds = ownedVenues.map((v) => v._id);
        filter.venueId = { $in: venueIds };
        break;
      }
      case 'super_admin':
        break;
      default:
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const bookings = await Booking.find(filter)
      .populate('courtId', 'name')
      .populate('venueId', 'name')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authSession = await getServerSession(authOptions);
    if (!authSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courtId, date, startTime, durationMinutes, paymentMethod, notes } =
      await request.json();

    if (!courtId || !date || !startTime || !durationMinutes) {
      return NextResponse.json(
        { error: 'courtId, date, startTime, and durationMinutes are required' },
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

    const endTime = addMinutesToTime(startTime, durationMinutes);
    const totalAmount = calculatePrice(court, date, startTime, durationMinutes);
    const dateObj = new Date(date + 'T00:00:00.000Z');

    // Generate booking code: BK-YYYYMMDD-XXXXX
    const dateCode = date.replace(/-/g, '');
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const bookingCode = `BK-${dateCode}-${randomChars}`;

    const qrCode = `QR-${bookingCode}`;

    // Calculate cashExpireAt for cash payments (30 min before slot start)
    let cashExpireAt: Date | undefined;
    if (paymentMethod === 'cash') {
      const [hours, minutes] = startTime.split(':').map(Number);
      cashExpireAt = new Date(dateObj);
      cashExpireAt.setUTCHours(hours, minutes - 30, 0, 0);
    }

    const bookingData = {
      bookingCode,
      customerId: authSession.user.id,
      courtId,
      venueId: court.venueId,
      date: dateObj,
      startTime,
      endTime,
      durationMinutes,
      status: paymentMethod === 'cash' ? 'pending_cash' : 'pending_payment',
      paymentMethod: paymentMethod || 'midtrans',
      totalAmount,
      notes,
      cashExpireAt,
      qrCode,
    };

    // Use MongoDB transaction to prevent double booking
    const mongooseModule = await import('mongoose');
    const dbSession = await mongooseModule.default.startSession();
    dbSession.startTransaction();

    try {
      const conflict = await Booking.findOne({
        courtId,
        date: dateObj,
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        status: {
          $in: ['confirmed', 'pending_cash', 'checked_in', 'pending_payment'],
        },
      }).session(dbSession);

      if (conflict) {
        await dbSession.abortTransaction();
        dbSession.endSession();
        return NextResponse.json({ error: 'SLOT_TAKEN' }, { status: 409 });
      }

      const [booking] = await Booking.create([bookingData], {
        session: dbSession,
      });

      await dbSession.commitTransaction();
      dbSession.endSession();

      return NextResponse.json(booking, { status: 201 });
    } catch (err) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw err;
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
