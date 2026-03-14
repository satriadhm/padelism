import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const paymentMethod = searchParams.get('paymentMethod');

    const filter: Record<string, unknown> = {};

    if (venueId) filter.venueId = venueId;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (date) filter.date = new Date(date + 'T00:00:00.000Z');

    const bookings = await Booking.find(filter)
      .populate('courtId', 'name')
      .populate('venueId', 'name')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
