'use client'
import { use, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, Share2, Heart, Star, X, Camera, Grid2X2,
  ChevronRight, ChevronLeft, Flag, Shield, Calendar, CalendarX2, Key, ShieldHalf,
  MessageCircle, Check, MapPin, Globe, Award,
} from 'lucide-react'
import { safari } from '@/data/safari'
import { stays } from '@/data/stays'
import { Vendor } from '@/data/stays'
import FooterSection from '@/components/FooterSection'

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
  { icon: '🏖️', label: 'Scenic', count: 35 },
  { icon: '🚗', label: 'Sunroof', count: 20 },
  { icon: '📷', label: 'Camera', count: 14 },
]

// Dynamic import for Leaflet map to avoid SSR issues
function MapPlaceholder({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{ lat: number; lng: number; label: string }> | null>(null)

  useEffect(() => {
    import('./MapComponent').then((mod) => {
      setMapComponent(() => mod.default)
    }).catch(() => { })
  }, [])

  if (!MapComponent) {
    return (
      <div className="w-full h-[220px] rounded-2xl flex flex-col
                      items-center justify-center gap-2" style={{ background: '#e8e3d9', border: '1px solid #e8e0d0' }}>
        <span className="text-3xl">🗺️</span>
        <p className="text-sm font-medium" style={{ color: '#78716c' }}>{label}</p>
        <p className="text-xs" style={{ color: '#a8a29e' }}>
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      </div>
    )
  }

  return <MapComponent lat={lat} lng={lng} label={label} />
}

const Divider = () => <div className="border-t border-[#e8e0d0] my-6" />

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// ── Mobile single-month calendar (single date, not a range) ──
function MiniCalendar({ selected, onSelect }: {
  selected: Date | null; onSelect: (d: Date) => void
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())


  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const isPast = (d: number) => new Date(year, month, d) < todayMid
  const isSelected = (d: number) => selected?.toDateString() === new Date(year, month, d).toDateString()

  return (
    <div style={{ background: '#FEFDFC', borderRadius: 16, padding: '16px 8px' }}>
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={() => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ WebkitTapHighlightColor: 'transparent', border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <ChevronLeft size={16} color="#304333" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#304333', fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={() => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ WebkitTapHighlightColor: 'transparent', border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <ChevronRight size={16} color="#304333" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WDAYS.map((d, i) => (
          <div key={i} className="text-center py-1" style={{ fontSize: 11, fontWeight: 600, color: '#78716c' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7" style={{ rowGap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const past = isPast(d), sel = isSelected(d)
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40 }}>
              <button disabled={past} onClick={() => !past && onSelect(new Date(year, month, d))}
                style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: sel ? 700 : 400,
                  background: sel ? '#2c4a1e' : 'transparent',
                  color: sel ? '#EAF98E' : past ? '#c8c0b4' : '#304333',
                  cursor: past ? 'not-allowed' : 'pointer', border: 'none',
                  WebkitTapHighlightColor: 'transparent', position: 'relative',
                }}>
                {past && (
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ position: 'absolute', width: '130%', height: '1px', background: '#c8c0b4', transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
                  </span>
                )}
                {d}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Desktop two-month calendar (single date, not a range) ──
function DesktopCalendar({ selected, onSelect, stacked = false }: {
  selected: Date | null; onSelect: (d: Date) => void; stacked?: boolean
}) {
  const today = new Date()
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const [startYear, setStartYear] = useState(today.getFullYear())
  const [startMonth, setStartMonth] = useState(today.getMonth())

  const secondMonth = startMonth === 11 ? 0 : startMonth + 1
  const secondYear = startMonth === 11 ? startYear + 1 : startYear

  function prevMonth() {
    if (startMonth === 0) { setStartMonth(11); setStartYear(y => y - 1) }
    else setStartMonth(m => m - 1)
  }
  function nextMonth() {
    if (startMonth === 11) { setStartMonth(0); setStartYear(y => y + 1) }
    else setStartMonth(m => m + 1)
  }

  function renderMonth(year: number, month: number, isLeft: boolean) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

    const isPast = (d: number) => new Date(year, month, d) < todayMid
    const isSelected = (d: number) => selected?.toDateString() === new Date(year, month, d).toDateString()

    return (
      <div style={{ flex: 1 }}>
        <div className="flex items-center justify-between mb-4">
          {isLeft ? (
            <button onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f5f0e6]"
              style={{ border: '1px solid #e8e0d0', background: 'transparent', cursor: 'pointer' }}>
              <ChevronLeft size={15} color="#304333" />
            </button>
          ) : <div className="w-8" />}
          <span style={{ fontSize: 15, fontWeight: 600, color: '#304333', fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {MONTHS[month]} {year}
          </span>
          {!isLeft ? (
            <button onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f5f0e6]"
              style={{ border: '1px solid #e8e0d0', background: 'transparent', cursor: 'pointer' }}>
              <ChevronRight size={15} color="#304333" />
            </button>
          ) : <div className="w-8" />}
        </div>
        <div className="grid grid-cols-7 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
            <div key={i} className="text-center py-1" style={{ fontSize: 12, fontWeight: 600, color: '#78716c' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7" style={{ rowGap: 2 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const past = isPast(d), sel = isSelected(d)
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44 }}>
                <button disabled={past} onClick={() => !past && onSelect(new Date(year, month, d))}
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: sel ? 700 : 400,
                    background: sel ? '#2c4a1e' : 'transparent',
                    color: sel ? '#EAF98E' : past ? '#c8c0b4' : '#304333',
                    cursor: past ? 'not-allowed' : 'pointer', border: 'none',
                    WebkitTapHighlightColor: 'transparent', position: 'relative',
                  }}>
                  {past && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', width: '130%', height: '1px', background: '#c8c0b4', transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
                    </span>
                  )}
                  {d}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ borderRadius: 16, padding: stacked ? 0 : 24, background: '#FEFDFC' }}>
      <div style={{ display: 'flex', flexDirection: stacked ? 'column' : 'row', gap: stacked ? 24 : 32 }}>
        {renderMonth(startYear, startMonth, true)}
        {stacked ? (
          <div style={{ height: 1, background: '#e8e0d0' }} />
        ) : (
          <div style={{ width: 1, background: '#e8e0d0', flexShrink: 0 }} />
        )}
        {renderMonth(secondYear, secondMonth, false)}
      </div>
    </div>
  )
}


export default function VendorDetailPage({ params }: Props) {
  const { id, vendorId } = use(params)
  const router = useRouter()

  const listing = allListings.find(l => l.id === id)
  const vendor: Vendor | undefined = listing?.vendors?.find(v => v.id === vendorId)

  const [wishlisted, setWishlisted] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [expandedReview, setExpandedReview] = useState<number | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [pets, setPets] = useState(0)

  const guests = adults + children
  const [showSidebarCal, setShowSidebarCal] = useState(false)
  const [showGuestPanel, setShowGuestPanel] = useState(false)
  const [showMobileDatePicker, setShowMobileDatePicker] = useState(false)

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
  const features = vendor.features ?? []
  const images = vendor.images ?? [vendor.image]
  const visibleAmenities = showAllAmenities ? amenities : amenities.slice(0, 4)
  const visibleReviewsDesktop = showAllReviews ? REVIEWS : REVIEWS.slice(0, 2)
  const visibleReviewsMobile = showAllReviews ? REVIEWS : REVIEWS.slice(0, 1)
  const otherVendors = listing.vendors?.filter(v => v.id !== vendorId) ?? []
  const basePrice = parseFloat(vendor.price.replace(/[^0-9.]/g, '')) || 100

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) setActiveImage(i => Math.min(images.length - 1, i + 1))
    if (diff < -50) setActiveImage(i => Math.max(0, i - 1))
  }

  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation()
    setWishlisted(w => !w)
  }

  // ── Full screen gallery modal ─────────────────────────────────────────
  if (showGallery) {
    return (
      <div className="fixed inset-0 bg-black z-[200] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <button
            onClick={() => setShowGallery(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <X size={18} color="white" />
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
            alt={`${vendor.name} ${activeImage + 1}`}
            fill sizes="100vw" className="object-contain"
          />
        </div>
        <div className="flex gap-2 justify-center py-4 px-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className="relative flex-shrink-0 rounded-lg overflow-hidden"
              style={{
                width: 56, height: 56,
                border: `2px solid ${i === activeImage ? 'white' : 'transparent'}`,
                opacity: i === activeImage ? 1 : 0.5,
              }}
            >
              <Image src={img} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    )
  }
  if (showMobileDatePicker) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <button
            onClick={() => setShowMobileDatePicker(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={22} color="#304333" />
          </button>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-sm font-semibold text-[#304333] underline"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            Clear dates
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-32">
          <h1 className="text-2xl font-bold text-[#304333] mb-1">Select tour date</h1>
          <p className="text-sm text-[#78716c] mb-6">Add your preferred tour date</p>
          <DesktopCalendar selected={selectedDate} onSelect={setSelectedDate} stacked />
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white px-5"
          style={{ borderTop: '1px solid #e8e0d0', paddingTop: 14, paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}>
          <div className="flex items-center justify-between">
            <div>
              {selectedDate ? (
                <p className="text-sm font-semibold text-[#304333]">
                  {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              ) : (
                <p className="text-sm font-semibold text-[#304333]">Add dates for prices</p>
              )}
              <div className="flex items-center gap-1">
                <Star size={12} fill="#F5D06E" color="#304333" />
                <span className="text-xs text-[#78716c]">{vendor.rating}</span>
              </div>
            </div>
            <button
              onClick={() => setShowMobileDatePicker(false)}
              disabled={!selectedDate}
              className="px-8 py-3 rounded-xl font-semibold text-sm transition-opacity"
              style={{
                background: selectedDate ? '#304333' : '#e8e0d0',
                color: selectedDate ? 'white' : '#a8a29e',
                border: 'none',
                cursor: selectedDate ? 'pointer' : 'not-allowed',
              }}>
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#FEFDFC', fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', background: '#FEFDFC' }}>


        {/* ═══════════════════════════════════════
          MOBILE PHOTO — single active image
          with overlay controls + count badge
          ═══════════════════════════════════════ */}
        <div className="sm:hidden">
          <div
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ height: '72vw', maxHeight: '340px' }}
          >
            <Image
              src={images[activeImage]}
              alt={`${vendor.name} ${activeImage + 1}`}
              fill sizes="100vw" className="object-cover"
              onClick={() => setShowGallery(true)}
            />

            {/* Top overlay controls */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 z-10"
              style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))', paddingBottom: 12 }}>
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
              >
                <ArrowLeft size={18} color="#304333" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                >
                  <Share2 size={16} color="#304333" />
                </button>
                <button
                  onClick={handleWishlist}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                >
                  <Heart size={16} color={wishlisted ? '#e8612a' : '#304333'} fill={wishlisted ? '#e8612a' : 'none'} />
                </button>
              </div>
            </div>

            {/* Count badge bottom-right */}
            <div className="absolute bottom-3 right-3 bg-black/60 text-white
                          text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 z-10">
              <Camera size={12} />
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
                className="rounded-full transition-all duration-200"
                style={{
                  width: activeImage === i ? 16 : 6, height: 6,
                  background: activeImage === i ? '#2c4a1e' : '#d4d4d4',
                }}
              />
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
          DESKTOP PHOTO GRID —
          back/share/save row + 1 large left + 2×2 right grid
          ═══════════════════════════════════════ */}
        <div className="hidden sm:block pt-4">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">

            <div className="flex items-center justify-between pb-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#304333] hover:underline"
              >
                <ArrowLeft size={16} strokeWidth={2} /> Back
              </button>
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors underline">
                  <Share2 size={15} /> Share
                </button>
                <button
                  onClick={handleWishlist}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors underline"
                >
                  <Heart size={15} color={wishlisted ? '#e8612a' : '#304333'} fill={wishlisted ? '#e8612a' : 'none'} /> Save
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden" style={{ height: 420 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, height: '100%' }}>
                <div className="relative overflow-hidden group cursor-pointer"
                  onClick={() => { setActiveImage(0); setShowGallery(true) }}>
                  <Image
                    src={images[0]}
                    alt={vendor.name}
                    fill sizes="(min-width: 1280px) 500px, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3 }}>
                  {[1, 2, 3, 4].map((imgIdx) => (
                    <div key={imgIdx} className="relative overflow-hidden group cursor-pointer"
                      onClick={() => { setActiveImage(imgIdx); setShowGallery(true) }}>
                      <Image
                        src={images[imgIdx] ?? images[0]}
                        alt={`${vendor.name} ${imgIdx + 1}`}
                        fill sizes="(min-width: 1280px) 250px, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowGallery(true)}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors z-10"
                style={{ border: '1px solid #d4cfc8', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }}
              >
                <Grid2X2 size={14} />
                Show all photos
              </button>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 pb-20 sm:pb-8 px-5 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full -mt-5 sm:mt-0 rounded-t-3xl sm:rounded-none bg-[#FEFDFC] sm:bg-transparent relative">
          <div className="md:grid md:grid-cols-[1fr_380px] md:gap-12">

            {/* ══ LEFT COLUMN  ══ */}
            <div>

              {/* Title section */}
              <div className="pt-5 pb-1 sm:pt-6 text-center sm:text-left">
                <h1 className="text-2xl sm:text-[28px] font-semibold text-[#304333] leading-tight mb-1">
                  {vendor.name}
                </h1>
                <p className="text-sm sm:text-base text-[#78716c] mb-2 flex items-center gap-1 justify-center sm:justify-start">
                  <MapPin size={13} /> {vendor.locationLabel ?? listing.location} · {listing.title}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-1.5">
                  <Star size={14} fill="#F5D06E" color="#304333" />
                  <span className="text-sm font-semibold text-[#304333]">{vendor.rating}</span>
                  <button className="text-sm text-[#304333] font-semibold underline">
                    {vendor.reviews} reviews
                  </button>
                </div>
              </div>

              <Divider />

              {/* Host mini-row */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center
                              flex-shrink-0 text-white text-lg font-semibold" style={{ background: '#2c4a1e' }}>
                  {vendor.name[0]}
                </div>
                <div>
                  <p className="text-base font-semibold text-[#304333]">
                    Toured by {vendor.name}
                  </p>
                  <p className="text-sm text-[#78716c]">
                    {vendor.yearsTouring ?? 3} year{(vendor.yearsTouring ?? 3) !== 1 ? 's' : ''} touring
                  </p>
                </div>
              </div>

              {features.length > 0 && (
                <>
                  <Divider />
                  <div className="flex flex-col gap-5">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#304333]">{f.title}</p>
                          <p className="text-sm text-[#78716c] mt-0.5">{f.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <Divider />

              {/* Description */}
              <div>
                <p className={`text-base text-[#304333] leading-relaxed ${!showFullDesc ? 'line-clamp-4' : ''}`}>
                  {vendor.description} Explore the vast savannah landscapes, encounter Africa's most iconic wildlife, and create memories that will last a lifetime. Our experienced guides bring the ecosystem to life with their deep knowledge of animal behaviour and local ecology. Every drive is different — every sighting unforgettable.
                </p>
                <button
                  onClick={() => setShowFullDesc(s => !s)}
                  className="mt-4 px-8 py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df]"
                  style={{ background: '#F1F5E4' }}
                >
                  {showFullDesc ? 'Show less' : 'Show more'}
                </button>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <h2 className="text-xl font-semibold text-[#304333] mb-5">What this tour offers</h2>
                    <div className="hidden sm:grid grid-cols-2 gap-x-8 gap-y-4">
                      {visibleAmenities.map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <Check size={16} color="#2c4a1e" strokeWidth={2.5} className="flex-shrink-0" />
                          <span className="text-sm text-[#304333]">{item}</span>
                        </div>
                      ))}
                    </div>
                    <div className="sm:hidden flex flex-col gap-4">
                      {visibleAmenities.map((item) => (
                        <div key={item} className="flex items-center gap-4">
                          <Check size={16} color="#2c4a1e" strokeWidth={2.5} className="flex-shrink-0" />
                          <span className="text-base text-[#304333]">{item}</span>
                        </div>
                      ))}
                    </div>
                    {amenities.length > 4 && (
                      <button
                        onClick={() => setShowAllAmenities(s => !s)}
                        className="mt-6 px-8 py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df]"
                        style={{ background: '#F1F5E4' }}
                      >
                        {showAllAmenities ? 'Show fewer' : `Show all ${amenities.length} amenities`}
                      </button>
                    )}
                  </div>
                </>
              )}

            </div>

            {/* ══ DESKTOP BOOKING SIDEBAR ══ */}
            <div className="hidden md:block">
              <div className="sticky top-24 mt-6">
                <div className="rounded-2xl shadow-xl p-6 bg-white" style={{ border: '1px solid #e8e0d0' }}>

                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-2xl font-semibold text-[#304333]">{vendor.price}</span>
                    <span className="text-base text-[#78716c]">/ person</span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star size={13} fill="#F5D06E" color="#304333" />
                      <span className="text-sm font-semibold text-[#304333]">{vendor.rating}</span>
                      <span className="text-sm text-[#78716c]">({vendor.reviews})</span>
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #b0a898' }}>
                      <div className="p-3 cursor-pointer hover:bg-[#f9f5ef] transition-colors"
                        style={{ borderBottom: '1px solid #b0a898' }}
                        onClick={() => setShowSidebarCal(true)}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Tour date</p>
                        <p className="text-sm font-semibold" style={{ color: selectedDate ? '#304333' : '#78716c' }}>
                          {selectedDate
                            ? selectedDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })
                            : (vendor.availability ?? 'Add date')}
                        </p>
                      </div>
                      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#f9f5ef] transition-colors"
                        onClick={() => setShowGuestPanel(s => !s)}>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Guests</p>
                          <p className="text-sm font-semibold text-[#304333]">{guests} guest{guests > 1 ? 's' : ''}</p>
                        </div>
                        <ChevronRight size={16} color="#78716c"
                          style={{ transform: showGuestPanel ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
                      </div>
                    </div>

                    {showSidebarCal && (
                      <div className="absolute bg-white rounded-xl shadow-xl z-50 p-4"
                        style={{ top: 60, border: '1px solid #e8e0d0', right: 0, width: 660 }}>
                        <DesktopCalendar selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setShowSidebarCal(false) }} />
                        <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                          <button onClick={() => setSelectedDate(null)}
                            className="text-sm font-semibold text-[#304333] underline"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Clear date
                          </button>
                          <button onClick={() => setShowSidebarCal(false)}
                            className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                            style={{ background: '#304333', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    {showGuestPanel && (
                      <div className="absolute bg-white rounded-xl shadow-xl z-50 p-5"
                        style={{ top: '100%', marginTop: 4, border: '1px solid #e8e0d0', left: 0, right: 0 }}>
                        {[
                          { label: 'Adults', sub: 'Age 13+', count: adults, set: setAdults, min: 1, max: 16 },
                          { label: 'Children', sub: 'Ages 2–12', count: children, set: setChildren, min: 0, max: Math.max(0, 16 - adults) },
                          { label: 'Infants', sub: 'Under 2', count: infants, set: setInfants, min: 0, max: 5 },
                          { label: 'Pets', sub: 'Bringing a service animal?', count: pets, set: setPets, min: 0, max: 5 },
                        ].map(({ label, sub, count, set, min, max }) => (
                          <div key={label} className="flex items-center justify-between py-4"
                            style={{ borderBottom: label !== 'Pets' ? '1px solid #f0ede8' : 'none' }}>
                            <div>
                              <p className="text-sm font-semibold text-[#304333]">{label}</p>
                              <p className="text-sm text-[#78716c]">{sub}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => set((c: number) => Math.max(min, c - 1))}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                  border: '1px solid #b0a898', background: 'none', cursor: count <= min ? 'not-allowed' : 'pointer',
                                  opacity: count <= min ? 0.4 : 1, fontFamily: 'inherit', color: '#304333', fontSize: 18,
                                }}>−</button>
                              <span className="text-sm font-semibold text-[#304333] w-4 text-center">{count}</span>
                              <button onClick={() => set((c: number) => Math.min(max, c + 1))}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                  border: '1px solid #b0a898', background: 'none', cursor: count >= max ? 'not-allowed' : 'pointer',
                                  opacity: count >= max ? 0.4 : 1, fontFamily: 'inherit', color: '#304333', fontSize: 18,
                                }}>+</button>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                          <button onClick={() => setShowGuestPanel(false)}
                            className="text-sm font-semibold text-[#304333]"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/listings/${id}/vendor/${vendorId}/book?guests=${guests}`)}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm text-white mb-3 transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                    Reserve
                  </button>
                  <p className="text-xs text-center text-[#78716c] mb-4">You won't be charged yet</p>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#304333] underline cursor-pointer">{vendor.price} × {guests} guest{guests > 1 ? 's' : ''}</span>
                      <span className="text-[#304333]">{vendor.price.replace(/[\d,]+/, String(basePrice * guests))}</span>
                    </div>
                    <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                      <span className="text-sm font-semibold text-[#304333]">Total</span>
                      <span className="text-sm font-semibold text-[#304333]">{vendor.price.replace(/[\d,]+/, String(basePrice * guests))}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          <Divider />
          {/* Select tour date */}
          <div>
            <h2 className="text-xl font-semibold text-[#304333] mb-1">
              {selectedDate ? `Selected: ${selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Select a date'}
            </h2>
            <p className="text-sm text-[#78716c] mb-4">
              {vendor.availability ? `Typically runs ${vendor.availability}` : 'Add your preferred tour date'}
            </p>
            <div className="hidden sm:block">
              <DesktopCalendar selected={selectedDate} onSelect={setSelectedDate} />
            </div>
            <div className="sm:hidden">
              <MiniCalendar selected={selectedDate} onSelect={setSelectedDate} />
            </div>
            {selectedDate && (
              <button onClick={() => setSelectedDate(null)}
                className="mt-3 text-sm font-semibold text-[#304333] underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Clear date
              </button>
            )}
          </div>

          <Divider />

          {/* Map */}
          <div>
            <h2 className="text-xl font-semibold text-[#304333] mb-1">Where you'll be</h2>
            <p className="text-sm text-[#78716c] mb-4 flex items-center gap-1">
              <MapPin size={13} /> {vendor.locationLabel ?? listing.location}
            </p>
            {vendor.lat && vendor.lng ? (
              <div style={{ position: 'relative', isolation: 'isolate' }}>
                <MapPlaceholder
                  lat={vendor.lat}
                  lng={vendor.lng}
                  label={vendor.locationLabel ?? listing.location}
                />
              </div>
            ) : (

              <div className="w-full h-[200px] rounded-2xl flex items-center justify-center" style={{ background: '#e8e3d9', border: '1px solid #e8e0d0' }}>
                <p className="text-sm" style={{ color: '#78716c' }}>Location map coming soon</p>
              </div>
            )}
          </div>
          <Divider />
          {/* Reviews */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={18} fill="#F5D06E" color="#304333" />
              <span className="text-xl font-semibold text-[#304333]">
                {vendor.rating} · {vendor.reviews} reviews
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3" style={{ scrollbarWidth: 'none' }}>
              {REVIEW_TAGS.map(({ icon, label, count }) => (
                <div key={label}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl flex-shrink-0"
                  style={{ border: '1px solid #e8e0d0', background: 'white' }}>
                  <span className="text-base">{icon}</span>
                  <span className="text-sm text-[#304333]">{label}</span>
                  <span className="text-sm text-[#78716c]">{count}</span>
                </div>
              ))}
            </div>

            <div className="hidden sm:grid grid-cols-2 gap-6 mt-2">
              {visibleReviewsDesktop.map((review, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center
                                                    text-sm font-semibold flex-shrink-0 text-[#304333]"
                      style={{ background: review.avatar }}>
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#304333]">{review.name}</p>
                      <p className="text-xs text-[#78716c]">{review.meta}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={11} fill={j < review.stars ? '#304333' : '#ddd'} color={j < review.stars ? '#304333' : '#ddd'} />
                      ))}
                    </div>
                    <span className="text-xs text-[#78716c]">· {review.date}</span>
                  </div>
                  <p className="text-sm text-[#304333] leading-relaxed"
                    style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                    {review.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="sm:hidden flex flex-col gap-5 mt-2">
              {visibleReviewsMobile.map((review, i) => (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center
                                                    text-sm font-semibold flex-shrink-0 text-[#304333]"
                      style={{ background: review.avatar }}>
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#304333]">{review.name}</p>
                      <p className="text-xs text-[#78716c]">{review.meta}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={13} fill={j < review.stars ? '#304333' : '#ddd'} color={j < review.stars ? '#304333' : '#ddd'} />
                      ))}
                    </div>
                    <span className="text-xs text-[#78716c]">{review.date}</span>
                  </div>
                  <p className={`text-sm text-[#304333] leading-relaxed ${expandedReview !== i ? 'line-clamp-3' : ''}`}>
                    {review.text}
                  </p>
                  <button
                    onClick={() => setExpandedReview(expandedReview === i ? null : i)}
                    className="text-sm font-semibold text-[#304333] underline mt-1">
                    {expandedReview === i ? 'Show less' : 'Show more'}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAllReviews(s => !s)}
              className="mt-4 px-8 py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df]"
              style={{ background: '#F1F5E4' }}
            >
              {showAllReviews ? 'Show fewer reviews' : `Show all ${vendor.reviews} reviews`}
            </button>
          </div>
          <Divider />
          {/* Availability */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} color="#304333" />
              <h2 className="text-xl font-semibold text-[#304333]">Availability</h2>
            </div>
            <p className="text-sm text-[#78716c]">
              {vendor.availability ?? 'Contact vendor for availability'}
            </p>
          </div>

          <Divider />

          {/* Meet your host */}
          <div>
            <h2 className="text-xl font-semibold text-[#304333] mb-5">Meet your host</h2>

            <div className="hidden sm:flex gap-10 items-start">
              <div className="flex-shrink-0" style={{ width: 400 }}>
                <div className="rounded-2xl p-5" style={{ border: '1px solid #e8e0d0', background: 'white' }}>
                  <div className="flex items-center">
                    <div className="w-1/2 flex flex-col items-center">
                      <div className="relative mb-3">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold" style={{ background: '#2c4a1e' }}>
                          {vendor.name[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                          <Shield size={12} color="#2c4a1e" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-[#304333] text-center">{vendor.name}</p>
                      <p className="text-sm text-[#78716c]">Tour operator</p>
                    </div>
                    <div className="w-1/2 pl-4">
                      <div className="py-2.5" style={{ borderBottom: '1px solid #e8e0d0' }}>
                        <p className="text-xl font-bold text-[#304333]">{vendor.reviews}</p>
                        <p className="text-xs text-[#78716c]">Reviews</p>
                      </div>
                      <div className="py-3" style={{ borderBottom: '1px solid #e8e0d0' }}>
                        <p className="text-xl font-bold text-[#304333]">{vendor.rating} <span className="text-base">★</span></p>
                        <p className="text-xs text-[#78716c]">Rating</p>
                      </div>
                      <div className="py-2.5">
                        <p className="text-xl font-bold text-[#304333]">{vendor.yearsTouring ?? 3}</p>
                        <p className="text-xs text-[#78716c]">Yrs touring</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-6">
                  <p className="text-base font-semibold text-[#304333] mb-2">Host details</p>
                  <p className="text-sm text-[#304333]">Response rate: {vendor.responseRate ?? 98}%</p>
                  <p className="text-sm text-[#304333]">Responds {vendor.responseTime ?? 'within a few hours'}</p>
                </div>
                <button className="px-8 py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df] flex items-center gap-2"
                  style={{ background: '#F1F5E4' }}>
                  <MessageCircle size={16} />
                  Message tour operator
                </button>
                <div className="flex items-start gap-3 mt-6 pt-6" style={{ borderTop: '1px solid #e8e0d0' }}>
                  <Shield size={20} strokeWidth={1.5} color="#78716c" />
                  <p className="text-xs text-[#78716c]">To help protect your payment, always communicate and pay through Erranza.</p>
                </div>
              </div>
            </div>

            <div className="sm:hidden">
              <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', maxWidth: 380 }}>
                <div className="flex items-center">
                  <div className="w-1/2 flex flex-col items-center">
                    <div className="relative mb-1.5">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold" style={{ background: '#2c4a1e' }}>
                        {vendor.name[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                        <Shield size={10} color="#2c4a1e" />
                      </div>
                    </div>
                    <p className="text-base font-bold text-[#304333] text-center">{vendor.name}</p>
                    <p className="text-xs text-[#78716c]">Tour operator</p>
                  </div>
                  <div className="w-1/2 pl-3">
                    <div className="py-2" style={{ borderBottom: '1px solid #e8e0d0' }}>
                      <p className="text-base font-bold text-[#304333]">{vendor.reviews}</p>
                      <p className="text-xs text-[#78716c]">Reviews</p>
                    </div>
                    <div className="py-2" style={{ borderBottom: '1px solid #e8e0d0' }}>
                      <p className="text-base font-bold text-[#304333]">{vendor.rating} <span className="text-sm">★</span></p>
                      <p className="text-xs text-[#78716c]">Rating</p>
                    </div>
                    <div className="py-2">
                      <p className="text-base font-bold text-[#304333]">{vendor.yearsTouring ?? 3}</p>
                      <p className="text-xs text-[#78716c]">Yrs touring</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-base font-semibold text-[#304333] mb-2">Host details</p>
                <p className="text-sm text-[#304333]">Response rate: {vendor.responseRate ?? 98}%</p>
                <p className="text-sm text-[#304333]">Responds {vendor.responseTime ?? 'within a few hours'}</p>
              </div>
              <button className="w-full py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df] mb-5 flex items-center justify-center gap-2"
                style={{ background: '#F1F5E4' }}>
                <MessageCircle size={16} />
                Message tour operator
              </button>
              <div className="flex items-start gap-3">
                <Shield size={18} strokeWidth={1.5} color="#78716c" />
                <p className="text-xs text-[#78716c]">To help protect your payment, always communicate and pay through Erranza.</p>
              </div>
            </div>
          </div>
          <Divider />


          {/* Things to know */}
          <div>
            <h2 className="text-xl font-semibold text-[#304333] mb-6">Things to know</h2>

            <div className="hidden sm:grid grid-cols-3 gap-8">
              {[
                { icon: <CalendarX2 size={32} strokeWidth={1.5} />, title: 'Cancellation policy', items: ['This reservation is non-refundable.', 'Review the full policy for details.'] },
                { icon: <Key size={32} strokeWidth={1.5} />, title: 'Tour rules', items: ['Respect wildlife, no flash photography.', 'Follow guide instructions at all times.'] },
                { icon: <ShieldHalf size={32} strokeWidth={1.5} />, title: 'Safety information', items: ['Stay inside the vehicle during game drives.', 'Emergency protocols briefed on arrival.'] },
              ].map(({ icon, title: st, items }) => (
                <div key={st}>
                  <div className="mb-4 text-[#304333]">{icon}</div>
                  <p className="text-base font-semibold text-[#304333] mb-3">{st}</p>
                  {items.map(item => <p key={item} className="text-sm text-[#78716c] mb-0.5">{item}</p>)}
                </div>
              ))}
            </div>

            <div className="sm:hidden">
              {[
                { icon: <Calendar size={22} strokeWidth={1.5} />, title: 'Cancellation policy', items: ['This reservation is non-refundable.', 'Review the full policy for details.'] },
                { icon: <Key size={22} strokeWidth={1.5} />, title: 'Tour rules', items: ['Respect wildlife, no flash photography.', 'Follow guide instructions at all times.'] },
                { icon: <ShieldHalf size={22} strokeWidth={1.5} />, title: 'Safety information', items: ['Stay inside the vehicle during game drives.', 'Emergency protocols briefed on arrival.'] },
              ].map(({ icon, title: st, items }, idx, arr) => (
                <div key={st} className="flex items-start gap-4 py-4" style={idx < arr.length - 1 ? { borderBottom: '1px solid #e8e0d0' } : {}}>
                  <span className="text-[#304333] flex-shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#304333] mb-1">{st}</p>
                    {items.map(item => <p key={item} className="text-sm text-[#78716c]">{item}</p>)}
                  </div>
                  <ChevronRight size={18} color="#a8a29e" className="flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>

            <button className="flex items-center gap-2 mt-5">
              <Flag size={14} color="#78716c" />
              <span className="text-sm text-[#304333] underline">Report this listing</span>
            </button>
          </div>

          {/* More vendors */}
          {otherVendors.length > 0 && (
            <>
              <Divider />
              <div className="pb-1">
                <h2 className="text-xl font-semibold text-[#304333] mb-4">
                  More tours offering similar services
                </h2>
                <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-3">
                    {otherVendors.slice(0, 4).map((v) => (
                      <button
                        key={v.id}
                        onClick={() => router.push(`/listings/${id}/vendor/${v.id}`)}
                        className="relative flex-shrink-0 w-[45vw] h-[130px] rounded-2xl overflow-hidden active:scale-95 transition-transform"
                        style={{ background: '#e8e0d0' }}
                      >
                        <Image src={v.image} alt={v.name} fill className="object-cover" sizes="45vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                          <p className="text-white text-xs font-semibold truncate">{v.name}</p>
                          <p className="text-white/70 text-[10px]">{v.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {otherVendors.slice(0, 4).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => router.push(`/listings/${id}/vendor/${v.id}`)}
                      className="relative h-[130px] rounded-2xl overflow-hidden active:scale-95 transition-transform"
                      style={{ background: '#e8e0d0' }}
                    >
                      <Image src={v.image} alt={v.name} fill className="object-cover" sizes="50vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                        <p className="text-white text-xs font-semibold truncate">{v.name}</p>
                        <p className="text-white/70 text-[10px]">{v.price}</p>
                      </div>
                    </button>
                  ))}
                </div>

              </div>
            </>
          )}

        </div>

        <FooterSection />

        {/* ── STICKY BOTTOM BAR (mobile) ── */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white px-5"
          style={{ borderTop: '1px solid #e8e0d0', paddingTop: 14, paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))', zIndex: 50 }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold text-[#304333]">{vendor.price}</span>
                <span className="text-sm text-[#78716c]">/ person</span>
              </div>
              {selectedDate ? (
                <p className="text-xs font-semibold" style={{ color: '#2c4a1e' }}>
                  {selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {vendor.price.replace(/[\d,]+/, String(basePrice * guests))}
                </p>
              ) : (
                <button className="text-sm text-[#304333] underline font-semibold"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {vendor.reviews} reviews
                </button>
              )}
            </div>
            <button
              onClick={() => {
                if (selectedDate) {
                  router.push(`/listings/${id}/vendor/${vendorId}/book?guests=${guests}`)
                } else {
                  setShowMobileDatePicker(true)
                }
              }}
              className="px-7 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              {selectedDate ? 'Reserve' : 'Check availability'}
            </button>

          </div>
        </div>


      </div >
    </div>
  )
}
