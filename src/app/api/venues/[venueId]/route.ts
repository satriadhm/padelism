import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Venue from '@/models/Venue';
import Court from '@/models/Court';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    await dbConnect();

    const { venueId } = await params;
    const venue = await Venue.findById(venueId).populate('ownerId', 'name');

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    const courts = await Court.find({ venueId: venue._id }).populate('sportType');
    const venueObj = venue.toObject();
    const response = { ...venueObj, courts };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching venue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { venueId } = await params;
    const venue = await Venue.findById(venueId);

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    if (
      session.user.role !== 'super_admin' &&
      venue.ownerId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const updated = await Venue.findByIdAndUpdate(venueId, body, { new: true });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating venue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
