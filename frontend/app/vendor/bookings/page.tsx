'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, Users, ChevronRight } from 'lucide-react'
import { VENDOR_BOOKINGS } from '@/data/vendor'
import { StatusBadge } from '../page'

const FILTERS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

export default function VendorBookingsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState('All')

  const filtered = VENDOR_BOOKINGS.filter(b =>
    filter === 'All' || b.status.toLowerCase() === filter.toLowerCase()
  )

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Bookings</h1>
        <p className="text-sm text-gray-500">{VENDOR_BOOKINGS.length} total bookings</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold
                        border transition-all
              ${filter === f
                ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
            {f}
            {f !== 'All' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                ({VENDOR_BOOKINGS.filter(b => b.status === f.toLowerCase()).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((booking) => (
          <button key={booking.id}
            onClick={() => router.push(`/vendor/bookings/${booking.id}`)}
            className="bg-white rounded-2xl border border-[#e0d9cc] p-4 text-left
                       hover:shadow-md transition-all w-full">
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden
                              flex-shrink-0 bg-[#e0d9cc]">
                <Image src={booking.listingImage} alt={booking.listingTitle}
                  fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-[#1a1a1a] truncate">
                    {booking.guestName}
                  </p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-xs text-gray-500 mb-1 truncate">{booking.listingTitle}</p>
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

            {/* Pending actions */}
            {booking.status === 'pending' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-2 rounded-xl bg-[#2c4a1e] text-white text-xs
                             font-semibold hover:bg-[#3d6b28] transition-colors">
                  Accept
                </button>
                <button onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-2 rounded-xl border border-gray-200 text-xs
                             font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                  Decline
                </button>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}