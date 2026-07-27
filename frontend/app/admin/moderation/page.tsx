'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, Star, Check, Ban, X } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const TABS = ['Listings', 'Reviews'] as const

type AdminListing = {
  id: number
  title: string
  category: string
  status: string
  flagged: boolean
  flag_reason: string | null
  vendor: { business_name: string }
}

type AdminReview = {
  id: number
  rating: number
  comment: string
  removed: boolean
  remove_reason: string | null
  listing: { title: string }
  vendor: { business_name: string }
  traveller: { name: string }
}

export default function ModerationPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Listings')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [listings, setListings] = useState<AdminListing[]>([])
  const [reviews, setReviews] = useState<AdminReview[]>([])

  const [actingId, setActingId] = useState<number | null>(null)
  const [suspendingId, setSuspendingId] = useState<number | null>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [removeReason, setRemoveReason] = useState('')

  useEffect(() => {
    Promise.all([
      apiFetch<{ listings: AdminListing[] }>('/admin/listings'),
      apiFetch<{ reviews: AdminReview[] }>('/admin/reviews'),
    ])
      .then(([l, r]) => {
        setListings(l.listings)
        setReviews(r.reviews)
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  async function confirmSuspendListing() {
    if (!suspendingId || !suspendReason.trim()) return
    setActingId(suspendingId)
    try {
      const { listing } = await apiFetch<{ listing: AdminListing }>(`/admin/listings/${suspendingId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: suspendReason.trim() }),
      })
      setListings(ls => ls.map(l => l.id === listing.id ? listing : l))
      setSuspendingId(null)
      setSuspendReason('')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function reinstateListing(id: number) {
    setActingId(id)
    try {
      const { listing } = await apiFetch<{ listing: AdminListing }>(`/admin/listings/${id}/reinstate`, { method: 'POST' })
      setListings(ls => ls.map(l => l.id === listing.id ? listing : l))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function confirmRemoveReview() {
    if (!removingId || !removeReason.trim()) return
    setActingId(removingId)
    try {
      const { review } = await apiFetch<{ review: AdminReview }>(`/admin/reviews/${removingId}/remove`, {
        method: 'POST',
        body: JSON.stringify({ reason: removeReason.trim() }),
      })
      setReviews(rs => rs.map(r => r.id === review.id ? review : r))
      setRemovingId(null)
      setRemoveReason('')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  async function restoreReview(id: number) {
    setActingId(id)
    try {
      const { review } = await apiFetch<{ review: AdminReview }>(`/admin/reviews/${id}/restore`, { method: 'POST' })
      setReviews(rs => rs.map(r => r.id === review.id ? review : r))
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
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Moderation</h1>

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

      {tab === 'Listings' && (
        <div className="flex flex-col gap-3">
          {listings.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              No listings yet.
            </p>
          )}
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold text-[#1a1a1a] truncate">{l.title}</p>
                {l.status === 'suspended' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500 flex-shrink-0">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{l.vendor.business_name} · {l.category}</p>
              {l.flagged && (
                <div className="flex items-start gap-1.5 mt-2 bg-amber-50 rounded-lg p-2">
                  <AlertTriangle size={12} color="#b45309" className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">{l.flag_reason}</p>
                </div>
              )}

              {suspendingId === l.id ? (
                <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
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
                    <button onClick={confirmSuspendListing} disabled={!suspendReason.trim() || actingId === l.id}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm suspension
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  {l.flagged && l.status !== 'suspended' && (
                    <button onClick={() => reinstateListing(l.id)} disabled={actingId === l.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-gray-200 shadow-sm text-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-40">
                      <Check size={13} /> Clear flag
                    </button>
                  )}
                  {l.status === 'suspended' ? (
                    <button onClick={() => reinstateListing(l.id)} disabled={actingId === l.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
                      <Check size={13} /> Unsuspend
                    </button>
                  ) : (
                    <button onClick={() => setSuspendingId(l.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                      <Ban size={13} /> Suspend listing
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'Reviews' && (
        <div className="flex flex-col gap-3">
          {reviews.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              No reviews yet.
            </p>
          )}
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{r.traveller.name}</p>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} color={i < r.rating ? '#f5a623' : '#ddd'} fill={i < r.rating ? '#f5a623' : '#ddd'} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{r.vendor.business_name} · {r.listing.title}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.comment}</p>

              {r.removed ? (
                <div className="bg-red-50 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-red-600">Removed</p>
                  <p className="text-xs text-red-500 mt-0.5">{r.remove_reason}</p>
                  <button onClick={() => restoreReview(r.id)} disabled={actingId === r.id}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
                    <Check size={13} /> Restore review
                  </button>
                </div>
              ) : removingId === r.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={removeReason} onChange={(e) => setRemoveReason(e.target.value)}
                    rows={2} placeholder="Reason for removal..."
                    className="w-full border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#2c4a1e] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setRemovingId(null); setRemoveReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-semibold
                                 text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={confirmRemoveReview} disabled={!removeReason.trim() || actingId === r.id}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                 hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm removal
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setRemovingId(r.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                             border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                  <X size={13} /> Remove review
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
