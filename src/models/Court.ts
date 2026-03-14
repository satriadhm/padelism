import mongoose, { Schema, Model } from 'mongoose';
import { ICourt } from '@/types';

const DurationPricingSchema = new Schema(
  {
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const PricingRuleSchema = new Schema(
  {
    name: { type: String, required: true },
    daysOfWeek: [{ type: Number }],
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationPricing: [DurationPricingSchema],
  },
  { _id: false }
);

const SlotConfigSchema = new Schema(
  {
    allowedDurations: [{ type: Number }],
    defaultDuration: { type: Number, default: 60 },
    slotStartTimes: [{ type: String }],
    minAdvanceBooking: { type: Number, default: 1 },
    maxAdvanceBooking: { type: Number, default: 14 },
    bufferTime: { type: Number, default: 0 },
  },
  { _id: false }
);

const CourtSchema = new Schema<ICourt>(
  {
    venueId: { type: Schema.Types.ObjectId, ref: 'Venue', required: true },
    name: { type: String, required: true },
    sportType: { type: Schema.Types.ObjectId, ref: 'SportType', required: true },
    description: { type: String, default: '' },
    images: [{ type: String }],
    capacity: { type: Number, default: 4 },
    floorType: { type: String, default: '' },
    isIndoor: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    slotConfig: { type: SlotConfigSchema, default: () => ({}) },
    pricing: {
      basePrice: { type: Number, default: 0 },
      pricingRules: [PricingRuleSchema],
    },
    cashOnArrival: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourtSchema.index({ venueId: 1 });

const Court: Model<ICourt> = mongoose.models.Court || mongoose.model<ICourt>('Court', CourtSchema);
export default Court;
