# Schedora

Schedora is a multi-tenant appointment booking SaaS built for local service businesses.

It helps businesses manage bookings, customers, services, staff, availability, subscriptions, and public booking pages from one professional dashboard.

Example business types:

- Barbers
- Nail technicians
- Cleaners
- Tutors
- Photographers
- Makeup artists
- Massage therapists
- Small clinics
- Consultants
- Other appointment-based service providers

---

## Live Demo

Production URL:

```txt
https://schedora-sigma.vercel.app
```

---

## Features

### Public Website

- Marketing landing page
- Pricing section
- FAQ section
- Call-to-action buttons
- Responsive layout
- Authentication links

### Authentication

- Clerk sign-in
- Clerk sign-up
- Protected dashboard routes
- Protected admin routes
- User onboarding flow

### Business Dashboard

- Dashboard metrics
- Appointment overview
- Customer management
- Service management
- Staff management
- Availability management
- Booking page settings
- Subscription and plan usage
- Business settings

### Public Booking Flow

- Public booking page for each business
- Customers can book without creating an account
- Service selection
- Date and time selection
- Customer contact form
- Appointment creation
- Booking usage tracking
- Success confirmation page

### Admin Portal

- Platform overview
- Business management
- User management
- Subscription management
- Business suspension and activation
- Manual plan changes
- Platform admin protection

---

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Clerk Authentication
- Prisma ORM
- PostgreSQL
- Neon Database
- Vercel Hosting
- GitHub Version Control

---

## Architecture

Schedora is built as a modular monolith.

The app has four main surfaces:

```txt
Public Website
Authenticated Business Dashboard
Public Booking App
Platform Admin Portal
```

The platform is multi-tenant.

The tenant is the business. Every business-owned record is connected to a `businessId`.

Business-owned records include:

```txt
services
staff_members
customers
appointments
availability_rules
subscriptions
booking_usage
admin_notes
```

Every protected read, write, update, and delete must be scoped by the active business.

Example tenant-safe query:

```ts
where: {
  id: appointmentId,
  businessId: activeBusinessId,
}
```

Avoid unsafe queries like:

```ts
where: {
  id: appointmentId,
}
```

---

## Core Routes

```txt
/
 /sign-in
 /sign-up
 /onboarding
 /dashboard
 /appointments
 /appointments/new
 /customers
 /customers/new
 /services
 /services/new
 /staff
 /staff/new
 /availability
 /booking-page
 /subscription
 /settings
 /book/[slug]
 /book/[slug]/success
 /admin
 /admin/overview
 /admin/businesses
 /admin/users
 /admin/subscriptions
 /admin/settings
```

---

## Project Structure

```txt
schedora/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── proxy.ts
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   ├── book/
│   │   ├── admin/
│   │   ├── (auth)/
│   │   └── (app)/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── marketing/
│   │   ├── dashboard/
│   │   ├── app-shell/
│   │   ├── admin/
│   │   └── modules/
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   └── format.ts
│   │
│   └── server/
│       ├── actions/
│       ├── admin/
│       ├── auth/
│       ├── business/
│       └── dashboard/
│
├── public/
├── package.json
├── prisma.config.ts
├── components.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Environment Variables

Create a `.env` file for database values:

```env
DATABASE_URL=""
```

Create a `.env.local` file for Clerk values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/onboarding"
NEXT_PUBLIC_CLERK_SIGN_OUT_FALLBACK_REDIRECT_URL="/"
```

Do not commit real `.env` or `.env.local` values to GitHub.

The `.env.example` file should contain only empty example values.

---

## Local Development

Install dependencies:

```bash
npm install
```

Run database migration:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

Seed demo data:

```bash
npx prisma db seed
```

Run the development server:

```bash
npm run dev
```

Open the app:

```txt
http://localhost:3000
```

---

## Prisma Commands

Open Prisma Studio:

```bash
npx prisma studio
```

Create a new migration:

```bash
npx prisma migrate dev --name migration_name
```

Generate Prisma Client:

```bash
npx prisma generate
```

Seed the database:

```bash
npx prisma db seed
```

---

## Database Models

Main database models:

```txt
User
Business
BusinessMembership
Service
StaffMember
Customer
Appointment
AvailabilityRule
Subscription
BookingUsage
AdminNote
```

Important relationships:

```txt
User → BusinessMembership → Business
Business → Services
Business → Staff Members
Business → Customers
Business → Appointments
Business → Availability Rules
Business → Subscription
Business → Booking Usage
```

---

## Authentication

Schedora uses Clerk for authentication.

Protected areas:

```txt
/dashboard
/appointments
/customers
/services
/staff
/availability
/booking-page
/subscription
/settings
/admin
/onboarding
```

Public areas:

```txt
/
 /sign-in
 /sign-up
 /book/[slug]
 /book/[slug]/success
```

Customers can book appointments without creating an account.

---

## Authorization Rules

Schedora uses two role systems.

Platform role:

```txt
USER
PLATFORM_ADMIN
```

Business role:

```txt
OWNER
ADMIN
STAFF
```

Admin routes require:

```txt
PLATFORM_ADMIN
```

Business routes require a valid business membership.

---

## Multi-Tenancy Rules

Schedora is multi-tenant.

Every business-owned record must include:

```txt
businessId
```

Every protected database query must check the active business.

Correct:

```ts
await prisma.appointment.findMany({
  where: {
    businessId: activeBusinessId,
  },
});
```

Incorrect:

```ts
await prisma.appointment.findMany();
```

Public booking pages resolve the business from the booking slug:

```txt
/book/[slug]
```

---

## Public Booking Flow

Customer flow:

```txt
Open public booking link
Select service
Select date
Select time
Enter customer details
Confirm booking
Appointment is created
Booking usage increases
Success page is shown
```

Booking validation includes:

```txt
Business must exist
Business must be active
Service must belong to business
Service must be active
Selected time must be available
Selected time must not conflict with existing appointment
Plan limit must allow another booking
Customer name and phone are required
```

---

## Subscription Plans

Current MVP plans:

```txt
Free
- 20 bookings per month

Starter
- 100 bookings per month

Pro
- Unlimited bookings
```

Stripe is not connected in the MVP.

Plan changes are currently handled manually through the admin portal.

---

## Admin Portal

Admin features:

```txt
View platform metrics
View businesses
View users
View subscriptions
Suspend businesses
Activate businesses
Change subscription plans
```

Admin protection is enforced on the server.

Normal users are redirected away from `/admin`.

---

## Deployment

Schedora is deployed on Vercel.

Required Vercel environment variables:

```env
DATABASE_URL=""
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/dashboard"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/onboarding"
NEXT_PUBLIC_CLERK_SIGN_OUT_FALLBACK_REDIRECT_URL="/"
```

Production build:

```bash
npm run build
```

The build script should generate Prisma Client before building Next.js:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

---

## Security Rules

- Do not expose database credentials in the browser.
- Do not commit `.env` or `.env.local`.
- Use environment variables for secrets.
- Dashboard routes require authentication.
- Admin routes require `PLATFORM_ADMIN`.
- Public booking pages do not require customer accounts.
- All business-owned database queries must be scoped by `businessId`.
- Admin actions must validate admin access on the server.
- Business actions must validate active business access on the server.
- Public booking submissions validate business, service, availability, conflicts, and plan limits.

---

## MVP Status

Completed:

```txt
Landing page
Authentication
User onboarding
Business dashboard
Appointments page
Customers page
Services page
Staff page
Availability page
Booking page settings
Subscription page
Settings page
Public booking flow
Admin portal
Admin protection
Admin business actions
Admin subscription actions
Database integration
Vercel deployment
GitHub setup
```

---

## Roadmap

Future improvements:

```txt
Better form error handling
Edit pages for services
Edit pages for customers
Edit pages for staff
Appointment detail pages
Email booking confirmations
Email reminders
Stripe billing
Audit logs
Admin notes
Analytics
Mobile sidebar
Calendar view
Staff-specific availability
Customer cancellation link
Production Clerk domain
Custom business domains
```

---

## Development Standards

This project follows these rules:

```txt
Keep business logic out of UI components.
Use server actions for mutations.
Use Prisma for database access.
Use tenant-scoped queries.
Keep admin routes separate from business routes.
Keep public booking friction low.
Build the simple professional version first.
```

---

## License

This project is currently private and built as an MVP SaaS project.
