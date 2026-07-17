'use client'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

export default function PackageBookingSuccessPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white
                    px-6 text-center gap-6">
      <div className="w-20 h-20 rounded-full bg-[#eaf5e4] flex items-center justify-center">
        <Check size={36} color="#2c4a1e" strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Booking confirmed!</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Your package is booked. Our team will be in touch shortly with your full
          itinerary and confirmation details.
        </p>
      </div>
      <button
        onClick={() => router.push('/')}
        className="bg-[#2c4a1e] text-white px-8 py-3 rounded-full font-semibold text-sm
                   hover:bg-[#3d6b28] transition-colors"
      >
        Back to home
      </button>
      <button
        onClick={() => router.push('/trips')}
        className="text-sm font-semibold text-[#1a1a1a] underline"
      >
        View my trips
      </button>
    </div>
  )
}
