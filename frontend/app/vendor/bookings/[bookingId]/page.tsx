'use client'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, Users, MessageCircle, AlertCircle, ShieldAlert } from 'lucide-react'
import { VENDOR_BOOKINGS, bookingRequiresApproval, getCancellationTerms } from '@/data/vendor'
import { StatusBadge } from '../../page'

type Props = {
  params: Promise<{ bookingId: string }>
}

function parseKsh(str: string): number {
  return Number(str.replace(/[^0-9.]/g, '')) || 0
}
function formatKsh(n: number): string {
  return `Ksh ${Math.round(n).toLocaleString()}`
}

export default function BookingDetailPage({ params }: Props) {
  const { bookingId } = use(params)
  const router = useRouter()
  const [, forceUpdate] = useState(0)

  const [proposing, setProposing] = useState(false)
  const [proposedDate, setProposedDate] = useState('')
  const [cancelling, setCancelling] = useState(false)

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

  const needsApproval = bookingRequiresApproval(booking)
  const terms = getCancellationTerms(booking)

  function acceptBooking() {
    if (!booking) return
    booking.status = 'confirmed'
    forceUpdate(n => n + 1)
  }

  function declineBooking() {
    if (!booking) return
    booking.status = 'cancelled'
    forceUpdate(n => n + 1)
  }

  function sendProposal() {
    if (!booking || !proposedDate) return
    booking.status = 'alternative_proposed'
    booking.proposedDates = proposedDate
    setProposing(false)
    setProposedDate('')
    forceUpdate(n => n + 1)
  }

  function confirmCancellation() {
    if (!booking) return
    const total = parseKsh(booking.total)
    const refundAmount = terms.refundPercent === null ? undefined : formatKsh(total * (terms.refundPercent / 100))
    booking.status = 'cancelled'
    booking.refundPercent = terms.refundPercent
    booking.refundAmount = refundAmount
    setCancelling(false)
    forceUpdate(n => n + 1)
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

      {/* Traveller details */}
      {(booking.travelers?.length || booking.specialRequests) && (
        <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
          <p className="text-sm font-semibold text-[#1a1a1a] mb-3">Traveller details</p>
          {booking.travelers && booking.travelers.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Travellers ({booking.travelers.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {booking.travelers.map((name) => (
                  <span key={name} className="text-xs font-medium text-[#1a1a1a] bg-gray-100
                                              px-2.5 py-1 rounded-full">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {booking.specialRequests && (
            <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
              <AlertCircle size={14} color="#b45309" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Special requests / dietary needs</p>
                <p className="text-xs text-amber-700 mt-0.5">{booking.specialRequests}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {booking.message && (
        <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={16} color="#2c4a1e" />
            <p className="text-sm font-semibold text-[#1a1a1a]">Message from guest</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{booking.message}</p>
        </div>
      )}

      {booking.status === 'alternative_proposed' && booking.proposedDates && (
        <div className="bg-blue-50 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-blue-700">Alternative date proposed</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Waiting on the guest to accept {booking.proposedDates}.
          </p>
        </div>
      )}

      {booking.status === 'cancelled' && booking.refundAmount !== undefined && (
        <div className="bg-red-50 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-red-600">Cancelled</p>
          <p className="text-xs text-red-500 mt-0.5">
            Refunded {booking.refundAmount} ({booking.refundPercent}%) per the {terms.label.toLowerCase()} cancellation policy.
          </p>
        </div>
      )}

      {/* ── Pending: approve/decline (only for Safari/Packages) ── */}
      {booking.status === 'pending' && needsApproval && !proposing && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <button onClick={acceptBooking}
              className="flex-1 py-3 rounded-xl bg-[#2c4a1e] text-white text-sm
                                 font-semibold hover:bg-[#3d6b28] transition-colors">
              Accept booking
            </button>
            <button onClick={declineBooking}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm
                                 font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
              Decline
            </button>
          </div>
          <button onClick={() => setProposing(true)}
            className="w-full py-3 rounded-xl border border-gray-200 text-sm
                       font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
            Propose alternative dates
          </button>
        </div>
      )}

      {booking.status === 'pending' && !needsApproval && (
        <p className="text-xs text-gray-400 text-center">
          This category doesn&apos;t require manual approval.
        </p>
      )}

      {/* ── Propose alternative dates form ── */}
      {proposing && (
        <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 flex flex-col gap-3">
          <p className="text-sm font-semibold text-[#1a1a1a]">Propose a new date</p>
          <input value={proposedDate} onChange={(e) => setProposedDate(e.target.value)}
            type="date"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
          <div className="flex gap-3">
            <button onClick={() => setProposing(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm
                         font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={sendProposal} disabled={!proposedDate}
              className="flex-1 py-2.5 rounded-xl bg-[#2c4a1e] text-white text-sm
                         font-semibold hover:bg-[#3d6b28] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed">
              Send to guest
            </button>
          </div>
        </div>
      )}

      {/* ── Confirmed: message + cancel ── */}
      {booking.status === 'confirmed' && !cancelling && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => router.push('/vendor/messages')}
            className="w-full py-3 rounded-xl border border-gray-200 text-sm
                       font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
            Message guest
          </button>
          <button
            onClick={() => setCancelling(true)}
            className="w-full py-3 rounded-xl border border-red-200 text-sm
                       font-semibold text-red-500 hover:bg-red-50 transition-colors">
            Cancel booking
          </button>
        </div>
      )}

      {/* ── Cancel confirmation ── */}
      {cancelling && (
        <div className="bg-white rounded-2xl border border-red-200 p-5 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <ShieldAlert size={16} color="#dc2626" className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">
                {terms.label} cancellation policy applies
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{terms.description}</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Refund to guest</span>
            <span className="text-sm font-bold text-[#1a1a1a]">
              {terms.refundPercent === null
                ? 'Set manually'
                : `${formatKsh(parseKsh(booking.total) * (terms.refundPercent / 100))} (${terms.refundPercent}%)`}
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCancelling(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm
                         font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
              Keep booking
            </button>
            <button onClick={confirmCancellation}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm
                         font-semibold hover:bg-red-700 transition-colors">
              Confirm cancellation
            </button>
          </div>
        </div>
      )}

      {(booking.status === 'completed' || booking.status === 'cancelled' || booking.status === 'alternative_proposed') && (
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
