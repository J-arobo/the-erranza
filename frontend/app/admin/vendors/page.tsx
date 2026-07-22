'use client'
import { useState } from 'react'
import { Star, MessageCircle, Check, X, Ban } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PLATFORM_VENDORS, VERIFICATION_SUBMISSIONS, logAction } from '@/data/admin'

const TABS = ['Verification queue', 'All vendors'] as const

export default function AdminVendorsPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<typeof TABS[number]>('Verification queue')
  const [, forceUpdate] = useState(0)
  const [suspendingId, setSuspendingId] = useState<string | null>(null)
  const [suspendReason, setSuspendReason] = useState('')

  function adminId() { return user?.email ?? 'unknown-admin' }

  function approveSubmission(id: string) {
    const sub = VERIFICATION_SUBMISSIONS.find(s => s.id === id)
    if (!sub) return
    sub.status = 'approved'
    const vendor = PLATFORM_VENDORS.find(v => v.id === sub.vendorId)
    if (vendor) vendor.verificationStatus = 'approved'
    logAction(adminId(), 'Approved verification', `${sub.vendorName} (${sub.docType})`)
    forceUpdate(n => n + 1)
  }

  function rejectSubmission(id: string) {
    const sub = VERIFICATION_SUBMISSIONS.find(s => s.id === id)
    if (!sub) return
    sub.status = 'rejected'
    const vendor = PLATFORM_VENDORS.find(v => v.id === sub.vendorId)
    if (vendor) vendor.verificationStatus = 'rejected'
    logAction(adminId(), 'Rejected verification', `${sub.vendorName} (${sub.docType})`)
    forceUpdate(n => n + 1)
  }

  function confirmSuspend() {
    const vendor = PLATFORM_VENDORS.find(v => v.id === suspendingId)
    if (!vendor || !suspendReason.trim()) return
    vendor.suspended = true
    vendor.suspendReason = suspendReason.trim()
    logAction(adminId(), 'Suspended vendor', vendor.name)
    setSuspendingId(null)
    setSuspendReason('')
    forceUpdate(n => n + 1)
  }

  function unsuspendVendor(id: string) {
    const vendor = PLATFORM_VENDORS.find(v => v.id === id)
    if (!vendor) return
    vendor.suspended = false
    vendor.suspendReason = undefined
    logAction(adminId(), 'Unsuspended vendor', vendor.name)
    forceUpdate(n => n + 1)
  }

  const pending = VERIFICATION_SUBMISSIONS.filter(s => s.status === 'pending')
  const history = VERIFICATION_SUBMISSIONS.filter(s => s.status !== 'pending')

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Vendors</h1>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
              ${tab === t
                ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                : 'bg-white text-[#1a1a1a] border-gray-200 shadow-sm hover:border-[#2c4a1e]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Verification queue' && (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Pending ({pending.length})
            </p>
            <div className="flex flex-col gap-3">
              {pending.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                  Nothing pending review.
                </p>
              )}
              {pending.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-[#1a1a1a]">{s.vendorName}</p>
                    <span className="text-xs text-gray-400">{s.submittedDate}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{s.docType}</p>
                  <div className="flex gap-2">
                    <button onClick={() => approveSubmission(s.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors">
                      <Check size={13} /> Approve
                    </button>
                    <button onClick={() => rejectSubmission(s.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-gray-200 shadow-sm text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                      <X size={13} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">History</p>
              <div className="flex flex-col divide-y divide-gray-100 bg-white rounded-2xl border border-gray-200 shadow-sm px-4">
                {history.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-2 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{s.vendorName}</p>
                      <p className="text-xs text-gray-400">{s.docType} · {s.submittedDate}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                      ${s.status === 'approved' ? 'bg-[#eaf5e4] text-[#2c4a1e]' : 'bg-red-50 text-red-500'}`}>
                      {s.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'All vendors' && (
        <div className="flex flex-col gap-3">
          {PLATFORM_VENDORS.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{v.name}</p>
                <div className="flex items-center gap-1.5">
                  {v.suspended && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                      Suspended
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
                    ${v.verificationStatus === 'approved' ? 'bg-[#eaf5e4] text-[#2c4a1e]'
                      : v.verificationStatus === 'pending' ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-100 text-gray-500'}`}>
                    {v.verificationStatus}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">{v.email}</p>

              <div className="flex gap-4 mb-3">
                <div className="flex items-center gap-1.5">
                  <Star size={12} color="#f5a623" fill="#f5a623" />
                  <span className="text-xs text-gray-600">{v.rating > 0 ? v.rating : '—'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle size={12} color="#888" />
                  <span className="text-xs text-gray-600">{v.responseRate}% response rate</span>
                </div>
                <span className="text-xs text-gray-400">{v.listingCount} listings</span>
              </div>

              {v.suspended ? (
                <>
                  <div className="bg-red-50 rounded-lg p-2.5 mb-3">
                    <p className="text-xs text-red-600">{v.suspendReason}</p>
                  </div>
                  <button onClick={() => unsuspendVendor(v.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors">
                    <Check size={13} /> Reinstate vendor
                  </button>
                </>
              ) : suspendingId === v.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)}
                    rows={2} placeholder="Reason for suspension..."
                    className="w-full border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#2c4a1e] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setSuspendingId(null); setSuspendReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-semibold
                                 text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={confirmSuspend} disabled={!suspendReason.trim()}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm suspension
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setSuspendingId(v.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                             border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                  <Ban size={13} /> Suspend vendor
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
