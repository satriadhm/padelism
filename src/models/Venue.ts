import mongoose, { Schema, Model } from 'mongoose';
import { IVenue } from '@/types';

const OperatingHourSchema = new Schema(
  {
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '07:00' },
    closeTime: { type: String, default: '22:00' },
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    province: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const VenueSchema = new Schema<IVenue>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    address: { type: AddressSchema, default: () => ({}) },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    images: [{ type: String }],
    facilities: [{ type: String }],
    operatingHours: {
      type: Map,
      of: OperatingHourSchema,
      default: () => {
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const hours: Record<string, { isOpen: boolean; openTime: string; closeTime: string }> = {};
        for (const day of days) {
          hours[day] = { isOpen: true, openTime: '07:00', closeTime: '22:00' };
        }
        return hours;
      },
    },
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    staffIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

VenueSchema.index({ slug: 1 }, { unique: true });
VenueSchema.index({ ownerId: 1 });

const Venue: Model<IVenue> = mongoose.models.Venue || mongoose.model<IVenue>('Venue', VenueSchema);
export default Venue;
