'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Users, ChevronRight } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { StatusBadge } from '../page'

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

type ApiBooking = {
  id: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'alternative_proposed'
  guests: number
  total: string
  check_in: string | null
  check_out: string | null
  listing: { id: number; title: string; category: string; images: { url: string }[] }
  traveller: { id: number; name: string; email: string }
}

function bookingRequiresApproval(category: string) {
  return category === 'Safari' || category === 'Packages'
}
function formatKsh(v: string | number) {
  return `Ksh ${Math.round(Number(v)).toLocaleString()}`
}
function formatDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
function formatDateRange(start: string | null, end: string | null) {
  if (!start) return '—'
  if (!end || end === start) return formatDate(start)
  return `${formatDate(start)} – ${formatDate(end)}`
}

export default function VendorBookingsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('All')
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  // Booking Accept confirmation
  const [confirmingAccept, setConfirmingAccept] = useState<ApiBooking | null>(null)


  useEffect(() => {
    apiFetch<{ bookings: ApiBooking[] }>('/vendor/bookings')
      .then(({ bookings }) => setBookings(bookings))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = bookings.filter(b =>
    filter === 'All' || b.status.toLowerCase() === filter.toLowerCase()
  )

  async function acceptBooking(id: number) {
    setBusyId(id)
    try {
      await apiFetch(`/vendor/bookings/${id}/accept`, { method: 'POST' })
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'confirmed' } : b))
      setConfirmingAccept(null)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  async function declineBooking(id: number, e: React.MouseEvent) {
    e.stopPropagation()
    setBusyId(id)
    try {
      await apiFetch(`/vendor/bookings/${id}/decline`, { method: 'POST' })
      setBookings(bs => bs.map(b => b.id === id ? { ...b, status: 'cancelled' } : b))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Bookings</h1>
        <p className="text-sm text-gray-500">{bookings.length} total bookings</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold
                        border transition-all
              ${filter === f
                ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
            {f}
            {f !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                ({bookings.filter(b => b.status === f.toLowerCase()).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-gray-400">
            No bookings yet.
          </div>
        )}
        {filtered.map((booking) => (
          <div key={booking.id}
            onClick={() => router.push(`/vendor/bookings/${booking.id}`)}
            role="button" tabIndex={0}
            className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-4 text-left
                       hover:shadow-md transition-all w-full cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden
                              flex-shrink-0 bg-[#f5f5f5]">
                <Image src={booking.listing.images[0]?.url ?? FALLBACK_IMAGE} alt={booking.listing.title}
                  fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-[#1a1a1a] truncate">
                    {booking.traveller.name}
                  </p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-xs text-gray-500 mb-1 truncate">{booking.listing.title}</p>
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

            {/* Pending actions — only for listings that require approval (Safari/Packages) */}
            {booking.status === 'pending' && bookingRequiresApproval(booking.listing.category) && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={(e) => { e.stopPropagation(); setConfirmingAccept(booking) }}
                  className="flex-1 py-2 rounded-xl bg-[#2c4a1e] text-white text-xs
                             font-semibold hover:bg-[#3d6b28] transition-colors">
                  Accept
                </button>
                <button onClick={(e) => declineBooking(booking.id, e)} disabled={busyId === booking.id}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-xs
                             font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {confirmingAccept && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget && busyId === null) setConfirmingAccept(null) }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Accept this booking?</h2>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Guest</span>
                <span className="font-semibold text-[#1a1a1a]">{confirmingAccept.traveller.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Listing</span>
                <span className="font-semibold text-[#1a1a1a] text-right">{confirmingAccept.listing.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Dates</span>
                <span className="font-semibold text-[#1a1a1a]">{formatDateRange(confirmingAccept.check_in, confirmingAccept.check_out)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Guests</span>
                <span className="font-semibold text-[#1a1a1a]">{confirmingAccept.guests}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold text-[#1a1a1a]">{formatKsh(confirmingAccept.total)}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              Once accepted, this booking is confirmed and the guest will be notified.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmingAccept(null)} disabled={busyId !== null}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                           text-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={() => acceptBooking(confirmingAccept.id)} disabled={busyId !== null}
                className="flex-1 py-3 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold
                           hover:bg-[#3d6b28] transition-colors disabled:opacity-50">
                {busyId === confirmingAccept.id ? 'Accepting…' : 'Confirm accept'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
