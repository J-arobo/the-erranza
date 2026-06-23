'use client'
import { VENDOR_EARNINGS, VENDOR_BOOKINGS } from '@/data/vendor'

export default function VendorEarningsPage() {
  const total = VENDOR_EARNINGS.reduce((s, e) => s + e.amount, 0)
  const max   = Math.max(...VENDOR_EARNINGS.map(e => e.amount))
  const completed = VENDOR_BOOKINGS.filter(b => b.status === 'completed')

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Earnings</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total earned',    value: `Ksh ${total.toLocaleString()}` },
          { label: 'This month',      value: `Ksh ${VENDOR_EARNINGS[11].amount.toLocaleString()}` },
          { label: 'Completed trips', value: completed.length },
        ].map(({ label, value }) => (
          <div key={label}
            className="bg-white rounded-2xl border border-[#e0d9cc] p-4">
            <p className="text-xl font-bold text-[#1a1a1a]">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Monthly earnings</h2>
        <div className="flex items-end gap-2 h-40">
          {VENDOR_EARNINGS.map(({ month, amount }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-500 font-semibold">
                {(amount / 1000).toFixed(0)}k
              </span>
              <div className="w-full rounded-t-lg bg-[#2c4a1e] hover:bg-[#3d6b28]
                              transition-colors cursor-pointer"
                style={{ height: `${(amount / max) * 100}%`, minHeight: '4px' }} />
              <span className="text-[9px] text-gray-400">{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Completed bookings</h2>
        <div className="flex flex-col divide-y divide-gray-100">
          {completed.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">{b.guestName}</p>
                <p className="text-xs text-gray-400">{b.listingTitle} · {b.dates}</p>
              </div>
              <p className="text-sm font-bold text-[#2c4a1e]">+{b.total}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}