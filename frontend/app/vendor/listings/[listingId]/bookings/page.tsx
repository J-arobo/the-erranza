'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, Users, ChevronRight, ChevronLeft } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { StatusBadge } from '../../../page'

type Props = {
  params: Promise<{ listingId: string }>
}

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const AVATAR_COLORS = ['#c4f0d4', '#f0e4c4', '#d4c4f0', '#c4e8f0', '#f0c4c4', '#e0f0c4']
function colorForName(name: string) {
  const hash = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

type ApiListing = { id: number; title: string; images: { url: string }[] }
type ApiBooking = {
  id: number
  status: string
  guests: number
  total: string
  check_in: string | null
  check_out: string | null
  listing: { id: number }
  traveller: { id: number; name: string }
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return '—'
  const s = new Date(start).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  if (!end || end === start) return s
  return `${s} – ${new Date(end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
}
function formatKsh(v: string | number) {
  return `Ksh ${Math.round(Number(v)).toLocaleString()}`
}
function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Booking calendar — shows which dates are booked on this listing, and who
// booked them on hover. Local to this page (matches how the booking-flow
// calendars elsewhere in the app each keep their own copy).
function AvailabilityCalendar({ bookings }: { bookings: ApiBooking[] }) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [hovered, setHovered] = useState<string | null>(null)

  function goBack() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function goFwd() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.check_in)

  function bookingForDate(dateStr: string) {
    return activeBookings.find(b => {
      const start = b.check_in!
      const end = b.check_out ?? b.check_in!
      return dateStr >= start.slice(0, 10) && dateStr <= end.slice(0, 10)
    })
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-[#1a1a1a]">Availability</h2>
        <div className="flex items-center gap-2">
          <button onClick={goBack} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center focus:outline-none">
            <ChevronLeft size={13} color="#1a1a1a" />
          </button>
          <span className="text-sm font-semibold text-[#1a1a1a] w-28 text-center">{MONTHS[month]} {year}</span>
          <button onClick={goFwd} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center focus:outline-none">
            <ChevronRight size={13} color="#1a1a1a" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WDAYS.map((d, i) => <div key={i} className="text-center py-1 text-[11px] font-semibold text-gray-400">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const date = new Date(year, month, d)
          const dateStr = toDateStr(date)
          const booking = bookingForDate(dateStr)
          const isHovered = hovered === dateStr

          return (
            <div key={i} className="relative"
              onMouseEnter={() => booking && setHovered(dateStr)}
              onMouseLeave={() => setHovered(null)}>
              <div className={`h-10 rounded-lg flex items-center justify-center text-xs font-semibold cursor-default
                ${booking
                  ? booking.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-[#eaf5e4] text-[#2c4a1e]'
                  : 'text-gray-400'}`}>
                {d}
              </div>
              {isHovered && booking && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#1a1a1a] text-white text-[11px]
                                px-3 py-2 rounded-lg whitespace-nowrap z-10 pointer-events-none text-center leading-relaxed">
                  <div className="font-semibold">{booking.traveller.name}</div>
                  <div className="text-gray-300 capitalize">{booking.status} · {formatDateRange(booking.check_in, booking.check_out)}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-[#eaf5e4]" />
          <span className="text-xs text-gray-500">Confirmed/completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100" />
          <span className="text-xs text-gray-500">Pending</span>
        </div>
      </div>
    </div>
  )
}

export default function ListingBookingsPage({ params }: Props) {
  const { listingId } = use(params)
  const router = useRouter()
  const [filter, setFilter] = useState('All')

  const [listing, setListing] = useState<ApiListing | null>(null)
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    Promise.all([
      apiFetch<{ listing: ApiListing }>(`/vendor/listings/${listingId}`),
      apiFetch<{ bookings: ApiBooking[] }>('/vendor/bookings'),
    ])
      .then(([listingRes, bookingsRes]) => {
        setListing(listingRes.listing)
        setBookings(bookingsRes.bookings.filter(b => b.listing.id === Number(listingId)))
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [listingId])

  const filtered = bookings.filter(b => filter === 'All' || b.status.toLowerCase() === filter.toLowerCase())

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound || !listing) {
    return (
      <div className="p-5 lg:p-8 max-w-3xl mx-auto text-center pt-20">
        <p className="text-sm text-gray-500 mb-4">Listing not found.</p>
        <button onClick={() => router.push('/vendor/listings')}
          className="text-sm font-semibold text-[#2c4a1e] underline">
          Back to listings
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <button onClick={() => router.push('/vendor/listings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to listings
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#f5f5f5]">
          <Image src={listing.images[0]?.url ?? FALLBACK_IMAGE} alt={listing.title} fill sizes="64px" className="object-cover" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">{listing.title}</h1>
          <p className="text-sm text-gray-500">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <AvailabilityCalendar bookings={bookings} />

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold
                        border transition-all focus:outline-none
              ${filter === f
                ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">No bookings match this filter.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((booking) => (
            <button key={booking.id}
              onClick={() => router.push(`/vendor/bookings/${booking.id}`)}
              className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-4 text-left
                         hover:shadow-md transition-all w-full">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center
                                text-sm font-bold flex-shrink-0"
                  style={{ background: colorForName(booking.traveller.name) }}>
                  {booking.traveller.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-[#1a1a1a] truncate">{booking.traveller.name}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} color="#888" />
                      <span className="text-xs text-gray-400">{formatDateRange(booking.check_in, booking.check_out)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={11} color="#888" />
                      <span className="text-xs text-gray-400">
                        {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#1a1a1a]">{formatKsh(booking.total)}</p>
                  <ChevronRight size={14} color="#aaa" className="ml-auto mt-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
