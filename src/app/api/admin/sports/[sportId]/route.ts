import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SportType from '@/models/SportType';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sportId: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { sportId } = await params;
    const body = await request.json();

    const sportType = await SportType.findByIdAndUpdate(sportId, body, {
      new: true,
    });

    if (!sportType) {
      return NextResponse.json(
        { error: 'Sport type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sportType);
  } catch (error) {
    console.error('Error updating sport type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
