'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { TrendingUp, Calendar, Star, List, ChevronRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  VENDOR_LISTINGS, VENDOR_BOOKINGS, VENDOR_EARNINGS, VENDOR_REVIEWS
} from '@/data/vendor'

export default function VendorDashboard() {
  const router = useRouter()
  const { user } = useAuth()

  const totalEarnings  = VENDOR_EARNINGS.reduce((s, e) => s + e.amount, 0)
  const pendingCount   = VENDOR_BOOKINGS.filter(b => b.status === 'pending').length
  const activeListings = VENDOR_LISTINGS.filter(l => l.status === 'active').length
  const avgRating      = VENDOR_REVIEWS.length > 0
    ? (VENDOR_REVIEWS.reduce((s, r) => s + r.rating, 0) / VENDOR_REVIEWS.length).toFixed(1)
    : '—'

  const maxEarning = Math.max(...VENDOR_EARNINGS.map(e => e.amount))

  const STATS = [
    {
      label: 'Total earnings',
      value: `Ksh ${totalEarnings.toLocaleString()}`,
      Icon: TrendingUp,
      color: 'bg-[#eaf5e4] text-[#2c4a1e]',
      path: '/vendor/earnings',
    },
    {
      label: 'Pending bookings',
      value: pendingCount,
      Icon: Calendar,
      color: 'bg-amber-50 text-amber-700',
      path: '/vendor/bookings',
    },
    {
      label: 'Active listings',
      value: activeListings,
      Icon: List,
      color: 'bg-blue-50 text-blue-700',
      path: '/vendor/listings',
    },
    {
      label: 'Avg rating',
      value: avgRating,
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
            className="bg-white rounded-2xl border border-[#e0d9cc] p-4 text-left
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
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1a1a1a]">Earnings this year</h2>
          <button onClick={() => router.push('/vendor/earnings')}
            className="text-xs text-[#2c4a1e] font-semibold">View all</button>
        </div>
        <div className="flex items-end gap-1.5 h-32">
          {VENDOR_EARNINGS.map(({ month, amount }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-[#2c4a1e] transition-all hover:bg-[#3d6b28]"
                style={{ height: `${(amount / maxEarning) * 100}%`, minHeight: '4px' }}
              />
              <span className="text-[9px] text-gray-400">{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1a1a1a]">Recent bookings</h2>
          <button onClick={() => router.push('/vendor/bookings')}
            className="text-xs text-[#2c4a1e] font-semibold">See all</button>
        </div>
        <div className="flex flex-col gap-3">
          {VENDOR_BOOKINGS.slice(0, 3).map((b) => (
            <button key={b.id}
              onClick={() => router.push(`/vendor/bookings/${b.id}`)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f5f0e8]
                         transition-colors text-left w-full">
              <div className="w-10 h-10 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0"
                style={{ background: b.guestColor }}>
                {b.guestInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a]">{b.guestName}</p>
                <p className="text-xs text-gray-400 truncate">{b.listingTitle}</p>
                <p className="text-xs text-gray-400">{b.dates}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-[#1a1a1a]">{b.total}</p>
                <StatusBadge status={b.status} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent reviews */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1a1a1a]">Recent reviews</h2>
          <button onClick={() => router.push('/vendor/reviews')}
            className="text-xs text-[#2c4a1e] font-semibold">See all</button>
        </div>
        {VENDOR_REVIEWS.slice(0, 2).map((r) => (
          <div key={r.id} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center
                              text-xs font-bold flex-shrink-0"
                style={{ background: r.guestColor }}>
                {r.guestInitial}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1a1a1a]">{r.guestName}</p>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10}
                      color={i < r.rating ? '#f5a623' : '#ddd'}
                      fill={i < r.rating ? '#f5a623' : '#ddd'} />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-400">{r.date}</span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 ml-10">{r.comment}</p>
          </div>
        ))}
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
