import mongoose, { Schema, Model } from 'mongoose';
import { INotification } from '@/types';

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'booking_confirmed',
        'booking_reminder',
        'booking_cancelled',
        'refund_processed',
        'new_booking_owner',
        'venue_approved',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    isRead: { type: Boolean, default: false },
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
    },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
