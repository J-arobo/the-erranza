'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Calendar, Users, MessageCircle, AlertCircle, ShieldAlert } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { StatusBadge } from '../../page'

type Props = {
  params: Promise<{ bookingId: string }>
}

type PolicyId = 'flexible' | 'moderate' | 'strict' | 'custom'

const CANCELLATION_POLICIES: Record<PolicyId, { label: string; description: string; refundPercent: number | null }> = {
  flexible: { label: 'Flexible', description: 'Full refund up to 24 hours before the start date.', refundPercent: 100 },
  moderate: { label: 'Moderate', description: 'Full refund up to 5 days before the start date, 50% refund after that.', refundPercent: 50 },
  strict: { label: 'Strict', description: 'Full refund up to 14 days before the start date. No refund after that.', refundPercent: 0 },
  custom: { label: 'Custom', description: 'Refund terms set by the operator.', refundPercent: null },
}

const AVATAR_COLORS = ['#f0c4d4', '#c4d4f0', '#d4f0c4', '#f0e0c4', '#e0c4f0']
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
function bookingRequiresApproval(category: string) {
  return category === 'Safari' || category === 'Packages'
}
function getCancellationTerms(cancellationPolicy: PolicyId, customText: string | null) {
  const policy = CANCELLATION_POLICIES[cancellationPolicy] ?? CANCELLATION_POLICIES.moderate
  return {
    ...policy,
    description: cancellationPolicy === 'custom' ? (customText || policy.description) : policy.description,
  }
}
function formatDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
function formatDateRange(start: string | null, end: string | null) {
  if (!start) return '—'
  if (!end || end === start) return formatDate(start)
  return `${formatDate(start)} – ${formatDate(end)}`
}
function formatKsh(v: string | number) {
  return `Ksh ${Math.round(Number(v)).toLocaleString()}`
}

type ApiBookingDetail = {
  id: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'alternative_proposed'
  guests: number
  total: string
  check_in: string | null
  check_out: string | null
  proposed_date: string | null
  refund_percent: number | null
  refund_amount: string | null
  special_requests: string | null
  listing: {
    id: number; title: string; category: string
    cancellation_policy: PolicyId; custom_cancellation_text: string | null
    images: { url: string }[]
  }
  traveller: { id: number; name: string; email: string }
  travelers: { id: number; name: string }[]
  messages: { id: number; sender_type: 'guest' | 'vendor'; text: string; created_at: string }[]
}

export default function BookingDetailPage({ params }: Props) {
  const { bookingId } = use(params)
  const router = useRouter()

  const [booking, setBooking] = useState<ApiBookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [proposing, setProposing] = useState(false)
  const [proposedDate, setProposedDate] = useState('')
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    apiFetch<{ booking: ApiBookingDetail }>(`/vendor/bookings/${bookingId}`)
      .then(({ booking }) => setBooking(booking))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [bookingId])

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound || !booking) {
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

  const needsApproval = bookingRequiresApproval(booking.listing.category)
  const terms = getCancellationTerms(booking.listing.cancellation_policy, booking.listing.custom_cancellation_text)
  const guestMessage = booking.messages.find(m => m.sender_type === 'guest')?.text

  async function acceptBooking() {
    setBusy(true)
    setError('')
    try {
      await apiFetch(`/vendor/bookings/${bookingId}/accept`, { method: 'POST' })
      setBooking(b => b ? { ...b, status: 'confirmed' } : b)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function declineBooking() {
    setBusy(true)
    setError('')
    try {
      await apiFetch(`/vendor/bookings/${bookingId}/decline`, { method: 'POST' })
      setBooking(b => b ? { ...b, status: 'cancelled' } : b)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function sendProposal() {
    if (!proposedDate) return
    setBusy(true)
    setError('')
    try {
      await apiFetch(`/vendor/bookings/${bookingId}/propose-dates`, {
        method: 'POST',
        body: JSON.stringify({ proposed_date: proposedDate }),
      })
      setBooking(b => b ? { ...b, status: 'alternative_proposed', proposed_date: proposedDate } : b)
      setProposing(false)
      setProposedDate('')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function confirmCancellation() {
    setBusy(true)
    setError('')
    try {
      const refundPercent = terms.refundPercent ?? 0
      await apiFetch(`/vendor/bookings/${bookingId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ refund_percent: refundPercent }),
      })
      setBooking(b => b ? {
        ...b,
        status: 'cancelled',
        refund_percent: refundPercent,
        refund_amount: String(Number(b.total) * (refundPercent / 100)),
      } : b)
      setCancelling(false)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.push('/vendor/bookings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to bookings
      </button>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center
                          text-base font-bold flex-shrink-0"
            style={{ background: avatarColor(booking.traveller.name) }}>
            {booking.traveller.name[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-[#1a1a1a]">{booking.traveller.name}</p>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="flex gap-3 pb-4 mb-4 border-b border-gray-100">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#e0d9cc]">
            <Image src={booking.listing.images[0]?.url ?? FALLBACK_IMAGE} alt={booking.listing.title} fill
              sizes="64px" className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">{booking.listing.title}</p>
            <button onClick={() => router.push(`/vendor/listings/${booking.listing.id}`)}
              className="text-xs text-[#2c4a1e] font-semibold hover:underline">
              View listing
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} color="#888" />
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">{formatDateRange(booking.check_in, booking.check_out)}</p>
              <p className="text-xs text-gray-400">Check-in {formatDate(booking.check_in)} · Check-out {formatDate(booking.check_out)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} color="#888" />
            <p className="text-sm text-[#1a1a1a]">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <span className="text-sm font-semibold text-[#1a1a1a]">Total</span>
          <span className="text-lg font-bold text-[#1a1a1a]">{formatKsh(booking.total)}</span>
        </div>
      </div>

      {/* Traveller details */}
      {(booking.travelers.length > 0 || booking.special_requests) && (
        <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
          <p className="text-sm font-semibold text-[#1a1a1a] mb-3">Traveller details</p>
          {booking.travelers.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Travellers ({booking.travelers.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {booking.travelers.map((t) => (
                  <span key={t.id} className="text-xs font-medium text-[#1a1a1a] bg-gray-100
                                              px-2.5 py-1 rounded-full">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {booking.special_requests && (
            <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
              <AlertCircle size={14} color="#b45309" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Special requests / dietary needs</p>
                <p className="text-xs text-amber-700 mt-0.5">{booking.special_requests}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {guestMessage && (
        <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={16} color="#2c4a1e" />
            <p className="text-sm font-semibold text-[#1a1a1a]">Message from guest</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{guestMessage}</p>
        </div>
      )}

      {booking.status === 'alternative_proposed' && booking.proposed_date && (
        <div className="bg-blue-50 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-blue-700">Alternative date proposed</p>
          <p className="text-xs text-blue-600 mt-0.5">
            Waiting on the guest to accept {formatDate(booking.proposed_date)}.
          </p>
        </div>
      )}

      {booking.status === 'cancelled' && booking.refund_amount !== null && (
        <div className="bg-red-50 rounded-2xl p-4 mb-5">
          <p className="text-sm font-semibold text-red-600">Cancelled</p>
          <p className="text-xs text-red-500 mt-0.5">
            Refunded {formatKsh(booking.refund_amount ?? 0)} ({booking.refund_percent}%) per the {terms.label.toLowerCase()} cancellation policy.
          </p>
        </div>
      )}

      {/* ── Pending: approve/decline (only for Safari/Packages) ── */}
      {booking.status === 'pending' && needsApproval && !proposing && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-3">
            <button onClick={acceptBooking} disabled={busy}
              className="flex-1 py-3 rounded-xl bg-[#2c4a1e] text-white text-sm
                                 font-semibold hover:bg-[#3d6b28] transition-colors disabled:opacity-50">
              Accept booking
            </button>
            <button onClick={declineBooking} disabled={busy}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm
                                 font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-50">
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
        <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 flex flex-col gap-3">
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
            <button onClick={sendProposal} disabled={!proposedDate || busy}
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
                : `${formatKsh(Number(booking.total) * (terms.refundPercent / 100))} (${terms.refundPercent}%)`}
            </span>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCancelling(false)}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm
                         font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
              Keep booking
            </button>
            <button onClick={confirmCancellation} disabled={busy}
              className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm
                         font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
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
