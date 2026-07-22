'use client'
import { useRouter } from 'next/navigation'
import {
  PLATFORM_VENDORS, PLATFORM_ADMINS, DISPUTES,
  PLATFORM_MONTHLY_REVENUE, VENDOR_PAYOUTS, PLATFORM_CONFIG,
} from '@/data/admin'

export default function SuperAdminDashboardPage() {
  const router = useRouter()

  const totalRevenue = PLATFORM_MONTHLY_REVENUE.reduce((s, m) => s + m.amount, 0)
  const totalCommission = VENDOR_PAYOUTS.reduce((s, v) => s + v.commissionCollected, 0)
  const activeAdmins = PLATFORM_ADMINS.filter(a => !a.revoked).length
  const escalatedDisputes = DISPUTES.filter(d => d.status === 'escalated').length
  const suspendedVendors = PLATFORM_VENDORS.filter(v => v.suspended).length

  const STATS = [
    { label: 'Platform revenue (YTD)', value: `Ksh ${(totalRevenue / 1000000).toFixed(2)}M`, path: '/super-admin/financials' },
    { label: 'Commission collected',   value: `Ksh ${totalCommission.toLocaleString()}`, path: '/super-admin/financials' },
    { label: 'Active admins',          value: activeAdmins, path: '/super-admin/admins' },
    { label: 'Escalated disputes',     value: escalatedDisputes, path: '/super-admin/disputes' },
    { label: 'Suspended vendors',      value: suspendedVendors, path: '/super-admin/moderation' },
  ]

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Dashboard</h1>

      {PLATFORM_CONFIG.maintenanceMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-amber-800">Maintenance mode is currently ON</p>
          <p className="text-xs text-amber-700 mt-0.5">{PLATFORM_CONFIG.maintenanceMessage || 'No message set.'}</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {STATS.map(({ label, value, path }) => (
          <button key={label} onClick={() => router.push(path)}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-left
                       hover:shadow-md transition-all">
            <p className="text-xl font-bold text-[#1a1a1a]">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Platform revenue this year</h2>
        <div className="flex items-end gap-2 h-32">
          {PLATFORM_MONTHLY_REVENUE.map(({ month, amount }) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-md bg-[#161616] transition-all"
                style={{ height: `${(amount / Math.max(...PLATFORM_MONTHLY_REVENUE.map(m => m.amount))) * 100}%`, minHeight: '4px' }} />
              <span className="text-[9px] text-gray-400">{month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
