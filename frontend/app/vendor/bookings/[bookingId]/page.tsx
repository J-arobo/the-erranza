'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, Users, MessageCircle } from 'lucide-react'
import { VENDOR_BOOKINGS } from '@/data/vendor'
import { StatusBadge } from '../../page'

type Props = {
  params: Promise<{ bookingId: string }>
}

export default function BookingDetailPage({ params }: Props) {
  const { bookingId } = use(params)
  const router = useRouter()

  const booking = VENDOR_BOOKINGS.find(b => b.id === bookingId)

  if (!booking) {
    return (
      <div className="p-5 lg:p-8 max-w-2xl mx-auto text-center pt-20">
        <p className="text-sm text-gray-500 mb-4">Booking not found.</p>
        <button onClick={() => router.push('/vendor/bookings')}
          className="text-sm font-semibold text-[#2c4a1e] underline">
          Back to bookings
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.push('/vendor/bookings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to bookings
      </button>

      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center
                          text-base font-bold flex-shrink-0"
            style={{ background: booking.guestColor }}>
            {booking.guestInitial}
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-[#1a1a1a]">{booking.guestName}</p>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="flex gap-3 pb-4 mb-4 border-b border-gray-100">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#e0d9cc]">
            <Image src={booking.listingImage} alt={booking.listingTitle} fill
              sizes="64px" className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">{booking.listingTitle}</p>
            <button onClick={() => router.push(`/vendor/listings/${booking.listingId}`)}
              className="text-xs text-[#2c4a1e] font-semibold hover:underline">
              View listing
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} color="#888" />
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">{booking.dates}</p>
              <p className="text-xs text-gray-400">Check-in {booking.checkIn} · Check-out {booking.checkOut}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} color="#888" />
            <p className="text-sm text-[#1a1a1a]">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm font-semibold text-[#1a1a1a]">Total</span>
          <span className="text-lg font-bold text-[#1a1a1a]">{booking.total}</span>
        </div>
      </div>

      {booking.message && (
        <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={16} color="#2c4a1e" />
            <p className="text-sm font-semibold text-[#1a1a1a]">Message from guest</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{booking.message}</p>
        </div>
      )}

      {booking.status === 'pending' ? (
        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-xl bg-[#2c4a1e] text-white text-sm
                             font-semibold hover:bg-[#3d6b28] transition-colors">
            Accept booking
          </button>
          <button className="flex-1 py-3 rounded-xl border border-gray-200 text-sm
                             font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
            Decline
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push('/vendor/messages')}
          className="w-full py-3 rounded-xl border border-gray-200 text-sm
                     font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
          Message guest
        </button>
      )}
    </div>
  )
}
