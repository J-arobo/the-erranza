'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Star, ChevronRight, Eye, Pause, Trash2 } from 'lucide-react'
import { VENDOR_LISTINGS } from '@/data/vendor'
import { StatusBadge } from '../../page'

const FILTERS = ['All', 'Active', 'Paused', 'Draft']

export default function VendorListingsPage() {
  const router  = useRouter()
  const [filter, setFilter] = useState('All')

  const filtered = VENDOR_LISTINGS.filter(l =>
    filter === 'All' || l.status.toLowerCase() === filter.toLowerCase()
  )

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Listings</h1>
          <p className="text-sm text-gray-500">{VENDOR_LISTINGS.length} total listings</p>
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
        {filtered.map((listing) => (
          <div key={listing.id}
            className="bg-white rounded-2xl border border-[#e0d9cc] overflow-hidden
                       hover:shadow-md transition-all">
            <div className="flex gap-4 p-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden
                              flex-shrink-0 bg-[#e0d9cc]">
                <Image src={listing.image} alt={listing.title} fill
                  sizes="96px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-[#1a1a1a] leading-snug">
                    {listing.title}
                  </p>
                  <StatusBadge status={listing.status} />
                </div>
                <p className="text-xs text-gray-400 mb-2">{listing.location}</p>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="font-semibold text-[#1a1a1a]">{listing.price}</span>
                  <span>·</span>
                  <span>{listing.bookings} bookings</span>
                  {listing.rating > 0 && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Star size={10} color="#f5a623" fill="#f5a623" />
                        {listing.rating}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-[#2c4a1e] font-semibold mt-1">
                  Earned: {listing.earnings}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => router.push(`/vendor/listings/${listing.id}`)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3
                           text-xs font-semibold text-[#1a1a1a] hover:bg-gray-50
                           transition-colors border-r border-gray-100"
              >
                <Eye size={13} /> Edit
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-3
                           text-xs font-semibold text-[#1a1a1a] hover:bg-gray-50
                           transition-colors border-r border-gray-100"
              >
                <Pause size={13} />
                {listing.status === 'paused' ? 'Activate' : 'Pause'}
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-3
                           text-xs font-semibold text-red-500 hover:bg-red-50
                           transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}