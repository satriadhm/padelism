import mongoose, { Schema, Model } from 'mongoose';
import { IPayment } from '@/types';

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'IDR' },
    method: {
      type: String,
      enum: ['midtrans', 'cash'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    midtransOrderId: { type: String, default: null },
    midtransTransactionId: { type: String, default: null },
    midtransPaymentType: { type: String, default: null },
    midtransSnapToken: { type: String, default: null },
    midtransResponse: { type: Schema.Types.Mixed, default: null },
    refundedAt: { type: Date, default: null },
    refundAmount: { type: Number, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

PaymentSchema.index({ bookingId: 1 });
PaymentSchema.index({ midtransOrderId: 1 });

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
export default Payment;
