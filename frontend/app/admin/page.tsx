'use client'
import { useRouter } from 'next/navigation'
import { Calendar, Users } from 'lucide-react'
import {
  PLATFORM_VENDORS, PLATFORM_LISTINGS, PLATFORM_REVIEWS,
  VERIFICATION_SUBMISSIONS, DISPUTES,
} from '@/data/admin'
import { VENDOR_BOOKINGS } from '@/data/vendor'

export default function AdminDashboardPage() {
  const router = useRouter()

  const pendingVerifications = VERIFICATION_SUBMISSIONS.filter(v => v.status === 'pending').length
  const flaggedListings = PLATFORM_LISTINGS.filter(l => l.flagged).length
  const flaggedReviews = PLATFORM_REVIEWS.filter(r => !r.removed && r.rating <= 2).length
  const openDisputes = DISPUTES.filter(d => d.status === 'open' || d.status === 'escalated').length
  const suspendedVendors = PLATFORM_VENDORS.filter(v => v.suspended).length

  const STATS = [
    { label: 'Pending verifications', value: pendingVerifications, path: '/admin/vendors' },
    { label: 'Flagged listings',      value: flaggedListings,      path: '/admin/moderation' },
    { label: 'Reviews to review',     value: flaggedReviews,       path: '/admin/moderation' },
    { label: 'Open disputes',         value: openDisputes,         path: '/admin/disputes' },
    { label: 'Suspended vendors',     value: suspendedVendors,     path: '/admin/vendors' },
  ]

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {STATS.map(({ label, value, path }) => (
          <button key={label} onClick={() => router.push(path)}
            className="bg-white rounded-2xl border border-gray-200 p-4 text-left
                       hover:shadow-md transition-all">
            <p className="text-2xl font-bold text-[#1a1a1a]">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={16} color="#2c4a1e" />
          <h2 className="text-base font-bold text-[#1a1a1a]">Recent bookings</h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Booking-level detail is currently only modeled for Mara Expeditions in this build.
        </p>
        <div className="flex flex-col divide-y divide-gray-100">
          {VENDOR_BOOKINGS.slice(0, 4).map((b) => (
            <div key={b.id} className="flex items-center gap-3 py-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0" style={{ background: b.guestColor }}>
                {b.guestInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a] truncate">{b.guestName}</p>
                <p className="text-xs text-gray-400 truncate">{b.listingTitle} · {b.dates}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
                <Users size={12} /> {b.guests}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
