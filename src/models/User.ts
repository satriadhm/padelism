import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '@/types';

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'venue_owner', 'staff', 'customer'],
      default: 'customer',
    },
    avatar: { type: String, default: '' },
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue', default: null },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
