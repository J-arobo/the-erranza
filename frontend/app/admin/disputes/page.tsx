'use client'
import { useState } from 'react'
import { Scale, ShieldAlert, Check } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { DISPUTES, PLATFORM_CONFIG, logAction } from '@/data/admin'

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700',
  auto_approved: 'bg-[#eaf5e4] text-[#2c4a1e]',
  escalated: 'bg-red-50 text-red-500',
  resolved: 'bg-gray-100 text-gray-500',
}
const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  auto_approved: 'Approved',
  escalated: 'Escalated to Super Admin',
  resolved: 'Resolved',
}

export default function AdminDisputesPage() {
  const { user } = useAuth()
  const [, forceUpdate] = useState(0)
  const ceiling = PLATFORM_CONFIG.disputeCeiling

  function approveRefund(id: string) {
    const dispute = DISPUTES.find(d => d.id === id)
    if (!dispute || dispute.amount >= ceiling) return
    dispute.status = 'auto_approved'
    logAction(
      user?.email ?? 'unknown-admin',
      `Approved refund of Ksh ${dispute.amount.toLocaleString()}`,
      `${dispute.bookingRef} — ${dispute.vendorName}`
    )
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Disputes</h1>
      <p className="text-sm text-gray-500 mb-6">
        Refunds under Ksh {ceiling.toLocaleString()} can be approved directly. Anything at or above
        that is escalated to a Super Admin.
      </p>

      <div className="flex flex-col gap-3">
        {DISPUTES.map((d) => {
          const overCeiling = d.amount >= ceiling
          return (
            <div key={d.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
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

              {d.status === 'open' && !overCeiling && (
                <button onClick={() => approveRefund(d.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                             bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors">
                  <Check size={13} /> Approve refund
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
    </div>
  )
}
