'use client'
import { useEffect, useState } from 'react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type VendorPayout = {
  vendor_id: number
  business_name: string
  gross_earnings: number
  commission: number
  payout: number
}

type Financials = {
  commission_rate: number
  gross_platform_revenue: number
  total_commission: number
  total_payouts: number
  vendors: VendorPayout[]
}

export default function SuperAdminFinancialsPage() {
  const [data, setData] = useState<Financials | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<Financials>('/super-admin/financials')
      .then(setData)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

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
        All-time totals from completed bookings, at the current {data.commission_rate}% standard commission rate.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Gross platform revenue', value: `Ksh ${data.gross_platform_revenue.toLocaleString()}` },
          { label: 'Commission collected', value: `Ksh ${data.total_commission.toLocaleString()}` },
          { label: 'Vendor payouts', value: `Ksh ${data.total_payouts.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <p className="text-lg font-bold text-[#1a1a1a]">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
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
                    Earned Ksh {v.gross_earnings.toLocaleString()} · Commission Ksh {v.commission.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm font-bold text-[#1a1a1a]">Ksh {v.payout.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
