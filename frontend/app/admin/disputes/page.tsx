'use client'
import { useEffect, useState } from 'react'
import { ShieldAlert, Check, ArrowUpCircle } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700',
  resolved: 'bg-[#eaf5e4] text-[#2c4a1e]',
  escalated: 'bg-red-50 text-red-500',
}
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  resolved: 'Resolved',
  escalated: 'Escalated to Super Admin',
}

type AdminDispute = {
  id: number
  status: string
  amount: string
  reason: string
  booking: { id: number; listing: { title: string; vendor: { business_name: string } } }
  raised_by: { name: string } | null
}

export default function AdminDisputesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [disputes, setDisputes] = useState<AdminDispute[]>([])
  const [ceiling, setCeiling] = useState(0)
  const [actingId, setActingId] = useState<number | null>(null)

  useEffect(() => {
    apiFetch<{ disputes: AdminDispute[]; ceiling: number }>('/admin/disputes')
      .then(({ disputes, ceiling }) => {
        setDisputes(disputes)
        setCeiling(ceiling)
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  async function resolveDispute(id: number) {
    setActingId(id)
    try {
      const { dispute } = await apiFetch<{ dispute: AdminDispute }>(`/admin/disputes/${id}/resolve`, { method: 'POST' })
      setDisputes(ds => ds.map(d => d.id === dispute.id ? dispute : d))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function escalateDispute(id: number) {
    setActingId(id)
    try {
      const { dispute } = await apiFetch<{ dispute: AdminDispute }>(`/admin/disputes/${id}/escalate`, { method: 'POST' })
      setDisputes(ds => ds.map(d => d.id === dispute.id ? dispute : d))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Disputes</h1>
      <p className="text-sm text-gray-500 mb-6">
        Refunds under Ksh {ceiling.toLocaleString()} can be approved directly. Anything at or above
        that must be escalated to a Super Admin.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {disputes.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          No disputes.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {disputes.map((d) => {
            const amount = Number(d.amount)
            const overCeiling = amount >= ceiling
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-[#1a1a1a]">Booking #{d.booking.id}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                    ${STATUS_STYLES[d.status]}`}>
                    {STATUS_LABELS[d.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-2">
                  {d.booking.listing.vendor.business_name} · {d.booking.listing.title}
                  {d.raised_by ? ` · raised by ${d.raised_by.name}` : ''}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-3">{d.reason}</p>

                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-3">
                  <span className="text-sm text-gray-600">Requested refund</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">Ksh {amount.toLocaleString()}</span>
                </div>

                {d.status === 'open' && !overCeiling && (
                  <button onClick={() => resolveDispute(d.id)} disabled={actingId === d.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
                    <Check size={13} /> Approve refund
                  </button>
                )}

                {d.status === 'open' && overCeiling && (
                  <button onClick={() => escalateDispute(d.id)} disabled={actingId === d.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40">
                    <ArrowUpCircle size={13} /> Escalate to Super Admin
                  </button>
                )}

                {d.status === 'escalated' && (
                  <div className="flex items-start gap-2 bg-red-50 rounded-lg p-2.5">
                    <ShieldAlert size={14} color="#dc2626" className="flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">
                      This exceeds your Ksh {ceiling.toLocaleString()} approval ceiling and requires Super Admin review.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
