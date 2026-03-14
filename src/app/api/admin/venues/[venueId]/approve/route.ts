import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Venue from '@/models/Venue';
import { createNotification } from '@/lib/notifications';

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

    if (session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { venueId } = await params;
    const { isApproved } = await request.json();

    const venue = await Venue.findByIdAndUpdate(
      venueId,
      { isApproved },
      { new: true }
    );

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    try {
      await createNotification({
        userId: venue.ownerId.toString(),
        type: 'venue_approved',
        title: isApproved ? 'Venue Approved' : 'Venue Rejected',
        message: isApproved
          ? `Your venue "${venue.name}" has been approved and is now live.`
          : `Your venue "${venue.name}" was not approved. Please contact support for details.`,
      });
    } catch (notifError) {
      console.error('Failed to send venue approval notification:', notifError);
    }

    return NextResponse.json(venue);
  } catch (error) {
    console.error('Error approving venue:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
