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

## Deploy to Vercel

### Required Environment Variables

Set these in your Vercel project's **Settings → Environment Variables** before deploying:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (use [MongoDB Atlas](https://www.mongodb.com/atlas) for production) |
| `NEXTAUTH_SECRET` | Random secret — generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your deployed URL, e.g. `https://your-app.vercel.app` |
| `MIDTRANS_SERVER_KEY` | Midtrans server key from [dashboard.midtrans.com](https://dashboard.midtrans.com) |
| `MIDTRANS_CLIENT_KEY` | Midtrans client key from [dashboard.midtrans.com](https://dashboard.midtrans.com) |
| `MIDTRANS_IS_PRODUCTION` | `false` for sandbox, `true` for production |
| `SMTP_HOST` | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (e.g. `587`) |
| `SMTP_USER` | SMTP account username / email |
| `SMTP_PASSWORD` | SMTP account password or app password |

### Deploy via Vercel Dashboard

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel auto-detects Next.js — no build settings need to change.
4. Add all environment variables listed above under **Environment Variables**.
5. Click **Deploy**.

### Deploy via Vercel CLI

```bash
npm install -g vercel
vercel login
vercel                  # follow the prompts; add env vars when asked
vercel --prod           # promote to production
```

### Configuration Notes

- **MongoDB**: Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works). Whitelist `0.0.0.0/0` in Atlas Network Access so Vercel's dynamic IPs can connect.
- **NextAuth**: Set `NEXTAUTH_URL` to your exact Vercel deployment URL (e.g. `https://your-app.vercel.app`). Do **not** include a trailing slash.
- **Midtrans**: Use sandbox keys (`SB-Mid-…`) for testing; switch to production keys only when you are ready to accept real payments and set `MIDTRANS_IS_PRODUCTION=true`.
- **SMTP**: Gmail users — create an [App Password](https://myaccount.google.com/apppasswords) and use it as `SMTP_PASSWORD`.

## License

Private — All rights reserved.
