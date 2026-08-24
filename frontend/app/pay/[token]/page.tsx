'use client'
import { use, useEffect, useState } from 'react'
import Image from 'next/image'
import { apiFetch, apiErrorMessage } from '@/lib/api'
// Paystack script
import Script from 'next/script'

type Props = { params: Promise<{ token: string }> }

type BookingSummary = {
  listing_title: string
  listing_image: string | null
  guests: number
  check_in: string | null
  check_out: string | null
  total: string
  paid: boolean
  expires_at: string | null
  expired: boolean
}

export default function PayBookingPage({ params }: Props) {
  const { token } = use(params)
  const [booking, setBooking] = useState<BookingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [phone, setPhone] = useState('')
  const [paying, setPaying] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [paid, setPaid] = useState(false)
  // Payment toggle - Company payment
  const [payMethod, setPayMethod] = useState<'mpesa' | 'card'>('mpesa')


  useEffect(() => {
    apiFetch<BookingSummary>(`/public/bookings/${token}`)
      .then((b) => { setBooking(b); setPaid(b.paid) })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [token])

  async function pay() {
    if (!phone.trim()) return
    setPaying(true)
    setError('')
    try {
      const { checkout_request_id } = await apiFetch<{ checkout_request_id: string }>(`/public/bookings/${token}/pay`, {
        method: 'POST',
        body: JSON.stringify({ phone: phone.trim() }),
      })
      setWaiting(true)

      const deadline = Date.now() + 45000
      const poll = async (): Promise<void> => {
        if (Date.now() > deadline) throw new Error('This is taking longer than expected. Try again if you were not charged.')
        const result = await apiFetch<{ status: string }>(`/public/bookings/${token}/status/${checkout_request_id}`)
        if (result.status === 'paid') { setPaid(true); return }
        await new Promise(r => setTimeout(r, 2000))
        return poll()
      }
      await poll()
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setPaying(false)
      setWaiting(false)
    }
  }

  // Organization  - pay with card
  async function payWithCard() {
    setPaying(true)
    setError('')
    try {
      const { reference, amount, email } = await apiFetch<{ reference: string; amount: number; email: string }>(
        `/public/bookings/${token}/pay-card/initialize`, { method: 'POST' }
      )

      const PaystackPop = (window as any).PaystackPop
      if (!PaystackPop) {
        setError('Payment could not start — please refresh and try again.')
        setPaying(false)
        return
      }

      const handler = PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email, amount, currency: 'KES', channels: ['card'], ref: reference,
        callback: (response: { reference: string }) => {
          apiFetch(`/public/bookings/${token}/pay-card/verify`, {
            method: 'POST',
            body: JSON.stringify({ reference: response.reference }),
          })
            .then(() => setPaid(true))
            .catch((err) => setError(apiErrorMessage(err)))
            .finally(() => setPaying(false))
        },
        onClose: () => setPaying(false),
      })
      handler.openIframe()
    } catch (err) {
      setError(apiErrorMessage(err))
      setPaying(false)
    }
  }


  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" /></div>
  }

  if (!booking) {
    return <div className="p-8 max-w-md mx-auto text-center pt-20 text-sm text-gray-500">{error || 'Invoice not found.'}</div>
  }

  return (
    <div className="p-5 max-w-md mx-auto pt-10">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Erranza</h1>
      <p className="text-sm text-gray-500 mb-6">Complete your trip payment</p>

      <div className="relative rounded-2xl overflow-hidden border border-[#e0d9cc] shadow-sm mb-5" style={{ height: 220 }}>
        {booking.listing_image && (
          <Image src={booking.listing_image} alt={booking.listing_title} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-white text-lg font-bold">{booking.listing_title}</p>
          <p className="text-white/80 text-sm mt-0.5">
            {booking.guests} guest{booking.guests > 1 ? 's' : ''}
            {booking.check_in && ` · ${new Date(booking.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}${booking.check_out ? ` – ${new Date(booking.check_out).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}`}
          </p>
        </div>
      </div>
      <div className="text-center mb-5">
        <p className="text-2xl font-bold text-[#2c4a1e]">Ksh {Number(booking.total).toLocaleString()}</p>
        <p className="text-xs text-gray-400">Amount due</p>
      </div>

      {!paid && booking.expires_at && !booking.expired && (
        <p className="text-xs text-amber-700 text-center mb-4">
          This invoice expires on {new Date(booking.expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} — please pay before then.
        </p>
      )}

      {paid ? (
        <div className="bg-white rounded-2xl border border-[#2c4a1e] overflow-hidden">
          <div className="bg-[#eaf5e4] px-5 py-4 text-center">
            <p className="text-base font-bold text-[#2c4a1e]">Payment received ✓</p>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-600 mb-1">{booking.listing_title}</p>
            {booking.check_in && (
              <p className="text-sm text-gray-500 mb-3">
                {new Date(booking.check_in).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {booking.check_out && ` – ${new Date(booking.check_out).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
              </p>
            )}
            <p className="text-lg font-bold text-[#1a1a1a] mb-3">Ksh {Number(booking.total).toLocaleString()} paid</p>
            <p className="text-xs text-gray-400">
              Save this link — you can return to it anytime as proof of payment. We'll be in touch with your booking confirmation shortly.
            </p>
          </div>
        </div>
      ) : booking.expired ? (
        <div className="px-4 py-4 rounded-xl bg-red-50 border border-red-200 text-center">
          <p className="text-sm font-semibold text-red-600">This invoice has expired</p>
          <p className="text-xs text-red-500 mt-1">Please contact us for a new payment link.</p>
        </div>
      ) : (

        <>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setPayMethod('mpesa')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${payMethod === 'mpesa' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200 text-[#1a1a1a]'}`}>
              M-Pesa
            </button>
            <button onClick={() => setPayMethod('card')}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold border ${payMethod === 'card' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200 text-[#1a1a1a]'}`}>
              Card
            </button>
          </div>
          {payMethod === 'mpesa' ? (
            <>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="M-Pesa number, e.g. 0712345678"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-3
                         outline-none focus:border-[#2c4a1e] transition-colors" />
              <button onClick={pay} disabled={paying}
                className="w-full bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#3d6b28] disabled:opacity-50">
                {paying ? 'Starting…' : 'Pay with M-Pesa'}
              </button>
            </>
          ) : (
            <button onClick={payWithCard} disabled={paying}
              className="w-full bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#3d6b28] disabled:opacity-50">
              {paying ? 'Starting…' : 'Pay with card'}
            </button>
          )}
        </>
      )}
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />
    </div>
  )
}
