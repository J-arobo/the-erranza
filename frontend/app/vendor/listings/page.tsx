'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Star, Eye, Pause, Trash2, Calendar } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { StatusBadge } from '../page'

const FILTERS = ['All', 'Active', 'Paused', 'Draft']

type ApiListing = {
  id: number
  title: string
  location: string
  price: string
  status: 'active' | 'paused' | 'draft' | 'suspended'
  bookings_count: number
  reviews_avg_rating: string | null
  earnings: string | null
  images: { url: string }[]
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

function formatKsh(value: string | number | null | undefined) {
  return `Ksh ${Math.round(Number(value ?? 0)).toLocaleString()}`
}

export default function VendorListingsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('All')
  const [listings, setListings] = useState<ApiListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [pausingId, setPausingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    apiFetch<{ listings: ApiListing[] }>('/vendor/listings')
      .then(({ listings }) => setListings(listings))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = listings.filter(l =>
    filter === 'All' || l.status.toLowerCase() === filter.toLowerCase()
  )

  async function togglePause(id: number) {
    const listing = listings.find(l => l.id === id)
    if (!listing) return
    const nextStatus = listing.status === 'paused' ? 'active' : 'paused'

    setBusyId(id)
    try {
      await apiFetch(`/vendor/listings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      })
      setListings(ls => ls.map(l => l.id === id ? { ...l, status: nextStatus } : l))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  function handlePauseClick(listing: ApiListing) {
    if (listing.status === 'paused') {
      togglePause(listing.id)
      return
    }
    setPausingId(listing.id)
  }

  async function confirmPause() {
    if (pausingId === null) return
    await togglePause(pausingId)
    setPausingId(null)
  }

  async function deleteListing(id: number) {
    setBusyId(id)
    try {
      await apiFetch(`/vendor/listings/${id}`, { method: 'DELETE' })
      setListings(ls => ls.filter(l => l.id !== id))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  async function confirmDelete() {
    if (deletingId === null) return
    await deleteListing(deletingId)
    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-4xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Listings</h1>
          <p className="text-sm text-gray-500">{listings.length} total listings</p>
        </div>
        <button
          onClick={() => router.push('/vendor/listings/new')}
          className="flex items-center gap-2 bg-[#2c4a1e] text-white px-4 py-2.5
                     rounded-xl text-sm font-semibold hover:bg-[#3d6b28] transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:block">New listing</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold
                        border transition-all
              ${filter === f
                ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-sm text-gray-400">
            No listings yet.
          </div>
        )}
        {filtered.map((listing) => {
          const rating = listing.reviews_avg_rating ? Number(listing.reviews_avg_rating) : 0
          const isBusy = busyId === listing.id

          return (
            <div key={listing.id}
              className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm overflow-hidden
                         hover:shadow-md transition-all min-w-0">
              <div className="flex gap-4 p-4 min-w-0">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden
                                flex-shrink-0 bg-[#e0d9cc]">
                  <Image src={listing.images[0]?.url ?? FALLBACK_IMAGE} alt={listing.title} fill
                    sizes="96px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-[#1a1a1a] leading-snug truncate">
                      {listing.title}
                    </p>
                    <StatusBadge status={listing.status} />
                  </div>
                  <p className="text-xs text-gray-400 mb-2 truncate">{listing.location}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-[#1a1a1a]">{formatKsh(listing.price)}</span>
                    <span>·</span>
                    <span>{listing.bookings_count} bookings</span>
                    {rating > 0 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <Star size={10} color="#f5a623" fill="#f5a623" />
                          {rating.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#2c4a1e] font-semibold mt-1">
                    Earned: {formatKsh(listing.earnings)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => router.push(`/vendor/listings/${listing.id}`)}
                  className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3
                             text-xs font-semibold text-[#1a1a1a] hover:bg-gray-50
                             transition-colors border-r border-gray-100"
                >
                  <Eye size={13} className="flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Edit</span>
                </button>
                <button
                  onClick={() => router.push(`/vendor/listings/${listing.id}/bookings`)}
                  className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3
                             text-xs font-semibold text-[#1a1a1a] hover:bg-gray-50
                             transition-colors border-r border-gray-100"
                >
                  <Calendar size={13} className="flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Bookings</span>
                </button>
                <button
                  onClick={() => handlePauseClick(listing)}
                  disabled={isBusy}
                  className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3
                             text-xs font-semibold text-[#1a1a1a] hover:bg-gray-50
                             transition-colors border-r border-gray-100 disabled:opacity-50"
                >
                  <Pause size={13} className="flex-shrink-0" />
                  <span className="hidden sm:inline truncate">
                    {listing.status === 'paused' ? 'Activate' : 'Pause'}
                  </span>
                </button>
                <button
                  onClick={() => setDeletingId(listing.id)}
                  disabled={isBusy}
                  className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-3
                             text-xs font-semibold text-red-500 hover:bg-red-50
                             transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} className="flex-shrink-0" />
                  <span className="hidden sm:inline truncate">Delete</span>
                </button>
              </div>

            </div>
          )
        })}
      </div>

      {/* Pause confirmation */}
      {pausingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setPausingId(null) }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">Pause this listing?</h2>
            <p className="text-sm text-gray-500 mb-5">
              While paused, this listing won&apos;t be shown to travellers and can&apos;t receive new bookings
              until you unpause it. Existing confirmed bookings are not affected.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPausingId(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                           text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmPause} disabled={busyId === pausingId}
                className="flex-1 py-3 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold
                           hover:bg-[#3d6b28] transition-colors disabled:opacity-50">
                {busyId === pausingId ? 'Pausing…' : 'Pause listing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deletingId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeletingId(null) }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">Delete this listing?</h2>
            <p className="text-sm text-gray-500 mb-5">
              This permanently deletes the listing and cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeletingId(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                           text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} disabled={busyId === deletingId}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold
                           hover:bg-red-700 transition-colors disabled:opacity-50">
                {busyId === deletingId ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
