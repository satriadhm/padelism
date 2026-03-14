# Court Marketplace — Application Plan

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐  │
│  │ Customer  │ │  Venue   │ │  Staff   │ │   Super Admin     │  │
│  │  Pages    │ │  Owner   │ │  Pages   │ │   Pages           │  │
│  │(auth)     │ │Dashboard │ │          │ │                   │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────────┬──────────┘  │
│       │             │            │                 │             │
│  ┌────▼─────────────▼────────────▼─────────────────▼──────────┐ │
│  │                     API ROUTES (/api/*)                     │ │
│  │  auth | venues | courts | bookings | payments | upload      │ │
│  └────┬──────────────────────────────────────────────┬────────┘ │
│       │                                              │          │
│  ┌────▼────────┐  ┌──────────┐  ┌──────────────┐   │          │
│  │  NextAuth   │  │  Slot    │  │ Notifications │   │          │
│  │  (JWT)      │  │  Engine  │  │  (nodemailer) │   │          │
│  └─────┬───────┘  └────┬─────┘  └──────┬────────┘   │          │
│        │               │               │            │          │
│  ┌─────▼───────────────▼───────────────▼────────────▼────────┐ │
│  │                    MONGOOSE / MONGODB                      │ │
│  │  Users | Venues | Courts | Bookings | Payments | Sports   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Midtrans    │  │  node-cron   │  │  UploadThing         │  │
│  │  (payments)  │  │  (scheduled) │  │  (images)            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## MongoDB Collections & Schema Overview

| Collection      | Purpose                        | Key Fields                                                  |
|-----------------|--------------------------------|-------------------------------------------------------------|
| users           | All platform users             | email, role, passwordHash, venueId (staff)                  |
| venues          | Sports venue listings          | ownerId, slug, address, operatingHours, isApproved          |
| courts          | Individual courts in venues    | venueId, sportType, slotConfig, pricing                     |
| bookings        | Court reservations             | bookingCode, courtId, date, startTime, endTime, status      |
| payments        | Payment records                | bookingId, method, status, midtransOrderId                  |
| sporttypes      | Sport categories               | name, slug, icon, color                                     |
| notifications   | In-app & email notifications   | userId, type, title, message, isRead                        |

### Indexes

- **users**: `{ email: 1 }` unique
- **venues**: `{ slug: 1 }` unique, `{ ownerId: 1 }`
- **courts**: `{ venueId: 1 }`
- **bookings**: `{ courtId: 1, date: 1, startTime: 1 }` unique compound (double-booking prevention)
- **bookings**: `{ customerId: 1 }`, `{ venueId: 1 }`, `{ status: 1 }`
- **payments**: `{ bookingId: 1 }`, `{ midtransOrderId: 1 }`
- **notifications**: `{ userId: 1, isRead: 1 }`

## API Routes Map

| Method | Route                               | Auth          | Description                       |
|--------|-------------------------------------|---------------|-----------------------------------|
| POST   | /api/auth/[...nextauth]             | Public        | NextAuth handler                  |
| POST   | /api/auth/register                  | Public        | Customer/venue owner registration |
| GET    | /api/venues                         | Public        | List venues (with filters)        |
| POST   | /api/venues                         | Venue Owner   | Create venue                      |
| GET    | /api/venues/[venueId]               | Public        | Venue detail                      |
| PUT    | /api/venues/[venueId]               | Venue Owner   | Update venue                      |
| GET    | /api/courts                         | Public        | List courts (filter by venue)     |
| POST   | /api/courts                         | Venue Owner   | Create court                      |
| GET    | /api/courts/[courtId]               | Public        | Court detail                      |
| PUT    | /api/courts/[courtId]               | Venue Owner   | Update court                      |
| GET    | /api/courts/[courtId]/slots         | Public        | Available slots for date          |
| GET    | /api/bookings                       | Authenticated | List bookings (role-filtered)     |
| POST   | /api/bookings                       | Customer      | Create booking (with txn)         |
| GET    | /api/bookings/[bookingId]           | Authenticated | Booking detail                    |
| POST   | /api/bookings/[bookingId]/cancel    | Authenticated | Cancel booking                    |
| POST   | /api/bookings/[bookingId]/check-in  | Staff         | Check in customer                 |
| POST   | /api/payments/create                | Customer      | Create Midtrans snap token        |
| POST   | /api/payments/webhook               | Public        | Midtrans webhook (verified)       |
| POST   | /api/upload                         | Authenticated | Image upload                      |
| GET    | /api/notifications                  | Authenticated | User notifications                |
| PUT    | /api/notifications/[id]/read        | Authenticated | Mark notification read            |
| GET    | /api/admin/venues                   | Super Admin   | All venues (admin)                |
| PUT    | /api/admin/venues/[venueId]/approve | Super Admin   | Approve/reject venue              |
| GET    | /api/admin/users                    | Super Admin   | All users                         |
| PUT    | /api/admin/users/[userId]           | Super Admin   | Activate/deactivate user          |
| GET    | /api/admin/sports                   | Super Admin   | List sport types                  |
| POST   | /api/admin/sports                   | Super Admin   | Create sport type                 |
| PUT    | /api/admin/sports/[sportId]         | Super Admin   | Update sport type                 |
| GET    | /api/admin/bookings                 | Super Admin   | All bookings                      |

## User Role Permission Matrix

| Action                     | Customer | Staff | Venue Owner | Super Admin |
|----------------------------|----------|-------|-------------|-------------|
| Browse venues & courts     | ✅       | ✅    | ✅          | ✅          |
| Create booking             | ✅       | ❌    | ❌          | ❌          |
| View own bookings          | ✅       | ❌    | ❌          | ✅          |
| Cancel own booking         | ✅       | ❌    | ❌          | ✅          |
| Check-in customers         | ❌       | ✅    | ✅          | ✅          |
| View venue bookings        | ❌       | ✅*   | ✅*         | ✅          |
| Manage courts              | ❌       | ❌    | ✅*         | ✅          |
| Manage venue settings      | ❌       | ❌    | ✅*         | ✅          |
| Manage staff               | ❌       | ❌    | ✅*         | ✅          |
| Approve venues             | ❌       | ❌    | ❌          | ✅          |
| Manage users               | ❌       | ❌    | ❌          | ✅          |
| Manage sport types         | ❌       | ❌    | ❌          | ✅          |
| View platform analytics    | ❌       | ❌    | ❌          | ✅          |

*\* = scoped to own venue only*

## Booking State Machine

```
                    ┌─────────────┐
                    │   CREATED   │
                    └──────┬──────┘
                           │
                ┌──────────┴──────────┐
                │                     │
        ┌───────▼───────┐    ┌───────▼───────┐
        │ pending_payment│    │ pending_cash  │
        │ (Midtrans)     │    │ (Cash)        │
        └───────┬───────┘    └───────┬───────┘
                │                     │
       ┌────────┴─────┐      ┌───────┴────────┐
       │              │      │                │
  ┌────▼────┐   ┌─────▼──┐  │          ┌─────▼──┐
  │confirmed│   │expired │  │          │expired │
  │         │   │(30min) │  │          │(auto)  │
  └────┬────┘   └────────┘  │          └────────┘
       │                     │
       │              ┌──────▼──────┐
       │              │  confirmed  │
       │              │(staff checkin│
       │              │ or start)   │
       │              └──────┬──────┘
       │                     │
       ├─────────────────────┤
       │                     │
  ┌────▼────┐          ┌────▼─────┐
  │checked_ │          │cancelled │
  │in       │          │          │
  └────┬────┘          └──────────┘
       │
  ┌────▼─────┐
  │completed │
  └──────────┘
```

### State Transitions:
- `pending_payment` → `confirmed` (Midtrans webhook: settlement/capture)
- `pending_payment` → `expired` (Midtrans webhook: expire/cancel/deny OR 30min timeout)
- `pending_cash` → `confirmed` (staff check-in)
- `pending_cash` → `expired` (auto-cancel: cashExpireAt < now, cron every 5min)
- `confirmed` → `checked_in` (staff scans QR / enters code)
- `confirmed` → `cancelled` (customer or owner cancels)
- `checked_in` → `completed` (auto after endTime, or manual)

## Payment Flow Diagram

```
Customer selects slot
        │
        ▼
  Create Booking (POST /api/bookings)
  ├── MongoDB Transaction (prevent double booking)
  └── status: pending_payment / pending_cash
        │
   ┌────┴──────────────────────┐
   │                           │
   ▼                           ▼
MIDTRANS PATH               CASH PATH
   │                           │
   ▼                           ▼
POST /api/payments/create    status: pending_cash
   │                         cashExpireAt = startTime - 30min
   ▼                           │
Snap Token returned            ▼
   │                         Cron checks every 5min
   ▼                         if cashExpireAt < now
Snap.js popup                  → status: expired
   │                           │
   ▼                         On check-in by staff
Midtrans processes             → status: confirmed
   │                           → then checked_in
   ▼
POST /api/payments/webhook
   │
   ▼
Verify SHA512 signature
   │
   ├── settlement/capture → status: confirmed
   │   → Send confirmation email + QR
   │   → Notify venue owner
   │
   ├── cancel/deny/expire → status: expired
   │   → Slot freed
   │
   └── Invalid signature → 401 reject
```

## Notification Trigger Map

| Trigger              | Recipients         | Channels       | Template                                  |
|----------------------|--------------------|----------------|-------------------------------------------|
| BOOKING_CONFIRMED    | Customer           | Email + In-App | "Your booking is confirmed! 🎉"           |
| BOOKING_CONFIRMED    | Venue Owner        | Email + In-App | "New booking received"                    |
| BOOKING_REMINDER     | Customer           | Email + In-App | "Your game starts in 1 hour! 🏸"          |
| BOOKING_CANCELLED    | Customer           | Email + In-App | "Booking cancelled" + refund info         |
| REFUND_PROCESSED     | Customer           | Email + In-App | "Refund processed" + amount + timeline    |
| VENUE_APPROVED       | Venue Owner        | Email + In-App | "Your venue has been approved! 🎉"        |

### Cron Jobs:
- **Every 5 min**: Expire pending_cash bookings past cashExpireAt
- **Every 5 min**: Send reminders for bookings starting in 55-65 min (reminderSent: false)

## Risk Log

| Risk                    | Mitigation                                                       |
|-------------------------|------------------------------------------------------------------|
| Double booking          | MongoDB compound unique index + transaction on every creation    |
| Payment failures        | 30min Snap token expiry, webhook idempotency, status checks      |
| Timezone handling       | Store all times in UTC, display in WIB (Asia/Jakarta, UTC+7)     |
| Concurrent reservations | MongoDB session transactions with optimistic locking             |
| Midtrans key exposure   | Server key only in server-side code, never in API responses      |
| Webhook forgery         | SHA512 signature verification on every webhook                   |
| Cash booking abuse      | Auto-cancel cron (cashExpireAt = startTime - 30min)              |
| Stale slot display      | Re-fetch slots on booking page mount + before submission         |
| Staff data leakage      | All queries filtered by venueId from JWT                         |
| Owner data leakage      | All queries filtered by ownerId from JWT                         |
