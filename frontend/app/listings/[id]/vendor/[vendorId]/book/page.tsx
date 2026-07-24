'use client'
import { use, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, X, ChevronRight, ChevronLeft, Shield, Star } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type Props = {
  params: Promise<{ id: string; vendorId: string }>
}

// 3 steps: review → message → confirm & pay
type Step = 'review' | 'message' | 'confirm'
const STEPS: Step[] = ['review', 'message', 'confirm']

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80'
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type ApiListingDetail = {
  id: number
  title: string
  price: string
  images: { url: string }[]
  reviews_count: number
  reviews_avg_rating: string | null
  min_guests: number | null
  max_guests: number | null
  min_lead_time_days: number | null
  vendor: { business_name: string }
}

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDisplayDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function DateMonthGrid({ year, month, selected, minDate, onSelect }: {
  year: number; month: number; selected: Date | null; minDate: Date; onSelect: (d: Date) => void
}) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const isDisabled = (d: number) => new Date(year, month, d) < minDate
  const isSelected = (d: number) => selected?.toDateString() === new Date(year, month, d).toDateString()

  return (
    <div>
      <p className="text-center font-bold text-[#1a1a1a] mb-3" style={{ fontSize: 15 }}>{MONTHS[month]} {year}</p>
      <div className="grid grid-cols-7 mb-1">
        {WDAYS.map((d, i) => (
          <div key={i} className="text-center py-1" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7" style={{ rowGap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const disabled = isDisabled(d)
          const selectedDay = isSelected(d)
          return (
            <div key={i} style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button
                disabled={disabled}
                onClick={() => !disabled && onSelect(new Date(year, month, d))}
                style={{
                  width: 44, height: 44, borderRadius: '50%', border: 'none', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  fontWeight: selectedDay ? 700 : 400,
                  background: selectedDay ? '#1a1a1a' : 'transparent',
                  color: selectedDay ? '#fff' : disabled ? '#d1d5db' : '#1a1a1a',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {d}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DateCalendar({ selected, minDate, onSelect }: {
  selected: Date | null; minDate: Date; onSelect: (d: Date) => void
}) {
  const start = selected ?? minDate
  const [year, setYear] = useState(start.getFullYear())
  const [month, setMonth] = useState(start.getMonth())
  function goBack() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function goFwd() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={goBack} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ border: 'none', background: '#f5f5f5', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
          <ChevronLeft size={16} color="#1a1a1a" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>{MONTHS[month]} {year}</span>
        <button onClick={goFwd} className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ border: 'none', background: '#f5f5f5', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
          <ChevronRight size={16} color="#1a1a1a" />
        </button>
      </div>
      <DateMonthGrid year={year} month={month} selected={selected} minDate={minDate} onSelect={onSelect} />
    </div>
  )
}

export default function BookingPage({ params }: Props) {
  const { id, vendorId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()

  const dateParam = searchParams.get('date')

  const [listing, setListing] = useState<ApiListingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [step, setStep] = useState<Step>('review')
  const [payMode, setPayMode] = useState<'full' | 'instalments'>('full')
  const [message, setMessage] = useState('')
  const [insurance, setInsurance] = useState(false)
  const [guests, setGuests] = useState(() => Number(searchParams.get('guests')) || 1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(dateParam ? new Date(dateParam) : null)
  const [showDateSheet, setShowDateSheet] = useState(false)
  const [sheetDate, setSheetDate] = useState<Date | null>(selectedDate)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useState(() => {
    apiFetch<{ listing: ApiListingDetail }>(`/listings/${vendorId}`)
      .then(({ listing }) => setListing(listing))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound || !listing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-white">
        <span className="text-5xl">🔍</span>
        <p className="text-gray-500 text-sm">Booking not found</p>
        <button onClick={() => router.back()}
          className="text-sm font-semibold underline text-[#2c4a1e]">
          Go back
        </button>
      </div>
    )
  }

  const minDate = (() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    if (listing.min_lead_time_days) d.setDate(d.getDate() + listing.min_lead_time_days)
    return d
  })()

  const stepIndex = STEPS.indexOf(step)
  const basePrice = Math.round(Number(listing.price))
  const totalPrice = basePrice * guests
  const insurancePrice = totalPrice * 0.12
  const finalTotal = insurance ? totalPrice + insurancePrice : totalPrice
  const tourImage = listing.images[0]?.url ?? FALLBACK_IMAGE
  const guideName = listing.vendor.business_name
  const rating = listing.reviews_avg_rating ? Number(listing.reviews_avg_rating).toFixed(2) : '4.50'
  const dateReady = !!selectedDate

  async function goNext() {
    if (step === 'review') { setStep('message'); return }
    if (step === 'message') { setStep('confirm'); return }
    if (step === 'confirm') {
      if (!selectedDate) {
        setSubmitError('Please select a tour date first.')
        return
      }

      setSubmitting(true)
      setSubmitError('')
      try {
        const { booking } = await apiFetch<{ booking: { id: number } }>('/bookings', {
          method: 'POST',
          body: JSON.stringify({
            listing_id: listing!.id,
            guests,
            check_in: toDateStr(selectedDate),
          }),
        })

        if (message.trim()) {
          await apiFetch(`/bookings/${booking.id}/messages`, {
            method: 'POST',
            body: JSON.stringify({ text: message.trim() }),
          })
        }

        router.push(`/listings/${id}/vendor/${vendorId}/book/success`)
      } catch (err) {
        setSubmitError(apiErrorMessage(err))
      } finally {
        setSubmitting(false)
      }
    }
  }

  function goBack() {
    if (step === 'review') router.back()
    if (step === 'message') setStep('review')
    if (step === 'confirm') setStep('message')
  }

  // ── Progress bar ──────────────────────────────────────────────────────
  const ProgressBar = () => (
    <div className="flex gap-2 px-5 py-3">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full transition-all duration-300
            ${i <= stepIndex ? 'bg-[#1a1a1a]' : 'bg-gray-200'}`}
        />
      ))}
    </div>
  )

  // ── Booking summary card (shared across steps) ────────────────────────
  const SummaryCard = ({ highlighted = false }: { highlighted?: boolean }) => (
    <div className={`rounded-2xl border p-4 mb-4
      ${highlighted ? 'border-blue-400 border-2' : 'border-gray-200'}`}>

      {/* Vendor thumbnail + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#e0d9cc]
                        flex-shrink-0">
          <Image
            src={tourImage} alt={guideName}
            fill sizes="56px" className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1a1a1a]">
            {guideName} | {listing.title}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={11} fill="#1a1a1a" color="#1a1a1a" />
            <span className="text-xs font-semibold text-[#1a1a1a]">{rating}</span>
            <span className="text-xs text-gray-400">({listing.reviews_count} reviews)</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">

        {/* Date */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Tour date</p>
            <p className="text-sm text-gray-500">
              {selectedDate ? formatDisplayDate(selectedDate) : 'Add a date'}
            </p>
          </div>
          <button
            onClick={() => { setSheetDate(selectedDate); setShowDateSheet(true) }}
            className="text-sm text-[#1a1a1a] font-semibold"
          >
            Change
          </button>
        </div>

        {/* Guests */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Guests</p>
            <p className="text-sm text-gray-500">{guests} adult{guests > 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGuests(g => Math.max(listing!.min_guests ?? 1, g - 1))}
              className="w-7 h-7 rounded-full border border-gray-300 text-sm
                         flex items-center justify-center hover:border-[#1a1a1a]"
            >−</button>
            <span className="text-sm font-semibold w-4 text-center">{guests}</span>
            <button
              onClick={() => setGuests(g => Math.min(listing!.max_guests ?? 20, g + 1))}
              className="w-7 h-7 rounded-full border border-gray-300 text-sm
                         flex items-center justify-center hover:border-[#1a1a1a]"
            >+</button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Total price</p>
            <p className="text-sm text-gray-500">
              Ksh {basePrice.toLocaleString()} × {guests} = Ksh {totalPrice.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Cancellation */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-sm font-semibold text-[#1a1a1a]">Free cancellation</p>
          <p className="text-sm text-gray-500">
            Cancel up to 3 days before your tour date for a full refund.{' '}
            <button className="font-bold text-[#1a1a1a] underline">Full policy</button>
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-lg mx-auto">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3
                      border-b border-gray-100 bg-white sticky top-0 z-40">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                     justify-center hover:bg-gray-50 transition-colors"
        >
          {step === 'review' ? <X size={16} color="#1a1a1a" /> : <ArrowLeft size={16} color="#1a1a1a" />}
        </button>

        <h1 className="text-[15px] font-semibold text-[#1a1a1a]">
          {step === 'review'  && 'Review and continue'}
          {step === 'message' && 'Message the guide'}
          {step === 'confirm' && 'Confirm and pay'}
        </h1>

        <button
          onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                     justify-center hover:bg-gray-50 transition-colors"
        >
          <X size={16} color="#1a1a1a" />
        </button>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-40">

        {/* ── STEP 1: Review ── */}
        {step === 'review' && (
          <>
            <SummaryCard />

            {!dateReady && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded-xl px-3 py-2 mb-4">
                Add your tour date to continue.
              </p>
            )}

            {/* How to pay */}
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#1a1a1a] mb-3">
                Choose how to pay
              </h2>
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <label className="flex items-center justify-between p-4 cursor-pointer
                                  hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">
                      Pay Ksh {totalPrice.toLocaleString()} now
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="pay"
                    checked={payMode === 'full'}
                    onChange={() => setPayMode('full')}
                    className="w-5 h-5 accent-[#1a1a1a]"
                  />
                </label>
                <div className="border-t border-gray-100" />
                <label className="flex items-center justify-between p-4 cursor-pointer
                                  hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">
                      Pay in 3 instalments
                    </p>
                    <p className="text-xs text-gray-400">
                      3 payments of Ksh {Math.round(totalPrice / 3).toLocaleString()} each ·{' '}
                      <button className="underline text-[#1a1a1a]">More info</button>
                    </p>
                  </div>
                  <input
                    type="radio"
                    name="pay"
                    checked={payMode === 'instalments'}
                    onChange={() => setPayMode('instalments')}
                    className="w-5 h-5 accent-[#1a1a1a]"
                  />
                </label>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: Message ── */}
        {step === 'message' && (
          <>
            <p className="text-sm text-gray-600 mb-2">
              Write a message to the guide/tour operator
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Before you can continue, let{' '}
              <span className="font-semibold text-[#1a1a1a]">{guideName}</span>{' '}
              know a little about your trip and why their guide is a good fit.
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi, I'm planning a trip to ${listing.title} and would love to...`}
              rows={6}
              className="w-full border border-gray-300 rounded-2xl p-4 text-sm
                         text-[#1a1a1a] placeholder:text-gray-400 outline-none resize-none
                         focus:border-[#1a1a1a] transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {message.length} characters
            </p>
          </>
        )}

        {/* ── STEP 3: Confirm & Pay ── */}
        {step === 'confirm' && (
          <>
            <SummaryCard highlighted />

            {submitError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {submitError}
              </div>
            )}

            {/* How you'll pay */}
            <button className="w-full flex items-center justify-between p-4 border
                               border-gray-200 rounded-2xl mb-3 hover:bg-gray-50 transition-colors">
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1a1a1a]">How you'll pay</p>
                <p className="text-sm text-gray-400">
                  {payMode === 'full'
                    ? `Ksh ${totalPrice.toLocaleString()} now`
                    : `3 instalments of Ksh ${Math.round(totalPrice / 3).toLocaleString()}`}
                </p>
              </div>
              <ChevronRight size={16} color="#aaa" />
            </button>

            {/* Payment method */}
            <button className="w-full flex items-center justify-between p-4 border
                               border-gray-200 rounded-2xl mb-5 hover:bg-gray-50 transition-colors">
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1a1a1a]">Payment method</p>
                <p className="text-sm text-gray-400">Credit or Debit Card</p>
              </div>
              <ChevronRight size={16} color="#aaa" />
            </button>

            {/* Travel insurance */}
            <div className="mb-5">
              <h2 className="text-sm font-bold text-[#1a1a1a] mb-3">
                Add safari/travel insurance?
              </h2>
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      Yes, add for Ksh {Math.round(insurancePrice).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">Only available when booking.</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Get up to 100% of the cost back if you cancel for covered reasons,
                      plus coverage for flights and activities.{' '}
                      <button className="font-semibold text-[#1a1a1a] underline">
                        What's covered
                      </button>
                    </p>
                  </div>
                  <button
                    onClick={() => setInsurance(i => !i)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold border
                                transition-all flex-shrink-0
                      ${insurance
                        ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                        : 'bg-white text-[#1a1a1a] border-gray-300'}`}
                  >
                    {insurance ? 'Added ✓' : 'Add'}
                  </button>
                </div>
              </div>
            </div>

            {/* Price details */}
            <div className="mb-5">
              <h2 className="text-sm font-bold text-[#1a1a1a] mb-3">Price details</h2>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {guests} {guests === 1 ? 'person' : 'people'} × Ksh {basePrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-[#1a1a1a]">Ksh {totalPrice.toLocaleString()}</span>
                </div>
                {insurance && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Travel insurance</span>
                    <span className="text-sm text-[#1a1a1a]">
                      +Ksh {Math.round(insurancePrice).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#1a1a1a]">Total</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">
                    Ksh {Math.round(finalTotal).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 mb-5 p-3 bg-gray-50 rounded-xl">
              <Shield size={16} color="#2c4a1e" />
              <p className="text-xs text-gray-500">
                🔒 To help protect your payment, always book through Erranza.
              </p>
            </div>
          </>
        )}

      </div>

      {/* ── PROGRESS + NEXT BUTTON ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100
                      max-w-lg mx-auto">
        <ProgressBar />
        <div className="px-5 pb-8 pt-2">
          {step === 'confirm' ? (
            <>
              <button
                onClick={goNext}
                disabled={submitting || !dateReady}
                className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold
                           text-base hover:bg-[#333] transition-colors active:scale-[0.99]
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Booking…' : 'Pay with Credit card'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                By selecting the button, I agree to the{' '}
                <button className="text-[#1a1a1a] underline">booking terms</button>
                {' '}and{' '}
                <button className="text-[#1a1a1a] underline">Terms of Service</button>.
                View{' '}
                <button className="text-[#1a1a1a] underline">Privacy Policy</button>.
              </p>
            </>
          ) : (
            <button
              onClick={goNext}
              disabled={step === 'message' && message.trim().length < 10}
              className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold
                         text-base hover:bg-[#333] transition-colors active:scale-[0.99]
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* ── DATE CHANGE SHEET ── */}
      {showDateSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => e.target === e.currentTarget && setShowDateSheet(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#1a1a1a]">Choose a tour date</h2>
              <button onClick={() => setShowDateSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="#1a1a1a" />
              </button>
            </div>
            {listing.min_lead_time_days ? (
              <p className="text-xs text-gray-400 mb-4">
                This tour requires at least {listing.min_lead_time_days} days' notice.
              </p>
            ) : null}
            <div className="overflow-y-auto flex-1">
              <DateCalendar selected={sheetDate} minDate={minDate} onSelect={setSheetDate} />
            </div>
            <div className="flex items-center justify-between pt-4 mt-2" style={{ borderTop: '1px solid #f0ede8' }}>
              <button onClick={() => setSheetDate(null)}
                className="text-sm font-semibold text-[#1a1a1a] underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear date
              </button>
              <button onClick={() => { setSelectedDate(sheetDate); setShowDateSheet(false) }}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: '#1a1a1a', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
