'use client'

import { use, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, Share2, Heart, Star, ChevronRight, ChevronLeft,
  Grid2X2, X, Shield, Check, Award,
  Wifi, Wind, Tv, Car, UtensilsCrossed, Waves,
  ShowerHead, Dumbbell, Coffee, Snowflake, Home,
  MapPin, Camera, Globe, Calendar,
  CalendarX2, Key, ShieldHalf,
  Clock, DoorOpen, Users, PawPrint, Moon, VolumeX, Power, ShieldAlert,
  Cigarette, Ban, AlertTriangle, Volume2,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import FooterSection from '@/components/FooterSection'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl flex items-center justify-center"
      style={{ height: 240, background: '#ffffff' }}>
      <p className="text-sm text-[#a8a29e]">Loading map…</p>
    </div>
  ),
})

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'High-speed WiFi': <Wifi size={22} strokeWidth={1.5} />,
  'WiFi': <Wifi size={22} strokeWidth={1.5} />,
  'Air conditioning': <Wind size={22} strokeWidth={1.5} />,
  'Smart TV': <Tv size={22} strokeWidth={1.5} />,
  'Free parking': <Car size={22} strokeWidth={1.5} />,
  'Full kitchen': <UtensilsCrossed size={22} strokeWidth={1.5} />,
  'Kitchen': <UtensilsCrossed size={22} strokeWidth={1.5} />,
  'Pool access': <Waves size={22} strokeWidth={1.5} />,
  'Private pool': <Waves size={22} strokeWidth={1.5} />,
  'Beachfront access': <Waves size={22} strokeWidth={1.5} />,
  'Beach access': <Waves size={22} strokeWidth={1.5} />,
  'Hot water': <ShowerHead size={22} strokeWidth={1.5} />,
  'Gym access': <Dumbbell size={22} strokeWidth={1.5} />,
  'Breakfast included': <Coffee size={22} strokeWidth={1.5} />,
  'Infinity pool': <Waves size={22} strokeWidth={1.5} />,
  'Spa access': <Snowflake size={22} strokeWidth={1.5} />,
  'Washing machine': <ShowerHead size={22} strokeWidth={1.5} />,
  'Balcony': <Home size={22} strokeWidth={1.5} />,
}
const getIcon = (label: string) => AMENITY_ICONS[label] ?? <Check size={22} strokeWidth={1.5} />

const CANCELLATION_POLICIES: Record<string, { label: string; description: string }> = {
  flexible: { label: 'Flexible', description: 'Full refund up to 24 hours before check-in.' },
  moderate: { label: 'Moderate', description: 'Full refund up to 5 days before check-in, 50% refund after that.' },
  strict: { label: 'Strict', description: 'Full refund up to 14 days before check-in. No refund after that.' },
  custom: { label: 'Custom', description: 'Refund terms set by the host.' },
}

function formatCutoffDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Cutoffs are computed from the real check-in date (when one's picked) so the
// modal can show "Before Sep 17, 2:00 PM", instead of vague
// "5 days before check-in" language. Without a check-in date there's nothing
// to compute, so callers fall back to the generic tier description.
function getCancellationRows(
  tier: string, policyLabel: string, description: string, customText: string | null, checkIn: Date | null
) {
  if (tier === 'custom') {
    return [{ prefix: '', date: '', time: '', label: 'Custom policy', text: customText || description }]
  }
  if (!checkIn) {
    return [{ prefix: '', date: '', time: '', label: policyLabel, text: description }]
  }

  const days = tier === 'flexible' ? 1 : tier === 'strict' ? 14 : 5 // moderate default
  const cutoff = new Date(checkIn)
  cutoff.setDate(cutoff.getDate() - days)
  const cutoffDate = formatCutoffDate(cutoff)

  if (tier === 'moderate') {
    return [
      { prefix: 'Before', date: cutoffDate, time: '2:00 PM', label: 'Full refund', text: 'Get back 100% of what you paid.' },
      { prefix: 'Before', date: formatCutoffDate(checkIn), time: '2:00 PM', label: 'Partial refund', text: 'Get back 50% of the remaining nights. No refund of the first night or the service fee.' },
    ]
  }

  return [
    { prefix: 'Before', date: cutoffDate, time: '2:00 PM', label: 'Full refund', text: 'Get back 100% of what you paid.' },
    { prefix: 'After', date: cutoffDate, time: '2:00 PM', label: 'No refund', text: 'This reservation is non-refundable after that.' },
  ]
}


function InfoRow({ icon, label, sublabel }: { icon: React.ReactNode; label: string; sublabel?: string }) {
  return (
    <div className="flex items-start gap-3 py-3" style={{ borderBottom: '1px solid #f0ede8' }}>
      <span className="text-[#304333] flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-[#304333]">{label}</p>
        {sublabel && <p className="text-xs text-[#78716c] mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}


function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `within ${hours}h ${mins}m` : `within ${hours}h`
}
function formatRelative(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days < 1) return 'Today'
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) !== 1 ? 's' : ''} ago`
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) !== 1 ? 's' : ''} ago`
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) !== 1 ? 's' : ''} ago`
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80'

type ApiListingSummary = { id: number; title: string; price: string; images: { url: string }[] }
type PaginatedListings = { data: ApiListingSummary[] }

type ApiListingDetail = {
  id: number
  title: string
  location: string
  price: string
  description: string | null
  min_guests: number | null
  max_guests: number | null
  bedrooms: number | null
  beds: number | null
  bathrooms: number | null
  lat: string | null
  lng: string | null
  cancellation_policy: 'flexible' | 'moderate' | 'strict' | 'custom'
  custom_cancellation_text: string | null
  amenities: string[] | null
  excluded: string[] | null
  images: { url: string }[]
  reviews: { id: number; rating: number; comment: string; created_at: string; traveller: { name: string; avatar_url: string | null } }[]
  reviews_count: number
  reviews_avg_rating: string | null
  is_superhost: boolean
  years_hosting: number
  response_rate: number | null
  avg_response_minutes: number | null
  cohost: { name: string } | null
  vendor: {
    id: number
    business_name: string
    bio: string | null
    logo_url: string | null
    languages: string[] | null
    verification_status: string
  }
  house_rules: { selected: string[]; additional_rules: string | null; additional_requests: string | null } | null
  safety_info: { key: string; note: string | null }[] | null
  // Unavailable dates
  unavailable_dates: { start: string; end: string }[]
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type DateRange = { start: Date; end: Date }

function parseUnavailable(ranges: { start: string; end: string }[]): DateRange[] {
  return ranges.map(r => ({ start: new Date(r.start + 'T00:00:00'), end: new Date(r.end + 'T00:00:00') }))
}
function isDateBlocked(date: Date, ranges: DateRange[]): boolean {
  return ranges.some(r => date >= r.start && date < r.end)
}
function rangeCrossesBlocked(start: Date, end: Date, ranges: DateRange[]): boolean {
  return ranges.some(r => start < r.end && end > r.start)
}

// ── Mobile single-month calendar (unchanged) ──
function MiniCalendar({ checkIn, checkOut, onSelect, disabledRanges }: {
  checkIn: Date | null; checkOut: Date | null; onSelect: (d: Date) => void; disabledRanges: DateRange[]
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const isPast = (d: number) => new Date(year, month, d) < todayMid
  const isBlocked = (d: number) => isDateBlocked(new Date(year, month, d), disabledRanges)
  const isStart = (d: number) => checkIn?.toDateString() === new Date(year, month, d).toDateString()
  const isEnd = (d: number) => checkOut?.toDateString() === new Date(year, month, d).toDateString()
  const isInRange = (d: number) => {
    if (!checkIn || !checkOut) return false
    const date = new Date(year, month, d)
    return date > checkIn && date < checkOut
  }

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
          const past = isPast(d) || isBlocked(d), start = isStart(d), end = isEnd(d), inRange = isInRange(d)
          const hasRange = !!(checkIn && checkOut)
          const inStrip = hasRange && (inRange || start || end)
          const col = i % 7
          const prevInStrip = d > 1 && hasRange && (() => {
            const prevDate = new Date(year, month, d - 1)
            return prevDate >= checkIn! && prevDate <= checkOut!
          })()
          const nextInStrip = hasRange && (() => {
            const nextDate = new Date(year, month, d + 1)
            if (nextDate.getMonth() !== month) return false
            return nextDate >= checkIn! && nextDate <= checkOut!
          })()
          const roundLeft = inStrip && (!prevInStrip || col === 0)
          const roundRight = inStrip && (!nextInStrip || col === 6)
          const borderRadius = inStrip ? `${roundLeft ? 24 : 0}px ${roundRight ? 24 : 0}px ${roundRight ? 24 : 0}px ${roundLeft ? 24 : 0}px` : '0'

          return (
            <div key={i} style={{
              background: inStrip ? '#D4DAAD' : 'transparent', borderRadius,
              display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40,
              ...(start && !end && hasRange ? { background: `linear-gradient(to right, transparent 50%, #D4DAAD 50%)`, borderRadius: `0 ${roundRight ? 24 : 0}px ${roundRight ? 24 : 0}px 0` } : {}),
              ...(end && !start && hasRange ? { background: `linear-gradient(to left, transparent 50%, #D4DAAD 50%)`, borderRadius: `${roundLeft ? 24 : 0}px 0 0 ${roundLeft ? 24 : 0}px` } : {}),
              ...(start && end ? { background: 'transparent', borderRadius: '50%' } : {}),
            }}>
              <button disabled={past} onClick={() => !past && onSelect(new Date(year, month, d))}
                style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: start || end ? 700 : 400,
                  background: start || end ? '#304333' : 'transparent',
                  color: start || end ? '#EAF98E' : past ? '#c8c0b4' : '#304333',
                  cursor: past ? 'not-allowed' : 'pointer', border: 'none',
                  WebkitTapHighlightColor: 'transparent', position: 'relative', zIndex: 1,
                }}>
                {past && (
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ position: 'absolute', width: '50%', height: '1px', background: '#c8c0b4', transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
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

// ── Desktop two-month calendar ──
function DesktopCalendar({ checkIn, checkOut, onSelect, disabledRanges }: {
  checkIn: Date | null; checkOut: Date | null; onSelect: (d: Date) => void; disabledRanges: DateRange[]
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
    const isBlocked = (d: number) => isDateBlocked(new Date(year, month, d), disabledRanges)
    const isStart = (d: number) => checkIn?.toDateString() === new Date(year, month, d).toDateString()
    const isEnd = (d: number) => checkOut?.toDateString() === new Date(year, month, d).toDateString()
    const isInRange = (d: number) => {
      if (!checkIn || !checkOut) return false
      const date = new Date(year, month, d)
      return date > checkIn && date < checkOut
    }

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
            const past = isPast(d) || isBlocked(d), start = isStart(d), end = isEnd(d), inRange = isInRange(d)
            const hasRange = !!(checkIn && checkOut)
            const inStrip = hasRange && (inRange || start || end)
            const col = i % 7

            const prevDate = d > 1 ? new Date(year, month, d - 1) : null
            const prevInStrip = prevDate && hasRange ? prevDate >= checkIn! && prevDate <= checkOut! : false
            const nextDateObj = new Date(year, month, d + 1)
            const nextInStrip = hasRange && nextDateObj.getMonth() === month
              ? nextDateObj >= checkIn! && nextDateObj <= checkOut!
              : false

            const roundLeft = inStrip && (!prevInStrip || col === 0)
            const roundRight = inStrip && (!nextInStrip || col === 6)
            const br = inStrip ? `${roundLeft ? 24 : 0}px ${roundRight ? 24 : 0}px ${roundRight ? 24 : 0}px ${roundLeft ? 24 : 0}px` : '0'

            return (
              <div key={i} style={{
                background: inStrip ? '#D4DAAD' : 'transparent',
                borderRadius: br,
                display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44,
                ...(start && !end && hasRange ? { background: `linear-gradient(to right, transparent 50%, #D4DAAD 50%)`, borderRadius: `0 ${roundRight ? 24 : 0}px ${roundRight ? 24 : 0}px 0` } : {}),
                ...(end && !start && hasRange ? { background: `linear-gradient(to left, transparent 50%, #D4DAAD 50%)`, borderRadius: `${roundLeft ? 24 : 0}px 0 0 ${roundLeft ? 24 : 0}px` } : {}),
                ...(start && end ? { background: 'transparent', borderRadius: '50%' } : {}),
              }}>
                <button disabled={past} onClick={() => !past && onSelect(new Date(year, month, d))}
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: start || end ? 700 : 400,
                    background: start || end ? '#304333' : 'transparent',
                    color: start || end ? '#EAF98E' : past ? '#c8c0b4' : '#304333',
                    cursor: past ? 'not-allowed' : 'pointer', border: 'none',
                    WebkitTapHighlightColor: 'transparent', position: 'relative', zIndex: 1,
                  }}>
                  {past && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', width: '50%', height: '1px', background: '#c8c0b4', transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
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
    <div style={{ borderRadius: 16, padding: '24px', background: '#FEFDFC' }}>
      <div style={{ display: 'flex', gap: 32 }}>
        {renderMonth(startYear, startMonth, true)}
        <div style={{ width: 1, background: '#e8e0d0', flexShrink: 0 }} />
        {renderMonth(secondYear, secondMonth, false)}
      </div>
    </div>
  )
}

const Divider = () => <div className="border-t border-[#e8e0d0] my-6" />
const MOB_PAD = { paddingLeft: 16, paddingRight: 16 } as const

type Props = { params: Promise<{ id: string }> }

export default function StayDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { isWishlisted, addToWishlist, removeFromWishlist, isLoggedIn } = useAuth()

  const [listing, setListing] = useState<ApiListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [activeImg, setActiveImg] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [showAllReviewsPage, setShowAllReviewsPage] = useState(false)
  const [showDescModal, setShowDescModal] = useState(false)
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false)
  const [activeInfo, setActiveInfo] = useState<{ title: string; body: React.ReactNode } | null>(null)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [nights, setNights] = useState(2)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [desktopNavVisible, setDesktopNavVisible] = useState(false)
  const [showSidebarCal, setShowSidebarCal] = useState(false)
  const [sidebarActiveField, setSidebarActiveField] = useState<'checkin' | 'checkout'>('checkin')
  const [showGuestPanel, setShowGuestPanel] = useState(false)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [pets, setPets] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const photoGridRef = useRef<HTMLDivElement>(null)
  const calendarSectionRef = useRef<HTMLDivElement>(null) // scroll target for "Add dates"
  const [messaging, setMessaging] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [dateWarning, setDateWarning] = useState(false)
  const [otherListings, setOtherListings] = useState<ApiListingSummary[]>([])

  useEffect(() => {
    apiFetch<{ listing: ApiListingDetail }>(`/listings/${id}`)
      .then(({ listing }) => setListing(listing))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    apiFetch<PaginatedListings>('/listings?category=Stays&per_page=100')
      .then(({ data }) => setOtherListings(data.filter(l => String(l.id) !== id).slice(0, 4)))
      .catch(() => { })
  }, [id])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const photoGrid = photoGridRef.current
      if (photoGrid) {
        const rect = photoGrid.getBoundingClientRect()
        setDesktopNavVisible(rect.bottom < 0)
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (showDescModal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [showDescModal])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#FEFDFC' }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#304333] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound || !listing) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4" style={{ background: '#FEFDFC' }}>
        <p className="text-sm text-[#78716c]">This stay could not be found.</p>
        <button onClick={() => router.push('/destinations/stays')}
          className="text-sm font-semibold text-[#304333] underline">
          Back to stays
        </button>
      </div>
    )
  }
  function handleMessageHost() {
    if (!isLoggedIn) { setShowLoginPrompt(true); return }
    router.push(`/messages?vendor=${listing!.vendor.id}&listing=${listing!.id}`)
  }

  const title = listing.title
  const location = listing.location
  const price = `Ksh ${Math.round(Number(listing.price)).toLocaleString()}`
  const priceNum = Math.round(Number(listing.price))
  const rating = listing.reviews_avg_rating ? Number(listing.reviews_avg_rating) : 4.5
  const reviewCount = listing.reviews_count

  const detail = {
    guests: listing.max_guests ?? listing.min_guests ?? 2,
    bedrooms: listing.bedrooms ?? 1,
    beds: listing.beds ?? 1,
    baths: listing.bathrooms ?? 1,
    hostName: listing.vendor.business_name,
    hostLogo: listing.vendor.logo_url,
    isSuperhost: listing.is_superhost,
    yearsHosting: listing.years_hosting,
    hostSpeaks: listing.vendor.languages?.length ? listing.vendor.languages.join(', ') : null,
    cohostName: listing.cohost?.name ?? null,
    responseRate: listing.response_rate,
    responseTime: listing.avg_response_minutes !== null ? formatDuration(listing.avg_response_minutes) : null,
    description: listing.description ?? 'No description provided yet.',
    images: listing.images.length > 0 ? listing.images.map(i => i.url) : [FALLBACK_IMAGE],
    amenities: listing.amenities ?? [],
    excluded: listing.excluded ?? [],
    reviews: listing.reviews.map(r => ({
      name: r.traveller.name,
      date: formatRelative(r.created_at),
      rating: r.rating,
      avatar: r.traveller.name[0]?.toUpperCase() ?? '?',
      avatarUrl: r.traveller.avatar_url,
      text: r.comment,
    })),
    lat: listing.lat != null && isFinite(Number(listing.lat)) ? Number(listing.lat) : -1.2864,
    lng: listing.lng != null && isFinite(Number(listing.lng)) ? Number(listing.lng) : 36.8172,
  }

  const cancellationPolicy = CANCELLATION_POLICIES[listing.cancellation_policy] ?? CANCELLATION_POLICIES.moderate
  const cancellationDescription = listing.cancellation_policy === 'custom'
    ? (listing.custom_cancellation_text || cancellationPolicy.description)
    : cancellationPolicy.description

  // "Add dates" scrolls to the inline calendar instead of opening the modal,
  // since there's nothing real to show in the cancellation table until a
  // check-in date exists.
  const scrollToDates = () => calendarSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })


  function handleReserveClick() {
    if (!checkIn || !checkOut) {
      setDateWarning(true)
      scrollToDates()
      return
    }
    const params = new URLSearchParams()
    params.set('checkIn', checkIn.toISOString())
    params.set('checkOut', checkOut.toISOString())
    router.push(`/listings/stays/${id}/book?${params.toString()}`)
  }


  const cancellationModalBody = (
    <div className="flex flex-col gap-6">
      {getCancellationRows(listing.cancellation_policy, cancellationPolicy.label, cancellationDescription, listing.custom_cancellation_text, checkIn).map((r, i) => (
        <div key={i} className="flex gap-4 pb-4" style={{ borderBottom: '1px solid #f0ede8' }}>
          {(r.prefix || r.date || r.time) && (
            <div className="flex-shrink-0" style={{ width: 110 }}>
              {r.prefix && <p className="text-sm font-bold text-[#304333]">{r.prefix}</p>}
              {r.date && <p className="text-sm text-[#304333]">{r.date}</p>}
              {r.time && <p className="text-sm text-[#304333]">{r.time}</p>}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-[#304333]">{r.label}</p>
            <p className="text-sm text-[#78716c] mt-0.5">{r.text}</p>
          </div>
        </div>
      ))}
      <div>
        <p className="text-sm font-bold text-[#304333] mb-1">Refund eligibility</p>
        <p className="text-sm text-[#78716c]">If you're paying in instalments, your refund or amount due depends on how much you've already paid at the time of cancellation.</p>
      </div>
    </div>
  )

  const HOUSE_RULES_CATALOG: Record<string, { label: string; icon: React.ReactNode }> = {
    no_pets: { label: 'No pets', icon: <PawPrint size={18} strokeWidth={1.5} /> },
    no_parties: { label: 'No parties or events', icon: <VolumeX size={18} strokeWidth={1.5} /> },
    no_commercial_photography: { label: 'No commercial photography', icon: <Camera size={18} strokeWidth={1.5} /> },
    smoking_allowed: { label: 'Smoking is allowed', icon: <Cigarette size={18} strokeWidth={1.5} /> },
    quiet_hours: { label: 'Quiet hours (10:00 PM – 7:00 AM)', icon: <Moon size={18} strokeWidth={1.5} /> },
    self_check_in: { label: 'Self check-in with keypad', icon: <DoorOpen size={18} strokeWidth={1.5} /> },
  }

  const SAFETY_CATALOG: Record<string, { label: string; icon: React.ReactNode }> = {
    no_carbon_monoxide_alarm: { label: 'No carbon monoxide alarm', icon: <ShieldAlert size={18} strokeWidth={1.5} /> },
    no_smoke_alarm: { label: 'No smoke alarm', icon: <ShieldAlert size={18} strokeWidth={1.5} /> },
    exterior_cameras: { label: 'Exterior security cameras on property', icon: <Shield size={18} strokeWidth={1.5} /> },
    not_suitable_children: { label: 'Not suitable for children (2–12 years)', icon: <Ban size={18} strokeWidth={1.5} /> },
    must_climb_stairs: { label: 'Must climb stairs', icon: <AlertTriangle size={18} strokeWidth={1.5} /> },
    no_parking: { label: 'No parking on property', icon: <Ban size={18} strokeWidth={1.5} /> },
    dangerous_animals: { label: 'May encounter potentially dangerous animal', icon: <AlertTriangle size={18} strokeWidth={1.5} /> },
    pets_on_property: { label: 'Pet(s) live on property', icon: <PawPrint size={18} strokeWidth={1.5} /> },
    noise_potential: { label: 'Potential for noise', icon: <Volume2 size={18} strokeWidth={1.5} /> },
    amenity_limitations: { label: 'Amenity limitations', icon: <Wifi size={18} strokeWidth={1.5} /> },
  }

  // Vendors pick from a fixed catalog in the listing editor; travellers see
  // exactly what was picked. Listings that predate this feature (or just
  // haven't been edited yet) fall back to the original generic copy.
  const rulesModalBody = (listing.house_rules && listing.house_rules.selected.length > 0) ? (
    <div className="flex flex-col">
      {listing.house_rules.selected.map(key => {
        const item = HOUSE_RULES_CATALOG[key]
        return item ? <InfoRow key={key} icon={item.icon} label={item.label} /> : null
      })}
      {listing.house_rules.additional_rules && (
        <>
          <p className="text-sm font-bold text-[#304333] mt-5 mb-1">Additional rules</p>
          <p className="text-sm text-[#78716c]">{listing.house_rules.additional_rules}</p>
        </>
      )}
      {listing.house_rules.additional_requests && (
        <>
          <p className="text-sm font-bold text-[#304333] mt-5 mb-1">Before you leave</p>
          <p className="text-sm text-[#78716c]">{listing.house_rules.additional_requests}</p>
        </>
      )}
    </div>
  ) : (
    <div className="flex flex-col">
      <p className="text-sm font-bold text-[#304333] mb-1">Checking in and out</p>
      <InfoRow icon={<Clock size={18} strokeWidth={1.5} />} label="Check-in after 2:00 PM" />
      <InfoRow icon={<Clock size={18} strokeWidth={1.5} />} label="Checkout before 11:00 AM" />
      <InfoRow icon={<DoorOpen size={18} strokeWidth={1.5} />} label="Self check-in with keypad" />
      <p className="text-sm font-bold text-[#304333] mt-5 mb-1">During your stay</p>
      <InfoRow icon={<Users size={18} strokeWidth={1.5} />} label={`${detail.guests} guests maximum`} />
      <InfoRow icon={<PawPrint size={18} strokeWidth={1.5} />} label="No pets" />
      <InfoRow icon={<Moon size={18} strokeWidth={1.5} />} label="Quiet hours" sublabel="10:00 PM – 7:00 AM" />
      <InfoRow icon={<VolumeX size={18} strokeWidth={1.5} />} label="No parties or events" />
      <p className="text-sm font-bold text-[#304333] mt-5 mb-1">Before you leave</p>
      <InfoRow icon={<Power size={18} strokeWidth={1.5} />} label="Turn things off" />
      <InfoRow icon={<Key size={18} strokeWidth={1.5} />} label="Return keys" />
    </div>
  )

  const safetyModalBody = (listing.safety_info && listing.safety_info.length > 0) ? (
    <div className="flex flex-col">
      <p className="text-sm text-[#78716c] mb-4">Avoid surprises by looking over these important details about the host's property.</p>
      {listing.safety_info.map(({ key, note }) => {
        const item = SAFETY_CATALOG[key]
        return item ? <InfoRow key={key} icon={item.icon} label={item.label} sublabel={note ?? undefined} /> : null
      })}
    </div>
  ) : (
    <div className="flex flex-col">
      <p className="text-sm text-[#78716c] mb-4">Avoid surprises by looking over these important details about the host's property.</p>
      <p className="text-sm font-bold text-[#304333] mb-1">Safety devices</p>
      <InfoRow icon={<ShieldAlert size={18} strokeWidth={1.5} />} label="Carbon monoxide alarm not reported" sublabel="We suggest bringing a portable detector for your trip." />
      <InfoRow icon={<ShieldAlert size={18} strokeWidth={1.5} />} label="Smoke alarm not reported" sublabel="We suggest bringing a portable detector for your trip." />
      <InfoRow icon={<Shield size={18} strokeWidth={1.5} />} label="Exterior security cameras on the property" sublabel="The host has exterior cameras. They don't monitor indoor spaces." />
    </div>
  )

  const infoModals = {
    cancellation: { title: 'Cancellation policy', body: cancellationModalBody },
    rules: { title: 'House rules', body: rulesModalBody },
    safety: { title: 'Safety & property', body: safetyModalBody },
  }


  const wishlisted = isWishlisted(id)
  const disabledRanges = parseUnavailable(listing.unavailable_dates ?? [])
  const images = detail.images
  const calNights = (checkIn && checkOut) ? Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)) : nights
  const total = priceNum * calNights
  const fee = Math.round(total * 0.12)

  const totalGuests = adults + children
  const guestLabel = `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}${infants > 0 ? `, ${infants} infant${infants !== 1 ? 's' : ''}` : ''}`

  function fmtDate(d: Date | null) {
    if (!d) return null
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
  function fmtDateFull(d: Date | null) {
    if (!d) return null
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  function handleCalSelect(date: Date) {
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(date); setCheckOut(null) }
    else if (date <= checkIn) { setCheckIn(date); setCheckOut(null) }
    else setCheckOut(date)
  }
  function handleSidebarCalSelect(date: Date) {
    if (sidebarActiveField === 'checkin' || !checkIn || (checkIn && checkOut)) {
      setCheckIn(date); setCheckOut(null); setSidebarActiveField('checkout')
    } else if (date <= checkIn) {
      setCheckIn(date); setCheckOut(null); setSidebarActiveField('checkout')
    } else if (rangeCrossesBlocked(checkIn, date, disabledRanges)) {
      setCheckIn(date); setCheckOut(null); setSidebarActiveField('checkout')
    } else {
      setCheckOut(date); setShowSidebarCal(false)
    }
  }
  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isLoggedIn) { router.push('/login'); return }
    const wishlistItem = { id, location, title, price, rating, image: images[0] }
    if (wishlisted) removeFromWishlist(id); else addToWishlist(wishlistItem)
  }

  if (showGallery) {
    return (
      <div className="fixed inset-0 bg-black z-[200] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-12 pb-3 flex-shrink-0">
          <button onClick={() => setShowGallery(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            <X size={18} color="white" />
          </button>
          <span className="text-sm font-semibold text-white">{activeImg + 1} / {images.length}</span>
          <div className="w-9" />
        </div>
        <div className="flex-1 relative">
          <Image src={images[activeImg]} alt={title} fill sizes="100vw" className="object-contain" />
        </div>
        <div className="flex gap-2 justify-center py-4 px-4 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {images.map((img: string, i: number) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className="relative flex-shrink-0 rounded-lg overflow-hidden"
              style={{ width: 56, height: 56, border: `2px solid ${i === activeImg ? 'white' : 'transparent'}`, opacity: i === activeImg ? 1 : 0.5, padding: 0, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              <Image src={img} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col"
      style={{ background: '#FEFDFC', fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* ── DESCRIPTION MODAL (mobile full-screen) ── */}
      {showDescModal && (
        <div className="sm:hidden fixed inset-0 z-[300] flex flex-col" style={{ background: '#FEFDFC' }}>
          <div className="flex font-bold flex-col px-4 flex-shrink-0"
            style={{ paddingTop: '16px', paddingBottom: 16 }}>
            <button onClick={() => setShowDescModal(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center mb-5"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              <X size={25} color="#304333" />
            </button>
            <h2 style={{ fontSize: 25, fontWeight: 800, color: '#304333' }}>About this space</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <p className="text-base text-[#304333] leading-relaxed whitespace-pre-line">{detail.description}</p>
          </div>
        </div>
      )}

      {/* ── DESKTOP STICKY NAV ── */}
      <div className="hidden sm:block"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: '#FEFDFC',
          borderBottom: desktopNavVisible ? '1px solid #e8e0d0' : '1px solid transparent',
          transform: desktopNavVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.25s ease, border-color 0.25s ease',
        }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-20 flex items-center justify-between" style={{ height: 64 }}>
          <div className="flex items-center gap-6">
            {['Photos', 'Amenities', 'Reviews', 'Location'].map(section => (
              <button key={section}
                className="text-sm font-semibold text-[#304333] pb-1 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                {section}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold text-[#304333]">{price}</span>
                <span className="text-sm text-[#78716c]">/ night</span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <Star size={12} fill="#F5D06E" color="#304333" />
                <span className="text-xs font-semibold text-[#304333]">{rating}</span>
                <span className="text-xs text-[#78716c]">· {reviewCount} reviews</span>
              </div>
            </div>
            <button onClick={handleReserveClick}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              Reserve
            </button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden "
        style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 0, background: '#FEFDFC' }}>

        {/* ══ MOBILE photo carousel ══ */}
        <div className="sm:hidden relative" style={{ aspectRatio: '4/3', width: '100%' }}>
          <Image src={images[activeImg]} alt={title} fill sizes="100vw"
            className="object-cover" onClick={() => setShowGallery(true)} />
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 z-10"
            style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))', paddingBottom: 12 }}>
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              <ArrowLeft size={18} color="#304333" />
            </button>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                <Share2 size={16} strokeWidth={1.5} color="#304333" />
              </button>
              <button onClick={handleWishlist}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                <Heart size={16} strokeWidth={1.5} color={wishlisted ? '#e8612a' : '#304333'} fill={wishlisted ? '#e8612a' : 'none'} />
              </button>
            </div>
          </div>
          <div className="absolute bottom-8 right-4 flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
            <Camera size={12} />{activeImg + 1} / {images.length}
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_: string, i: number) => (
              <button key={i} onClick={() => setActiveImg(i)} className="rounded-full transition-all"
                style={{ width: activeImg === i ? 16 : 6, height: 6, background: 'white', opacity: activeImg === i ? 1 : 0.6, border: 'none', padding: 0, cursor: 'pointer' }} />
            ))}
          </div>
          <button className="absolute left-0 top-0 w-1/3 h-full"
            onClick={() => setActiveImg(i => Math.max(0, i - 1))}
            style={{ background: 'transparent', border: 'none', WebkitTapHighlightColor: 'transparent' }} />
          <button className="absolute right-0 top-0 w-1/3 h-full"
            onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
            style={{ background: 'transparent', border: 'none', WebkitTapHighlightColor: 'transparent' }} />
        </div>

        {/* ══ DESKTOP photo section ══ */}
        <div className="hidden sm:block" ref={photoGridRef}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-20">
            <div className="flex items-center justify-between pt-4 pb-3">
              <button onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#304333] hover:underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                <ArrowLeft size={16} strokeWidth={2} color="#304333" /> Back
              </button>
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', textDecoration: 'underline' }}>
                  <Share2 size={15} strokeWidth={1.5} /> Share
                </button>
                <button onClick={handleWishlist}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', textDecoration: 'underline' }}>
                  <Heart size={15} strokeWidth={1.5} color={wishlisted ? '#e8612a' : '#304333'} fill={wishlisted ? '#e8612a' : 'none'} /> Save
                </button>
              </div>
            </div>

            <div className="hidden md:block relative rounded-2xl overflow-hidden" style={{ height: 480 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, height: '100%' }}>
                <div className="relative overflow-hidden group cursor-pointer"
                  onClick={() => { setActiveImg(0); setShowGallery(true) }}>
                  <Image src={images[0]} alt={title} fill sizes="(min-width: 1280px) 560px, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" priority />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3 }}>
                  {[1, 2, 3, 4].map((imgIdx) => (
                    <div key={imgIdx} className="relative overflow-hidden group cursor-pointer"
                      onClick={() => { setActiveImg(imgIdx); setShowGallery(true) }}>
                      <Image src={images[imgIdx] ?? images[0]} alt="" fill
                        sizes="(min-width: 1280px) 280px, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowGallery(true)}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors z-10"
                style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: '1px solid #d4cfc8', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }}>
                <Grid2X2 size={14} /> Show all photos
              </button>
            </div>

            <div className="md:hidden relative rounded-2xl overflow-hidden" style={{ height: 320 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 3, height: '100%' }}>
                {images.slice(0, 3).map((img: string, i: number) => (
                  <div key={i} className="relative overflow-hidden group cursor-pointer"
                    onClick={() => { setActiveImg(i); setShowGallery(true) }}>
                    <Image src={img} alt="" fill sizes="33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105" priority={i === 0} />
                  </div>
                ))}
              </div>
              <button onClick={() => setShowGallery(true)}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white rounded-xl px-3 py-2 text-xs font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors z-10"
                style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: '1px solid #d4cfc8' }}>
                <Grid2X2 size={13} /> Show all
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            PAGE LAYOUT — 2-col desktop, single col mobile
        ══════════════════════════════════════════════════════ */}
        <div className="sm:px-6 lg:px-8 xl:px-20 max-w-7xl mx-auto -mt-5 sm:mt-0 rounded-t-3xl sm:rounded-none bg-[#FEFDFC] sm:bg-transparent relative">
          <div className="md:grid md:gap-12" style={{ gridTemplateColumns: '1fr 380px' }}>

            {/* ══ LEFT COLUMN ══ */}
            <div>

              {/* ── Title + meta ── */}
              <div className="pt-5 pb-1 sm:pt-6 sm:px-0" style={{ ...MOB_PAD }}>
                <h1 className="text-2xl sm:text-[28px] font-semibold text-[#304333] leading-tight mb-1 text-center sm:text-left">{title}</h1>
                <p className="hidden sm:block text-base text-[#304333] mb-1">{location}</p>
                <p className="hidden sm:block text-sm text-[#304333] mb-2">
                  {detail.guests} guests · {detail.bedrooms} bedroom{detail.bedrooms !== 1 ? 's' : ''} · {detail.beds} bed{detail.beds !== 1 ? 's' : ''} · {detail.baths} bath{detail.baths !== 1 ? 's' : ''}
                </p>
                <p className="sm:hidden text-base text-[#78716c] mb-2 text-center">{location}</p>
                <p className="sm:hidden text-sm text-[#78716c] mb-2 text-center">
                  {detail.guests} guests · {detail.bedrooms} bedroom{detail.bedrooms !== 1 ? 's' : ''} · {detail.beds} bed{detail.beds !== 1 ? 's' : ''} · {detail.baths} bath{detail.baths !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Star size={14} fill="#F5D06E" color="#304333" />
                  <span className="text-sm font-semibold text-[#304333]">{rating}</span>
                  <button onClick={() => setShowAllReviewsPage(true)}
                    className="text-sm text-[#304333] font-semibold underline" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {reviewCount} reviews
                  </button>
                  {detail.isSuperhost && (
                    <>
                      <span className="text-[#a8a29e]">·</span>
                      <span className="text-sm font-semibold text-[#304333]">Superhost</span>
                    </>
                  )}
                </div>
              </div>

              <Divider />

              {/* ── Host row ── */}
              <div className="flex items-center gap-4 pb-1 sm:px-0" style={{ ...MOB_PAD }}>
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-lg font-semibold"
                    style={detail.hostLogo ? { backgroundImage: `url(${detail.hostLogo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                    {!detail.hostLogo && detail.hostName[0]}
                  </div>
                  {detail.isSuperhost && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <Award size={10} color="white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-[#304333]">Hosted by {detail.hostName}</p>
                  <p className="text-sm text-[#78716c]">
                    {detail.yearsHosting > 0 ? `${detail.yearsHosting} year${detail.yearsHosting !== 1 ? 's' : ''} hosting` : 'New host'}
                  </p>
                </div>
              </div>

              <Divider />

              {/* ── Description ── */}
              <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
                <div className="hidden sm:block">
                  <p className="text-base text-[#304333] leading-relaxed whitespace-pre-line"
                    style={!showFullDesc ? { display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' } : {}}>
                    {detail.description}
                  </p>
                  <button onClick={() => setShowFullDesc(s => !s)}
                    className="mt-4 px-8 py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df]"
                    style={{ background: '#F1F5E4', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: 'none', color: '#304333', fontFamily: 'inherit' }}>
                    {showFullDesc ? 'Show less' : 'Show more'}
                  </button>
                </div>
                <div className="sm:hidden">
                  <p className="text-base text-[#304333] leading-relaxed whitespace-pre-line"
                    style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                    {detail.description}
                  </p>
                  <button onClick={() => setShowDescModal(true)}
                    className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-center transition-colors hover:bg-[#ede8df]"
                    style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', color: '#304333' }}>
                    Show more
                  </button>
                </div>
              </div>

              <Divider />

              {/* ── Amenities ── */}
              <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
                <h2 className="text-xl font-semibold text-[#304333] mb-5">What this place offers</h2>

                <div className="hidden sm:grid grid-cols-2 gap-x-8 gap-y-4">
                  {detail.amenities.slice(0, 10).map((label: string) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-[#304333] flex-shrink-0">{getIcon(label)}</span>
                      <span className="text-sm text-[#304333]">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="sm:hidden flex flex-col gap-4">
                  {detail.amenities.slice(0, 5).map((label: string) => (
                    <div key={label} className="flex items-center gap-4">
                      <span className="text-[#304333]">{getIcon(label)}</span>
                      <span className="text-base text-[#304333]">{label}</span>
                    </div>
                  ))}
                </div>

                {detail.amenities.length > 5 && (
                  <button onClick={() => setShowAmenitiesModal(true)}
                    className="mt-6 px-8 py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df]"
                    style={{ background: '#F1F5E4', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: 'none', color: '#304333', fontFamily: 'inherit' }}>
                    {`Show all ${detail.amenities.length} amenities`}
                  </button>
                )}
              </div>

              {showAmenitiesModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                  onClick={(e) => { if (e.target === e.currentTarget) setShowAmenitiesModal(false) }}>
                  <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
                    style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-xl font-bold text-[#304333]">What this place offers</h2>
                      <button onClick={() => setShowAmenitiesModal(false)}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: '#f5f0e6', border: 'none', cursor: 'pointer' }}>
                        <X size={18} color="#304333" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-4 mb-6">
                      {detail.amenities.map((label: string) => (
                        <div key={label} className="flex items-center gap-4">
                          <span className="text-[#304333]">{getIcon(label)}</span>
                          <span className="text-sm text-[#304333]">{label}</span>
                        </div>
                      ))}
                    </div>
                    {detail.excluded.length > 0 && (
                      <>
                        <div className="border-t border-[#e8e0d0] pt-5 mb-1">
                          <p className="text-sm font-semibold text-[#78716c] mb-4">Not included</p>
                        </div>
                        <div className="flex flex-col gap-4">
                          {detail.excluded.map((label: string) => (
                            <div key={label} className="flex items-center gap-4">
                              <X size={18} color="#a8a29e" />
                              <span className="text-sm text-[#a8a29e] line-through">{label}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── Active info modal ── */}
              {activeInfo && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                  onClick={(e) => { if (e.target === e.currentTarget) setActiveInfo(null) }}>
                  <div className="bg-white w-full sm:max-w-xl rounded-t-3xl sm:rounded-2xl h-[92vh] sm:h-auto sm:max-h-[85vh] overflow-y-auto flex flex-col">
                    <div className="sm:hidden flex items-center px-5 pt-6 pb-2 sticky top-0 bg-white z-10">
                      <button onClick={() => setActiveInfo(null)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                        <ArrowLeft size={20} color="#304333" />
                      </button>
                    </div>
                    <div className="hidden sm:flex items-center justify-between px-8 pt-8">
                      <h2 className="text-2xl font-bold text-[#304333]">{activeInfo.title}</h2>
                      <button onClick={() => setActiveInfo(null)}
                        className="w-9 h-9 flex items-center justify-center rounded-full"
                        style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>
                        <X size={18} color="#304333" />
                      </button>
                    </div>
                    <div className="px-5 sm:px-8 pb-8 sm:pb-10 pt-2 sm:pt-6">
                      <h2 className="text-2xl sm:hidden font-bold text-[#304333] mb-4">{activeInfo.title}</h2>
                      {activeInfo.body}
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ══ DESKTOP BOOKING SIDEBAR ══ */}
            <div className="hidden md:block">
              <div className="sticky top-24 mt-6">
                <div className="rounded-2xl shadow-xl p-6 bg-white" style={{ border: '1px solid #e8e0d0' }}>

                  {checkIn && checkOut ? (
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-[#304333] underline cursor-pointer">
                          Ksh {(total + fee).toLocaleString()}
                        </span>
                        <span className="text-base text-[#304333]">for {calNights} night{calNights !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} fill="#F5D06E" color="#304333" />
                        <span className="text-xs font-semibold text-[#304333]">{rating}</span>
                        <span className="text-xs text-[#78716c]">· {reviewCount} reviews</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-2xl font-semibold text-[#304333]">{price}</span>
                      <span className="text-base text-[#78716c]">/ night</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Star size={13} fill="#F5D06E" color="#304333" />
                        <span className="text-sm font-semibold text-[#304333]">{rating}</span>
                        <span className="text-sm text-[#78716c]">({reviewCount})</span>
                      </div>
                    </div>
                  )}

                  <div className="relative mb-4">
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #b0a898' }}>
                      <div className="grid grid-cols-2" style={{ borderBottom: '1px solid #b0a898' }}>
                        <div className="p-3 cursor-pointer hover:bg-[#f9f5ef] transition-colors"
                          style={{ borderRight: '1px solid #b0a898' }}
                          onClick={() => { setSidebarActiveField('checkin'); setShowSidebarCal(true) }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Check-in</p>
                          <p className="text-sm font-semibold" style={{ color: checkIn ? '#304333' : '#78716c' }}>
                            {checkIn ? checkIn.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'Add date'}
                          </p>
                        </div>
                        <div className="p-3 cursor-pointer hover:bg-[#f9f5ef] transition-colors"
                          onClick={() => { setSidebarActiveField('checkout'); setShowSidebarCal(true) }}>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Checkout</p>
                          <p className="text-sm font-semibold" style={{ color: checkOut ? '#304333' : '#78716c' }}>
                            {checkOut ? checkOut.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'Add date'}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#f9f5ef] transition-colors"
                        onClick={() => setShowGuestPanel(s => !s)}>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Guests</p>
                          <p className="text-sm font-semibold text-[#304333]">{guestLabel}</p>
                        </div>
                        <ChevronRight size={16} color="#78716c"
                          style={{ transform: showGuestPanel ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
                      </div>

                    </div>

                    {showSidebarCal && (
                      <div className="absolute bg-white rounded-xl shadow-xl z-50 p-4"
                        style={{ top: 60, marginTop: 0, border: '1px solid #e8e0d0', right: 0, width: 660 }}>
                        <p className="text-sm font-semibold text-[#304333] mb-3">
                          {checkIn && !checkOut
                            ? 'Select checkout date'
                            : checkIn && checkOut
                              ? `${fmtDateFull(checkIn)} – ${fmtDateFull(checkOut)}`
                              : 'Select check-in date'}
                        </p>
                        <DesktopCalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleSidebarCalSelect} disabledRanges={disabledRanges} />

                        <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                          <button onClick={() => { setCheckIn(null); setCheckOut(null); setSidebarActiveField('checkin') }}
                            className="text-sm font-semibold text-[#304333] underline"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Clear dates
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
                          { label: 'Adults', sub: 'Age 13+', count: adults, set: setAdults, min: 1, max: detail.guests },
                          { label: 'Children', sub: 'Ages 2–12', count: children, set: setChildren, min: 0, max: Math.max(0, detail.guests - adults) },
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
                                  opacity: count <= min ? 0.4 : 1, fontFamily: 'inherit', color: '#304333', fontSize: 18
                                }}>
                                −
                              </button>
                              <span className="text-sm font-semibold text-[#304333] w-4 text-center">{count}</span>
                              <button onClick={() => set((c: number) => Math.min(max, c + 1))}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                  border: '1px solid #b0a898', background: 'none', cursor: count >= max ? 'not-allowed' : 'pointer',
                                  opacity: count >= max ? 0.4 : 1, fontFamily: 'inherit', color: '#304333', fontSize: 18
                                }}>
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-[#78716c] mt-4 mb-3">
                          This place has a maximum of {detail.guests} guests, not including infants. Pets aren't allowed.
                        </p>
                        <div className="flex justify-end">
                          <button onClick={() => setShowGuestPanel(false)}
                            className="text-sm font-semibold text-[#304333]"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                  <button onClick={handleReserveClick}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm text-white mb-3 transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                    Reserve
                  </button>
                  <p className="text-xs text-center text-[#78716c] mb-4">You won't be charged yet</p>

                  {checkIn && checkOut ? (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#304333] underline cursor-pointer">{price} × {calNights} night{calNights !== 1 ? 's' : ''}</span>
                        <span className="text-[#304333]">Ksh {total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#304333] underline cursor-pointer">Erranza service fee</span>
                        <span className="text-[#304333]">Ksh {fee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                        <span className="text-sm font-semibold text-[#304333]">Total before taxes</span>
                        <span className="text-sm font-semibold text-[#304333]">Ksh {(total + fee).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#78716c] underline cursor-pointer">{price} × {nights} nights</span>
                        <span className="text-[#304333]">Ksh {(priceNum * nights).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#78716c] underline cursor-pointer">Erranza service fee</span>
                        <span className="text-[#304333]">Ksh {Math.round(priceNum * nights * 0.12).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                        <span className="text-sm font-semibold text-[#304333]">Total before taxes</span>
                        <span className="text-sm font-semibold text-[#304333]">
                          Ksh {(priceNum * nights + Math.round(priceNum * nights * 0.12)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        <div className="sm:px-6 md:px-8 xl:px-20 max-w-7xl mx-auto">

          {/* ── Calendar ── */}
          <div ref={calendarSectionRef} className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-1">
              {checkIn && checkOut
                ? `${calNights} night${calNights !== 1 ? 's' : ''} in ${location.split(',')[0]}`
                : checkIn ? 'Select checkout date' : 'Select dates'}
            </h2>
            {checkIn && checkOut && (
              <p className="text-sm text-[#78716c] mb-3">
                {fmtDateFull(checkIn)} – {fmtDateFull(checkOut)}
              </p>
            )}
            {checkIn && !checkOut && (
              <p className="text-sm font-semibold mb-4" style={{ color: '#e8612a' }}>
                Check-in {fmtDateFull(checkIn)} — now choose your checkout date
              </p>
            )}
            {!checkIn && (
              <p className={`text-sm mb-4 ${dateWarning ? 'font-semibold' : 'text-[#78716c]'}`}
                style={dateWarning ? { color: '#e8612a' } : undefined}>
                {dateWarning ? 'Please select your check-in and check-out dates to continue.' : 'Add your travel dates for exact pricing'}
              </p>
            )}

            <div className="hidden sm:block mt-4">
              <DesktopCalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleSidebarCalSelect} disabledRanges={disabledRanges} />
            </div>
            <div className="sm:hidden mt-4">
              <MiniCalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleSidebarCalSelect} disabledRanges={disabledRanges} />
            </div>
            {(checkIn || checkOut) && (
              <button onClick={() => { setCheckIn(null); setCheckOut(null) }}
                className="mt-3 text-sm font-semibold text-[#304333] underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', padding: 0 }}>
                Clear dates
              </button>
            )}
          </div>

          <Divider />

          {/* ── Map ── */}
          <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-1">Where you'll be</h2>
            <p className="text-sm text-[#78716c] mb-4 flex items-center gap-1">
              <MapPin size={13} /> {location}
            </p>
            <div style={{ position: 'relative', isolation: 'isolate' }}>
              <MapComponent lat={detail.lat} lng={detail.lng} label={title} />
            </div>

            <p className="text-sm text-[#78716c] mt-3">{location} · Exact address provided after booking</p>
          </div>

          <Divider />

          {/* ── Reviews ── */}
          {detail.reviews.length === 0 ? (
            <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
              <div className="rounded-2xl px-4 py-8 text-center" style={{ background: '#F1F5E4' }}>
                <p className="text-sm font-semibold text-[#304333]">No reviews yet</p>
              </div>
            </div>
          ) : (
            <div className="pb-1">
              <button onClick={() => setShowAllReviewsPage(true)}
                className="flex items-center gap-2 mb-5 sm:px-0" style={{ ...MOB_PAD, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <Star size={18} fill="#F5D06E" color="#304333" />
                <span className="text-xl font-semibold text-[#304333]">{rating}</span>
                <span className="text-[#a8a29e]">·</span>
                <span className="text-xl font-semibold text-[#304333] underline">{reviewCount} reviews</span>
              </button>

              <div className="hidden sm:grid grid-cols-2 gap-6">
                {detail.reviews.map((rev, i: number) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                        style={rev.avatarUrl ? { backgroundImage: `url(${rev.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                        {!rev.avatarUrl && rev.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#304333]">{rev.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_: unknown, j: number) => (
                          <Star key={j} size={11} fill="#304333" color="#304333" />
                        ))}
                      </div>
                      <span className="text-xs text-[#78716c]">· {rev.date}</span>
                    </div>
                    <p className="text-sm text-[#304333] leading-relaxed"
                      style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rev.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="sm:hidden overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                <div className="flex gap-4" style={{ width: 'max-content' }}>
                  {detail.reviews.slice(0, 5).map((rev, i: number) => (
                    <div key={i} className="flex-shrink-0 p-4 rounded-2xl bg-white"
                      style={{ width: 300, border: '1px solid #e8e0d0' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {rev.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#304333]">{rev.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: rev.rating }).map((_: unknown, j: number) => (
                            <Star key={j} size={12} fill="#F5D06E" color="#304333" />
                          ))}
                        </div>
                        <span className="text-xs text-[#78716c]">· {rev.date}</span>
                      </div>
                      <p className="text-sm text-[#304333] leading-relaxed"
                        style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rev.text}
                      </p>
                    </div>
                  ))}
                  <button onClick={() => setShowAllReviewsPage(true)}
                    className="flex-shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl"
                    style={{ width: 160, border: '1px solid #e8e0d0', background: 'white', cursor: 'pointer' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#F1F5E4' }}>
                      <ChevronRight size={18} color="#304333" />
                    </div>
                    <span className="text-sm font-semibold text-[#304333]">See all {reviewCount} reviews</span>
                  </button>
                </div>
              </div>
            </div>
          )}


          <Divider />

          {/* ── Meet your host ── */}
          <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-5">Meet your host</h2>

            <div className='hidden sm:flex gap-10 items-start'>
              <div className="flex-shrink-0" style={{ width: 450 }}>
                <div className="rounded-2xl p-5" style={{ border: '1px solid #e8e0d0', background: 'white' }}>
                  <div className="flex items-center">

                    <div className="w-1/2 flex flex-col items-center">
                      <div className="relative mb-3">
                        <div className="w-24 h-24 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-4xl font-bold"
                          style={detail.hostLogo ? { backgroundImage: `url(${detail.hostLogo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                          {!detail.hostLogo && detail.hostName[0]}
                        </div>
                        {detail.isSuperhost && (
                          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                            <Award size={14} color="white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xl font-bold text-[#304333] text-center">{detail.hostName}</p>
                      <p className="text-sm text-[#78716c]">Host</p>
                    </div>

                    <div className="w-1/2 pl-4">
                      <div className="py-2.5" style={{ borderBottom: '1px solid #e8e0d0' }}>
                        <p className="text-xl font-bold text-[#304333]">{reviewCount}</p>
                        <p className="text-xs text-[#78716c]">Reviews</p>
                      </div>
                      <div className="py-3" style={{ borderBottom: '1px solid #e8e0d0' }}>
                        <p className="text-xl font-bold text-[#304333]">{rating} <span className="text-base">★</span></p>
                        <p className="text-xs text-[#78716c]">Rating</p>
                      </div>
                      <div className="py-2.5">
                        <p className="text-xl font-bold text-[#304333]">{detail.yearsHosting * 12}</p>
                        <p className="text-xs text-[#78716c]">Months hosting</p>
                      </div>
                    </div>

                  </div>
                </div>
                {detail.hostSpeaks && (
                  <div className="flex items-center gap-2.5 mt-4">
                    <Globe size={18} strokeWidth={1.5} color="#304333" />
                    <p className="text-sm text-[#304333]">Speaks {detail.hostSpeaks}</p>
                  </div>
                )}
              </div>

              <div className="flex-1">
                {detail.cohostName && (
                  <div className="mb-6">
                    <p className="text-base font-semibold text-[#304333] mb-3">Co-hosts</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-sm font-bold">
                        {detail.cohostName[0]}
                      </div>
                      <p className="text-sm font-semibold text-[#304333]">{detail.cohostName}</p>
                    </div>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-base font-semibold text-[#304333] mb-2">Host details</p>
                  {detail.responseRate !== null ? (
                    <>
                      <p className="text-sm text-[#304333]">Response rate: {detail.responseRate}%</p>
                      <p className="text-sm text-[#304333]">Responds {detail.responseTime}</p>
                    </>
                  ) : (
                    <p className="text-sm text-[#78716c]">No message history yet.</p>
                  )}
                </div>
                <button onClick={handleMessageHost} disabled={messaging}
                  className="px-8 py-3.5 rounded-xl text-sm font-semibold transition-colors hover:bg-[#ede8df] disabled:opacity-60"
                  style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#304333' }}>
                  {messaging ? 'Opening…' : 'Message host'}
                </button>
                <div className="flex items-start gap-3 mt-6 pt-6" style={{ borderTop: '1px solid #e8e0d0' }}>
                  <Shield size={20} strokeWidth={1.5} color="#78716c" />
                  <p className="text-xs text-[#78716c]">To help protect your payment, always use Erranza to send money and communicate with hosts.</p>
                </div>
              </div>

            </div>

            <div className="sm:hidden">
              <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', maxWidth: 380 }}>
                <div className="flex items-center">

                  <div className="w-1/2 flex flex-col items-center">
                    <div className="relative mb-1.5">
                      <div className="w-24 h-24 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-3xl font-bold"
                        style={detail.hostLogo ? { backgroundImage: `url(${detail.hostLogo})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                        {!detail.hostLogo && detail.hostName[0]}
                      </div>
                      {detail.isSuperhost && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                          <Award size={10} color="white" />
                        </div>
                      )}
                    </div>
                    <p className="text-base font-bold text-[#304333] text-center">{detail.hostName}</p>
                    <p className="text-xs text-[#78716c]">Host</p>
                  </div>

                  <div className="w-1/2 pl-3">
                    <div className="py-2" style={{ borderBottom: '1px solid #e8e0d0' }}>
                      <p className="text-base font-bold text-[#304333]">{reviewCount}</p>
                      <p className="text-xs text-[#78716c]">Reviews</p>
                    </div>
                    <div className="py-2" style={{ borderBottom: '1px solid #e8e0d0' }}>
                      <p className="text-base font-bold text-[#304333]">{rating} <span className="text-sm">★</span></p>
                      <p className="text-xs text-[#78716c]">Rating</p>
                    </div>
                    <div className="py-2">
                      <p className="text-base font-bold text-[#304333]">{detail.yearsHosting * 12}</p>
                      <p className="text-xs text-[#78716c]">Months hosting</p>
                    </div>
                  </div>

                </div>
              </div>

              {detail.hostSpeaks && (
                <div className="flex items-center gap-2.5 mt-4 mb-2">
                  <Globe size={18} strokeWidth={1.5} color="#304333" />
                  <p className="text-sm text-[#304333]">Speaks {detail.hostSpeaks}</p>
                </div>
              )}

              <Divider />

              {detail.cohostName && (
                <div className="mb-5">
                  <p className="text-base font-semibold text-[#304333] mb-3">Co-hosts</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-sm font-bold">
                      {detail.cohostName[0]}
                    </div>
                    <p className="text-sm font-semibold text-[#304333]">{detail.cohostName}</p>
                  </div>
                </div>
              )}
              <div className="mb-5">
                <p className="text-base font-semibold text-[#304333] mb-2">Host details</p>
                {detail.responseRate !== null ? (
                  <>
                    <p className="text-sm text-[#304333]">Response rate: {detail.responseRate}%</p>
                    <p className="text-sm text-[#304333]">Responds {detail.responseTime}</p>
                  </>
                ) : (
                  <p className="text-sm text-[#78716c]">No message history yet.</p>
                )}
              </div>
              <button onClick={handleMessageHost} disabled={messaging}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-colors hover:bg-[#ede8df] mb-5"
                style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: '#304333' }}>
                {messaging ? 'Opening…' : 'Message host'}
              </button>
              <div className="flex items-start gap-3 pt-5" >
                <Shield size={18} strokeWidth={1.5} color="#78716c" />
                <p className="text-xs text-[#78716c]">To help protect your payment, always use Erranza to send money and communicate with hosts.</p>
              </div>

            </div>
          </div>

          <Divider />

          {/* ── Things to know ── */}
          <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-6">Things to know</h2>

            <div className="hidden sm:grid grid-cols-3 gap-8">
              {[
                {
                  icon: <CalendarX2 size={32} strokeWidth={1.5} />, title: 'Cancellation policy',
                  items: checkIn && checkOut ? [`${cancellationPolicy.label}: ${cancellationDescription}`] : ['Add your dates to see the cancellation policy for your trip.'],
                  modalKey: 'cancellation' as const, needsDates: !checkIn || !checkOut,
                },
                {
                  icon: <Key size={32} strokeWidth={1.5} />, title: 'House rules',
                  items: listing.house_rules && listing.house_rules.selected.length > 0
                    ? listing.house_rules.selected.slice(0, 3).map(k => HOUSE_RULES_CATALOG[k]?.label).filter((v): v is string => !!v)
                    : ['Check-in after 2:00 PM', 'Checkout before 11:00 AM', `${detail.guests} guests maximum`],
                  modalKey: 'rules' as const, needsDates: false,
                },
                {
                  icon: <ShieldHalf size={32} strokeWidth={1.5} />, title: 'Safety & property',
                  items: listing.safety_info && listing.safety_info.length > 0
                    ? listing.safety_info.slice(0, 3).map(({ key }) => SAFETY_CATALOG[key]?.label).filter((v): v is string => !!v)
                    : ['Smoke alarm not reported', 'Exterior security cameras on property', 'Carbon monoxide alarm'],
                  modalKey: 'safety' as const, needsDates: false,
                },
              ].map(({ icon, title: st, items, modalKey, needsDates }) => (
                <div key={st}>
                  <div className="mb-4 text-[#222]">{icon}</div>
                  <p className="text-base font-semibold text-[#222] mb-3">{st}</p>
                  {items.map(item => <p key={item} className="text-sm text-[#78716c] mb-0.5">{item}</p>)}
                  <button onClick={() => needsDates ? scrollToDates() : setActiveInfo(infoModals[modalKey])}
                    className="text-sm text-[#78716c] underline mt-2"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {needsDates ? 'Add dates' : 'Learn more'}
                  </button>
                </div>
              ))}
            </div>

            <div className="sm:hidden">
              {[
                {
                  icon: <Calendar size={22} strokeWidth={1.5} />, title: 'Cancellation policy',
                  items: checkIn && checkOut ? [`${cancellationPolicy.label}: ${cancellationDescription}`] : ['Add your dates to see the cancellation policy for your trip.'],
                  modalKey: 'cancellation' as const, needsDates: !checkIn || !checkOut,
                },
                {
                  icon: <Home size={22} strokeWidth={1.5} />, title: 'House rules',
                  items: listing.house_rules && listing.house_rules.selected.length > 0
                    ? listing.house_rules.selected.slice(0, 3).map(k => HOUSE_RULES_CATALOG[k]?.label).filter((v): v is string => !!v)
                    : ['Check-in after 2:00 PM', 'Checkout before 11:00 AM', `${detail.guests} guests maximum`],
                  modalKey: 'rules' as const, needsDates: false,
                },
                {
                  icon: <Shield size={22} strokeWidth={1.5} />, title: 'Safety & property',
                  items: listing.safety_info && listing.safety_info.length > 0
                    ? listing.safety_info.slice(0, 3).map(({ key }) => SAFETY_CATALOG[key]?.label).filter((v): v is string => !!v)
                    : ['Smoke alarm not reported', 'Exterior security cameras on property', 'Carbon monoxide alarm'],
                  modalKey: 'safety' as const, needsDates: false,
                },

              ].map(({ icon, title: st, items, modalKey, needsDates }, idx, arr) => (
                <div key={st} onClick={() => needsDates ? scrollToDates() : setActiveInfo(infoModals[modalKey])}
                  className="flex items-start gap-4 py-4 cursor-pointer" style={idx < arr.length - 1 ? { borderBottom: '1px solid #e8e0d0' } : {}}>

                  <span className="text-[#304333] flex-shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#304333] mb-1">{st}</p>
                    {items.map(item => <p key={item} className="text-sm text-[#78716c]">{item}</p>)}
                  </div>
                  <ChevronRight size={18} color="#a8a29e" className="flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          {otherListings.length > 0 && (
            <>
              <Divider />
              <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
                <h2 className="text-xl font-semibold text-[#304333] mb-4">More stays nearby</h2>

                <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-3">
                    {otherListings.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => router.push(`/listings/stays/${l.id}`)}
                        className="relative flex-shrink-0 w-[45vw] h-[130px] rounded-2xl overflow-hidden active:scale-95 transition-transform"
                        style={{ background: '#e8e0d0' }}
                      >
                        <Image src={l.images[0]?.url ?? FALLBACK_IMAGE} alt={l.title} fill className="object-cover" sizes="45vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                          <p className="text-white text-xs font-semibold truncate">{l.title}</p>
                          <p className="text-white/70 text-[10px]">Ksh {Math.round(Number(l.price)).toLocaleString()}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {otherListings.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => router.push(`/listings/stays/${l.id}`)}
                      className="relative h-[130px] rounded-2xl overflow-hidden active:scale-95 transition-transform"
                      style={{ background: '#e8e0d0' }}
                    >
                      <Image src={l.images[0]?.url ?? FALLBACK_IMAGE} alt={l.title} fill className="object-cover" sizes="50vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                        <p className="text-white text-xs font-semibold truncate">{l.title}</p>
                        <p className="text-white/70 text-[10px]">Ksh {Math.round(Number(l.price)).toLocaleString()}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <Divider />

          {/* ── Explore nearby ── */}

          <div className="pb-4 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-4">
              Explore other options in and around {location.split(',')[0]}
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {['Nairobi', 'Diani Beach', 'Mombasa', 'Zanzibar', 'Malindi', 'Watamu', 'Karen', 'Westlands'].map(place => (
                <button key={place} className="text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' }}>
                  <p className="text-sm font-semibold text-[#304333]">{place}</p>
                  <p className="text-xs text-[#78716c]">Vacation rentals</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        <FooterSection />
      </div>

      {/* ══ MOBILE STICKY BOTTOM BAR ══ */}
      <div className="md:hidden flex-shrink-0 bg-white flex items-center justify-between px-5"
        style={{ borderTop: '1px solid #e8e0d0', paddingTop: 14, paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))', zIndex: 50 }}>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-semibold text-[#304333]">{price}</span>
            <span className="text-sm text-[#78716c]">/ night</span>
          </div>
          {checkIn && checkOut ? (
            <p className="text-xs font-semibold" style={{ color: '#2c4a1e' }}>
              {fmtDate(checkIn)} – {fmtDate(checkOut)} · Ksh {total.toLocaleString()}
            </p>
          ) : (
            <button className="text-sm text-[#304333] underline font-semibold"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {reviewCount} reviews
            </button>
          )}
        </div>
        <button onClick={handleReserveClick}
          className="px-7 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
          Reserve
        </button>
      </div>

      {/* ── Login prompt for message host ── */}
      {showLoginPrompt && (
                <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.4)' }}
                  onClick={(e) => { if (e.target === e.currentTarget) setShowLoginPrompt(false) }}>
                  <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">Log in to continue</h2>
                    <p className="text-sm text-gray-500 mb-5">
                      You&apos;ll need to log in or create an account before you can message the host.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/listings/stays/${id}`)}`)}
                        className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                        Create account
                      </button>
                      <button onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/listings/stays/${id}`)}`)}
                        className="flex-1 py-3 rounded-xl bg-[#1a1a1a] text-white text-sm font-semibold hover:bg-[#333] transition-colors">
                        Log in
                      </button>
                    </div>
                  </div>
                </div>
              )}

      {/* ── Show all review modal ── */}
      {showAllReviewsPage && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAllReviewsPage(false) }}>
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-1.5">
                <Star size={16} fill="#F5D06E" color="#304333" />
                <span className="text-sm font-semibold text-[#304333]">{rating} · {reviewCount} reviews</span>
              </div>
              <button onClick={() => setShowAllReviewsPage(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>
                <X size={18} color="#304333" />
              </button>
            </div>
            {detail.reviews.length === 0 ? (
              <div className="rounded-2xl px-4 py-10 text-center" style={{ background: '#F1F5E4' }}>
                <p className="text-sm font-semibold text-[#304333]">No reviews yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">

                {detail.reviews.map((rev, i: number) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {rev.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#304333]">{rev.name}</p>
                        <p className="text-xs text-[#78716c]">{rev.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: rev.rating }).map((_: unknown, j: number) => (
                        <Star key={j} size={12} fill="#F5D06E" color="#304333" />
                      ))}
                    </div>
                    <p className="text-sm text-[#304333] leading-relaxed">{rev.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  )
}
