import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Venue from '@/models/Venue';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const sport = searchParams.get('sport');
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {
      isApproved: true,
      isActive: true,
    };

    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    let query = Venue.find(filter).populate('ownerId', 'name');

    if (sport) {
      const Court = (await import('@/models/Court')).default;
      const courtsWithSport = await Court.find({ sportType: sport }).select('venueId');
      const venueIds = courtsWithSport.map((c) => c.venueId);
      filter._id = { $in: venueIds };
      query = Venue.find(filter).populate('ownerId', 'name');
    }

    const venues = await query.sort({ createdAt: -1 });

    return NextResponse.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
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

    const baseSlug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    const existingSlug = await Venue.findOne({ slug });
    if (existingSlug) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    const venue = await Venue.create({
      ...body,
      ownerId: session.user.id,
      slug,
      isApproved: false,
    });

    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    console.error('Error creating venue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
