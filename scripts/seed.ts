import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import Venue from '../src/models/Venue';
import Court from '../src/models/Court';
import SportType from '../src/models/SportType';
import Booking from '../src/models/Booking';
import Payment from '../src/models/Payment';
import Notification from '../src/models/Notification';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/court-marketplace';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Venue.deleteMany({}),
    Court.deleteMany({}),
    SportType.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Hash passwords
  const hashPassword = (pw: string) => bcrypt.hashSync(pw, 10);

  // Create users
  const superAdmin = await User.create({
    name: 'Super Admin',
    email: 'admin@courtmarket.com',
    password: hashPassword('admin123'),
    role: 'super_admin',
    isVerified: true,
  });
  console.log('Created super admin:', superAdmin.email);

  const venueOwner = await User.create({
    name: 'Budi Santoso',
    email: 'budi@venue.com',
    password: hashPassword('owner123'),
    role: 'venue_owner',
    isVerified: true,
  });
  console.log('Created venue owner:', venueOwner.email);

  const customer = await User.create({
    name: 'Siti Rahayu',
    email: 'siti@customer.com',
    password: hashPassword('customer123'),
    role: 'customer',
    isVerified: true,
  });
  console.log('Created customer:', customer.email);

  // Create sport types
  const sportsData = [
    { name: 'Badminton', icon: '🏸', color: '#3B82F6' },
    { name: 'Futsal', icon: '⚽', color: '#F59E0B' },
    { name: 'Basketball', icon: '🏀', color: '#EF4444' },
    { name: 'Tennis', icon: '🎾', color: '#8B5CF6' },
    { name: 'Volleyball', icon: '🏐', color: '#EC4899' },
    { name: 'Table Tennis', icon: '🏓', color: '#06B6D4' },
  ];

  const sports = await SportType.insertMany(sportsData);
  console.log('Created sport types:', sports.map((s: { name: string }) => s.name).join(', '));

  const badminton = sports.find((s: { name: string }) => s.name === 'Badminton');
  const futsal = sports.find((s: { name: string }) => s.name === 'Futsal');

  // Create venue
  const venue = await Venue.create({
    name: 'Gelora Sports Center',
    slug: 'gelora-sports-center',
    ownerId: venueOwner._id,
    description: 'Premium sports center in Jakarta with modern facilities.',
    address: {
      street: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      state: 'DKI Jakarta',
      zipCode: '10220',
      country: 'Indonesia',
    },
    phone: '+62-21-5551234',
    email: 'info@gelorasports.com',
    status: 'approved',
    amenities: ['parking', 'toilet', 'canteen', 'wifi'],
    operatingHours: {
      monday: { open: '07:00', close: '22:00', isClosed: false },
      tuesday: { open: '07:00', close: '22:00', isClosed: false },
      wednesday: { open: '07:00', close: '22:00', isClosed: false },
      thursday: { open: '07:00', close: '22:00', isClosed: false },
      friday: { open: '07:00', close: '22:00', isClosed: false },
      saturday: { open: '07:00', close: '22:00', isClosed: false },
      sunday: { open: '07:00', close: '22:00', isClosed: false },
    },
  });
  console.log('Created venue:', venue.name);

  // Create staff linked to venue
  const staff = await User.create({
    name: 'Agus Pratama',
    email: 'agus@staff.com',
    password: hashPassword('staff123'),
    role: 'staff',
    isVerified: true,
    venueId: venue._id,
  });
  console.log('Created staff:', staff.email);

  // Slot config: hourly from 07:00 to 21:00
  const slotStartTimes = Array.from({ length: 15 }, (_, i) => {
    const hour = 7 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Create courts
  const courtA = await Court.create({
    name: 'Court A',
    venueId: venue._id,
    sportTypeId: badminton!._id,
    type: 'indoor',
    description: 'Indoor badminton court with professional flooring.',
    isActive: true,
    slotConfig: {
      startTimes: slotStartTimes,
    },
    allowedDurations: [60, 90, 120],
    pricingRules: [
      {
        name: 'Weekday Regular',
        type: 'weekday',
        days: [1, 2, 3, 4, 5],
        startTime: '07:00',
        endTime: '21:00',
        pricePerHour: 75000,
      },
      {
        name: 'Weekend Peak',
        type: 'weekend',
        days: [0, 6],
        startTime: '07:00',
        endTime: '21:00',
        pricePerHour: 100000,
      },
    ],
  });
  console.log('Created court:', courtA.name);

  const courtB = await Court.create({
    name: 'Court B',
    venueId: venue._id,
    sportTypeId: futsal!._id,
    type: 'outdoor',
    description: 'Outdoor futsal court with synthetic grass.',
    isActive: true,
    slotConfig: {
      startTimes: slotStartTimes,
    },
    allowedDurations: [60, 90, 120],
    pricingRules: [
      {
        name: 'Weekday Regular',
        type: 'weekday',
        days: [1, 2, 3, 4, 5],
        startTime: '07:00',
        endTime: '21:00',
        pricePerHour: 150000,
      },
      {
        name: 'Weekend Peak',
        type: 'weekend',
        days: [0, 6],
        startTime: '07:00',
        endTime: '21:00',
        pricePerHour: 200000,
      },
    ],
  });
  console.log('Created court:', courtB.name);

  // Create test bookings
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const booking1 = await Booking.create({
    bookingCode: 'BK-001',
    userId: customer._id,
    courtId: courtA._id,
    venueId: venue._id,
    date: formatDate(tomorrow),
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    totalAmount: 75000,
    status: 'confirmed',
    paymentMethod: 'midtrans',
    paymentStatus: 'paid',
  });
  console.log('Created booking:', booking1.bookingCode, '- confirmed');

  const booking2 = await Booking.create({
    bookingCode: 'BK-002',
    userId: customer._id,
    courtId: courtB._id,
    venueId: venue._id,
    date: formatDate(tomorrow),
    startTime: '14:00',
    endTime: '15:00',
    durationMinutes: 60,
    totalAmount: 150000,
    status: 'pending_cash',
    paymentMethod: 'cash',
    paymentStatus: 'unpaid',
  });
  console.log('Created booking:', booking2.bookingCode, '- pending_cash');

  const booking3 = await Booking.create({
    bookingCode: 'BK-003',
    userId: customer._id,
    courtId: courtA._id,
    venueId: venue._id,
    date: formatDate(yesterday),
    startTime: '10:00',
    endTime: '11:00',
    durationMinutes: 60,
    totalAmount: 75000,
    status: 'completed',
    paymentMethod: 'midtrans',
    paymentStatus: 'paid',
  });
  console.log('Created booking:', booking3.bookingCode, '- completed');

  console.log('\nSeed completed!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
