'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type Admin = { id: number }
type Dispute = { id: number; status: string }
type Vendor = { id: number; suspended: boolean }
type Financials = { gross_platform_revenue: number; total_commission: number }
type Config = { maintenance_mode: boolean; maintenance_message: string | null }

export default function SuperAdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeAdmins, setActiveAdmins] = useState(0)
  const [escalatedDisputes, setEscalatedDisputes] = useState(0)
  const [suspendedVendors, setSuspendedVendors] = useState(0)
  const [financials, setFinancials] = useState<Financials | null>(null)
  const [config, setConfig] = useState<Config | null>(null)

  useEffect(() => {
    Promise.all([
      apiFetch<{ admins: Admin[] }>('/super-admin/admins'),
      apiFetch<{ disputes: Dispute[] }>('/super-admin/disputes'),
      apiFetch<{ vendors: Vendor[] }>('/admin/vendors'),
      apiFetch<Financials>('/super-admin/financials'),
      apiFetch<{ config: Config }>('/super-admin/config'),
    ])
      .then(([admins, disputes, vendors, fin, cfg]) => {
        setActiveAdmins(admins.admins.length)
        setEscalatedDisputes(disputes.disputes.filter(d => d.status === 'escalated').length)
        setSuspendedVendors(vendors.vendors.filter(v => v.suspended).length)
        setFinancials(fin)
        setConfig(cfg.config)
      })
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

  const STATS = [
    { label: 'Platform revenue', value: `Ksh ${((financials?.gross_platform_revenue ?? 0) / 1000000).toFixed(2)}M`, path: '/super-admin/financials' },
    { label: 'Commission collected', value: `Ksh ${(financials?.total_commission ?? 0).toLocaleString()}`, path: '/super-admin/financials' },
    { label: 'Active admins', value: activeAdmins, path: '/super-admin/admins' },
    { label: 'Escalated disputes', value: escalatedDisputes, path: '/super-admin/disputes' },
    { label: 'Suspended vendors', value: suspendedVendors, path: '/super-admin/moderation' },
  ]

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Dashboard</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {config?.maintenance_mode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-amber-800">Maintenance mode is currently ON</p>
          <p className="text-xs text-amber-700 mt-0.5">{config.maintenance_message || 'No message set.'}</p>
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
        <h2 className="text-base font-bold text-[#1a1a1a] mb-2">Financial summary</h2>
        <p className="text-xs text-gray-400 mb-4">
          All-time totals across every vendor. See the Financials page for the full per-vendor breakdown.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-[#1a1a1a]">Ksh {(financials?.gross_platform_revenue ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Gross platform revenue</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[#1a1a1a]">Ksh {(financials?.total_commission ?? 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total commission</p>
          </div>
        </div>
      </div>
    </div>
  )
}
