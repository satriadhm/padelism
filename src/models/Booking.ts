import mongoose, { Schema, Model } from 'mongoose';
import { IBooking } from '@/types';

const BookingSchema = new Schema<IBooking>(
  {
    bookingCode: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courtId: { type: Schema.Types.ObjectId, ref: 'Court', required: true },
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'pending_cash', 'checked_in', 'completed', 'cancelled', 'expired'],
      default: 'pending_payment',
    },
    paymentMethod: {
      type: String,
      enum: ['midtrans', 'cash'],
      required: true,
    },
    totalAmount: { type: Number, required: true },
    notes: { type: String, default: '' },
    cashExpireAt: { type: Date, default: null },
    qrCode: { type: String, default: '' },
    reminderSent: { type: Boolean, default: false },
    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    cancellationReason: { type: String, default: null },
  },
  { timestamps: true }
);

BookingSchema.index({ courtId: 1, date: 1, startTime: 1 }, { unique: true });
BookingSchema.index({ customerId: 1 });
BookingSchema.index({ venueId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ bookingCode: 1 }, { unique: true });

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
