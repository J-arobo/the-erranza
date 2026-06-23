This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


## Intallations
Map Library
    - npm install leaflet react-leaflet
    - npm install --save-dev @types/leaflet
    - npm install react-icons 


## To run on mobile or other devices
1. Find your computer's IP and run - "ifconfig | grep inet"
    e.g 192.168.x.x
2. Run Next.js dev server - v
3. Bind to all interfaces to make it accessible - "npm run dev -- --hostname 0.0.0.0"
4. Connected to the same wifi, on your phone access it - 'http://192.168.x.x:3000" 
    Replace 192.168.x.x with your IP

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.



Project Structure

## Vendor Side
src/app/
├── vendor/                          ← NEW — vendor dashboard root
│   ├── layout.tsx                   ← vendor shell (different nav from main app)
│   ├── page.tsx                     ← vendor dashboard home
│   ├── listings/
│   │   ├── page.tsx                 ← all vendor listings
│   │   ├── new/
│   │   │   └── page.tsx             ← create new listing
│   │   └── [listingId]/
│   │       ├── page.tsx             ← edit listing
│   │       └── bookings/
│   │           └── page.tsx         ← bookings for this listing
│   ├── bookings/
│   │   ├── page.tsx                 ← all bookings across listings
│   │   └── [bookingId]/
│   │       └── page.tsx             ← single booking detail
│   ├── messages/
│   │   └── page.tsx                 ← vendor inbox
│   ├── earnings/
│   │   └── page.tsx                 ← revenue + payouts
│   ├── reviews/
│   │   └── page.tsx                 ← all guest reviews
│   └── profile/
│       └── page.tsx                 ← vendor public profile + settings
│
├── components/
│   └── vendor/                      ← NEW — vendor-specific components
│       ├── VendorShell.tsx          ← sidebar/topbar for vendor pages
│       ├── VendorSidebar.tsx        ← desktop sidebar navigation
│       ├── BookingCard.tsx          ← booking summary card
│       ├── EarningsChart.tsx        ← revenue chart
│       └── ListingForm.tsx          ← create/edit listing form
│
└── data/
    └── vendor.ts                    ← vendor-specific types + mock data






## URL 
Vendor URl 
/vendor              → dashboard
/vendor/listings     → manage listings
/vendor/listings/new → create listing
/vendor/bookings     → all bookings
/vendor/earnings     → revenue
/vendor/messages     → inbox
/vendor/profile      → vendor profile


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.





