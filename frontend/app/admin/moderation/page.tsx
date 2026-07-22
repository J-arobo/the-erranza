'use client'
import { useState } from 'react'
import Image from 'next/image'
import { AlertTriangle, Star, Check, Ban, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PLATFORM_LISTINGS, PLATFORM_REVIEWS, logAction } from '@/data/admin'

const TABS = ['Listings', 'Reviews'] as const

export default function ModerationPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<typeof TABS[number]>('Listings')
  const [, forceUpdate] = useState(0)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [removeReason, setRemoveReason] = useState('')

  function adminId() { return user?.email ?? 'unknown-admin' }

  function suspendListing(id: string) {
    const listing = PLATFORM_LISTINGS.find(l => l.id === id)
    if (!listing) return
    listing.status = 'suspended'
    logAction(adminId(), 'Suspended listing', listing.title)
    forceUpdate(n => n + 1)
  }

  function unsuspendListing(id: string) {
    const listing = PLATFORM_LISTINGS.find(l => l.id === id)
    if (!listing) return
    listing.status = 'active'
    logAction(adminId(), 'Unsuspended listing', listing.title)
    forceUpdate(n => n + 1)
  }

  function clearFlag(id: string) {
    const listing = PLATFORM_LISTINGS.find(l => l.id === id)
    if (!listing) return
    listing.flagged = false
    logAction(adminId(), 'Cleared flag on listing', listing.title)
    forceUpdate(n => n + 1)
  }

  function confirmRemoveReview() {
    const review = PLATFORM_REVIEWS.find(r => r.id === removingId)
    if (!review || !removeReason.trim()) return
    review.removed = true
    review.removeReason = removeReason.trim()
    logAction(adminId(), 'Removed review', `${review.guestName} on ${review.listingTitle}`)
    setRemovingId(null)
    setRemoveReason('')
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Moderation</h1>

      <div className="flex gap-2 mb-5">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
              ${tab === t
                ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Listings' && (
        <div className="flex flex-col gap-3">
          {PLATFORM_LISTINGS.map((l) => (
            <div key={l.id} className="bg-white rounded-2xl border border-gray-200 p-4">
              <div className="flex gap-3">
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
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
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
                               bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors">
                    <Check size={13} /> Unsuspend
                  </button>
                ) : (
                  <button onClick={() => suspendListing(l.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                               border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                    <Ban size={13} /> Suspend listing
                  </button>
                )}
              </div>
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
              ) : removingId === r.id ? (
                <div className="flex flex-col gap-2">
                  <textarea value={removeReason} onChange={(e) => setRemoveReason(e.target.value)}
                    rows={2} placeholder="Reason for removal..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                               focus:border-[#2c4a1e] transition-colors resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setRemovingId(null); setRemoveReason('') }}
                      className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold
                                 text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button onClick={confirmRemoveReview} disabled={!removeReason.trim()}
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
