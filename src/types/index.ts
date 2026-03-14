import { Types } from 'mongoose';

export type UserRole = 'super_admin' | 'venue_owner' | 'staff' | 'customer';

export type BookingStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'pending_cash'
  | 'checked_in'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type PaymentMethod = 'midtrans' | 'cash';

export type PaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'booking_cancelled'
  | 'refund_processed'
  | 'new_booking_owner'
  | 'venue_approved';

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  avatar: string;
  venueId: Types.ObjectId | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface IOperatingHour {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface IVenue {
  _id: Types.ObjectId;
  ownerId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  address: IAddress;
  phone: string;
  email: string;
  images: string[];
  facilities: string[];
  operatingHours: Record<string, IOperatingHour>;
  isActive: boolean;
  isApproved: boolean;
  staffIds: Types.ObjectId[];
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDurationPricing {
  durationMinutes: number;
  price: number;
}

export interface IPricingRule {
  name: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  durationPricing: IDurationPricing[];
}

export interface ISlotConfig {
  allowedDurations: number[];
  defaultDuration: number;
  slotStartTimes: string[];
  minAdvanceBooking: number;
  maxAdvanceBooking: number;
  bufferTime: number;
}

export interface ICourt {
  _id: Types.ObjectId;
  venueId: Types.ObjectId;
  name: string;
  sportType: Types.ObjectId;
  description: string;
  images: string[];
  capacity: number;
  floorType: string;
  isIndoor: boolean;
  isActive: boolean;
  slotConfig: ISlotConfig;
  pricing: {
    basePrice: number;
    pricingRules: IPricingRule[];
  };
  cashOnArrival: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBooking {
  _id: Types.ObjectId;
  bookingCode: string;
  customerId: Types.ObjectId;
  courtId: Types.ObjectId;
  venueId: Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  notes: string;
  cashExpireAt: Date | null;
  qrCode: string;
  reminderSent: boolean;
  cancelledAt: Date | null;
  cancelledBy: Types.ObjectId | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  _id: Types.ObjectId;
  bookingId: Types.ObjectId;
  customerId: Types.ObjectId;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  midtransOrderId: string | null;
  midtransTransactionId: string | null;
  midtransPaymentType: string | null;
  midtransSnapToken: string | null;
  midtransResponse: Record<string, unknown> | null;
  refundedAt: Date | null;
  refundAmount: number | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISportType {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
}

export interface INotification {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  bookingId: Types.ObjectId | null;
  isRead: boolean;
  channels: {
    inApp: boolean;
    email: boolean;
    sms: boolean;
  };
  sentAt: Date;
  createdAt: Date;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isAvailable: boolean;
  price: number;
}
