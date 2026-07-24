'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import BottomNav from '@/components/BottomNav'

const STATUS_STYLES = {
  upcoming: { bg: 'bg-[#eaf5e4]', text: 'text-[#2c4a1e]', label: 'Upcoming' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Completed' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-500', label: 'Cancelled' },
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

type ApiBooking = {
  id: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'alternative_proposed'
  guests: number
  total: string
  check_in: string | null
  check_out: string | null
  listing: {
    id: number
    title: string
    images: { url: string }[]
    vendor: { id: number; business_name: string }
  }
}

type Trip = {
  id: number
  listingTitle: string
  vendorName: string
  image: string
  dates: string
  guests: number
  price: string
  status: 'upcoming' | 'completed' | 'cancelled'
}

function mapStatus(status: ApiBooking['status']): Trip['status'] {
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'
  return 'upcoming'
}

function formatDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
function formatDateRange(start: string | null, end: string | null) {
  if (!start) return '—'
  if (!end || end === start) return formatDate(start)
  return `${formatDate(start)} – ${formatDate(end)}`
}
function formatKsh(v: string | number) {
  return `Ksh ${Math.round(Number(v)).toLocaleString()}`
}

function mapBooking(b: ApiBooking): Trip {
  return {
    id: b.id,
    listingTitle: b.listing.title,
    vendorName: b.listing.vendor.business_name,
    image: b.listing.images[0]?.url ?? FALLBACK_IMAGE,
    dates: formatDateRange(b.check_in, b.check_out),
    guests: b.guests,
    price: formatKsh(b.total),
    status: mapStatus(b.status),
  }
}

export default function TripsPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return }

    apiFetch<{ bookings: ApiBooking[] }>('/bookings')
      .then(({ bookings }) => setTrips(bookings.map(mapBooking)))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 sm:px-8 pt-8 pb-32 max-w-2xl mx-auto w-full">

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2">Trips</h1>

        {!isLoggedIn ? (
          <div className="mt-4">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
              Log in to view your trips
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Once you've booked a tour or stay, it will appear here.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-[#2c4a1e] text-white px-6 py-3 rounded-xl font-semibold
                         text-sm hover:bg-[#3d6b28] transition-colors"
            >
              Log in
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#e8f0e0] flex items-center
                            justify-center">
              <Calendar size={28} color="#2c4a1e" />
            </div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">No trips yet</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              When you book a safari, stay or experience, it will appear here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-2 border border-[#1a1a1a] text-[#1a1a1a] px-6 py-3
                         rounded-xl font-semibold text-sm hover:bg-[#f0ece4] transition-colors"
            >
              Start exploring
            </button>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {trips.filter(t => t.status === 'upcoming').length > 0 && (
              <div className="mb-6">
                <h2 className="text-base font-bold text-[#1a1a1a] mb-3">Upcoming</h2>
                <div className="flex flex-col gap-3">
                  {trips
                    .filter(t => t.status === 'upcoming')
                    .map(trip => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                </div>
              </div>
            )}

            {/* Past trips */}
            {trips.filter(t => t.status !== 'upcoming').length > 0 && (
              <div>
                <h2 className="text-base font-bold text-[#1a1a1a] mb-3">Past trips</h2>
                <div className="flex flex-col gap-3">
                  {trips
                    .filter(t => t.status !== 'upcoming')
                    .map(trip => (
                      <TripCard key={trip.id} trip={trip} />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav active="Trips" onSelect={() => { }} scrollingDown={false} scrolled={false} />
    </div>
  )
}

function TripCard({ trip }: { trip: Trip }) {
  const style = STATUS_STYLES[trip.status]

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden w-full"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-[90px] h-[90px] rounded-xl overflow-hidden
                        flex-shrink-0 bg-[#e0d9cc]">
          <Image src={trip.image} alt={trip.listingTitle} fill
            sizes="90px" className="object-cover" />
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-center gap-1">
          {/* Status badge */}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md
                            w-fit ${style.bg} ${style.text}`}>
            {style.label}
          </span>
          <p className="text-[14px] font-bold text-[#1a1a1a] leading-snug truncate">
            {trip.listingTitle}
          </p>
          <p className="text-[12px] text-gray-500">{trip.vendorName}</p>
          <div className="flex flex-col gap-1 mt-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} color="#888" />
              <span className="text-[11px] text-gray-400">{trip.dates}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} color="#888" />
              <span className="text-[11px] text-gray-400">
                {trip.guests} guest{trip.guests > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <p className="text-[12px] font-semibold text-[#2c4a1e] mt-0.5">{trip.price}</p>
        </div>
      </div>

      {/* Actions for upcoming trips */}
      {trip.status === 'upcoming' && (
        <div className="flex border-t border-gray-100">
          <button className="flex-1 py-3 text-xs font-semibold text-[#1a1a1a]
                             hover:bg-gray-50 transition-colors border-r border-gray-100">
            Manage booking
          </button>
          <button className="flex-1 py-3 text-xs font-semibold text-[#1a1a1a]
                             hover:bg-gray-50 transition-colors">
            Message host
          </button>
        </div>
      )}

      {/* Review for completed trips */}
      {trip.status === 'completed' && (
        <div className="border-t border-gray-100">
          <button className="w-full py-3 text-xs font-semibold text-[#2c4a1e]
                             hover:bg-gray-50 transition-colors">
            Leave a review ★
          </button>
        </div>
      )}
    </div>
  )
}
