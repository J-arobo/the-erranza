'use client'
import { useEffect, useState } from 'react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { useRouter } from 'next/navigation'

type VendorPayout = {
  vendor_id: number
  business_name: string
  gross_earnings: number
  commission: number
  payout: number
}

type Financials = {
  gross_platform_revenue: number
  total_commission: number
  total_payouts: number
  vendors: VendorPayout[]
}

type BookingPayoutRow = {
  id: number
  leg: 'vendor' | 'commission'
  amount: string
  status: 'pending' | 'processing' | 'paid' | 'failed'
  destination: string | null
  reference: string | null
  failure_reason: string | null
  created_at: string
  booking: { id: number; listing: { title: string } } | null
  vendor: { business_name: string } | null
}

type PayoutsResponse = {
  payouts: { data: BookingPayoutRow[]; current_page: number; last_page: number }
  summary: {
    vendor_disbursed_this_month: number
    commission_pending: number
    failed_vendor_payouts: number
  }
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-500',
  processing: 'bg-blue-50 text-blue-700',
  paid: 'bg-[#eaf5e4] text-[#2c4a1e]',
  failed: 'bg-red-50 text-red-600',
}

function formatKsh(v: number | string) {
  return `Ksh ${Math.round(Number(v)).toLocaleString()}`
}

export default function SuperAdminFinancialsPage() {
  const router = useRouter()
  const [data, setData] = useState<Financials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [payoutsData, setPayoutsData] = useState<PayoutsResponse | null>(null)
  const [payoutsPage, setPayoutsPage] = useState(1)
  const [loadingMorePayouts, setLoadingMorePayouts] = useState(false)

  useEffect(() => {
    apiFetch<Financials>('/super-admin/financials')
      .then(setData)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))

    apiFetch<PayoutsResponse>('/super-admin/payouts')
      .then(setPayoutsData)
      .catch(() => { })
  }, [])

  function loadMorePayouts() {
    if (!payoutsData) return
    setLoadingMorePayouts(true)
    const nextPage = payoutsPage + 1
    apiFetch<PayoutsResponse>(`/super-admin/payouts?page=${nextPage}`)
      .then((res) => {
        setPayoutsData(p => p ? { ...res, payouts: { ...res.payouts, data: [...p.payouts.data, ...res.payouts.data] } } : res)
        setPayoutsPage(res.payouts.current_page)
      })
      .finally(() => setLoadingMorePayouts(false))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#161616] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-5 lg:p-8 max-w-4xl mx-auto">
        <p className="text-sm text-red-600">{error || 'Could not load financials.'}</p>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Financials</h1>
      <p className="text-sm text-gray-500 mb-6">
        All-time totals from completed bookings, at each vendor's own plan rate (12% Standard, 8% Plus).
      </p>

      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: 'Gross platform revenue', value: formatKsh(data.gross_platform_revenue) },
          { label: 'Commission collected', value: formatKsh(data.total_commission) },
          { label: 'Vendor payouts', value: formatKsh(data.total_payouts) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-lg font-bold text-[#1a1a1a]">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-8">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Vendor payouts</h2>
        {data.vendors.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No completed bookings yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {data.vendors.map((v) => (
              <div key={v.vendor_id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{v.business_name}</p>
                  <p className="text-xs text-gray-400">
                    Earned {formatKsh(v.gross_earnings)} · Commission {formatKsh(v.commission)}
                  </p>
                </div>
                <p className="text-sm font-bold text-[#1a1a1a]">{formatKsh(v.payout)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">Payouts activity</h2>
      <p className="text-sm text-gray-500 mb-4">Live, from the trip-completion payout pipeline.</p>

      {payoutsData && (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <p className="text-lg font-bold text-[#1a1a1a]">{formatKsh(payoutsData.summary.vendor_disbursed_this_month)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Disbursed to vendors this month</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <p className="text-lg font-bold text-[#1a1a1a]">{formatKsh(payoutsData.summary.commission_pending)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Commission queued (Account B pending)</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <p className={`text-lg font-bold ${payoutsData.summary.failed_vendor_payouts > 0 ? 'text-red-600' : 'text-[#1a1a1a]'}`}>
                {payoutsData.summary.failed_vendor_payouts}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">Failed vendor payouts needing attention</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            {payoutsData.payouts.data.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No payout activity yet.</p>
            ) : (
              <div className="flex flex-col divide-y divide-gray-100">
                {payoutsData.payouts.data.map((p) => (
                  <button key={p.id} onClick={() => p.booking && router.push(`/super-admin/bookings/${p.booking.id}`)}
                    disabled={!p.booking}
                    className="w-full text-left py-3 hover:bg-gray-50 transition-colors -mx-5 px-5 disabled:cursor-default disabled:hover:bg-transparent">

                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                          {p.booking?.listing.title ?? `Booking #${p.booking?.id}`} · {p.vendor?.business_name}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">{p.leg} leg</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-[#1a1a1a]">{formatKsh(p.amount)}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[p.status]}`}>
                          {p.status}
                        </span>
                      </div>
                    </div>
                    {p.failure_reason && (
                      <p className="text-xs text-red-500 mt-1">{p.failure_reason}</p>
                    )}
                    {p.reference && p.status === 'paid' && (
                      <p className="text-xs text-gray-400 mt-1">Ref: {p.reference}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {payoutsPage < payoutsData.payouts.last_page && (
            <button onClick={loadMorePayouts} disabled={loadingMorePayouts}
              className="w-full text-center text-sm font-semibold text-[#2c4a1e] py-3 mt-3 focus:outline-none disabled:opacity-50">
              {loadingMorePayouts ? 'Loading…' : 'Show more'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
