import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import User from '@/models/User';
import { createSnapToken } from '@/lib/midtrans';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const customer = await User.findById(booking.customerId);
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const orderId = `ORDER-${booking.bookingCode}-${Date.now()}`;

    const snapResult = await createSnapToken({
      transaction_details: {
        order_id: orderId,
        gross_amount: booking.totalAmount,
      },
      customer_details: {
        first_name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
      },
      expiry: { unit: 'hours', duration: 1 },
    });

    const payment = await Payment.create({
      bookingId: booking._id,
      customerId: booking.customerId,
      amount: booking.totalAmount,
      currency: 'IDR',
      method: 'midtrans',
      status: 'pending',
      midtransOrderId: orderId,
      midtransSnapToken: snapResult.token,
    });

    return NextResponse.json({
      snapToken: snapResult.token,
      redirectUrl: snapResult.redirect_url,
      orderId,
      paymentId: payment._id,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
