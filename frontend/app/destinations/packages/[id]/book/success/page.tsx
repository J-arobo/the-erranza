'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

type BookingSummary = {
  guests: number
  check_in: string | null
  check_out: string | null
  listing: { id: number; title: string; vendor: { id: number } }
}

function formatShort(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : null
}

function PackageBookingSuccessPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('booking')
  const [booking, setBooking] = useState<BookingSummary | null>(null)

  useEffect(() => {
    if (!bookingId) return
    apiFetch<{ booking: BookingSummary }>(`/bookings/${bookingId}`)
      .then(({ booking }) => setBooking(booking))
      .catch(() => { })
  }, [bookingId])

  function handleMessageOperator() {
    if (!booking) { router.push('/messages'); return }
    const checkIn = formatShort(booking.check_in)
    const checkOut = formatShort(booking.check_out)
    const dates = checkIn ? (checkOut ? `${checkIn} – ${checkOut}` : checkIn) : null
    const text = `Hi! I just booked "${booking.listing.title}" for ${booking.guests} guest${booking.guests === 1 ? '' : 's'}${dates ? ` (${dates})` : ''}. Looking forward to it!`
    router.push(`/messages?vendor=${booking.listing.vendor.id}&listing=${booking.listing.id}&text=${encodeURIComponent(text)}`)
  }

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
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={() => router.push('/trips')}
          className="w-full bg-[#2c4a1e] text-white px-8 py-3.5 rounded-xl font-semibold
                     text-sm hover:bg-[#3d6b28] transition-colors"
        >
          View my trips
        </button>
        <button
          onClick={handleMessageOperator}
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

export default function PackageBookingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PackageBookingSuccessPageContent />
    </Suspense>
  )
}
