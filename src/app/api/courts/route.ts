import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Court from '@/models/Court';
import Venue from '@/models/Venue';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get('venueId');

    const filter: Record<string, unknown> = {};
    if (venueId) {
      filter.venueId = venueId;
    }

    const courts = await Court.find(filter)
      .populate('sportType')
      .populate('venueId', 'name slug');

    return NextResponse.json(courts);
  } catch (error) {
    console.error('Error fetching courts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'venue_owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const venue = await Venue.findById(body.venueId);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    if (venue.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not own this venue' },
        { status: 403 }
      );
    }

    const court = await Court.create(body);

    return NextResponse.json(court, { status: 201 });
  } catch (error) {
    console.error('Error creating court:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
