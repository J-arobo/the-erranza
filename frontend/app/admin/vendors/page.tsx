'use client'
import { useEffect, useState } from 'react'
import { Check, X, Ban, FileText } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const TABS = ['Verification queue', 'All vendors'] as const

type Submission = {
  id: number
  vendor_id: number
  doc_type: string
  status: string
  file_url: string | null
  rejection_reason: string | null
  created_at: string
  vendor: { id: number; business_name: string; email: string }
}

type Vendor = {
  id: number
  business_name: string
  email: string
  phone: string | null
  license_number: string | null
  tax_pin: string | null
  payout_method: string | null
  payout_bank_name: string | null
  payout_details: string | null
  categories: string[] | null
  regions: string[] | null
  plan: string
  verification_status: string
  suspended: boolean
  suspend_reason: string | null
  listings_count: number
  owner: { name: string; email: string }
  verification_submissions?: Submission[]
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-[#eaf5e4] text-[#2c4a1e]',
  rejected: 'bg-red-50 text-red-600',
}

const CARD_BORDER: Record<string, string> = {
  pending: 'border-l-4 border-l-amber-400',
  approved: 'border-l-4 border-l-[#2c4a1e]',
  rejected: 'border-l-4 border-l-red-400',
}

const HOVER_BORDER: Record<string, string> = {
  pending: 'hover:border-amber-400',
  approved: 'hover:border-[#2c4a1e]',
  rejected: 'hover:border-red-400',
}

function AdminVendorsPageContent() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState<typeof TABS[number]>('Verification queue')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])

  const [actingId, setActingId] = useState<number | null>(null)

  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null)
  const [vendorDetail, setVendorDetail] = useState<Vendor | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; submissionId: number; docType: string } | null>(null)
  const [confirmNote, setConfirmNote] = useState('')

  const [confirmingSuspend, setConfirmingSuspend] = useState(false)
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

  useEffect(() => {
    const vendorParam = searchParams.get('vendor')
    if (vendorParam) {
      setTab('All vendors')
      openVendorDetail(Number(vendorParam))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  function openVendorDetail(vendorId: number) {
    setSelectedVendorId(vendorId)
    setLoadingDetail(true)
    setError('')
    setConfirmingSuspend(false)
    setSuspendReason('')
    apiFetch<{ vendor: Vendor }>(`/admin/vendors/${vendorId}`)
      .then(({ vendor }) => setVendorDetail(vendor))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoadingDetail(false))
  }

  

  async function refreshVendorDetail(vendorId: number) {
    try {
      const { vendor } = await apiFetch<{ vendor: Vendor }>(`/admin/vendors/${vendorId}`)
      setVendorDetail(vendor)
      setVendors(vs => vs.map(v => v.id === vendor.id ? { ...v, ...vendor } : v))
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  function closeVendorDetail() {
    setSelectedVendorId(null)
    setVendorDetail(null)
    setConfirmingSuspend(false)
    setSuspendReason('')
  }

  async function approveSubmission(id: number, note?: string) {
    setActingId(id)
    try {
      await apiFetch(`/admin/verifications/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ note: note?.trim() || null }),
      })
      setSubmissions(subs => subs.filter(s => s.id !== id))
      if (vendorDetail) await refreshVendorDetail(vendorDetail.id)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function rejectSubmission(id: number, note?: string) {
    setActingId(id)
    try {
      await apiFetch(`/admin/verifications/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note: note?.trim() || null }),
      })
      setSubmissions(subs => subs.filter(s => s.id !== id))
      if (vendorDetail) await refreshVendorDetail(vendorDetail.id)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function confirmSuspend() {
    if (!vendorDetail || !suspendReason.trim()) return
    setActingId(vendorDetail.id)
    try {
      const { vendor } = await apiFetch<{ vendor: Vendor }>(`/admin/vendors/${vendorDetail.id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: suspendReason.trim() }),
      })
      setVendorDetail(v => v ? { ...v, ...vendor } : v)
      setVendors(vs => vs.map(v => v.id === vendor.id ? { ...v, ...vendor } : v))
      setConfirmingSuspend(false)
      setSuspendReason('')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function reinstateVendor() {
    if (!vendorDetail) return
    setActingId(vendorDetail.id)
    try {
      const { vendor } = await apiFetch<{ vendor: Vendor }>(`/admin/vendors/${vendorDetail.id}/reinstate`, { method: 'POST' })
      setVendorDetail(v => v ? { ...v, ...vendor } : v)
      setVendors(vs => vs.map(v => v.id === vendor.id ? { ...v, ...vendor } : v))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  const pendingByVendor = Object.values(
    submissions.reduce<Record<number, { vendor: Submission['vendor']; count: number; latestDate: string }>>((acc, s) => {
      if (!acc[s.vendor_id]) {
        acc[s.vendor_id] = { vendor: s.vendor, count: 0, latestDate: s.created_at }
      }
      acc[s.vendor_id].count += 1
      if (s.created_at > acc[s.vendor_id].latestDate) acc[s.vendor_id].latestDate = s.created_at
      return acc
    }, {})
  )

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
            Pending ({pendingByVendor.length})
          </p>
          <div className="flex flex-col gap-3">
            {pendingByVendor.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                Nothing pending review.
              </p>
            )}
            {pendingByVendor.map((p) => (
              <div key={p.vendor.id}
              onClick={() => openVendorDetail(p.vendor.id)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 cursor-pointer transition-colors
                border-l-4 border-l-amber-400 hover:border-amber-400">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-[#1a1a1a]">{p.vendor.business_name}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(p.latestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {p.count} document{p.count > 1 ? 's' : ''} pending review — click to review
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'All vendors' && (
        <div className="flex flex-col gap-3">
          {vendors.map((v) => (
            <div key={v.id}
              onClick={() => openVendorDetail(v.id)}
              className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-4 cursor-pointer transition-colors hover:bg-white
                ${CARD_BORDER[v.verification_status] ?? ''} ${HOVER_BORDER[v.verification_status] ?? 'hover:border-gray-300'} ${v.suspended ? 'bg-red-50/40' : ''}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{v.business_name}</p>
                <div className="flex items-center gap-1.5">
                  {v.suspended && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                      Suspended
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
                    ${STATUS_STYLES[v.verification_status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {v.verification_status}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-1">{v.email} · owner: {v.owner?.name}</p>
              <span className="text-xs text-gray-400">{v.listings_count} listings</span>
            </div>
          ))}
        </div>
      )}

      {/* ── VENDOR DETAIL PANEL ── */}
      {selectedVendorId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeVendorDetail() }}>
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            {loadingDetail || !vendorDetail ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h2 className="text-lg font-bold text-[#1a1a1a]">{vendorDetail.business_name}</h2>
                  <button onClick={closeVendorDetail}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>
                    <X size={16} color="#1a1a1a" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mb-4">
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
                    ${STATUS_STYLES[vendorDetail.verification_status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {vendorDetail.verification_status}
                  </span>
                  {vendorDetail.suspended && (
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                      Suspended
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Owner</p>
                    <p className="font-semibold text-[#1a1a1a]">{vendorDetail.owner?.name}</p>
                    <p className="text-xs text-gray-500">{vendorDetail.owner?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Business email / phone</p>
                    <p className="font-semibold text-[#1a1a1a]">{vendorDetail.email}</p>
                    <p className="text-xs text-gray-500">{vendorDetail.phone ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Business license no.</p>
                    <p className="font-semibold text-[#1a1a1a]">{vendorDetail.license_number ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">KRA PIN</p>
                    <p className="font-semibold text-[#1a1a1a]">{vendorDetail.tax_pin ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payout method</p>
                    <p className="font-semibold text-[#1a1a1a] capitalize">{vendorDetail.payout_method ?? '—'}</p>
                    {vendorDetail.payout_method === 'bank' && vendorDetail.payout_bank_name && (
                      <p className="text-xs text-gray-500">{vendorDetail.payout_bank_name}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Payout details</p>
                    <p className="font-semibold text-[#1a1a1a]">{vendorDetail.payout_details ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Plan</p>
                    <p className="font-semibold text-[#1a1a1a] capitalize">{vendorDetail.plan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Listings</p>
                    <p className="font-semibold text-[#1a1a1a]">{vendorDetail.listings_count}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Categories</p>
                    <p className="font-semibold text-[#1a1a1a]">{vendorDetail.categories?.join(', ') || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400">Operating regions</p>
                    <p className="font-semibold text-[#1a1a1a]">{vendorDetail.regions?.join(', ') || '—'}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100 mb-4" />

                <p className="text-sm font-bold text-[#1a1a1a] mb-3">Submitted documents</p>
                {!vendorDetail.verification_submissions || vendorDetail.verification_submissions.length === 0 ? (
                  <p className="text-sm text-gray-400 mb-4">No documents submitted yet.</p>
                ) : (
                  <div className="flex flex-col gap-2 mb-4">
                    {vendorDetail.verification_submissions.map((s) => (
                      <div key={s.id} className="border border-gray-200 rounded-xl p-3">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-[#1a1a1a]">{s.doc_type}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${STATUS_STYLES[s.status]}`}>
                            {s.status}
                          </span>
                        </div>
                        {s.file_url ? (
                          <a href={s.file_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#304333] underline mb-2 w-fit">
                            <FileText size={12} /> View document
                          </a>
                        ) : (
                          <p className="text-xs text-gray-400 mb-2">No file attached.</p>
                        )}
                        {s.status !== 'pending' && s.rejection_reason && (
                          <p className={`text-xs mb-2 ${s.status === 'rejected' ? 'text-red-500' : 'text-gray-500'}`}>{s.rejection_reason}</p>
                        )}
                        {s.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => setConfirmAction({ type: 'approve', submissionId: s.id, docType: s.doc_type })} disabled={actingId === s.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                         bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
                              <Check size={13} /> Approve
                            </button>
                            <button onClick={() => setConfirmAction({ type: 'reject', submissionId: s.id, docType: s.doc_type })} disabled={actingId === s.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                         border border-gray-200 shadow-sm text-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-40">
                              <X size={13} /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="h-px bg-gray-100 mb-4" />

                {vendorDetail.suspended ? (
                  <>
                    <div className="bg-red-50 rounded-lg p-3 mb-3">
                      <p className="text-xs text-red-600">{vendorDetail.suspend_reason}</p>
                    </div>
                    <button onClick={reinstateVendor} disabled={actingId === vendorDetail.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
                      <Check size={13} /> Reinstate vendor
                    </button>
                  </>
                ) : confirmingSuspend ? (
                  <div className="flex flex-col gap-2">
                    <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)}
                      rows={2} placeholder="Reason for suspension..."
                      className="w-full border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-sm outline-none
                                 focus:border-[#2c4a1e] transition-colors resize-none" />
                    <div className="flex gap-2">
                      <button onClick={() => { setConfirmingSuspend(false); setSuspendReason('') }}
                        className="flex-1 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-semibold
                                   text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button onClick={confirmSuspend} disabled={!suspendReason.trim() || actingId === vendorDetail.id}
                        className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                   hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        Confirm suspension
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setConfirmingSuspend(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                    <Ban size={13} /> Suspend vendor
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── CONFIRM APPROVE/REJECT ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setConfirmAction(null); setConfirmNote('') } }}>
          <div className={`bg-white rounded-2xl p-6 max-w-sm w-full border-2
            ${confirmAction.type === 'approve' ? 'border-[#eaf5e4]' : 'border-red-200'}`}>
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">
              {confirmAction.type === 'approve' ? 'Approve this document?' : 'Reject this document?'}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {confirmAction.type === 'approve'
                ? `You're about to approve the "${confirmAction.docType}" submission.`
                : `You're about to reject the "${confirmAction.docType}" submission. The vendor will need to re-upload it.`}
            </p>
            <textarea value={confirmNote} onChange={(e) => setConfirmNote(e.target.value)}
              rows={2}
              placeholder={confirmAction.type === 'approve' ? 'Optional internal note (not shown to the vendor)…' : 'Reason for rejection (shown to the vendor)…'}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                         focus:border-[#2c4a1e] transition-colors resize-none mb-4" />
            <div className="flex gap-2">
              <button onClick={() => { setConfirmAction(null); setConfirmNote('') }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => {
                if (confirmAction.type === 'approve') approveSubmission(confirmAction.submissionId, confirmNote)
                else rejectSubmission(confirmAction.submissionId, confirmNote)
                setConfirmAction(null)
                setConfirmNote('')
              }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors
                  ${confirmAction.type === 'approve' ? 'bg-[#2c4a1e] hover:bg-[#3d6b28]' : 'bg-red-600 hover:bg-red-700'}`}>
                {confirmAction.type === 'approve' ? 'Yes, approve' : 'Yes, reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminVendorsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    }>
      <AdminVendorsPageContent />
    </Suspense>
  )
}

