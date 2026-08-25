'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type Props = { params: Promise<{ bookingId: string }> }

type ApiBookingDetail = {
  id: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  guests: number
  total: string
  check_in: string | null
  check_out: string | null
  special_requests: string | null
  company_name: string | null
  billing_email: string | null
  created_by_admin: boolean
  listing: { id: number; title: string; vendor: { id: number; business_name: string } }
  traveller: { id: number; name: string; email: string; phone: string | null }
  payments: { id: number; status: string; amount: string; paid_at: string | null }[]
}

const STATUSES: ApiBookingDetail['status'][] = ['pending', 'confirmed', 'completed', 'cancelled']

function toDateInput(v: string | null) {
  return v ? v.slice(0, 10) : ''
}

export default function AdminBookingDetailPage({ params }: Props) {
  const { bookingId } = use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<ApiBookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [status, setStatus] = useState<ApiBookingDetail['status']>('pending')
  const [guests, setGuests] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [total, setTotal] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  useEffect(() => {
    apiFetch<{ booking: ApiBookingDetail }>(`/admin/bookings/${bookingId}`)
      .then(({ booking }) => {
        setBooking(booking)
        setStatus(booking.status)
        setGuests(String(booking.guests))
        setCheckIn(toDateInput(booking.check_in))
        setCheckOut(toDateInput(booking.check_out))
        setTotal(booking.total)
        setSpecialRequests(booking.special_requests ?? '')
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [bookingId])

  async function save() {
    setSaving(true)
    setError('')
    try {
      const { booking: updated } = await apiFetch<{ booking: ApiBookingDetail }>(`/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          guests: Number(guests),
          check_in: checkIn || null,
          check_out: checkOut || null,
          total: Number(total),
          special_requests: specialRequests.trim() || null,
        }),
      })
      setBooking(updated)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" /></div>
  }
  if (!booking) {
    return <div className="p-8 text-center text-sm text-gray-500">{error || 'Booking not found.'}</div>
  }

  return (
    <div className="p-5 lg:p-8 max-w-lg mx-auto">
      <button onClick={() => router.push('/admin/bookings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to bookings
      </button>

      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">{booking.listing.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{booking.listing.vendor.business_name}</p>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <p className="text-xs text-gray-400 mb-1">Traveller</p>
        <p className="text-sm font-semibold text-[#1a1a1a]">{booking.traveller.name} — {booking.traveller.email}</p>
        {booking.company_name && <p className="text-xs text-gray-500 mt-1">Company: {booking.company_name}</p>}
        <p className="text-xs text-gray-400 mt-3 mb-1">Payment</p>
        {booking.payments.map((p) => (
          <p key={p.id} className="text-sm text-[#1a1a1a] capitalize">
            {p.status} — Ksh {Number(p.amount).toLocaleString()} {p.paid_at && `(${new Date(p.paid_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})`}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Status</label>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border capitalize transition-all
                  ${status === s ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Guests</label>
            <input value={guests} onChange={(e) => setGuests(e.target.value)} type="number" min="1"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Total (Ksh)</label>
            <input value={total} onChange={(e) => setTotal(e.target.value)} type="number" min="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Check-in</label>
            <input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Check-out</label>
            <input value={checkOut} onChange={(e) => setCheckOut(e.target.value)} type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Special requests</label>
          <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] resize-none" />
        </div>

        <button onClick={save} disabled={saving}
          className="bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#3d6b28] disabled:opacity-50">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
