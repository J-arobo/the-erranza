'use client'
import { useEffect, useState } from 'react'
import { FileCheck2, Check, X } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type AdminSubmission = {
  id: number
  doc_type: string
  file_url: string | null
  status: string
  created_at: string
  vendor: { id: number; business_name: string; email: string }
}

export default function AdminVerificationsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([])
  const [actingId, setActingId] = useState<number | null>(null)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    apiFetch<{ submissions: AdminSubmission[] }>('/admin/verifications')
      .then(({ submissions }) => setSubmissions(submissions))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  async function approve(id: number) {
    setActingId(id)
    try {
      await apiFetch(`/admin/verifications/${id}/approve`, { method: 'POST' })
      setSubmissions(s => s.filter(x => x.id !== id))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function reject(id: number) {
    setActingId(id)
    try {
      await apiFetch(`/admin/verifications/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason: reason.trim() || null }),
      })
      setSubmissions(s => s.filter(x => x.id !== id))
      setRejectingId(null)
      setReason('')
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
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Verifications</h1>
      <p className="text-sm text-gray-500 mb-6">
        Review documents vendors submitted during onboarding. A vendor gets full dashboard
        access once every document they've submitted is approved.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {submissions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
          No pending submissions.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {submissions.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{s.vendor.business_name}</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex-shrink-0">
                  Pending
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{s.vendor.email} · {s.doc_type}</p>

              {s.file_url ? (
                <a href={s.file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#304333] underline mb-3">
                  <FileCheck2 size={13} /> View document
                </a>
              ) : (
                <p className="text-xs text-gray-400 mb-3">No file attached.</p>
              )}

              {rejectingId === s.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for rejection (optional, shown to the vendor)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => reject(s.id)} disabled={actingId === s.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-40">
                      <X size={13} /> Confirm reject
                    </button>
                    <button onClick={() => { setRejectingId(null); setReason('') }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200
                                 text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => approve(s.id)} disabled={actingId === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
                    <Check size={13} /> Approve
                  </button>
                  <button onClick={() => setRejectingId(s.id)} disabled={actingId === s.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40">
                    <X size={13} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
