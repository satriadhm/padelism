import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Payment from '@/models/Payment';
import User from '@/models/User';
import Court from '@/models/Court';
import Venue from '@/models/Venue';
import { verifyWebhookSignature } from '@/lib/midtrans';
import { sendBookingConfirmation } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      transaction_id,
      payment_type,
      fraud_status,
    } = body;

    // Always verify signature first
    const isValid = verifyWebhookSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    const payment = await Payment.findOne({ midtransOrderId: order_id });
    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    const booking = await Booking.findById(payment.bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    payment.midtransTransactionId = transaction_id;
    payment.midtransPaymentType = payment_type;
    payment.midtransResponse = body;

    if (
      transaction_status === 'capture' ||
      transaction_status === 'settlement'
    ) {
      if (fraud_status && fraud_status !== 'accept') {
        payment.status = 'failed';
        booking.status = 'expired';
      } else {
        payment.status = 'success';
        payment.paidAt = new Date();
        booking.status = 'confirmed';

        try {
          const customer = await User.findById(booking.customerId);
          const court = await Court.findById(booking.courtId);
          const venue = await Venue.findById(booking.venueId);
          await sendBookingConfirmation({
            bookingCode: booking.bookingCode,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
            totalAmount: booking.totalAmount,
            customerEmail: customer?.email || '',
            customerName: customer?.name || '',
            customerId: booking.customerId.toString(),
            venueName: venue?.name || '',
            courtName: court?.name || '',
            bookingId: booking._id.toString(),
          });
        } catch (notifError) {
          console.error(
            'Failed to send booking confirmation:',
            notifError
          );
        }
      }
    } else if (
      ['cancel', 'deny', 'expire'].includes(transaction_status)
    ) {
      payment.status = 'cancelled';
      booking.status = 'expired';
    } else if (transaction_status === 'pending') {
      payment.status = 'pending';
    }

    await payment.save();
    await booking.save();

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Midtrans webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
