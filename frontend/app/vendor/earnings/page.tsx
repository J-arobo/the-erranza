'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

// Show more / Show less
const [showAllListings, setShowAllListings] = useState(false)

type ApiEarnings = {
  monthly: { month: string; amount: number }[]
  total_earned: number
  this_month: number
  completed_trips: number
  total_views: number
  commission_rate: number
  listings: { id: number; title: string; views: number; bookings: number; image: string | null }[]
}

type ApiBooking = {
  id: number
  status: string
  total: string
  check_in: string | null
  check_out: string | null
  listing: { id: number; title: string }
  traveller: { id: number; name: string }
}

export default function VendorEarningsPage() {
  const [earnings, setEarnings] = useState<ApiEarnings | null>(null)
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiFetch<ApiEarnings>('/vendor/earnings'),
      apiFetch<{ bookings: ApiBooking[] }>('/vendor/bookings'),
    ])
      .then(([e, b]) => {
        setEarnings(e)
        setBookings(b.bookings)
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="p-5 lg:p-8 max-w-3xl mx-auto">
        <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error || 'Could not load earnings.'}</div>
      </div>
    )
  }

  const max = Math.max(1, ...earnings.monthly.map(e => e.amount))
  const byViews = [...earnings.listings].sort((a, b) => b.views - a.views)
  const completed = bookings
    .filter(b => b.status === 'completed')
    .map(b => ({
      ...b,
      net: Math.round(Number(b.total) * (1 - earnings.commission_rate)),
    }))

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Earnings</h1>
      <p className="text-xs text-gray-400 mb-6">
        Shown after Erranza's {Math.round(earnings.commission_rate * 100)}% commission — what you actually receive.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total earned',    value: `Ksh ${earnings.total_earned.toLocaleString()}` },
          { label: 'This month',      value: `Ksh ${earnings.this_month.toLocaleString()}` },
          { label: 'Completed trips', value: earnings.completed_trips },
          { label: 'Total views',     value: earnings.total_views.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label}
            className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-4">
            <p className="text-xl font-bold text-[#1a1a1a]">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Monthly earnings</h2>
        {earnings.monthly.every(e => e.amount === 0) ? (
          <p className="text-sm text-gray-400 py-10 text-center">
            Your monthly earnings will appear here once a trip is completed.
          </p>
        ) : (
          <>
            <div className="flex items-end gap-2 h-40 mb-5">
              {earnings.monthly.map(({ month, amount }, i) => (
                <div key={`${month}-${i}`} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                  <span className="text-[9px] text-gray-500 font-semibold">
                    {amount > 0 ? `${(amount / 1000).toFixed(0)}k` : ''}
                  </span>
                  <div className="w-full rounded-t-lg bg-[#2c4a1e] hover:bg-[#3d6b28]
                                  transition-colors cursor-pointer"
                    style={{ height: `${(amount / max) * 100}%`, minHeight: '4px' }} />
                  <span className="text-[9px] text-gray-400">{month}</span>
                </div>
              ))}
            </div>
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left font-semibold text-gray-400 text-xs py-2 px-1">Month</th>
                    <th className="text-right font-semibold text-gray-400 text-xs py-2 px-1">Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.monthly.map(({ month, amount }, i) => (
                    <tr key={`${month}-${i}`} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 px-1 text-[#1a1a1a]">{month}</td>
                      <td className="py-2 px-1 text-right font-semibold text-[#1a1a1a]">Ksh {amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Listing performance */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-1">Listing performance</h2>
        <p className="text-xs text-gray-400 mb-4">Views and conversion rate per listing.</p>
        {byViews.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">You don't have any listings yet.</p>
        ) : (
          <>
            <div className="flex flex-col divide-y divide-gray-100">
              {(showAllListings ? byViews : byViews.slice(0, 5)).map((l) => {
                const conversion = l.views > 0 ? ((l.bookings / l.views) * 100).toFixed(1) : null
                return (
                  <div key={l.id} className="flex items-center gap-3 py-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-[#f5f5f5]">
                      <Image src={l.image ?? FALLBACK_IMAGE} alt={l.title} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1a1a1a] truncate">{l.title}</p>
                      <p className="text-xs text-gray-400">
                        {l.views.toLocaleString()} views · {l.bookings} bookings
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#2c4a1e]">
                        {conversion !== null ? `${conversion}%` : '—'}
                      </p>
                      <p className="text-[10px] text-gray-400">conversion</p>
                    </div>
                  </div>
                )
              })}
            </div>
            {byViews.length > 5 && (
              <button onClick={() => setShowAllListings(s => !s)}
                className="w-full text-center text-xs font-semibold text-[#2c4a1e] mt-3 pt-3 border-t border-gray-100">
                {showAllListings ? 'Show less' : `Show all ${byViews.length} listings`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Completed bookings</h2>
        {completed.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No completed bookings yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {completed.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{b.traveller.name}</p>
                  <p className="text-xs text-gray-400">
                    {b.listing.title} · {b.check_in ? new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </p>
                </div>
                <p className="text-sm font-bold text-[#2c4a1e]">+Ksh {b.net.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
