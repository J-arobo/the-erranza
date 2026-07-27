'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AlertTriangle, Star, Check, Ban, X, Trash2 } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const TABS = ['Vendors', 'Listings', 'Reviews', 'Travellers'] as const

type Vendor = {
  id: number
  business_name: string
  email: string
  suspended: boolean
  suspend_reason: string | null
  listings_count: number
  owner: { id: number; name: string; email: string }
}

type AdminListing = {
  id: number
  title: string
  category: string
  status: string
  flagged: boolean
  flag_reason: string | null
  vendor: { business_name: string }
  images?: { url: string }[]
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

type PlatformUser = {
  id: number
  name: string
  email: string
  suspended: boolean
  suspend_reason: string | null
  created_at: string
  roles: { id: number; name: string }[]
}

function DeleteConfirm({
  confirmText, helperText, onCancel, onConfirm, confirming,
}: { confirmText: string; helperText: string; onCancel: () => void; onConfirm: () => void; confirming: boolean }) {
  const [typed, setTyped] = useState('')
  return (
    <div className="border border-red-200 rounded-xl p-3 flex flex-col gap-2 bg-red-50">
      <p className="text-xs text-red-700">{helperText}</p>
      <input value={typed} onChange={(e) => setTyped(e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm outline-none
                   focus:border-red-400 transition-colors bg-white" />
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-semibold
                     text-[#1a1a1a] hover:bg-white transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={typed !== confirmText || confirming}
          className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                     hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Delete permanently
        </button>
      </div>
    </div>
  )
}

export default function SuperAdminModerationPage() {
  const [tab, setTab] = useState<typeof TABS[number]>('Vendors')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [listings, setListings] = useState<AdminListing[]>([])
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [users, setUsers] = useState<PlatformUser[]>([])

  const [actingId, setActingId] = useState<number | null>(null)
  const [removingReviewId, setRemovingReviewId] = useState<number | null>(null)
  const [removeReason, setRemoveReason] = useState('')
  const [suspendingVendorId, setSuspendingVendorId] = useState<number | null>(null)
  const [suspendVendorReason, setSuspendVendorReason] = useState('')
  const [suspendingListingId, setSuspendingListingId] = useState<number | null>(null)
  const [suspendListingReason, setSuspendListingReason] = useState('')
  const [suspendingTravellerId, setSuspendingTravellerId] = useState<number | null>(null)
  const [suspendTravellerReason, setSuspendTravellerReason] = useState('')
  const [deletingKey, setDeletingKey] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      apiFetch<{ vendors: Vendor[] }>('/admin/vendors'),
      apiFetch<{ listings: AdminListing[] }>('/admin/listings'),
      apiFetch<{ reviews: AdminReview[] }>('/admin/reviews'),
      apiFetch<{ users: PlatformUser[] }>('/super-admin/users'),
    ])
      .then(([v, l, r, u]) => {
        setVendors(v.vendors)
        setListings(l.listings)
        setReviews(r.reviews)
        setUsers(u.users)
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const travellers = users.filter(u => u.roles.some(r => r.name === 'traveller'))

  // ── Vendors ──
  async function confirmSuspendVendor() {
    if (!suspendingVendorId || !suspendVendorReason.trim()) return
    setActingId(suspendingVendorId)
    try {
      const { vendor } = await apiFetch<{ vendor: Vendor }>(`/admin/vendors/${suspendingVendorId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: suspendVendorReason.trim() }),
      })
      setVendors(vs => vs.map(v => v.id === vendor.id ? vendor : v))
      setSuspendingVendorId(null); setSuspendVendorReason('')
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
  async function deleteVendor(vendor: Vendor) {
    setActingId(vendor.id)
    try {
      await apiFetch(`/super-admin/users/${vendor.owner.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ confirm_email: vendor.owner.email }),
      })
      setVendors(vs => vs.filter(v => v.id !== vendor.id))
      setDeletingKey(null)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  // ── Listings ──
  async function confirmSuspendListing() {
    if (!suspendingListingId || !suspendListingReason.trim()) return
    setActingId(suspendingListingId)
    try {
      const { listing } = await apiFetch<{ listing: AdminListing }>(`/admin/listings/${suspendingListingId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: suspendListingReason.trim() }),
      })
      setListings(ls => ls.map(l => l.id === listing.id ? listing : l))
      setSuspendingListingId(null); setSuspendListingReason('')
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

  // ── Reviews ──
  async function confirmRemoveReview() {
    if (!removingReviewId || !removeReason.trim()) return
    setActingId(removingReviewId)
    try {
      const { review } = await apiFetch<{ review: AdminReview }>(`/admin/reviews/${removingReviewId}/remove`, {
        method: 'POST',
        body: JSON.stringify({ reason: removeReason.trim() }),
      })
      setReviews(rs => rs.map(r => r.id === review.id ? review : r))
      setRemovingReviewId(null); setRemoveReason('')
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

  // ── Travellers ──
  async function confirmSuspendTraveller() {
    if (!suspendingTravellerId || !suspendTravellerReason.trim()) return
    setActingId(suspendingTravellerId)
    try {
      const { user } = await apiFetch<{ user: PlatformUser }>(`/super-admin/users/${suspendingTravellerId}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason: suspendTravellerReason.trim() }),
      })
      setUsers(us => us.map(u => u.id === user.id ? user : u))
      setSuspendingTravellerId(null); setSuspendTravellerReason('')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }
  async function reinstateTraveller(id: number) {
    setActingId(id)
    try {
      const { user } = await apiFetch<{ user: PlatformUser }>(`/super-admin/users/${id}/reinstate`, { method: 'POST' })
      setUsers(us => us.map(u => u.id === user.id ? user : u))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }
  async function deleteTraveller(t: PlatformUser) {
    setActingId(t.id)
    try {
      await apiFetch(`/super-admin/users/${t.id}`, {
        method: 'DELETE',
        body: JSON.stringify({ confirm_email: t.email }),
      })
      setUsers(us => us.filter(u => u.id !== t.id))
      setDeletingKey(null)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setActingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#161616] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Moderation</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
              ${tab === t
                ? 'bg-[#161616] text-white border-[#161616]'
                : 'bg-white text-[#1a1a1a] border-gray-200 shadow-sm hover:border-[#161616]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Vendors' && (
        <div className="flex flex-col gap-3">
          {vendors.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{v.business_name}</p>
                {v.suspended && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">{v.email} · {v.listings_count} listings</p>

              {deletingKey === `v-${v.id}` ? (
                <DeleteConfirm confirmText={v.owner.email}
                  helperText={`This permanently deletes the owner account and everything tied to it — it cannot be undone. Type the owner's email (${v.owner.email}) to confirm.`}
                  onCancel={() => setDeletingKey(null)}
                  onConfirm={() => deleteVendor(v)}
                  confirming={actingId === v.id} />
              ) : suspendingVendorId === v.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={suspendVendorReason} onChange={(e) => setSuspendVendorReason(e.target.value)}
                    rows={2} placeholder="Reason for suspension..."
                    className="w-full border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#161616] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setSuspendingVendorId(null); setSuspendVendorReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={confirmSuspendVendor} disabled={!suspendVendorReason.trim() || actingId === v.id}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm suspension
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {v.suspended ? (
                    <div className="w-full">
                      <div className="bg-red-50 rounded-lg p-2.5 mb-2">
                        <p className="text-xs text-red-600">{v.suspend_reason}</p>
                      </div>
                      <button onClick={() => reinstateVendor(v.id)} disabled={actingId === v.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                   bg-[#161616] text-white hover:bg-black transition-colors disabled:opacity-40">
                        <Check size={13} /> Reinstate
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setSuspendingVendorId(v.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                      <Ban size={13} /> Suspend
                    </button>
                  )}
                  <button onClick={() => setDeletingKey(`v-${v.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               border border-gray-200 shadow-sm text-gray-500 hover:bg-gray-50 transition-colors">
                    <Trash2 size={13} /> Delete permanently
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'Listings' && (
        <div className="flex flex-col gap-3">
          {listings.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex gap-3 mb-3">
                {l.images?.[0] && (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <Image src={l.images[0].url} alt={l.title} fill sizes="64px" className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
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
                </div>
              </div>

              {suspendingListingId === l.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={suspendListingReason} onChange={(e) => setSuspendListingReason(e.target.value)}
                    rows={2} placeholder="Reason for suspension..."
                    className="w-full border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#161616] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setSuspendingListingId(null); setSuspendListingReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={confirmSuspendListing} disabled={!suspendListingReason.trim() || actingId === l.id}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm suspension
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
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
                                 bg-[#161616] text-white hover:bg-black transition-colors disabled:opacity-40">
                      <Check size={13} /> Unsuspend
                    </button>
                  ) : (
                    <button onClick={() => setSuspendingListingId(l.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                      <Ban size={13} /> Suspend
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
                               bg-[#161616] text-white hover:bg-black transition-colors disabled:opacity-40">
                    <Check size={13} /> Restore review
                  </button>
                </div>
              ) : removingReviewId === r.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={removeReason} onChange={(e) => setRemoveReason(e.target.value)}
                    rows={2} placeholder="Reason for removal..."
                    className="w-full border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#161616] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setRemovingReviewId(null); setRemoveReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={confirmRemoveReview} disabled={!removeReason.trim() || actingId === r.id}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm removal
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setRemovingReviewId(r.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                             border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                  <X size={13} /> Remove review
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'Travellers' && (
        <div className="flex flex-col gap-3">
          {travellers.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{t.name}</p>
                {t.suspended && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">
                {t.email} · joined {new Date(t.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>

              {deletingKey === `t-${t.id}` ? (
                <DeleteConfirm confirmText={t.email}
                  helperText={`This permanently deletes this account — it cannot be undone. Type their email (${t.email}) to confirm.`}
                  onCancel={() => setDeletingKey(null)}
                  onConfirm={() => deleteTraveller(t)}
                  confirming={actingId === t.id} />
              ) : suspendingTravellerId === t.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={suspendTravellerReason} onChange={(e) => setSuspendTravellerReason(e.target.value)}
                    rows={2} placeholder="Reason for suspension..."
                    className="w-full border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#161616] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setSuspendingTravellerId(null); setSuspendTravellerReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 shadow-sm text-xs font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={confirmSuspendTraveller} disabled={!suspendTravellerReason.trim() || actingId === t.id}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm suspension
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {t.suspended ? (
                    <button onClick={() => reinstateTraveller(t.id)} disabled={actingId === t.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 bg-[#161616] text-white hover:bg-black transition-colors disabled:opacity-40">
                      <Check size={13} /> Reinstate
                    </button>
                  ) : (
                    <button onClick={() => setSuspendingTravellerId(t.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                      <Ban size={13} /> Suspend
                    </button>
                  )}
                  <button onClick={() => setDeletingKey(`t-${t.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               border border-gray-200 shadow-sm text-gray-500 hover:bg-gray-50 transition-colors">
                    <Trash2 size={13} /> Delete permanently
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
