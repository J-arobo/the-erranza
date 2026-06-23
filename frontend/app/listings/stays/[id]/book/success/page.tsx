'use client'
// src/app/listings/stays/[id]/book/success/page.tsx

import { useRouter } from 'next/navigation'
import { Check, Calendar, MapPin } from 'lucide-react'

export default function StayBookingSuccess() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white
                    px-6 text-center gap-6">
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-[#eaf5e4] flex items-center justify-center">
        <Check size={36} color="#2c4a1e" strokeWidth={2.5} />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">
          You're all booked!
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
          Your stay is confirmed. The host will be in touch shortly.
          Check your messages for confirmation details.
        </p>
      </div>

      {/* Booking details */}
      <div className="bg-[#f5f0e8] rounded-2xl p-5 w-full max-w-sm flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Calendar size={16} color="#2c4a1e" />
          <p className="text-sm text-[#1a1a1a]">Check-in details sent to your email</p>
        </div>
        <div className="flex items-center gap-3">
          <MapPin size={16} color="#2c4a1e" />
          <p className="text-sm text-[#1a1a1a]">Exact address shared by host</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => router.push('/trips')}
          className="w-full bg-[#2c4a1e] text-white px-8 py-3.5 rounded-xl font-semibold
                     text-sm hover:bg-[#3d6b28] transition-colors"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          View my trips
        </button>
        <button
          onClick={() => router.push('/messages')}
          className="w-full border border-[#1a1a1a] text-[#1a1a1a] px-8 py-3.5 rounded-xl
                     font-semibold text-sm hover:bg-gray-50 transition-colors"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          Message host
        </button>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-gray-400 underline"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          Back to home
        </button>
      </div>
    </div>
  )
}