import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Court from '@/models/Court';
import Venue from '@/models/Venue';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courtId: string }> }
) {
  try {
    await dbConnect();

    const { courtId } = await params;
    const court = await Court.findById(courtId)
      .populate('sportType')
      .populate('venueId');

    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    return NextResponse.json(court);
  } catch (error) {
    console.error('Error fetching court:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ courtId: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courtId } = await params;
    const court = await Court.findById(courtId);

    if (!court) {
      return NextResponse.json({ error: 'Court not found' }, { status: 404 });
    }

    const venue = await Venue.findById(court.venueId);

    if (
      session.user.role !== 'super_admin' &&
      venue?.ownerId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await Court.findByIdAndUpdate(courtId, body, { new: true });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating court:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
