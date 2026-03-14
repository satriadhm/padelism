import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SportType from '@/models/SportType';

export async function GET() {
  try {
    await dbConnect();

    const sportTypes = await SportType.find({ isActive: true }).sort({
      name: 1,
    });

    return NextResponse.json(sportTypes);
  } catch (error) {
    console.error('Error fetching sport types:', error);
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

    if (session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const sportType = await SportType.create({
      ...body,
      slug,
      createdBy: session.user.id,
    });

    return NextResponse.json(sportType, { status: 201 });
  } catch (error) {
    console.error('Error creating sport type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
