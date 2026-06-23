'use client'
import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, Share2, Heart, Star,
  ChevronRight, Flag, Shield, Calendar,
  MessageCircle, Check
} from 'lucide-react'
import { safari } from '@/data/safari'
import { stays } from '@/data/stays'
import { Vendor } from '@/data/stays'

const allListings = [...safari, ...stays]

type Props = {
  params: Promise<{ id: string; vendorId: string }>
}

// Reviews mock data
const REVIEWS = [
  {
    name: 'Mark Gillet',
    meta: '5 years on Safari',
    date: 'March 2026',
    stars: 4,
    text: 'Absolutely incredible experience. The guides were knowledgeable and patient. We spotted all of the Big Five on day one. The tented camp was comfortable and the food was outstanding. Would highly recommend to anyone visiting Kenya.',
    avatar: '#f0c4d4',
  },
  {
    name: 'Sarah Omondi',
    meta: '2 years on Safari',
    date: 'February 2026',
    stars: 5,
    text: 'Best safari experience I\'ve ever had. The team went above and beyond to ensure we had the perfect game drive. Morning and evening drives were both exceptional.',
    avatar: '#c4d4f0',
  },
]

const REVIEW_TAGS = [
  { icon: '🏖️', label: 'Scenic',   count: 35 },
  { icon: '🚗', label: 'Sunroof',   count: 20 },
  { icon: '📷', label: 'Camera',    count: 14 },
]

const THINGS_TO_KNOW = [
  {
    title: 'Cancellation policy',
    description: 'This reservation is non-refundable. Review the full policy for details.',
  },
  {
    title: 'Tour rules',
    description: 'Respect wildlife, no flash photography, follow guide instructions at all times.',
  },
  {
    title: 'Safety information',
    description: 'Stay inside the vehicle during game drives. Emergency protocols briefed on arrival.',
  },
]

// Dynamic import for Leaflet map to avoid SSR issues
function MapPlaceholder({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{lat: number; lng: number; label: string}> | null>(null)

  useEffect(() => {
    // Dynamically import to avoid SSR
    import('./MapComponent').then((mod) => {
      setMapComponent(() => mod.default)
    }).catch(() => {
      // Map failed to load — show fallback
    })
  }, [])

  if (!MapComponent) {
    return (
      <div className="w-full h-[220px] rounded-2xl bg-[#e8e3d9] flex flex-col
                      items-center justify-center gap-2 border border-[#e0d9cc]">
        <span className="text-3xl">🗺️</span>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-xs text-gray-400">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </div>
    )
  }

  return <MapComponent lat={lat} lng={lng} label={label} />
}

export default function VendorDetailPage({ params }: Props) {
  const { id, vendorId } = use(params)
  const router = useRouter()

  const listing = allListings.find(l => l.id === id)
  const vendor: Vendor | undefined = listing?.vendors?.find(v => v.id === vendorId)

  const [wishlisted, setWishlisted]   = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [showAllReviews, setShowAllReviews]     = useState(false)
  const [expandedReview, setExpandedReview]     = useState<number | null>(null)

  if (!listing || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-white">
        <span className="text-5xl">🔍</span>
        <p className="text-gray-500 text-sm">Vendor not found</p>
        <button onClick={() => router.back()}
          className="text-sm font-semibold underline text-[#2c4a1e]">
          Go back
        </button>
      </div>
    )
  }

  const amenities = vendor.amenities ?? []
  const features  = vendor.features  ?? []
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 4)
  const visibleReviews   = showAllReviews   ? REVIEWS   : REVIEWS.slice(0, 1)
  const otherVendors     = listing.vendors?.filter(v => v.id !== vendorId) ?? []

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-white
                      sticky top-0 z-40 border-b border-gray-100">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                     justify-center hover:bg-gray-50 transition-colors">
          <ArrowLeft size={18} color="#1a1a1a" />
        </button>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                             justify-center hover:bg-gray-50 transition-colors">
            <Share2 size={16} color="#1a1a1a" />
          </button>
          <button
            onClick={() => setWishlisted(w => !w)}
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                       justify-center hover:bg-gray-50 transition-colors">
            <Heart size={16}
              color={wishlisted ? '#e63946' : '#1a1a1a'}
              fill={wishlisted ? '#e63946' : 'none'} />
          </button>
        </div>
      </div>

      {/* ── HERO IMAGE ── */}
      <div className="w-full max-w-5xl mx-auto px-5 sm:px-6 lg:px-12 pt-4">
        <div className="relative h-[280px] sm:h-[360px] bg-[#e0d9cc] rounded-2xl overflow-hidden" >
            <Image
            src={vendor.image} alt={vendor.name}
            fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover"
            />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 pb-32 px-5 sm:px-6 lg:px-12 max-w-5xl mx-auto w-full">

        {/* Title section */}
        <div className="px-5 pt-5 pb-5 border-b border-gray-100 text-center">
          <h1 className="text-xl font-bold text-[#1a1a1a] uppercase tracking-wide mb-2">
            {vendor.name}
          </h1>
          <p className="text-sm text-gray-500 mb-2">
            {vendor.locationLabel ?? listing.location} · {listing.title}
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <Star size={14} color="#1a1a1a" fill="#1a1a1a" />
            <span className="text-sm font-semibold text-[#1a1a1a]">{vendor.rating}</span>
            <button className="text-sm text-[#1a1a1a] underline">
              {vendor.reviews} reviews
            </button>
          </div>
        </div>

        {/* Hosted by */}
        <div className="flex items-center gap-4 py-5 border-b border-gray-100">
          <div className="w-12 h-12 rounded-full flex items-center justify-center
                          flex-shrink-0 text-lg font-bold"
            style={{ background: '#f0c4d4' }}>
            {vendor.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">
              Toured by {vendor.name}
            </p>
            <p className="text-xs text-gray-400">
              {vendor.yearsTouring ?? 3} years touring
            </p>
          </div>
        </div>

        {/* Features / highlights */}
        {features.length > 0 && (
          <div className="py-5 border-b border-gray-100 flex flex-col gap-5">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{f.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Description */}
        <div className="py-5 border-b border-gray-100">
          <p className={`text-sm text-gray-600 leading-relaxed
            ${!showFullDesc ? 'line-clamp-4' : ''}`}>
            {vendor.description} Explore the vast savannah landscapes, encounter Africa's most iconic wildlife, and create memories that will last a lifetime. Our experienced guides bring the ecosystem to life with their deep knowledge of animal behaviour and local ecology. Every drive is different — every sighting unforgettable.
          </p>
          <button
            onClick={() => setShowFullDesc(s => !s)}
            className="mt-3 w-full py-3 rounded-xl bg-gray-100 text-sm font-semibold
                       text-[#1a1a1a] hover:bg-gray-200 transition-colors">
            {showFullDesc ? 'Show less' : 'Show more'}
          </button>
        </div>

        {/* Reviews */}
        <div className="py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} color="#1a1a1a" fill="#1a1a1a" />
            <span className="text-lg font-bold text-[#1a1a1a]">
              {vendor.rating} · {vendor.reviews} reviews
            </span>
          </div>

          {/* Review tag chips */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
            {REVIEW_TAGS.map(({ icon, label, count }) => (
              <div key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border
                           border-gray-200 bg-white flex-shrink-0">
                <span className="text-base">{icon}</span>
                <span className="text-sm text-[#1a1a1a]">{label}</span>
                <span className="text-sm text-gray-400">{count}</span>
              </div>
            ))}
          </div>

          {/* Review cards */}
          <div className="flex flex-col gap-5 mt-2">
            {visibleReviews.map((review, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center
                                  text-sm font-bold flex-shrink-0"
                    style={{ background: review.avatar }}>
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.meta}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={13}
                        color={j < review.stars ? '#1a1a1a' : '#ddd'}
                        fill={j < review.stars ? '#1a1a1a' : '#ddd'} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">{review.date}</span>
                </div>
                <p className={`text-sm text-gray-600 leading-relaxed
                  ${expandedReview !== i ? 'line-clamp-3' : ''}`}>
                  {review.text}
                </p>
                <button
                  onClick={() => setExpandedReview(expandedReview === i ? null : i)}
                  className="text-sm font-semibold text-[#1a1a1a] underline mt-1">
                  {expandedReview === i ? 'Show less' : 'Show more'}
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAllReviews(s => !s)}
            className="mt-4 w-full py-3 rounded-xl bg-gray-100 text-sm font-semibold
                       text-[#1a1a1a] hover:bg-gray-200 transition-colors">
            {showAllReviews
              ? 'Show fewer reviews'
              : `Show all ${vendor.reviews} reviews`}
          </button>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="py-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-4">
              What this tour offers
            </h3>
            <div className="flex flex-col gap-3">
              {visibleAmenities.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check size={16} color="#2c4a1e" strokeWidth={2.5} />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
            {amenities.length > 4 && (
              <button
                onClick={() => setShowAllAmenities(s => !s)}
                className="mt-4 w-full py-3 rounded-xl bg-gray-100 text-sm font-semibold
                           text-[#1a1a1a] hover:bg-gray-200 transition-colors">
                {showAllAmenities
                  ? 'Show fewer'
                  : `Show all ${amenities.length} amenities`}
              </button>
            )}
          </div>
        )}

        {/* Map */}
        <div className="py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1a1a1a] mb-1">
            Where you'll be
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {vendor.locationLabel ?? listing.location}
          </p>
          {vendor.lat && vendor.lng ? (
            <MapPlaceholder
              lat={vendor.lat}
              lng={vendor.lng}
              label={vendor.locationLabel ?? listing.location}
            />
          ) : (
            <div className="w-full h-[200px] rounded-2xl bg-[#e8e3d9] flex items-center
                            justify-center border border-[#e0d9cc]">
              <p className="text-sm text-gray-400">Location map coming soon</p>
            </div>
          )}
        </div>

        {/* Vendor profile card */}
        <div className="py-5 border-b border-gray-100">
          <div className="flex items-center gap-4 bg-white rounded-2xl border
                          border-gray-100 shadow-sm p-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-[#e0d9cc] relative">
                <Image src={vendor.image} alt={vendor.name} fill
                  className="object-cover" sizes="64px" />
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-white
                              border border-gray-200 flex items-center justify-center">
                <Shield size={10} color="#2c4a1e" />
              </div>
            </div>

            {/* Name + type */}
            <div className="flex-1">
              <p className="text-base font-bold text-[#1a1a1a]">{vendor.name}</p>
              <p className="text-xs text-gray-400">Tours</p>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-2 text-right">
              <div>
                <p className="text-base font-bold text-[#1a1a1a]">{vendor.reviews}</p>
                <div className="w-16 h-px bg-gray-200 mb-1" />
                <p className="text-[10px] text-gray-400">Reviews</p>
              </div>
              <div>
                <p className="text-base font-bold text-[#1a1a1a]">{vendor.rating} ★</p>
                <div className="w-16 h-px bg-gray-200 mb-1" />
                <p className="text-[10px] text-gray-400">Rating</p>
              </div>
              <div>
                <p className="text-base font-bold text-[#1a1a1a]">
                  {vendor.yearsTouring ?? 3}
                </p>
                <div className="w-16 h-px bg-gray-200 mb-1" />
                <p className="text-[10px] text-gray-400">Yrs touring</p>
              </div>
            </div>
          </div>

          {/* Host details */}
          <div className="mt-4">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-2">Host details</h3>
            <p className="text-sm text-gray-500">
              Response rate: {vendor.responseRate ?? 98}%
            </p>
            <p className="text-sm text-gray-500">
              Responds {vendor.responseTime ?? 'within a few hours'}
            </p>
          </div>

          <button className="mt-4 w-full py-3 rounded-xl bg-gray-100 text-sm font-semibold
                             text-[#1a1a1a] hover:bg-gray-200 transition-colors flex items-center
                             justify-center gap-2">
            <MessageCircle size={16} color="#1a1a1a" />
            Message tour operator
          </button>

          <p className="text-xs text-gray-400 mt-2 text-center">
            🔒 To help protect your payment, always communicate and pay through Erranza.
          </p>
        </div>

        {/* Availability */}
        <div className="py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} color="#1a1a1a" />
            <h3 className="text-base font-bold text-[#1a1a1a]">Availability</h3>
          </div>
          <p className="text-sm text-gray-500">
            {vendor.availability ?? 'Contact vendor for availability'}
          </p>
        </div>

        {/* More vendors */}
        {otherVendors.length > 0 && (
          <div className="py-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-4">
              More tours offering similar services
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherVendors.slice(0, 4).map((v) => (
                <button
                  key={v.id}
                  onClick={() => router.push(`/listings/${id}/vendor/${v.id}`)}
                  className="relative h-[130px] rounded-2xl overflow-hidden bg-[#e0d9cc]
                             active:scale-95 transition-transform"
                >
                  <Image src={v.image} alt={v.name} fill
                    className="object-cover" sizes="50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs font-semibold truncate">{v.name}</p>
                    <p className="text-white/70 text-[10px]">{v.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Things to know */}
        <div className="px-5 py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1a1a1a] mb-4">Things to know</h3>
          <div className="flex flex-col gap-4">
            {THINGS_TO_KNOW.map((item) => (
              <button key={item.title}
                className="flex items-start gap-3 text-left w-full">
                <Calendar size={18} color="#1a1a1a" className="flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1a1a1a]">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                </div>
                <ChevronRight size={16} color="#aaa" className="flex-shrink-0 mt-0.5" />
              </button>
            ))}
          </div>

          {/* Report listing */}
          <button className="flex items-center gap-2 mt-5">
            <Flag size={14} color="#888" />
            <span className="text-sm text-[#1a1a1a] underline">Report this listing</span>
          </button>
        </div>

      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
                      px-5 py-4 flex items-center justify-between z-50">
        <div>
          <p className="text-base font-bold text-[#1a1a1a] underline">{vendor.price} total</p>
          <p className="text-xs text-gray-400">{vendor.availability ?? '30 Apr – 2 May'}</p>
        </div>
        <button
          onClick={() => router.push(`/listings/${id}/vendor/${vendorId}/book`)}
          className="bg-[#2c4a1e] text-white px-8 py-3 rounded-full font-semibold text-sm
                     hover:bg-[#3d6b28] transition-colors active:scale-95"
        >
          Reserve
        </button>
      </div>

    </div>
  )
}