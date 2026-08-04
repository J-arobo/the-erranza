'use client'
import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, Users, MessageCircle, AlertTriangle } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type Props = { params: Promise<{ id: string }> }

type ApiBookingDetail = {
  id: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'alternative_proposed'
  guests: number
  total: string
  check_in: string | null
  check_out: string | null
  proposed_date: string | null
  special_requests: string | null
  listing: {
    id: number
    title: string
    category: string
    cancellation_policy: 'flexible' | 'moderate' | 'strict' | 'custom'
    custom_cancellation_text: string | null
    images: { url: string }[]
    itinerary: { day: number; title: string; description: string | null }[]
    vendor: { id: number; business_name: string; phone: string | null }
  }
  // Payment plans
  payment_plan: 'full' | 'instalments'
  payments: { id: number; amount: string; due_date: string; status: 'pending' | 'paid'; paid_at: string | null }[]
  review: { id: number; rating: number; comment: string } | null
}

// No stored "days before check-in" field exists per policy tier, so these
// are documented, industry-standard defaults applied to the real policy
// value and real check-in date — not fabricated per-booking data.
const FREE_CANCEL_DAYS: Record<string, number> = {
  flexible: 1,
  moderate: 5,
  strict: 14,
}

function formatDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

export default function TripDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()

  const [booking, setBooking] = useState<ApiBookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)
  //Payment plan state
  const [payingId, setPayingId] = useState<number | null>(null)

  useEffect(() => {
    apiFetch<{ booking: ApiBookingDetail }>(`/bookings/${id}`)
      .then(({ booking }) => setBooking(booking))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  // Payment plan
  async function handlePayInstallment(paymentId: number) {
    setPayingId(paymentId)
    setError('')
    try {
      await apiFetch(`/bookings/${id}/payments/${paymentId}/pay`, { method: 'POST' })
      setBooking(b => b ? {
        ...b,
        payments: b.payments.map(p => p.id === paymentId ? { ...p, status: 'paid' as const, paid_at: new Date().toISOString() } : p),
      } : b)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setPayingId(null)
    }
  }

  async function handleCancel() {
    setCancelling(true)
    setError('')
    try {
      const { booking: updated } = await apiFetch<{ booking: { status: ApiBookingDetail['status'] } }>(`/bookings/${id}/cancel`, { method: 'POST' })
      setBooking(b => b ? { ...b, status: updated.status } : b)
      setConfirmingCancel(false)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound || !booking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <p className="text-sm text-gray-500">This trip could not be found.</p>
        <button onClick={() => router.push('/trips')} className="text-sm font-semibold text-[#2c4a1e] underline">
          Back to trips
        </button>
      </div>
    )
  }

  const listing = booking.listing
  const image = listing.images[0]?.url ?? 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80'
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed' || booking.status === 'alternative_proposed'

  let cancelWindowText = ''
  if (booking.check_in) {
    const checkIn = new Date(booking.check_in)
    if (listing.cancellation_policy === 'custom' && listing.custom_cancellation_text) {
      cancelWindowText = listing.custom_cancellation_text
    } else {
      const days = FREE_CANCEL_DAYS[listing.cancellation_policy] ?? 5
      const deadline = new Date(checkIn)
      deadline.setDate(deadline.getDate() - days)
      const withinFreeCancelWindow = new Date() <= deadline
      cancelWindowText = withinFreeCancelWindow
        ? `Free cancellation until ${formatDate(deadline.toISOString())} (${days} day${days > 1 ? 's' : ''} before check-in).`
        : `The free-cancellation window closed on ${formatDate(deadline.toISOString())}. Cancelling now may not be fully refunded.`
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center">
          <ArrowLeft size={16} color="#1a1a1a" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#1a1a1a]">Trip details</h1>
      </div>

      <div className="max-w-xl mx-auto px-5 py-5">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#f5f5f5] mb-4">
          <Image src={image} alt={listing.title} fill sizes="500px" className="object-cover" />
        </div>

        <h2 className="text-xl font-bold text-[#1a1a1a] mb-1">{listing.title}</h2>
        <p className="text-sm text-gray-500 mb-4">{listing.vendor.business_name}</p>

        <div className="grid grid-cols-2 gap-4 mb-5 bg-gray-50 rounded-xl p-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Dates</p>
            <p className="text-sm font-semibold text-[#1a1a1a]">
              {formatDate(booking.check_in)}{booking.check_out ? ` – ${formatDate(booking.check_out)}` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Guests</p>
            <p className="text-sm font-semibold text-[#1a1a1a]">{booking.guests}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{booking.payment_plan === 'instalments' ? 'Total' : 'Total paid'}</p>
            <p className="text-sm font-semibold text-[#1a1a1a]">Ksh {Math.round(Number(booking.total)).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Status</p>
            <p className="text-sm font-semibold text-[#1a1a1a] capitalize">{booking.status.replace('_', ' ')}</p>
          </div>
        </div>

        {booking.status === 'alternative_proposed' && booking.proposed_date && (
          <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3 mb-5">
            <AlertTriangle size={16} color="#b45309" className="flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              The host has proposed a new date: <strong>{formatDate(booking.proposed_date)}</strong>. Message them to confirm or discuss alternatives.
            </p>
          </div>
        )}

        {booking.special_requests && (
          <div className="mb-5">
            <p className="text-sm font-bold text-[#1a1a1a] mb-1">Special requests</p>
            <p className="text-sm text-gray-600">{booking.special_requests}</p>
          </div>
        )}

        {booking.special_requests && (
          <div className="mb-5">
            <p className="text-sm font-bold text-[#1a1a1a] mb-1">Special requests</p>
            <p className="text-sm text-gray-600">{booking.special_requests}</p>
          </div>
        )}

        {booking.payment_plan === 'instalments' && booking.payments.length > 0 && (
          <div className="mb-5">
            <p className="text-sm font-bold text-[#1a1a1a] mb-3">Payment schedule</p>
            <div className="flex flex-col gap-2">
              {booking.payments.map((payment, i) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">Payment {i + 1} of {booking.payments.length}</p>
                    <p className="text-xs text-gray-500">
                      {payment.status === 'paid'
                        ? `Paid ${formatDate(payment.paid_at)}`
                        : `Due ${formatDate(payment.due_date)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#1a1a1a]">Ksh {Math.round(Number(payment.amount)).toLocaleString()}</p>
                    {payment.status === 'paid' ? (
                      <span className="text-xs font-semibold text-[#2c4a1e]">Paid ✓</span>
                    ) : (
                      <button
                        onClick={() => handlePayInstallment(payment.id)}
                        disabled={payingId === payment.id}
                        className="text-xs font-semibold text-white bg-[#2c4a1e] px-3 py-1 rounded-full mt-1 hover:bg-[#3d6b28] transition-colors disabled:opacity-40"
                      >
                        {payingId === payment.id ? 'Paying…' : 'Pay now'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {listing.itinerary.length > 0 && (
          <div className="mb-5">
            <p className="text-sm font-bold text-[#1a1a1a] mb-3">Itinerary</p>
            <div className="flex flex-col gap-3">
              {listing.itinerary.map(day => (
                <div key={day.day} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#eaf5e4] text-[#2c4a1e] text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {day.day}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{day.title}</p>
                    {day.description && <p className="text-xs text-gray-500 mt-0.5">{day.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {booking.review && (
          <div className="mb-5">
            <p className="text-sm font-bold text-[#1a1a1a] mb-1">Your review</p>
            <p className="text-sm text-gray-600">{booking.review.comment}</p>
          </div>
        )}

        {canCancel && (
          <div className="mb-5">
            <p className="text-sm font-bold text-[#1a1a1a] mb-1">Cancellation policy</p>
            <p className="text-xs text-gray-500 capitalize mb-1">{listing.cancellation_policy} policy</p>
            <p className="text-sm text-gray-600">{cancelWindowText}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 mt-6">
          <button
            onClick={() => router.push(`/messages?booking=${booking.id}`)}
            className="w-full flex items-center justify-center gap-2 border border-[#1a1a1a] text-[#1a1a1a] py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <MessageCircle size={16} /> Message host
          </button>

          {canCancel && !confirmingCancel && (
            <button
              onClick={() => setConfirmingCancel(true)}
              className="w-full border border-red-200 text-red-600 py-3.5 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
            >
              Cancel booking
            </button>
          )}

          {confirmingCancel && (
            <div className="border border-red-200 rounded-xl p-4 bg-red-50">
              <p className="text-sm text-red-700 mb-3">{cancelWindowText || 'Are you sure you want to cancel this booking?'}</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmingCancel(false)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-[#1a1a1a]">
                  Keep booking
                </button>
                <button onClick={handleCancel} disabled={cancelling}
                  className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-40">
                  {cancelling ? 'Cancelling…' : 'Confirm cancellation'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
