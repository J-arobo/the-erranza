'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type Submission = { id: number }
type Vendor = { id: number; suspended: boolean }
type Review = { id: number; rating: number; removed: boolean }
type AdminListing = { id: number; flagged: boolean }
type Dispute = { id: number; status: string }
type Booking = {
  id: number
  guests: number
  check_in: string | null
  traveller: { name: string }
  listing: { title: string }
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [pendingVerifications, setPendingVerifications] = useState(0)
  const [suspendedVendors, setSuspendedVendors] = useState(0)
  const [flaggedReviews, setFlaggedReviews] = useState(0)
  const [flaggedListings, setFlaggedListings] = useState(0)
  const [openDisputes, setOpenDisputes] = useState(0)
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])

  useEffect(() => {
    Promise.all([
      apiFetch<{ submissions: Submission[] }>('/admin/verifications'),
      apiFetch<{ vendors: Vendor[] }>('/admin/vendors'),
      apiFetch<{ reviews: Review[] }>('/admin/reviews'),
      apiFetch<{ listings: AdminListing[] }>('/admin/listings'),
      apiFetch<{ disputes: Dispute[]; ceiling: number }>('/admin/disputes'),
      apiFetch<{ data: Booking[] }>('/admin/bookings'),
    ])
      .then(([verifs, vendors, reviews, listings, disputes, bookings]) => {
        setPendingVerifications(verifs.submissions.length)
        setSuspendedVendors(vendors.vendors.filter(v => v.suspended).length)
        setFlaggedReviews(reviews.reviews.filter(r => !r.removed && r.rating <= 2).length)
        setFlaggedListings(listings.listings.filter(l => l.flagged).length)
        setOpenDisputes(disputes.disputes.filter(d => d.status === 'open' || d.status === 'escalated').length)
        setRecentBookings(bookings.data.slice(0, 4))
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const STATS = [
    { label: 'Pending verifications', value: pendingVerifications, path: '/admin/vendors' },
    { label: 'Flagged listings',      value: flaggedListings,      path: '/admin/moderation' },
    { label: 'Reviews to review',     value: flaggedReviews,       path: '/admin/moderation' },
    { label: 'Open disputes',         value: openDisputes,         path: '/admin/disputes' },
    { label: 'Suspended vendors',     value: suspendedVendors,     path: '/admin/vendors' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Dashboard</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {STATS.map(({ label, value, path }) => (
          <button key={label} onClick={() => router.push(path)}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-left
                       hover:shadow-md transition-all">
            <p className="text-2xl font-bold text-[#1a1a1a]">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={16} color="#2c4a1e" />
          <h2 className="text-base font-bold text-[#1a1a1a]">Recent bookings</h2>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No bookings yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {recentBookings.map((b) => (
              <div key={b.id} className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-full bg-[#eaf5e4] flex items-center justify-center
                                text-sm font-bold text-[#2c4a1e] flex-shrink-0">
                  {b.traveller.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{b.traveller.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {b.listing.title}{b.check_in ? ` · ${new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                  <Users size={12} /> {b.guests}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
