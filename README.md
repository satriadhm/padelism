# Court Marketplace (Padelism)

A multi-tenant court booking marketplace built with Next.js. Venue owners can list their sports courts, and customers can discover, book, and pay for court time online.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** NextAuth.js
- **Styling:** Tailwind CSS
- **Payments:** Midtrans integration + cash payments

## Prerequisites

- **Node.js** >= 18
- **MongoDB** (local or Atlas)

## Setup

```bash
# 1. Clone the repository
git clone <repo-url> && cd padelism

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your values:
#   MONGODB_URI=mongodb://localhost:27017/court-marketplace
#   NEXTAUTH_SECRET=your-secret
#   NEXTAUTH_URL=http://localhost:3000

# 4. Seed the database (optional, for development)
npx tsx scripts/seed.ts

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/seed.ts` | Seed database with test data |

## Folder Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/              # REST API endpoints
│   ├── (auth)/           # Auth pages (login, register)
│   └── ...               # Feature pages
├── components/           # Reusable React components
├── hooks/                # Custom React hooks
│   ├── useAvailableSlots.ts  # Fetch court time slots
│   └── useBooking.ts         # Create/cancel bookings
├── lib/                  # Utilities (DB connection, auth config)
├── models/               # Mongoose models
│   ├── User.ts
│   ├── Venue.ts
│   ├── Court.ts
│   ├── SportType.ts
│   ├── Booking.ts
│   ├── Payment.ts
│   └── Notification.ts
├── types/                # TypeScript type definitions
└── middleware.ts          # Route protection middleware
scripts/
└── seed.ts               # Database seed script
```

## Default Test Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@courtmarket.com | admin123 |
| Venue Owner | budi@venue.com | owner123 |
| Staff | agus@staff.com | staff123 |
| Customer | siti@customer.com | customer123 |

## API Routes Overview

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/[...nextauth]` | Authentication (NextAuth) |
| GET | `/api/courts` | List courts |
| GET | `/api/courts/:id/slots?date=` | Get available slots |
| POST | `/api/bookings` | Create a booking |
| POST | `/api/bookings/:id/cancel` | Cancel a booking |
| GET | `/api/venues` | List venues |
| GET/POST | `/api/sport-types` | Sport types CRUD |

## Roles

| Role | Description |
|------|-------------|
| **super_admin** | Full platform access, manage all venues and users |
| **venue_owner** | Manage own venues, courts, bookings, and staff |
| **staff** | Check-in customers, view assigned venue bookings |
| **customer** | Browse venues, book courts, manage own bookings |

## Deployment

Deploy on [Vercel](https://vercel.com) or any platform supporting Next.js. Set the required environment variables in your hosting provider's dashboard.

## License

Private — All rights reserved.
