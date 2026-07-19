'use client'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, Users, ChevronRight } from 'lucide-react'
import { VENDOR_LISTINGS, VENDOR_BOOKINGS } from '@/data/vendor'
import { StatusBadge } from '../../../page'

type Props = {
  params: Promise<{ listingId: string }>
}

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

export default function ListingBookingsPage({ params }: Props) {
  const { listingId } = use(params)
  const router = useRouter()
  const [filter, setFilter] = useState('All')

  const listing = VENDOR_LISTINGS.find(l => l.id === listingId)
  const bookings = VENDOR_BOOKINGS.filter(b => b.listingId === listingId)
  const filtered = bookings.filter(b => filter === 'All' || b.status.toLowerCase() === filter.toLowerCase())

  if (!listing) {
    return (
      <div className="p-5 lg:p-8 max-w-3xl mx-auto text-center pt-20">
        <p className="text-sm text-gray-500 mb-4">Listing not found.</p>
        <button onClick={() => router.push('/vendor/listings')}
          className="text-sm font-semibold text-[#2c4a1e] underline">
          Back to listings
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <button onClick={() => router.push('/vendor/listings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to listings
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#e0d9cc]">
          <Image src={listing.image} alt={listing.title} fill sizes="64px" className="object-cover" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">{listing.title}</h1>
          <p className="text-sm text-gray-500">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold
                        border transition-all
              ${filter === f
                ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">No bookings match this filter.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((booking) => (
            <button key={booking.id}
              onClick={() => router.push(`/vendor/bookings/${booking.id}`)}
              className="bg-white rounded-2xl border border-[#e0d9cc] p-4 text-left
                         hover:shadow-md transition-all w-full">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center
                                text-sm font-bold flex-shrink-0"
                  style={{ background: booking.guestColor }}>
                  {booking.guestInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-[#1a1a1a] truncate">{booking.guestName}</p>
                    <StatusBadge status={booking.status} />
                  </div>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-1">
                      <Calendar size={11} color="#888" />
                      <span className="text-xs text-gray-400">{booking.dates}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={11} color="#888" />
                      <span className="text-xs text-gray-400">
                        {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-[#1a1a1a]">{booking.total}</p>
                  <ChevronRight size={14} color="#aaa" className="ml-auto mt-1" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
