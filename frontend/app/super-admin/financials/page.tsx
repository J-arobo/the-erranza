'use client'
import { PLATFORM_MONTHLY_REVENUE, VENDOR_PAYOUTS } from '@/data/admin'

export default function SuperAdminFinancialsPage() {
  const totalRevenue = PLATFORM_MONTHLY_REVENUE.reduce((s, m) => s + m.amount, 0)
  const totalCommission = VENDOR_PAYOUTS.reduce((s, v) => s + v.commissionCollected, 0)
  const totalPayouts = VENDOR_PAYOUTS.reduce((s, v) => s + v.netPayout, 0)
  const maxRevenue = Math.max(...PLATFORM_MONTHLY_REVENUE.map(m => m.amount))

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Financials</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Platform revenue (YTD)', value: `Ksh ${totalRevenue.toLocaleString()}` },
          { label: 'Commission collected', value: `Ksh ${totalCommission.toLocaleString()}` },
          { label: 'Vendor payouts', value: `Ksh ${totalPayouts.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-200 p-4">
            <p className="text-lg font-bold text-[#1a1a1a]">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Monthly revenue</h2>
        <div className="flex items-end gap-2 h-40">
          {PLATFORM_MONTHLY_REVENUE.map(({ month, amount }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-500 font-semibold">{(amount / 1000).toFixed(0)}k</span>
              <div className="w-full rounded-t-lg bg-[#161616]"
                style={{ height: `${(amount / maxRevenue) * 100}%`, minHeight: '4px' }} />
              <span className="text-[9px] text-gray-400">{month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Vendor payouts</h2>
        <div className="flex flex-col divide-y divide-gray-100">
          {VENDOR_PAYOUTS.map((v) => (
            <div key={v.vendorId} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">{v.vendorName}</p>
                <p className="text-xs text-gray-400">
                  Earned Ksh {v.totalEarned.toLocaleString()} · Commission Ksh {v.commissionCollected.toLocaleString()}
                </p>
              </div>
              <p className="text-sm font-bold text-[#1a1a1a]">Ksh {v.netPayout.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
