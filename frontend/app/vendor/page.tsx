'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, Calendar, Star, List, ChevronRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const AVATAR_COLORS = ['#c4f0d4', '#f0e4c4', '#d4c4f0', '#c4e8f0', '#f0c4c4', '#e0f0c4']
function colorForName(name: string) {
  const hash = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

type ApiListing = { id: number; status: string }
type ApiBooking = {
  id: number
  status: string
  guests: number
  total: string
  check_in: string | null
  check_out: string | null
  listing: { id: number; title: string }
  traveller: { id: number; name: string }
}
type ApiReview = {
  id: number
  rating: number
  comment: string
  created_at: string
  listing: { id: number; title: string }
  traveller: { id: number; name: string; avatar_url: string | null }
}
type ApiEarnings = { monthly: { month: string; amount: number }[]; total_earned: number }

function formatDateRange(checkIn: string | null, checkOut: string | null) {
  if (!checkIn) return '—'
  const start = new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (!checkOut || checkOut === checkIn) return start
  const end = new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${start} – ${end}`
}

export default function VendorDashboard() {
  const router = useRouter()
  const { user } = useAuth()

  const [listings, setListings] = useState<ApiListing[]>([])
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [earnings, setEarnings] = useState<ApiEarnings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiFetch<{ listings: ApiListing[] }>('/vendor/listings'),
      apiFetch<{ bookings: ApiBooking[] }>('/vendor/bookings'),
      apiFetch<{ reviews: ApiReview[] }>('/vendor/reviews'),
      apiFetch<ApiEarnings>('/vendor/earnings'),
    ])
      .then(([l, b, r, e]) => {
        setListings(l.listings)
        setBookings(b.bookings)
        setReviews(r.reviews)
        setEarnings(e)
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  const pendingCount = bookings.filter(b => b.status === 'pending').length
  const activeListings = listings.filter(l => l.status === 'active').length
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '—'
  const monthly = earnings?.monthly ?? []
  const maxEarning = Math.max(1, ...monthly.map(e => e.amount))

  const STATS = [
    {
      label: 'Total earnings',
      value: (earnings?.total_earned ?? 0) > 0 ? `Ksh ${(earnings?.total_earned ?? 0).toLocaleString()}` : 'No earnings yet',
      Icon: TrendingUp,
      color: 'bg-[#eaf5e4] text-[#2c4a1e]',
      path: '/vendor/earnings',
    },
    {
      label: 'Pending bookings',
      value: pendingCount > 0 ? pendingCount : 'None pending',
      Icon: Calendar,
      color: 'bg-amber-50 text-amber-700',
      path: '/vendor/bookings',
    },
    {
      label: 'Active listings',
      value: activeListings > 0 ? activeListings : 'None yet',
      Icon: List,
      color: 'bg-blue-50 text-blue-700',
      path: '/vendor/listings',
    },
    {
      label: 'Avg rating',
      value: avgRating === '—' ? 'No reviews yet' : avgRating,
      Icon: Star,
      color: 'bg-orange-50 text-orange-700',
      path: '/vendor/reviews',
    },
  ]


  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#1a1a1a]">
          Welcome back, {user?.name?.split(' ')[0] ?? 'Vendor'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening with your listings today.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {/* Pending alert */}
      {pendingCount > 0 && (
        <button
          onClick={() => router.push('/vendor/bookings')}
          className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200
                     rounded-2xl p-4 mb-5 text-left hover:bg-amber-100 transition-colors"
        >
          <AlertCircle size={20} color="#b45309" className="flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-800 flex-1">
            You have {pendingCount} pending booking{pendingCount > 1 ? 's' : ''} awaiting approval
          </p>
          <ChevronRight size={16} color="#b45309" />
        </button>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {STATS.map(({ label, value, Icon, color, path }) => (
          <button key={label} onClick={() => router.push(path)}
            className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-4 text-left
                       hover:shadow-md transition-all active:scale-[0.98]">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={16} />
            </div>
            <p className="text-xl font-bold text-[#1a1a1a]">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* Earnings chart */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1a1a1a]">Earnings this year</h2>
          <button onClick={() => router.push('/vendor/earnings')}
            className="text-xs text-[#2c4a1e] font-semibold">View all</button>
        </div>
        {monthly.every(e => e.amount === 0) ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            Your earnings will show up here once a trip is completed.
          </p>
        ) : (
          <div className="flex items-end gap-1.5 h-32">
            {monthly.map(({ month, amount }, i) => (
              <div key={`${month}-${i}`} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-[#2c4a1e] transition-all hover:bg-[#3d6b28]"
                  style={{ height: `${(amount / maxEarning) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-[9px] text-gray-400">{month}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1a1a1a]">Recent bookings</h2>
          <button onClick={() => router.push('/vendor/bookings')}
            className="text-xs text-[#2c4a1e] font-semibold">See all</button>
        </div>
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm font-semibold text-[#1a1a1a] mb-1">No bookings yet</p>
            <p className="text-xs text-gray-400 mb-4">Create your first listing to start getting bookings.</p>
            <button onClick={() => router.push('/vendor/listings/new')}
              className="text-xs font-semibold text-white bg-[#2c4a1e] px-4 py-2 rounded-full hover:bg-[#3d6b28] transition-colors">
              Create your first listing
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.slice(0, 3).map((b) => (
              <button key={b.id}
                onClick={() => router.push(`/vendor/bookings/${b.id}`)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f3f4f6]
                           transition-colors text-left w-full">
                <div className="w-10 h-10 rounded-full flex items-center justify-center
                                text-sm font-bold flex-shrink-0"
                  style={{ background: colorForName(b.traveller.name) }}>
                  {b.traveller.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{b.traveller.name}</p>
                  <p className="text-xs text-gray-400 truncate">{b.listing.title}</p>
                  <p className="text-xs text-gray-400">{formatDateRange(b.check_in, b.check_out)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#1a1a1a]">Ksh {Math.round(Number(b.total)).toLocaleString()}</p>
                  <StatusBadge status={b.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent reviews */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1a1a1a]">Recent reviews</h2>
          <button onClick={() => router.push('/vendor/reviews')}
            className="text-xs text-[#2c4a1e] font-semibold">See all</button>
        </div>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            Your reviews will show up here once guests start rating their trips.
          </p>
        ) : (
          reviews.slice(0, 2).map((r) => (
            <div key={r.id} className="mb-4 last:mb-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center
                                text-xs font-bold flex-shrink-0 overflow-hidden"
                  style={{ background: colorForName(r.traveller.name) }}>
                  {r.traveller.avatar_url
                    ? <img src={r.traveller.avatar_url} alt={r.traveller.name} className="w-full h-full object-cover" />
                    : r.traveller.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{r.traveller.name}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={10}
                        color={i < r.rating ? '#f5a623' : '#ddd'}
                        fill={i < r.rating ? '#f5a623' : '#ddd'} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 ml-10">{r.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending:              'bg-amber-50 text-amber-700',
    confirmed:            'bg-[#eaf5e4] text-[#2c4a1e]',
    completed:            'bg-gray-100 text-gray-500',
    cancelled:            'bg-red-50 text-red-500',
    alternative_proposed: 'bg-blue-50 text-blue-600',
  }
  const labels: Record<string, string> = {
    alternative_proposed: 'Date proposed',
  }
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
                      ${styles[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {labels[status] ?? status}
    </span>
  )
}
