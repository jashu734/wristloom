# Wristloom — Luxury Timepiece Care & Restoration

Full-stack Next.js platform for doorstep luxury watch repair, technician tracking, and vault management.

## Project Structure

```
WristLoom/
├── wristloom-frontend/        ← Next.js 16 (Full-Stack App Router)
│   ├── prisma/                ← Prisma Schema (Supabase PostgreSQL)
│   ├── public/                ← Static assets
│   ├── src/
│   │   ├── app/               ← Pages & Server App Router Routes
│   │   │   ├── api/           ← Full-stack API (auth, bookings, payments, vault, etc.)
│   │   │   ├── admin/         ← Admin views (bookings, technicians, live map)
│   │   │   ├── booking/       ← End-to-end 7-step booking wizard
│   │   │   ├── live-tracking/ ← Real-time technician GPS tracking
│   │   │   └── ...            ← Customer portal, vault, showcase pages
│   │   ├── components/        ← React UI components
│   │   ├── lib/               ← Database client, auth, Supabase, utilities
│   │   └── store/             ← Zustand stores (booking, cart, wishlist)
│   └── .env.local             ← Environment variables (ignored in Git)
```

## Getting Started

```bash
cd wristloom-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
