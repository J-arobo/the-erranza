'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { Eye, EyeOff, Wallet, ChevronDown } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'


type ApiEarnings = {
  monthly: { month: string; full_month: string; year: string; amount: number }[]
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

// Vendor Payouts
type ApiPayout = {
  id: number
  amount: number
  status: 'pending' | 'processing' | 'paid' | 'failed' | 'manual'
  reference: string | null
  failure_reason: string | null
  paid_at: string | null
  created_at: string
  booking_id: number
  traveller_name: string | null
  listing_title: string | null
}
type ApiPayoutResponse = { payouts: ApiPayout[]; summary: { paid: number; pending: number; failed: number } }

function PayoutBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: 'Paid', cls: 'bg-[#eaf5e4] text-[#2c4a1e]' },
    processing: { label: 'Processing', cls: 'bg-amber-50 text-amber-700' },
    pending: { label: 'Pending', cls: 'bg-amber-50 text-amber-700' },
    failed: { label: 'Failed', cls: 'bg-red-50 text-red-600' },
    manual: { label: 'Manual', cls: 'bg-gray-100 text-gray-500' },
  }
  const s = map[status] ?? { label: status, cls: 'bg-gray-100 text-gray-500' }
  return <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${s.cls}`}>{s.label}</span>
}


export default function VendorEarningsPage() {
  const [earnings, setEarnings] = useState<ApiEarnings | null>(null)
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // Show more / Show less
  const [showAllListings, setShowAllListings] = useState(false)
  const [hideEarnings, setHideEarnings] = useState(false)
  // Show more/less on Completed bookings
  const [showAllCompleted, setShowAllCompleted] = useState(false)
  // Hover on the bars
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  // Vednor payouts
  const [payoutData, setPayoutData] = useState<ApiPayoutResponse | null>(null)
  const [retryingId, setRetryingId] = useState<number | null>(null)
  const [showAllPayouts, setShowAllPayouts] = useState(false)
  const [payoutsOpen, setPayoutsOpen] = useState(true)



  useEffect(() => {
    setHideEarnings(localStorage.getItem('erranza_hide_earnings_page') === '1')
  }, [])

  function toggleHideEarnings() {
    setHideEarnings(h => {
      localStorage.setItem('erranza_hide_earnings_page', h ? '0' : '1')
      return !h
    })
  }

  // Vendor Payouts: Retry failed payout
  async function retryPayout(id: number) {
    setRetryingId(id)
    try {
      const { payout } = await apiFetch<{ payout: { id: number; status: ApiPayout['status'] } }>(
        `/vendor/payouts/${id}/retry`, { method: 'POST' },
      )
      setPayoutData(d => d ? {
        ...d,
        payouts: d.payouts.map(p => p.id === id
          ? { ...p, status: payout.status, failure_reason: payout.status === 'failed' ? p.failure_reason : null }
          : p),
      } : d)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setRetryingId(null)
    }
  }


  useEffect(() => {
    Promise.all([
      apiFetch<ApiEarnings>('/vendor/earnings'),
      apiFetch<{ bookings: ApiBooking[] }>('/vendor/bookings'),
      apiFetch<ApiPayoutResponse>('/vendor/payouts'),
    ])
      .then(([e, b, p]) => {
        setEarnings(e)
        setBookings(b.bookings)
        setPayoutData(p)
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
      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Earnings</h1>
        <button onClick={toggleHideEarnings}
          className="text-gray-400 hover:text-[#1a1a1a] transition-colors focus:outline-none"
          title={hideEarnings ? 'Show figures' : 'Hide figures'}>
          {hideEarnings ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <p className="text-xs text-gray-400 mb-6">
        Shown after Erranza's {Math.round(earnings.commission_rate * 100)}% commission — what you actually receive.
      </p>


      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total earned', value: hideEarnings ? '••••••' : `Ksh ${earnings.total_earned.toLocaleString()}` },
          { label: 'This month', value: hideEarnings ? '••••••' : `Ksh ${earnings.this_month.toLocaleString()}` },
          { label: 'Completed trips', value: earnings.completed_trips },
          { label: 'Total views', value: earnings.total_views.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label}
            className="relative bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-4">
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
          <div className="flex items-end gap-2 h-40">
            {earnings.monthly.map(({ month, full_month, year, amount }, i) => (

              <div key={`${month}-${i}`} className="relative flex-1 h-full flex flex-col items-center justify-end gap-1"
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}>
                {hoveredBar === i && (
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white text-[10px] font-semibold
                                  px-3 py-2 rounded-lg whitespace-nowrap z-10 pointer-events-none text-center leading-relaxed">
                    <div>{full_month} {year}</div>
                    <div>{hideEarnings ? 'Hidden' : `Ksh ${amount.toLocaleString()}`}</div>
                  </div>
                )}
                <span className="text-[9px] text-gray-500 font-semibold">
                  {hideEarnings ? '' : (amount > 0 ? `${(amount / 1000).toFixed(0)}k` : '')}
                </span>
                <div className="w-full rounded-t-lg bg-[#2c4a1e] hover:bg-[#3d6b28]
                              transition-colors cursor-pointer"
                  style={{ height: `${(amount / max) * 100}%`, minHeight: '4px' }} />
                <span className="text-[9px] text-gray-400">{month}</span>
              </div>
            ))}
          </div>
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
                className="w-full text-center text-xs font-semibold text-[#2c4a1e] mt-3 pt-3 border-t border-gray-100 focus:outline-none">
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
          <>
            <div className="flex flex-col divide-y divide-gray-100">
              {(showAllCompleted ? completed : completed.slice(0, 5)).map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{b.traveller.name}</p>
                    <p className="text-xs text-gray-400">
                      {b.listing.title} · {b.check_in ? new Date(b.check_in).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-[#2c4a1e]">{hideEarnings ? '••••••' : `+Ksh ${b.net.toLocaleString()}`}</p>
                </div>
              ))}
            </div>
            {completed.length > 5 && (
              <button onClick={() => setShowAllCompleted(s => !s)}
                className="w-full text-center text-xs font-semibold text-[#2c4a1e] mt-3 pt-3 border-t border-gray-100 focus:outline-none">
                {showAllCompleted ? 'Show less' : `Show all ${completed.length} completed bookings`}
              </button>
            )}
          </>
        )}
      </div>

      {/* Payouts */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mt-5">
        <button onClick={() => setPayoutsOpen(o => !o)}
          className="w-full flex items-center gap-2.5 text-left focus:outline-none">
          <div className="w-8 h-8 rounded-lg bg-[#eaf5e4] flex items-center justify-center flex-shrink-0">
            <Wallet size={16} color="#2c4a1e" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#1a1a1a]">Payouts</h2>
            <p className="text-xs text-gray-400">Sent automatically after each completed trip.</p>
          </div>
          {payoutData && payoutData.summary.failed > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600 flex-shrink-0">
              {payoutData.payouts.filter(p => p.status === 'failed').length} failed
            </span>
          )}
          <ChevronDown size={18} color="#999"
            className={`flex-shrink-0 transition-transform ${payoutsOpen ? 'rotate-180' : ''}`} />
        </button>

        {payoutsOpen && (
          <div className="mt-4">
            {payoutData && (payoutData.summary.pending > 0 || payoutData.summary.failed > 0) && (
              <div className="flex gap-3 mb-4">
                {payoutData.summary.pending > 0 && (
                  <div className="flex-1 rounded-xl bg-amber-50 px-3 py-2">
                    <p className="text-sm font-bold text-amber-800">{hideEarnings ? '••••' : `Ksh ${payoutData.summary.pending.toLocaleString()}`}</p>
                    <p className="text-[10px] text-amber-700">In progress</p>
                  </div>
                )}
                {payoutData.summary.failed > 0 && (
                  <div className="flex-1 rounded-xl bg-red-50 px-3 py-2">
                    <p className="text-sm font-bold text-red-700">{hideEarnings ? '••••' : `Ksh ${payoutData.summary.failed.toLocaleString()}`}</p>
                    <p className="text-[10px] text-red-600">Needs attention</p>
                  </div>
                )}
              </div>
            )}

            {!payoutData || payoutData.payouts.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No payouts yet — they'll show here once a trip is completed.
              </p>
            ) : (
              <>
                <div className="flex flex-col divide-y divide-gray-100">
                  {(showAllPayouts ? payoutData.payouts : payoutData.payouts.slice(0, 6)).map((p) => (
                    <div key={p.id} className="py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                            {p.traveller_name ?? 'Trip'} · {p.listing_title ?? `Booking #${p.booking_id}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {p.reference ? ` · ${p.reference}` : ''}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#2c4a1e]">{hideEarnings ? '••••••' : `Ksh ${p.amount.toLocaleString()}`}</p>
                          <PayoutBadge status={p.status} />
                        </div>
                      </div>
                      {p.status === 'failed' && (
                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-xs text-red-500 min-w-0">{p.failure_reason ?? 'This payout did not go through.'}</p>
                          <button onClick={() => retryPayout(p.id)} disabled={retryingId === p.id}
                            className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
                            {retryingId === p.id ? 'Retrying…' : 'Retry'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {payoutData.payouts.length > 6 && (
                  <button onClick={() => setShowAllPayouts(s => !s)}
                    className="w-full text-center text-xs font-semibold text-[#2c4a1e] mt-3 pt-3 border-t border-gray-100 focus:outline-none">
                    {showAllPayouts ? 'Show less' : `Show all ${payoutData.payouts.length} payouts`}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>


    </div>
  )
}
