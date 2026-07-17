'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Star, Check, ArrowRight } from 'lucide-react'
import AppShell from '@/components/AppShell'
import FooterSection from '@/components/FooterSection'
import HeartButton from '@/components/HeartButton'
import { packages } from '@/data/packages'
import { safari } from '@/data/safari'

const FILTERS = ['All', 'Beach', 'Safari', 'Cultural', 'Honeymoon', 'Family']

// Every vendor "package" built off a safari destination — dates are fixed
// per booking there (no date picker), so these are ready-to-book as-is.
const safariPackages = safari.flatMap((listing) =>
  (listing.vendors ?? []).map((v) => ({
    listingId: listing.id,
    vendorId: v.id,
    listingTitle: listing.title,
    location: listing.location,
    vendorName: v.name,
    image: v.image,
    price: v.price,
    rating: v.rating,
  }))
)

type SafariPackage = typeof safariPackages[number]

// Peek carousel on mobile (one full card + a peek of the next), wider cards
// at each larger breakpoint — shared by both sliding rows so they stay in sync.
const CARD_WIDTH_CLASSES = `flex-shrink-0 min-w-0
  w-[calc(100vw_-_120px)]
  sm:w-[calc((100vw_-_88px)/3)]
  md:w-[calc((100vw_-_164px)/4)]
  lg:w-[calc((100vw_-_164px)/4)]
  xl:w-[calc((100vw_-_496px)/5)]`

// ── Safari tour card — same shell as PackageCard (border/shadow, inset rounded image,
// title+rating row, price+CTA row); no itinerary block since vendor data doesn't have one ──
function SafariPackageCard({ pkg }: { pkg: SafariPackage }) {
  const router = useRouter()
  const listingLike = {
    id: `${pkg.listingId}-${pkg.vendorId}`,
    location: pkg.location,
    title: pkg.vendorName,
    price: pkg.price,
    rating: pkg.rating,
    image: pkg.image,
  }

  return (
    <div
      onClick={() => router.push(`/listings/${pkg.listingId}/vendor/${pkg.vendorId}/package`)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer
      shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)]
      transition-shadow duration-200 active:scale-[0.98]"

    >
      <div className="relative w-full aspect-[4/3] rounded-b-2xl overflow-hidden bg-[#e0d9cc]">
        <Image
          src={pkg.image} alt={pkg.vendorName} fill
          sizes="(max-width: 640px) 90vw, 30vw"
          className="object-cover"
        />
        <span className="absolute top-3 left-3 bg-white text-[#1a1a1a] text-[10px]
                         font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm z-10">
          {pkg.listingTitle}
        </span>
        <HeartButton listing={listingLike} size={22} className="absolute top-3 right-3 z-10" />
        <span className="absolute bottom-3 left-3 bg-black/55 text-white text-[11px]
                         font-semibold px-2.5 py-1 rounded-full z-10">
          {pkg.location}
        </span>
      </div>

      <div className="pt-3 px-1 pb-1">
        <p className="text-[13px] text-[#222] font-semibold leading-snug line-clamp-2">{pkg.vendorName}</p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          {pkg.price} . <span>★ {pkg.rating}</span>
        </p>
      </div>

    </div>
  )
}

// ── Curated package card 
function PackageCard({ pkg }: { pkg: typeof packages[number] }) {
  const router = useRouter()
  const highlights = (pkg.itinerary ?? []).slice(0, 2)

  return (
    <div
      onClick={() => router.push(`/destinations/packages/${pkg.id}`)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer
      shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)]
      transition-shadow duration-200 active:scale-[0.98]"
    >
      <div className="relative w-full aspect-[4/3] rounded-b-2xl overflow-hidden bg-[#e0d9cc]">


        <Image
          src={pkg.image} alt={pkg.title} fill
          sizes="(max-width: 640px) 90vw, 30vw"
          className="object-cover"
        />
        {pkg.badge && (
          <span className="absolute top-3 left-3 bg-white text-[#1a1a1a] text-[10px]
                           font-bold uppercase tracking-wide px-2.5 py-1 rounded-full shadow-sm z-10">
            {pkg.badge}
          </span>
        )}
        <HeartButton listing={pkg} size={22} className="absolute top-3 right-3 z-10" />
        <span className="absolute bottom-3 left-3 bg-black/55 text-white text-[11px]
                         font-semibold px-2.5 py-1 rounded-full z-10">
          {pkg.location}
        </span>
      </div>

      <div className="pt-3 px-1 pb-1">
        <p className="text-[13px] text-[#222] font-semibold leading-snug line-clamp-2 mb-2">{pkg.title}</p>


        {highlights.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-2">
            {highlights.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check size={13} color="#2c4a1e" strokeWidth={2.5} className="flex-shrink-0 mt-[2px]" />
                <span className="text-[12px] text-gray-500 leading-snug">{step}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[12px] text-gray-500 mt-0.5">
          {pkg.price} . <span>★ {pkg.rating}</span>
        </p>
      </div>

    </div>
  )
}

// ── Section heading
function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2 px-4 sm:px-8 md:px-12 lg:px-52 mb-3 w-fit">
      <h2 className="text-base font-bold text-[#1a1a1a]">{title}</h2>
      <button className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
        <ArrowRight size={14} color="#1a1a1a" />
      </button>
    </div>
  )
}


export default function PackagesPage() {
  const router = useRouter()
  const [activeFilter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = packages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell showCollapse={false}>
      <div className="pt-4 bg-[#ffffff] min-h-full overflow-x-hidden w-full">

        {/*
        <div className="px-4 sm:px-8 md:px-12 lg:px-52 pb-3">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Travel Packages</h1>
          <p className="text-sm text-gray-500">Curated multi-day itineraries</p>
        </div>
        */}

        {/* ── Curated packages */}
        <div className="mb-2">
          <SectionHeading title="Curated packages" />

          <div className="sm:px-4 md:px-12 lg:px-52 pb-4">
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 px-4">
                {filtered.map((item) => (
                  <div key={item.id} className={CARD_WIDTH_CLASSES}>
                    <PackageCard pkg={item} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* ── Safari tour packages (existing destinations, fixed-date booking) ── */}
        {safariPackages.length > 0 && (
          <div>
            <SectionHeading title="Safari tour packages" />

            <div className="sm:px-4 md:px-12 lg:px-52 pb-2">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 px-4">
                  {safariPackages.map((pkg) => (
                    <div key={`${pkg.listingId}-${pkg.vendorId}`} className={CARD_WIDTH_CLASSES}>
                      <SafariPackageCard pkg={pkg} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/*
        <div className="flex gap-2 px-4 sm:px-8 md:px-12 lg:px-52 pb-4 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
                          border transition-all
                ${activeFilter === f
                  ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                  : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>
        */}


        {/* ── Build your own package CTA ── */}
        <div className="px-4 sm:px-8 md:px-12 lg:px-52 py-8 flex justify-center">
          <button
            onClick={() => router.push('/destinations/packages/create')}
            className="flex items-center gap-1.5 bg-[#2c4a1e] text-white px-5 py-3
                       rounded-xl text-sm font-semibold hover:bg-[#3d6b28] transition-colors"
          >
            <Plus size={16} />
            Build package
          </button>


        </div>

        <FooterSection />
      </div>
    </AppShell>
  )
}
