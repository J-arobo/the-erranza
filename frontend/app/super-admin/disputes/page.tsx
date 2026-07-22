'use client'
import { useState } from 'react'
import { Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { DISPUTES, logAction } from '@/data/admin'

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700',
  auto_approved: 'bg-[#eaf5e4] text-[#2c4a1e]',
  escalated: 'bg-red-50 text-red-500',
  resolved: 'bg-gray-100 text-gray-500',
}
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  auto_approved: 'Approved',
  escalated: 'Escalated',
  resolved: 'Resolved',
}

export default function SuperAdminDisputesPage() {
  const { user } = useAuth()
  const [, forceUpdate] = useState(0)

  function resolve(id: string) {
    const d = DISPUTES.find(x => x.id === id)
    if (!d) return
    const wasEscalated = d.status === 'escalated'
    d.status = 'resolved'
    logAction(
      user?.email ?? 'unknown-super-admin',
      wasEscalated
        ? `Overrode escalation and approved refund of Ksh ${d.amount.toLocaleString()}`
        : `Approved refund of Ksh ${d.amount.toLocaleString()}`,
      `${d.bookingRef} — ${d.vendorName}`
    )
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Disputes</h1>
      <p className="text-sm text-gray-500 mb-6">
        No approval ceiling applies here — you can resolve any dispute, including ones escalated past an Admin's limit.
      </p>

      <div className="flex flex-col gap-3">
        {DISPUTES.map((d) => (
          <div key={d.id} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-bold text-[#1a1a1a]">{d.bookingRef}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                ${STATUS_STYLES[d.status]}`}>
                {STATUS_LABELS[d.status]}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{d.vendorName} · {d.guestName} · {d.date}</p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{d.reason}</p>

            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3 mb-3">
              <span className="text-sm text-gray-600">Requested refund</span>
              <span className="text-sm font-bold text-[#1a1a1a]">Ksh {d.amount.toLocaleString()}</span>
            </div>

            {(d.status === 'open' || d.status === 'escalated') && (
              <button onClick={() => resolve(d.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                           bg-[#161616] text-white hover:bg-black transition-colors">
                <Check size={13} /> {d.status === 'escalated' ? 'Override and approve' : 'Approve refund'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
