'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type Props = { params: Promise<{ bookingId: string }> }

type ApiPayment = { id: number; amount: string; status: string; due_date: string; paid_at: string | null; paystack_reference: string | null }
type ApiExtraCharge = { id: number; amount: string; description: string; status: string; decided_at: string | null }
type ApiPayout = {
  id: number; leg: 'vendor' | 'commission'; amount: string; status: string
  destination: string | null; reference: string | null; failure_reason: string | null; paid_at: string | null; created_at: string
}
type ApiBookingDetail = {
  id: number
  status: string
  total: string
  guests: number
  check_in: string | null
  check_out: string | null
  vendor_completed_at: string | null
  traveller_completed_at: string | null
  listing: { id: number; title: string; vendor: { business_name: string; plan: string; payout_method: string | null; payout_bank_name: string | null; payout_details: string | null } }
  traveller: { id: number; name: string; email: string }
  payments: ApiPayment[]
  extra_charges: ApiExtraCharge[]
  payouts: ApiPayout[]
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-[#eaf5e4] text-[#2c4a1e]',
  cancelled: 'bg-red-50 text-red-600',
  processing: 'bg-blue-50 text-blue-700',
  paid: 'bg-[#eaf5e4] text-[#2c4a1e]',
  failed: 'bg-red-50 text-red-600',
  declined: 'bg-red-50 text-red-600',
}

function formatDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
function formatDateTime(v: string | null) {
  return v ? new Date(v).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'
}
function formatKsh(v: string | number) {
  return `Ksh ${Math.round(Number(v)).toLocaleString()}`
}

function Pill({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

export default function SuperAdminBookingTrackerPage({ params }: Props) {
  const { bookingId } = use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<ApiBookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<{ booking: ApiBookingDetail }>(`/super-admin/bookings/${bookingId}`)
      .then(({ booking }) => setBooking(booking))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [bookingId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#161616] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="p-5 lg:p-8 max-w-3xl mx-auto text-center pt-20">
        <p className="text-sm text-red-600 mb-4">{error || 'Booking not found.'}</p>
        <button onClick={() => router.push('/super-admin/bookings')} className="text-sm font-semibold text-[#161616] underline">
          Back to tracker
        </button>
      </div>
    )
  }

  const commissionRate = booking.listing.vendor.plan === 'plus' ? 8 : 12
  const vendorLeg = booking.payouts.find(p => p.leg === 'vendor')
  const commissionLeg = booking.payouts.find(p => p.leg === 'commission')

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <button onClick={() => router.push('/super-admin/bookings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to tracker
      </button>

      <div className="flex items-center justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Booking #{booking.id}</h1>
        <Pill status={booking.status} />
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {booking.listing.title} · {booking.listing.vendor.business_name} · {booking.traveller.name} ({booking.traveller.email})
      </p>

      {/* Trip */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-bold text-[#1a1a1a] mb-3">Trip</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs text-gray-400 mb-0.5">Dates</p><p className="font-semibold text-[#1a1a1a]">{formatDate(booking.check_in)} – {formatDate(booking.check_out)}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">Guests</p><p className="font-semibold text-[#1a1a1a]">{booking.guests}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">Total</p><p className="font-semibold text-[#1a1a1a]">{formatKsh(booking.total)}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">Completion</p>
            <p className="font-semibold text-[#1a1a1a]">
              {booking.status === 'completed'
                ? `Both sides confirmed ${formatDateTime(booking.vendor_completed_at)}`
                : booking.vendor_completed_at || booking.traveller_completed_at
                  ? 'Waiting on the other side'
                  : 'Not yet'}
            </p>
          </div>
        </div>
      </div>

      {/* Payments */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
        <h2 className="text-sm font-bold text-[#1a1a1a] mb-3">Payment{booking.payments.length !== 1 ? 's' : ''}</h2>
        {booking.payments.length === 0 ? (
          <p className="text-sm text-gray-400">No payment recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {booking.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{formatKsh(p.amount)}</p>
                  <p className="text-xs text-gray-400">{p.paystack_reference ?? 'no reference'}</p>
                </div>
                <div className="text-right">
                  <Pill status={p.status} />
                  <p className="text-xs text-gray-400 mt-0.5">{p.status === 'paid' ? formatDateTime(p.paid_at) : `Due ${formatDate(p.due_date)}`}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extra charges */}
      {booking.extra_charges.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
          <h2 className="text-sm font-bold text-[#1a1a1a] mb-3">Extra charges</h2>
          <div className="flex flex-col divide-y divide-gray-100">
            {booking.extra_charges.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{c.description}</p>
                  <p className="text-xs text-gray-400">{formatKsh(c.amount)}</p>
                </div>
                <Pill status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payout / commission */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-[#1a1a1a] mb-1">Payout & commission</h2>
        <p className="text-xs text-gray-400 mb-4">Vendor is on the {booking.listing.vendor.plan === 'plus' ? 'Plus' : 'Standard'} plan — {commissionRate}% commission.</p>

        {!vendorLeg && !commissionLeg ? (
          <p className="text-sm text-gray-400">No payout triggered yet — this fires once the trip is marked completed.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {vendorLeg && (
              <div className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Vendor payout</p>
                  <Pill status={vendorLeg.status} />
                </div>
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">{formatKsh(vendorLeg.amount)}</p>
                <p className="text-xs text-gray-400">To: {vendorLeg.destination ?? '—'}</p>
                {vendorLeg.reference && <p className="text-xs text-gray-400">Ref: {vendorLeg.reference}</p>}
                {vendorLeg.status === 'paid' && <p className="text-xs text-gray-400">Settled {formatDateTime(vendorLeg.paid_at)}</p>}
                {vendorLeg.failure_reason && <p className="text-xs text-red-500 mt-1">{vendorLeg.failure_reason}</p>}
              </div>
            )}
            {commissionLeg && (
              <div className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Erranza commission</p>
                  <Pill status={commissionLeg.status} />
                </div>
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">{formatKsh(commissionLeg.amount)}</p>
                <p className="text-xs text-gray-400">To: {commissionLeg.destination ?? '—'}</p>
                {commissionLeg.status === 'paid' && <p className="text-xs text-gray-400">Settled {formatDateTime(commissionLeg.paid_at)}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
