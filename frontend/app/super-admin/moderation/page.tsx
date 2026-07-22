'use client'
import { useState } from 'react'
import Image from 'next/image'
import { AlertTriangle, Star, Check, Ban, X, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  PLATFORM_VENDORS, PLATFORM_LISTINGS, PLATFORM_REVIEWS, PLATFORM_TRAVELLERS,
  logAction,
} from '@/data/admin'

const TABS = ['Vendors', 'Listings', 'Reviews', 'Travellers'] as const

function DeleteConfirm({
  entityName, onCancel, onConfirm,
}: { entityName: string; onCancel: () => void; onConfirm: () => void }) {
  const [typed, setTyped] = useState('')
  return (
    <div className="border border-red-200 rounded-xl p-3 flex flex-col gap-2 bg-red-50">
      <p className="text-xs text-red-700">
        This permanently deletes the record — it cannot be undone. Type <strong>{entityName}</strong> to confirm.
      </p>
      <input value={typed} onChange={(e) => setTyped(e.target.value)}
        className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm outline-none
                   focus:border-red-400 transition-colors bg-white" />
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold
                     text-[#1a1a1a] hover:bg-white transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={typed !== entityName}
          className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                     hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Delete permanently
        </button>
      </div>
    </div>
  )
}

export default function SuperAdminModerationPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<typeof TABS[number]>('Vendors')
  const [, forceUpdate] = useState(0)
  const [removingReviewId, setRemovingReviewId] = useState<string | null>(null)
  const [removeReason, setRemoveReason] = useState('')
  const [suspendingVendorId, setSuspendingVendorId] = useState<string | null>(null)
  const [suspendVendorReason, setSuspendVendorReason] = useState('')
  const [suspendingTravellerId, setSuspendingTravellerId] = useState<string | null>(null)
  const [suspendTravellerReason, setSuspendTravellerReason] = useState('')
  const [deletingKey, setDeletingKey] = useState<string | null>(null)

  function adminId() { return user?.email ?? 'unknown-super-admin' }

  // Vendors
  function confirmSuspendVendor() {
    const v = PLATFORM_VENDORS.find(x => x.id === suspendingVendorId)
    if (!v || !suspendVendorReason.trim()) return
    v.suspended = true
    v.suspendReason = suspendVendorReason.trim()
    logAction(adminId(), 'Suspended vendor', v.name)
    setSuspendingVendorId(null); setSuspendVendorReason('')
    forceUpdate(n => n + 1)
  }
  function reinstateVendor(id: string) {
    const v = PLATFORM_VENDORS.find(x => x.id === id)
    if (!v) return
    v.suspended = false; v.suspendReason = undefined
    logAction(adminId(), 'Reinstated vendor', v.name)
    forceUpdate(n => n + 1)
  }
  function deleteVendor(id: string) {
    const idx = PLATFORM_VENDORS.findIndex(x => x.id === id)
    if (idx === -1) return
    const [v] = PLATFORM_VENDORS.splice(idx, 1)
    logAction(adminId(), 'Permanently deleted vendor account', v.name)
    setDeletingKey(null)
    forceUpdate(n => n + 1)
  }

  // Listings
  function suspendListing(id: string) {
    const l = PLATFORM_LISTINGS.find(x => x.id === id)
    if (!l) return
    l.status = 'suspended'
    logAction(adminId(), 'Suspended listing', l.title)
    forceUpdate(n => n + 1)
  }
  function unsuspendListing(id: string) {
    const l = PLATFORM_LISTINGS.find(x => x.id === id)
    if (!l) return
    l.status = 'active'
    logAction(adminId(), 'Unsuspended listing', l.title)
    forceUpdate(n => n + 1)
  }
  function clearFlag(id: string) {
    const l = PLATFORM_LISTINGS.find(x => x.id === id)
    if (!l) return
    l.flagged = false
    logAction(adminId(), 'Cleared flag on listing', l.title)
    forceUpdate(n => n + 1)
  }
  function deleteListing(id: string) {
    const idx = PLATFORM_LISTINGS.findIndex(x => x.id === id)
    if (idx === -1) return
    const [l] = PLATFORM_LISTINGS.splice(idx, 1)
    logAction(adminId(), 'Permanently deleted listing', l.title)
    setDeletingKey(null)
    forceUpdate(n => n + 1)
  }

  // Reviews
  function confirmRemoveReview() {
    const r = PLATFORM_REVIEWS.find(x => x.id === removingReviewId)
    if (!r || !removeReason.trim()) return
    r.removed = true
    r.removeReason = removeReason.trim()
    logAction(adminId(), 'Removed review', `${r.guestName} on ${r.listingTitle}`)
    setRemovingReviewId(null); setRemoveReason('')
    forceUpdate(n => n + 1)
  }

  // Travellers
  function confirmSuspendTraveller() {
    const t = PLATFORM_TRAVELLERS.find(x => x.id === suspendingTravellerId)
    if (!t || !suspendTravellerReason.trim()) return
    t.suspended = true
    t.suspendReason = suspendTravellerReason.trim()
    logAction(adminId(), 'Suspended traveller', t.name)
    setSuspendingTravellerId(null); setSuspendTravellerReason('')
    forceUpdate(n => n + 1)
  }
  function reinstateTraveller(id: string) {
    const t = PLATFORM_TRAVELLERS.find(x => x.id === id)
    if (!t) return
    t.suspended = false; t.suspendReason = undefined
    logAction(adminId(), 'Reinstated traveller', t.name)
    forceUpdate(n => n + 1)
  }
  function deleteTraveller(id: string) {
    const idx = PLATFORM_TRAVELLERS.findIndex(x => x.id === id)
    if (idx === -1) return
    const [t] = PLATFORM_TRAVELLERS.splice(idx, 1)
    logAction(adminId(), 'Permanently deleted traveller account', t.name)
    setDeletingKey(null)
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Moderation</h1>

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
              ${tab === t
                ? 'bg-[#161616] text-white border-[#161616]'
                : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#161616]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Vendors' && (
        <div className="flex flex-col gap-3">
          {PLATFORM_VENDORS.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{v.name}</p>
                {v.suspended && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">{v.email} · {v.listingCount} listings</p>

              {deletingKey === `v-${v.id}` ? (
                <DeleteConfirm entityName={v.name} onCancel={() => setDeletingKey(null)}
                  onConfirm={() => deleteVendor(v.id)} />
              ) : suspendingVendorId === v.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={suspendVendorReason} onChange={(e) => setSuspendVendorReason(e.target.value)}
                    rows={2} placeholder="Reason for suspension..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#161616] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setSuspendingVendorId(null); setSuspendVendorReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={confirmSuspendVendor} disabled={!suspendVendorReason.trim()}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm suspension
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {v.suspended ? (
                    <button onClick={() => reinstateVendor(v.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 bg-[#161616] text-white hover:bg-black transition-colors">
                      <Check size={13} /> Reinstate
                    </button>
                  ) : (
                    <button onClick={() => setSuspendingVendorId(v.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                      <Ban size={13} /> Suspend
                    </button>
                  )}
                  <button onClick={() => setDeletingKey(`v-${v.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
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
          {PLATFORM_LISTINGS.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex gap-3 mb-3">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image src={l.image} alt={l.title} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-[#1a1a1a] truncate">{l.title}</p>
                    {l.status === 'suspended' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500 flex-shrink-0">
                        Suspended
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{l.vendorName} · {l.category}</p>
                  {l.flagged && (
                    <div className="flex items-start gap-1.5 mt-2 bg-amber-50 rounded-lg p-2">
                      <AlertTriangle size={12} color="#b45309" className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700">{l.flagReason}</p>
                    </div>
                  )}
                </div>
              </div>

              {deletingKey === `l-${l.id}` ? (
                <DeleteConfirm entityName={l.title} onCancel={() => setDeletingKey(null)}
                  onConfirm={() => deleteListing(l.id)} />
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {l.flagged && (
                    <button onClick={() => clearFlag(l.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-gray-200 text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                      <Check size={13} /> Clear flag
                    </button>
                  )}
                  {l.status === 'suspended' ? (
                    <button onClick={() => unsuspendListing(l.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 bg-[#161616] text-white hover:bg-black transition-colors">
                      <Check size={13} /> Unsuspend
                    </button>
                  ) : (
                    <button onClick={() => suspendListing(l.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                      <Ban size={13} /> Suspend
                    </button>
                  )}
                  <button onClick={() => setDeletingKey(`l-${l.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                    <Trash2 size={13} /> Delete permanently
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'Reviews' && (
        <div className="flex flex-col gap-3">
          {PLATFORM_REVIEWS.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{r.guestName}</p>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} color={i < r.rating ? '#f5a623' : '#ddd'} fill={i < r.rating ? '#f5a623' : '#ddd'} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">{r.vendorName} · {r.listingTitle}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{r.comment}</p>

              {r.removed ? (
                <div className="bg-red-50 rounded-lg p-2.5">
                  <p className="text-xs font-semibold text-red-600">Removed</p>
                  <p className="text-xs text-red-500 mt-0.5">{r.removeReason}</p>
                </div>
              ) : removingReviewId === r.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={removeReason} onChange={(e) => setRemoveReason(e.target.value)}
                    rows={2} placeholder="Reason for removal..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#161616] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setRemovingReviewId(null); setRemoveReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={confirmRemoveReview} disabled={!removeReason.trim()}
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
          {PLATFORM_TRAVELLERS.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{t.name}</p>
                {t.suspended && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                    Suspended
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">{t.email} · joined {t.joinedDate} · {t.tripCount} trips</p>

              {deletingKey === `t-${t.id}` ? (
                <DeleteConfirm entityName={t.name} onCancel={() => setDeletingKey(null)}
                  onConfirm={() => deleteTraveller(t.id)} />
              ) : suspendingTravellerId === t.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={suspendTravellerReason} onChange={(e) => setSuspendTravellerReason(e.target.value)}
                    rows={2} placeholder="Reason for suspension..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#161616] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setSuspendingTravellerId(null); setSuspendTravellerReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold hover:bg-gray-50">
                      Cancel
                    </button>
                    <button onClick={confirmSuspendTraveller} disabled={!suspendTravellerReason.trim()}
                      className="flex-1 py-2 rounded-lg bg-red-600 text-white text-xs font-semibold
                                 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">
                      Confirm suspension
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 flex-wrap">
                  {t.suspended ? (
                    <button onClick={() => reinstateTraveller(t.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                 bg-[#161616] text-white hover:bg-black transition-colors">
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
                               border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
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
