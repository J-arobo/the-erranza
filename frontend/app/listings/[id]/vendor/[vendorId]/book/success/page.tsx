'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'

export default function BookingSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking')

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white
                    px-6 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-[#eaf5e4] flex items-center justify-center">
        <Check size={36} color="#2c4a1e" strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Booking confirmed!</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your safari is booked. The tour operator will be in touch shortly.
          Check your messages for confirmation details.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => router.push('/trips')}
          className="w-full bg-[#2c4a1e] text-white px-8 py-3.5 rounded-xl font-semibold
                     text-sm hover:bg-[#3d6b28] transition-colors"
        >
          View my trips
        </button>
        <button
          onClick={() => router.push(bookingId ? `/messages?booking=${bookingId}` : '/messages')}
          className="w-full border border-[#1a1a1a] text-[#1a1a1a] px-8 py-3.5 rounded-xl
                     font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Message tour operator
        </button>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-gray-400 underline"
        >
          Back to home
        </button>
      </div>
    </div>
  )
}
