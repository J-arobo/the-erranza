'use client'
import { use, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, Share2, Heart, Star,
  MapPin, Clock, Users, Shield,
  ChevronRight, Check, Grid2X2
} from 'lucide-react'
import { safari } from '@/data/safari'
import { stays } from '@/data/stays'
import { Vendor } from '@/data/stays'

const allListings = [...safari, ...stays]

type Props = { params: Promise<{ id: string }> }

export default function ListingDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const listing = allListings.find(l => l.id === id)

  const [wishlisted, setWishlisted] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [showAll, setShowAll] = useState(false)
  const [showGallery, setShowGallery] = useState(false)

  // Touch swipe state
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <span className="text-5xl">🔍</span>
        <p className="text-gray-500 text-sm">Listing not found</p>
        <button onClick={() => router.back()}
          className="text-sm font-semibold underline text-[#2c4a1e]">
          Go back
        </button>
      </div>
    )
  }

  const images = listing.images ?? [listing.image]
  const vendors = listing.vendors ?? []

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) setActiveImage(i => Math.min(images.length - 1, i + 1)) // swipe left
    if (diff < -50) setActiveImage(i => Math.max(0, i - 1))                  // swipe right
  }

  // ── Full screen gallery modal ─────────────────────────────────────────
  if (showGallery) {
    return (
      <div className="fixed inset-0 bg-black z-[200] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <button
            onClick={() => setShowGallery(false)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <span className="text-white text-sm font-semibold">
            {activeImage + 1} / {images.length}
          </span>
          <div className="w-9" />
        </div>
        <div
          className="flex-1 relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[activeImage]}
            alt={`${listing.title} ${activeImage + 1}`}
            fill
            sizes="100vw"
            className="object-contain"
          />
        </div>
        <div className="flex gap-1.5 justify-center py-4 overflow-x-auto px-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0
                          border-2 transition-all
                          ${activeImage === i ? 'border-white' : 'border-transparent opacity-60'}`}
            >
              <Image src={img} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-white
                      sticky top-0 z-40 border-b border-gray-100">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                     justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} color="#1a1a1a" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#1a1a1a] truncate px-4">
          {listing.title}
        </h1>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                             justify-center hover:bg-gray-50 transition-colors">
            <Share2 size={16} color="#1a1a1a" />
          </button>
          <button
            onClick={() => setWishlisted(w => !w)}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                       justify-center hover:bg-gray-50 transition-colors"
          >
            <Heart size={16}
              color={wishlisted ? '#e63946' : '#1a1a1a'}
              fill={wishlisted ? '#e63946' : 'none'} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          MOBILE PHOTO CAROUSEL — bulge style
          with swipe + count badge
          ═══════════════════════════════════════ */}
      <div className="sm:hidden">
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ height: '72vw', maxHeight: '340px' }}
        >
          {/* Slides strip */}
          <div
            className="flex h-full transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${activeImage * 100}%)` }}
          >
            {images.map((img, i) => (
              <div
                key={i}
                className="relative flex-shrink-0 w-full h-full"
              >
                <Image
                  src={img}
                  alt={`${listing.title} ${i + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  onClick={() => setShowGallery(true)}
                />
              </div>
            ))}
          </div>

          {/* Count badge bottom-right */}
          <div className="absolute bottom-3 right-3 bg-black/60 text-white
                          text-xs font-semibold px-2.5 py-1 rounded-full">
            {activeImage + 1} / {images.length}
          </div>

          {/* Left/right tap zones — transparent */}
          <button
            className="absolute left-0 top-0 w-1/3 h-full"
            onClick={() => setActiveImage(i => Math.max(0, i - 1))}
          />
          <button
            className="absolute right-0 top-0 w-1/3 h-full"
            onClick={() => setActiveImage(i => Math.min(images.length - 1, i + 1))}
          />
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 py-2">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`rounded-full transition-all duration-200
                ${activeImage === i
                  ? 'w-5 h-1.5 bg-[#2c4a1e]'
                  : 'w-1.5 h-1.5 bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          DESKTOP PHOTO GRID — 
          1 large left + 2×2 right grid
          ═══════════════════════════════════════ */}
      <div className="hidden sm:block pt-4">
        <div className="relative grid grid-cols-2 gap-2 rounded-2xl overflow-hidden max-w-6xl mx-auto h-[500px] lg:h-[600px]"
        >  {/* style={{ height: '420px'}} */}

          {/* Large left image */}
          <div className="relative row-span-2 overflow-hidden group cursor-pointer"
            onClick={() => setShowGallery(true)}>
            <Image
              src={images[0]}
              alt={listing.title}
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* 2×2 right grid */}
          <div className="grid grid-cols-2 grid-rows-2 gap-3 lg:gap-4 ">
            {images.slice(1, 5).map((img, i) => (
              <div
                key={i}
                className="relative overflow-hidden group cursor-pointer"
                onClick={() => { setActiveImage(i + 1); setShowGallery(true) }}
              >
                <Image
                  src={img}
                  alt={`${listing.title} ${i + 2}`}
                  fill
                  sizes="25vw"
                  className="object-cover transition-transform duration-300
                             group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Show all photos button — bottom right corner */}
          <button
            onClick={() => setShowGallery(true)}
            className="absolute bottom-4 right-4 flex items-center gap-2 bg-white
                       border border-gray-300 rounded-xl px-4 py-2 text-sm font-semibold
                       text-[#1a1a1a] hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Grid2X2 size={15} color="#1a1a1a" />
            Show all photos
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 pb-8
                      max-w-5xl mx-auto w-full">

        {/* Title + rating */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <h2 className="text-2xl font-bold text-[#1a1a1a] leading-tight flex-1">
            {listing.title}
          </h2>
          <div className="flex items-center gap-1 flex-shrink-0 mt-1">
            <Star size={14} color="#f5a623" fill="#f5a623" />
            <span className="text-sm font-bold text-[#1a1a1a]">{listing.rating}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-4">
          <MapPin size={13} color="#888" />
          <span className="text-sm text-gray-500">{listing.location}</span>
        </div>

        {/* Quick stats */}
        <div className="flex gap-4 mb-5 pb-5 border-b border-gray-100">
          {[
            { Icon: Clock, label: '2–5 days' },
            { Icon: Users, label: 'All group sizes' },
            { Icon: Shield, label: 'Verified vendors' },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={14} color="#2c4a1e" />
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-[#1a1a1a] mb-2">
            About this destination
          </h3>
          <p className={`text-sm text-gray-600 leading-relaxed
            ${!showAll ? 'line-clamp-3' : ''}`}>
            {listing.description ??
              `Experience the magic of ${listing.title}. A world-class destination
               offering unforgettable wildlife encounters and breathtaking landscapes.`}
          </p>
          <button
            onClick={() => setShowAll(s => !s)}
            className="text-sm font-semibold text-[#1a1a1a] underline mt-1"
          >
            {showAll ? 'Show less' : 'Show more'}
          </button>
        </div>

        {/* What's included */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1a1a1a] mb-3">
            What's typically included
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Expert local guides',
              'Game drives',
              'Park entry fees',
              'Accommodation',
              'Meals (varies by vendor)',
              'Transport from city',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#eaf5e4] flex items-center
                                justify-center flex-shrink-0">
                  <Check size={11} color="#2c4a1e" strokeWidth={2.5} />
                </div>
                <span className="text-xs text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Package-specific: what's included details */}
        {listing.packageIncludes && (
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-3">Package includes</h3>
            <div className="flex flex-col gap-2">
              {listing.packageIncludes.map((item: string) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#eaf5e4] flex items-center
                          justify-center flex-shrink-0">
                    <Check size={11} color="#2c4a1e" strokeWidth={2.5} />
                  </div>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Vendors ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-[#1a1a1a]">
              Available packages
            </h3>
            <span className="text-xs text-gray-400">
              {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor.id}
                vendor={vendor}
                listingId={id}
                onBook={(vendorId) =>
                  router.push(`/listings/${id}/vendor/${vendorId}`)
                }
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ── Vendor Card ─────────────────────────────────────────────────────────────
// Fix 2: entire card is clickable including image
type VendorCardProps = {
  vendor: Vendor
  listingId: string
  onBook: (vendorId: string) => void
}

function VendorCard({ vendor, listingId, onBook }: VendorCardProps) {
  const [wishlisted, setWishlisted] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    // The entire card calls onBook — including the image
    <div
      onClick={() => onBook(vendor.id)}
      className="bg-[#faf8f1] rounded-2xl overflow-hidden border border-[#eeebe4]
                 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]
                 group"
    >
      {/* Vendor image — fully clickable as part of card */}
      <div className="relative h-[160px] sm:h-[200px] bg-[#e0d9cc] overflow-hidden">
        {!imgError ? (
          <Image
            src={vendor.image}
            alt={vendor.name}
            fill
            sizes="(max-width: 640px) 100vw, 600px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#d4cdc0]">
            <span className="text-xs text-gray-400">{vendor.name}</span>
          </div>
        )}

        {/* Wishlist — stops propagation so it doesn't trigger onBook */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(w => !w) }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/85 rounded-full
                     flex items-center justify-center active:scale-90 transition-transform
                     z-10"
        >
          <Heart
            size={14}
            color={wishlisted ? '#e63946' : '#555'}
            fill={wishlisted ? '#e63946' : 'none'}
          />
        </button>

        {/* View details overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10
                        transition-colors duration-200 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity
                           bg-white text-[#1a1a1a] text-xs font-semibold px-3 py-1.5
                           rounded-full shadow">
            View details
          </span>
        </div>
      </div>

      {/* Vendor details */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-[15px] font-bold text-[#1a1a1a] leading-tight flex-1">
            {vendor.name}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={12} color="#f5a623" fill="#f5a623" />
            <span className="text-[12px] font-semibold text-[#1a1a1a]">
              {vendor.rating}
            </span>
            <span className="text-[11px] text-gray-400">({vendor.reviews})</span>
          </div>
        </div>

        <p className="text-[12px] text-gray-500 mb-3 leading-relaxed">
          {vendor.description}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-400">from </span>
            <span className="text-[16px] font-bold text-[#1a1a1a]">{vendor.price}</span>
            <span className="text-[11px] text-gray-400"> / person</span>
          </div>
          {/* Button still works as a visual affordance but card handles the click */}
          <div
            className="flex items-center gap-1.5 bg-[#2c4a1e] text-white
                       px-4 py-2 rounded-xl text-xs font-semibold"
          >
            Book now
            <ChevronRight size={13} color="white" />
          </div>
        </div>
      </div>
    </div>
  )
}