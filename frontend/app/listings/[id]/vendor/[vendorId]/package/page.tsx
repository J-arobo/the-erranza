'use client'
import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Share2, Heart, Star, Check, Users } from 'lucide-react'
import { safari } from '@/data/safari'
import { stays } from '@/data/stays'
import { Vendor } from '@/data/stays'

const allListings = [...safari, ...stays]

type Props = {
  params: Promise<{ id: string; vendorId: string }>
}

// Dynamic import for Leaflet map to avoid SSR issues — same pattern as ../page.tsx.
// Unrelated to app/data/packages.ts; this is a per-vendor package configurator.
function MapPlaceholder({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{ lat: number; lng: number; label: string }> | null>(null)

  useEffect(() => {
    import('../MapComponent').then((mod) => {
      setMapComponent(() => mod.default)
    }).catch(() => {})
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

export default function PackagePage({ params }: Props) {
  const { id, vendorId } = use(params)
  const router = useRouter()

  const listing = allListings.find(l => l.id === id)
  const vendor: Vendor | undefined = listing?.vendors?.find(v => v.id === vendorId)

  const [wishlisted, setWishlisted] = useState(false)
  const [guests, setGuests] = useState(1)
  const [selected, setSelected] = useState<Set<string>>(
    new Set((vendor?.packageItems ?? []).filter(i => i.defaultSelected).map(i => i.id))
  )

  if (!listing || !vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-white">
        <span className="text-5xl">🔍</span>
        <p className="text-gray-500 text-sm">Package not found</p>
        <button onClick={() => router.back()}
          className="text-sm font-semibold underline text-[#2c4a1e]">
          Go back
        </button>
      </div>
    )
  }

  const amenities = vendor.amenities ?? []
  const packageItems = vendor.packageItems ?? []

  const basePrice = parseFloat(vendor.price.replace(/[^0-9.]/g, '')) || 100
  const extrasTotal = packageItems
    .filter(i => selected.has(i.id))
    .reduce((sum, i) => sum + i.price, 0)
  const total = basePrice * guests + extrasTotal

  function toggleItem(itemId: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(itemId) ? next.delete(itemId) : next.add(itemId)
      return next
    })
  }

  function handleBook() {
    const bookParams = new URLSearchParams()
    bookParams.set('guests', String(guests))
    if (extrasTotal > 0) bookParams.set('extras', String(extrasTotal))
    router.push(`/listings/${id}/vendor/${vendorId}/book?${bookParams.toString()}`)
  }

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
        <div className="relative h-[280px] sm:h-[360px] bg-[#e0d9cc] rounded-2xl overflow-hidden">
          <Image
            src={vendor.image} alt={vendor.name}
            fill sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover"
          />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 pb-32 px-5 sm:px-6 lg:px-12 max-w-5xl mx-auto w-full">

        {/* Title + location description */}
        <div className="py-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-[#1a1a1a] mb-1">{vendor.name}</h1>
          <p className="text-sm text-gray-500 mb-2">
            {vendor.locationLabel ?? listing.location} · {listing.title}
          </p>
          <div className="flex items-center gap-1.5 mb-3">
            <Star size={14} color="#1a1a1a" fill="#1a1a1a" />
            <span className="text-sm font-semibold text-[#1a1a1a]">{vendor.rating}</span>
            <span className="text-sm text-gray-400">({vendor.reviews} reviews)</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {vendor.description} Explore {listing.title} with a package built around what you
            want to see and do — adjust guests and extras below and the price updates instantly.
          </p>
        </div>

        {/* Guests */}
        <div className="py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} color="#1a1a1a" />
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">Guests</p>
              <p className="text-xs text-gray-400">{guests} adult{guests > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setGuests(g => Math.max(1, g - 1))}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center
                         justify-center hover:border-[#1a1a1a] transition-colors"
            >−</button>
            <span className="text-sm font-semibold w-4 text-center">{guests}</span>
            <button
              onClick={() => setGuests(g => g + 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center
                         justify-center hover:border-[#1a1a1a] transition-colors"
            >+</button>
          </div>
        </div>

        {/* Live price */}
        <div className="py-5 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-1">Total price</p>
          <p className="text-2xl font-bold text-[#1a1a1a]">
            {vendor.price.replace(/[\d,]+/, String(Math.round(total)))}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {vendor.price} × {guests} guest{guests > 1 ? 's' : ''}
            {extrasTotal > 0 && ` + ${vendor.price.replace(/[\d,]+/, String(extrasTotal))} extras`}
          </p>
        </div>

        {/* Inclusions */}
        {amenities.length > 0 && (
          <div className="py-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-4">Inclusions</h3>
            <div className="flex flex-col gap-3">
              {amenities.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <Check size={16} color="#2c4a1e" strokeWidth={2.5} />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customize / extras */}
        {packageItems.length > 0 && (
          <div className="py-5 border-b border-gray-100">
            <h3 className="text-base font-bold text-[#1a1a1a] mb-1">Customize your package</h3>
            <p className="text-xs text-gray-400 mb-4">Select extras to add to your total</p>
            <div className="flex flex-col gap-3">
              {packageItems.map((item) => {
                const isSelected = selected.has(item.id)
                return (
                  <label
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl border
                               border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItem(item.id)}
                        className="w-5 h-5 accent-[#2c4a1e]"
                      />
                      <span className="text-sm text-[#1a1a1a]">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1a1a1a]">
                      +{vendor.price.replace(/[\d,]+/, String(item.price))}
                    </span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Map */}
        <div className="py-5 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#1a1a1a] mb-1">Where you'll be</h3>
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

      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200
                      px-5 py-4 flex items-center justify-between z-50">
        <div>
          <p className="text-base font-bold text-[#1a1a1a]">
            {vendor.price.replace(/[\d,]+/, String(Math.round(total)))} total
          </p>
          <p className="text-xs text-gray-400">{guests} guest{guests > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleBook}
          className="bg-[#2c4a1e] text-white px-8 py-3 rounded-full font-semibold text-sm
                     hover:bg-[#3d6b28] transition-colors active:scale-95"
        >
          Book now
        </button>
      </div>

    </div>
  )
}
