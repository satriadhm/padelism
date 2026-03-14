import mongoose, { Schema, Model } from 'mongoose';
import { ISportType } from '@/types';

const SportTypeSchema = new Schema<ISportType>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    icon: { type: String, required: true },
    color: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

SportTypeSchema.index({ slug: 1 }, { unique: true });

const SportType: Model<ISportType> = mongoose.models.SportType || mongoose.model<ISportType>('SportType', SportTypeSchema);
export default SportType;
