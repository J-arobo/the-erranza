'use client'
import { useEffect, useState } from 'react'
import { Check, X, Ban } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const TABS = ['Verification queue', 'All vendors'] as const

type Submission = {
  id: number
  vendor_id: number
  doc_type: string
  status: string
  created_at: string
  vendor: { id: number; business_name: string; email: string }
}

type Vendor = {
  id: number
  business_name: string
  email: string
  verification_status: string
  suspended: boolean
  suspend_reason: string | null
  listings_count: number
  owner: { name: string; email: string }
}

export default function AdminVendorsPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Verification queue')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [actingId, setActingId] = useState<number | null>(null)
  const [suspendingId, setSuspendingId] = useState<number | null>(null)
  const [suspendReason, setSuspendReason] = useState('')

  useEffect(() => {
    Promise.all([
      apiFetch<{ submissions: Submission[] }>('/admin/verifications'),
      apiFetch<{ vendors: Vendor[] }>('/admin/vendors'),
    ])
      .then(([subs, vends]) => {
        setSubmissions(subs.submissions)
        setVendors(vends.vendors)
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  async function approveSubmission(id: number) {
    setActingId(id)
    try {
      await apiFetch(`/admin/verifications/${id}/approve`, { method: 'POST' })
      setSubmissions(subs => subs.filter(s => s.id !== id))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function rejectSubmission(id: number) {
    setActingId(id)
    try {
      await apiFetch(`/admin/verifications/${id}/reject`, { method: 'POST' })
      setSubmissions(subs => subs.filter(s => s.id !== id))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function confirmSuspend() {
    if (!suspendingId || !suspendReason.trim()) return
    setActingId(suspendingId)
    try {
      const { vendor } = await apiFetch<{ vendor: Vendor }>(`/admin/vendors/${suspendingId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: suspendReason.trim() }),
      })
      setVendors(vs => vs.map(v => v.id === vendor.id ? vendor : v))
      setSuspendingId(null)
      setSuspendReason('')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function reinstateVendor(id: number) {
    setActingId(id)
    try {
      const { vendor } = await apiFetch<{ vendor: Vendor }>(`/admin/vendors/${id}/reinstate`, { method: 'POST' })
      setVendors(vs => vs.map(v => v.id === vendor.id ? vendor : v))
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
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Vendors</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

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
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
            Pending ({submissions.length})
          </p>
          <div className="flex flex-col gap-3">
            {submissions.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                Nothing pending review.
              </p>
            )}
            {submissions.map((s) => (
              <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-[#1a1a1a]">{s.vendor.business_name}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{s.doc_type}</p>
                <div className="flex gap-2">
                  <button onClick={() => approveSubmission(s.id)} disabled={actingId === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
                    <Check size={13} /> Approve
                  </button>
                  <button onClick={() => rejectSubmission(s.id)} disabled={actingId === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               border border-gray-200 shadow-sm text-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-40">
                    <X size={13} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'All vendors' && (
        <div className="flex flex-col gap-3">
          {vendors.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{v.business_name}</p>
                <div className="flex items-center gap-1.5">
                  {v.suspended && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                      Suspended
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
                    ${v.verification_status === 'approved' ? 'bg-[#eaf5e4] text-[#2c4a1e]'
                      : v.verification_status === 'pending' ? 'bg-amber-50 text-amber-700'
                      : 'bg-gray-100 text-gray-500'}`}>
                    {v.verification_status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">{v.email} · owner: {v.owner?.name}</p>

              <div className="flex gap-4 mb-3">
                <span className="text-xs text-gray-400">{v.listings_count} listings</span>
              </div>

              {v.suspended ? (
                <>
                  <div className="bg-red-50 rounded-lg p-2.5 mb-3">
                    <p className="text-xs text-red-600">{v.suspend_reason}</p>
                  </div>
                  <button onClick={() => reinstateVendor(v.id)} disabled={actingId === v.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
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
                    <button onClick={confirmSuspend} disabled={!suspendReason.trim() || actingId === v.id}
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
