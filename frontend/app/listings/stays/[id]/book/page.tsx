'use client'
// src/app/listings/stays/[id]/book/page.tsx

import { use, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, X, ChevronRight, Shield, Star, ChevronLeft } from 'lucide-react'
import { stays } from '@/data/stays'

type Props = { params: Promise<{ id: string }> }
type Step = 'review' | 'message' | 'confirm'
const STEPS: Step[] = ['review', 'message', 'confirm']

const STAY_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80',
  '2': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&q=80',
  '3': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function BookMonthGrid({ year, month, checkIn, checkOut, onSelect }: {
  year: number; month: number; checkIn: Date | null; checkOut: Date | null; onSelect: (d: Date) => void
}) {
  const today = new Date()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isPast = (d: number) => new Date(year, month, d) < todayMid
  const isStart = (d: number) => checkIn?.toDateString() === new Date(year, month, d).toDateString()
  const isEnd = (d: number) => checkOut?.toDateString() === new Date(year, month, d).toDateString()
  const isInRange = (d: number) => { if (!checkIn || !checkOut) return false; const date = new Date(year, month, d); return date > checkIn && date < checkOut }
  const stripBg = '#e8f0d4'
  return (
    <div>
      <p className="text-center font-bold text-[#1a1a1a] mb-3" style={{ fontSize: 15 }}>{MONTHS[month]} {year}</p>
      <div className="grid grid-cols-7 mb-1">
        {WDAYS.map((d, i) => <div key={i} className="text-center py-1" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7" style={{ rowGap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const past = isPast(d), start = isStart(d), end = isEnd(d), inRange = isInRange(d)
          const hasRange = !!(checkIn && checkOut)
          const inStrip = hasRange && (inRange || start || end)
          const col = i % 7
          const prevInStrip = d > 1 && hasRange && (() => { const p = new Date(year, month, d - 1); return p >= checkIn! && p <= checkOut! })()
          const nextInStrip = hasRange && (() => { const n = new Date(year, month, d + 1); if (n.getMonth() !== month) return false; return n >= checkIn! && n <= checkOut! })()
          const roundLeft = inStrip && (!prevInStrip || col === 0)
          const roundRight = inStrip && (!nextInStrip || col === 6)
          return (
            <div key={i} style={{
              height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: inStrip ? stripBg : 'transparent',
              borderRadius: inStrip ? `${roundLeft ? 22 : 0}px ${roundRight ? 22 : 0}px ${roundRight ? 22 : 0}px ${roundLeft ? 22 : 0}px` : 0,
              ...(start && !end && hasRange ? { background: `linear-gradient(to right, transparent 50%, ${stripBg} 50%)`, borderRadius: 0 } : {}),
              ...(end && !start && hasRange ? { background: `linear-gradient(to left, transparent 50%, ${stripBg} 50%)`, borderRadius: 0 } : {}),
              ...(start && end ? { background: 'transparent', borderRadius: 0 } : {}),
            }}>
              <button disabled={past} onClick={() => !past && onSelect(new Date(year, month, d))}
                style={{
                  width: 44, height: 44, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: start || end ? 700 : 400, background: start || end ? '#1a1a1a' : 'transparent',
                  color: start || end ? '#fff' : past ? '#d1d5db' : '#1a1a1a', cursor: past ? 'not-allowed' : 'pointer',
                  flexShrink: 0, WebkitTapHighlightColor: 'transparent', position: 'relative', zIndex: 1
                }}>
                {d}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BookCalendar({ checkIn, checkOut, onSelect }: {
  checkIn: Date | null; checkOut: Date | null; onSelect: (d: Date) => void
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const nextMonth = month === 11 ? 0 : month + 1
  const nextYear = month === 11 ? year + 1 : year
  function goBack() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function goFwd() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div>
      {/* Mobile: single month */}
      <div className="sm:hidden">
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
        <BookMonthGrid year={year} month={month} checkIn={checkIn} checkOut={checkOut} onSelect={onSelect} />
      </div>

      {/* Desktop/tablet: two months side by side */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goBack} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ border: 'none', background: '#f5f5f5', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            <ChevronLeft size={16} color="#1a1a1a" />
          </button>
          <button onClick={goFwd} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ border: 'none', background: '#f5f5f5', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            <ChevronRight size={16} color="#1a1a1a" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <BookMonthGrid year={year} month={month} checkIn={checkIn} checkOut={checkOut} onSelect={onSelect} />
          <BookMonthGrid year={nextYear} month={nextMonth} checkIn={checkIn} checkOut={checkOut} onSelect={onSelect} />
        </div>
      </div>
    </div>
  )
}



export default function StayBookingPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const checkInParam = searchParams.get('checkIn')
  const checkOutParam = searchParams.get('checkOut')
  const checkIn = checkInParam ? new Date(checkInParam) : null
  const checkOut = checkOutParam ? new Date(checkOutParam) : null

  function fmtDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function fmtDateRange(ci: Date, co: Date) {
    const sameYear = ci.getFullYear() === co.getFullYear()
    const sameMonth = sameYear && ci.getMonth() === co.getMonth()
    if (sameMonth) return `${ci.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${co.getDate()}, ${co.getFullYear()}`
    if (sameYear) return `${ci.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${co.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${co.getFullYear()}`
    return `${fmtDate(ci)} – ${fmtDate(co)}`
  }

  const [localCheckIn, setLocalCheckIn] = useState<Date | null>(checkIn)
  const [localCheckOut, setLocalCheckOut] = useState<Date | null>(checkOut)
  const [showDateSheet, setShowDateSheet] = useState(false)
  const [showGuestSheet, setShowGuestSheet] = useState(false)
  const [showPriceSheet, setShowPriceSheet] = useState(false)
  const [sheetCI, setSheetCI] = useState<Date | null>(checkIn)
  const [sheetCO, setSheetCO] = useState<Date | null>(checkOut)
  const [sheetField, setSheetField] = useState<'checkin' | 'checkout'>('checkin')
  const [sheetAdults, setSheetAdults] = useState(1)
  const [sheetChildren, setSheetChildren] = useState(0)
  const [sheetInfants, setSheetInfants] = useState(0)
  const [sheetPets, setSheetPets] = useState(0)
  {/* fUll Policy Opens modal */ }
  const [showPolicySheet, setShowPolicySheet] = useState(false)
  const stay = stays.find(s => s.id === id)

  const [step, setStep] = useState<Step>('review')
  const [payMode, setPayMode] = useState<'full' | 'instalments'>('full')
  const [message, setMessage] = useState('')
  const [insurance, setInsurance] = useState(false)
  const [guests, setGuests] = useState(1)
  const dateDiff = (localCheckIn && localCheckOut) ? Math.max(1, Math.round((localCheckOut.getTime() - localCheckIn.getTime()) / 86400000)) : null
  const [nights, setNights] = useState(2)
  const effectiveNights = dateDiff ?? nights


  if (!stay) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <span className="text-5xl">🔍</span>
        <p className="text-gray-500 text-sm">Stay not found</p>
        <button onClick={() => router.back()}
          className="text-sm font-semibold underline text-[#2c4a1e]">Go back</button>
      </div>
    )
  }

  const stepIndex = STEPS.indexOf(step)
  const priceNum = parseInt(stay.price.replace(/[^0-9]/g, '')) || 8500
  const total = priceNum * effectiveNights * guests
  const fee = Math.round(total * 0.12)
  const weeklyDiscount = effectiveNights >= 7 ? Math.round(total * 0.02) : 0
  const insureFee = Math.round(total * 0.08)
  const grandTotal = total + fee + (insurance ? insureFee : 0)
  const stayImage = STAY_IMAGES[id] ?? stay.image

  function goNext() {
    if (step === 'review') { setStep('message'); return }
    if (step === 'message') { setStep('confirm'); return }
    if (step === 'confirm') {
      router.push(`/listings/stays/${id}/book/success`)
    }
  }
  function goBack() {
    if (step === 'review') { router.back(); return }
    if (step === 'message') { setStep('review'); return }
    if (step === 'confirm') { setStep('message'); return }
  }

  function handleSheetCalSelect(date: Date) {
    if (sheetField === 'checkin' || !sheetCI || (sheetCI && sheetCO)) {
      setSheetCI(date); setSheetCO(null); setSheetField('checkout')
    } else if (date <= sheetCI) {
      setSheetCI(date); setSheetCO(null); setSheetField('checkout')
    } else {
      setSheetCO(date); setSheetField('checkin')
    }
  }


  // ── Summary card ───────────────────────────────────────────────────────
  const SummaryCard = ({ highlighted = false }: { highlighted?: boolean }) => (
    <div className={`rounded-2xl border p-4 mb-4 ${highlighted ? 'border-2 border-[#304333]' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#e0d9cc] flex-shrink-0">
          <Image src={stayImage} alt={stay.title} fill sizes="80px" className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1a1a1a] leading-snug">{stay.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={11} fill="#1a1a1a" color="#1a1a1a" />
            <span className="text-xs font-semibold text-[#1a1a1a]">{stay.rating}</span>
            <span className="text-xs text-gray-400">(89 reviews)</span>
          </div>
        </div>
      </div>

      {/* Free cancellation — desktop: below image */}
      <div className="hidden sm:block py-3" style={{ borderTop: '1px solid #f0ede8', borderBottom: '1px solid #f0ede8', marginBottom: 0 }}>
        <p className="text-sm font-semibold text-[#1a1a1a]">Free cancellation</p>
        <p className="text-sm text-gray-500">Cancel before check-in for a full refund.{' '}
          <button onClick={() => setShowPolicySheet(true)} className="font-bold text-[#1a1a1a] underline"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
            Full policy
          </button>
        </p>
      </div>

      <div style={{ borderTop: '1px solid #f0ede8' }}>
        {/* Dates */}
        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #f0ede8' }}>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Dates</p>
            <p className="text-sm text-gray-500">
              {localCheckIn && localCheckOut ? fmtDateRange(localCheckIn, localCheckOut) : 'Add dates'}
            </p>
          </div>
          <button onClick={() => { setSheetCI(localCheckIn); setSheetCO(localCheckOut); setSheetField('checkin'); setShowDateSheet(true) }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#304333]"
            style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Change
          </button>
        </div>

        {/* Guests */}
        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #f0ede8' }}>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Guests</p>
            <p className="text-sm text-gray-500">{sheetAdults} adult{sheetAdults > 1 ? 's' : ''}{sheetChildren > 0 ? `, ${sheetChildren} child${sheetChildren > 1 ? 'ren' : ''}` : ''}</p>
          </div>
          <button onClick={() => setShowGuestSheet(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#304333]"
            style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Change
          </button>
        </div>

        {/* Price details — desktop only */}
        <div className="hidden sm:block py-3" style={{ borderBottom: '1px solid #f0ede8' }}>
          <p className="text-sm font-bold text-[#1a1a1a] mb-2">Price details</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{effectiveNights} night{effectiveNights !== 1 ? 's' : ''} × {stay.price}</span>
              <span className="text-[#1a1a1a]">Ksh {total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Erranza service fee</span>
              <span className="text-[#1a1a1a]">Ksh {fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 mt-1" style={{ borderTop: '1px solid #f0ede8' }}>
              <span className="font-bold text-[#1a1a1a]">Total KES</span>
              <span className="font-bold text-[#1a1a1a]">Ksh {(total + fee).toLocaleString()}</span>
            </div>
            <button onClick={() => setShowPriceSheet(true)} className="text-sm text-[#1a1a1a] underline text-left mt-0.5"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              Price breakdown
            </button>
          </div>
        </div>

        {/* Total price — mobile only */}
        <div className="flex items-center justify-between py-3 sm:hidden" style={{ borderBottom: '1px solid #f0ede8' }}>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Total price</p>
            <p className="text-sm text-gray-500">Ksh {(total + fee).toLocaleString()}</p>
          </div>
          <button onClick={() => setShowPriceSheet(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#304333]"
            style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Details
          </button>
        </div>

        {/* Free cancellation — mobile: below total price */}
        <div className="pt-3 sm:hidden">
          <p className="text-sm font-semibold text-[#1a1a1a]">Free cancellation</p>
          <p className="text-sm text-gray-500">Cancel before check-in for a full refund.{' '}
            <button onClick={() => setShowPolicySheet(true)} className="font-bold text-[#1a1a1a] underline"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
              Full policy
            </button>
          </p>
        </div>

        {showPolicySheet && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={e => e.target === e.currentTarget && setShowPolicySheet(false)}>
            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5 pb-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <h2 className="text-base font-semibold text-[#1a1a1a]">Cancellation policy</h2>
                <button onClick={() => setShowPolicySheet(false)} className="w-8 h-8 flex items-center justify-center rounded-full"
                  style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>
                  <X size={16} color="#1a1a1a" />
                </button>
              </div>
              <div className="flex gap-8 py-5" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Before</p>
                  {localCheckIn ? (
                    <>
                      <p className="text-sm text-[#1a1a1a]">{localCheckIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      <p className="text-sm text-[#1a1a1a]">3:00 PM</p>
                    </>
                  ) : <p className="text-sm text-[#1a1a1a]">Check-in</p>}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">Full refund</p>
                  <p className="text-sm text-gray-500">Get back 100% of what you paid.</p>
                </div>
              </div>
              <div className="flex gap-8 py-5" style={{ borderBottom: '1px solid #f0f0f0' }}>
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">After that</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">Partial refund</p>
                  <p className="text-sm text-gray-500">Get back every night but the first one. No refund of the first night or the service fee.</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">Time shown is based on the location of the listing.</p>
              <p className="text-sm font-semibold text-[#1a1a1a] mt-4 mb-1">Refund eligibility</p>
              <p className="text-sm text-gray-500 mb-4">If you're making scheduled payments, your refund or amount due will depend on how much you've paid at the time of cancellation.</p>
              <button className="text-sm text-[#1a1a1a] underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
                How to find any cancellation policy
              </button>
            </div>
          </div>
        )}


      </div>
    </div>
  )


  return (
    <div className="flex flex-col min-h-screen bg-white max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3
                      border-b border-gray-100 sticky top-0 bg-white z-40">
        <button
          onClick={goBack}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                     justify-center hover:bg-gray-50"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <ArrowLeft size={16} color="#1a1a1a" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#1a1a1a]">
          {step === 'review' && 'Review your trip'}
          {step === 'message' && 'Message the host'}
          {step === 'confirm' && 'Confirm and pay'}
        </h1>
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center
                     justify-center hover:bg-gray-50"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <X size={16} color="#1a1a1a" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-40">

        {/* STEP 1 — Review */}
        {step === 'review' && (
          <>
            <SummaryCard />
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#1a1a1a] mb-3">Choose how to pay</h2>
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <label className="flex items-center justify-between p-4 cursor-pointer
                                  hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">
                      Pay Ksh {total.toLocaleString()} now
                    </p>
                  </div>
                  <input type="radio" name="pay" checked={payMode === 'full'}
                    onChange={() => setPayMode('full')}
                    className="w-5 h-5 accent-[#1a1a1a]" />
                </label>
                <div className="border-t border-gray-100" />
                <label className="flex items-center justify-between p-4 cursor-pointer
                                  hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">Pay in 3 instalments</p>
                    <p className="text-xs text-gray-400">
                      3 payments of Ksh {Math.round(total / 3).toLocaleString()} each
                    </p>
                  </div>
                  <input type="radio" name="pay" checked={payMode === 'instalments'}
                    onChange={() => setPayMode('instalments')}
                    className="w-5 h-5 accent-[#1a1a1a]" />
                </label>
              </div>
            </div>
          </>
        )}

        {/* STEP 2 — Message */}
        {step === 'message' && (
          <>
            <p className="text-lg font-bold text-[#1a1a1a] mb-2">
              Write a message to the host
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Before you continue, let{' '}
              <span className="font-semibold text-[#1a1a1a]">
                {stays.find(s => s.id === id)?.title.split(' ').slice(0, 2).join(' ')}
              </span>{' '}
              know about your trip and why this stay is a great fit.
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Hi! I'm excited about staying at your place. I'm travelling to ${stay.location} and…`}
              rows={6}
              className="w-full border border-gray-300 rounded-2xl p-4 text-sm
                         text-[#1a1a1a] placeholder:text-gray-400 outline-none
                         focus:border-[#2c4a1e] transition-colors resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {message.length} characters
            </p>
          </>
        )}

        {/* STEP 3 — Confirm & Pay */}
        {step === 'confirm' && (
          <>
            <SummaryCard highlighted />

            {/* Payment method */}
            <button className="w-full flex items-center justify-between p-4 border
                               border-gray-200 rounded-2xl mb-3 hover:bg-gray-50
                               transition-colors text-left">
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">How you'll pay</p>
                <p className="text-sm text-gray-400">
                  {payMode === 'full'
                    ? `Ksh ${total.toLocaleString()} now`
                    : `3 × Ksh ${Math.round(total / 3).toLocaleString()}`}
                </p>
              </div>
              <ChevronRight size={16} color="#aaa" />
            </button>

            <button className="w-full flex items-center justify-between p-4 border
                               border-gray-200 rounded-2xl mb-5 hover:bg-gray-50
                               transition-colors text-left">
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">Payment method</p>
                <p className="text-sm text-gray-400">Credit or Debit Card</p>
              </div>
              <ChevronRight size={16} color="#aaa" />
            </button>

            {/* Travel insurance */}
            <div className="mb-5">
              <h2 className="text-sm font-bold text-[#1a1a1a] mb-3">
                Add travel insurance?
              </h2>
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      Yes, add for Ksh {insureFee.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">Only available when booking.</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Get up to 100% of the cost back if you cancel for covered reasons.{' '}
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
                    style={{ WebkitTapHighlightColor: 'transparent' }}
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
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 underline">
                    {stay.price} × {nights} night{nights !== 1 ? 's' : ''} × {guests} guest{guests !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[#1a1a1a]">Ksh {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 underline">Erranza service fee</span>
                  <span className="text-[#1a1a1a]">Ksh {fee.toLocaleString()}</span>
                </div>
                {insurance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Travel insurance</span>
                    <span className="text-[#1a1a1a]">Ksh {insureFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between">
                  <span className="text-sm font-bold text-[#1a1a1a]">Total (KES)</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">
                    Ksh {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust badge */}
            <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
              <Shield size={16} color="#2c4a1e" />
              <p className="text-xs text-gray-500">
                To protect your payment, always book through Erranza.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Progress + CTA */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white
                      border-t border-gray-100">
        {/* Progress bar */}
        <div className="flex gap-1.5 px-5 pt-3">
          {STEPS.map((s, i) => (
            <div key={s}
              className={`flex-1 h-1 rounded-full transition-all
                ${i <= stepIndex ? 'bg-[#2c4a1e]' : 'bg-gray-200'}`} />
          ))}
        </div>

        <div className="px-5 py-4 pb-8">
          {step === 'confirm' ? (
            <>
              <button
                onClick={goNext}
                className="w-full bg-[#2c4a1e] text-white py-4 rounded-2xl font-bold
                           text-sm hover:bg-[#3d6b28] transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Confirm and pay · Ksh {grandTotal.toLocaleString()}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                By tapping, I agree to the{' '}
                <button className="underline text-[#1a1a1a]">booking terms</button>
                {', '}
                <button className="underline text-[#1a1a1a]">Terms of Service</button>
                {' and '}
                <button className="underline text-[#1a1a1a]">Privacy Policy</button>.
              </p>
            </>
          ) : (
            <button
              onClick={goNext}
              disabled={step === 'message' && message.trim().length < 10}
              className="w-full bg-[#2c4a1e] text-white py-4 rounded-2xl font-bold
                         text-sm hover:bg-[#3d6b28] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Next
            </button>
          )}
        </div>
      </div>
      {/* Date change bottom sheet */}
      {showDateSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => e.target === e.currentTarget && setShowDateSheet(false)}>
          <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl p-6 h-[85vh] sm:h-auto sm:max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#1a1a1a]">Change dates</h2>
              <button onClick={() => setShowDateSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="#1a1a1a" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              <BookCalendar checkIn={sheetCI} checkOut={sheetCO} onSelect={handleSheetCalSelect} />
            </div>
            <div className="flex items-center justify-between pt-4 mt-2" style={{ borderTop: '1px solid #f0ede8' }}>
              <button onClick={() => { setSheetCI(null); setSheetCO(null); setSheetField('checkin') }}
                className="text-sm font-semibold text-[#1a1a1a] underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Clear dates
              </button>
              <button onClick={() => { setLocalCheckIn(sheetCI); setLocalCheckOut(sheetCO); setShowDateSheet(false) }}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: '#1a1a1a', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest change bottom sheet */}
      {showGuestSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => e.target === e.currentTarget && setShowGuestSheet(false)}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-[#1a1a1a]">Change guests</h2>
              <button onClick={() => setShowGuestSheet(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ background: '#f5f5f5', border: 'none', cursor: 'pointer' }}>
                <X size={16} color="#1a1a1a" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">This place has a maximum of 10 guests, not including infants. Pets aren't allowed.</p>
            {[
              { label: 'Adults', sub: 'Age 13+', count: sheetAdults, set: setSheetAdults, min: 1, max: 10 },
              { label: 'Children', sub: 'Ages 2–12', count: sheetChildren, set: setSheetChildren, min: 0, max: 10 - sheetAdults },
              { label: 'Infants', sub: 'Under 2', count: sheetInfants, set: setSheetInfants, min: 0, max: 5 },
              { label: 'Pets', sub: 'Bringing a service animal?', count: sheetPets, set: setSheetPets, min: 0, max: 5 },
            ].map(({ label, sub, count, set, min, max }) => (
              <div key={label} className="flex items-center justify-between py-4" style={{ borderBottom: '1px solid #f5f5f5' }}>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{label}</p>
                  <p className="text-sm text-gray-500">{sub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => set((c: number) => Math.max(min, c - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: '#f5f5f5', border: 'none', cursor: count <= min ? 'not-allowed' : 'pointer', opacity: count <= min ? 0.4 : 1, fontFamily: 'inherit', fontSize: 18, color: '#1a1a1a' }}>
                    −
                  </button>
                  <span className="text-sm font-semibold text-[#1a1a1a] w-4 text-center">{count}</span>
                  <button onClick={() => set((c: number) => Math.min(max, c + 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: '#f5f5f5', border: 'none', cursor: count >= max ? 'not-allowed' : 'pointer', opacity: count >= max ? 0.4 : 1, fontFamily: 'inherit', fontSize: 18, color: '#1a1a1a' }}>
                    +
                  </button>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 mt-2">
              <button onClick={() => setShowGuestSheet(false)}
                className="text-sm font-semibold text-[#1a1a1a] underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={() => setShowGuestSheet(false)}
                className="px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: '#1a1a1a', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price details bottom sheet */}
      {showPriceSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => e.target === e.currentTarget && setShowPriceSheet(false)}>
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">

            {/* Header — centered title, × on right */}
            <div className="flex items-center justify-between mb-6 pb-4" style={{ borderBottom: '1px solid #f0f0f0' }}>
              <div className="w-8" />
              <h2 className="text-base font-semibold text-[#1a1a1a]">Price breakdown</h2>
              <button onClick={() => setShowPriceSheet(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#1a1a1a',
                  lineHeight: 1, padding: '0 4px', fontFamily: 'inherit', width: 32
                }}>
                ×
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {/* Nights with date range */}
              <div className="flex justify-between text-sm">
                <span className="text-[#1a1a1a]">
                  {effectiveNights} night{effectiveNights !== 1 ? 's' : ''}
                  {localCheckIn && localCheckOut
                    ? ` · ${localCheckIn.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} – ${localCheckOut.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
                    : ''}
                </span>

                <span className="text-[#1a1a1a]">Ksh {total.toLocaleString()}</span>
              </div>

              {/* Service fee + VAT note on desktop */}
              <div className="flex justify-between text-sm items-start">
                <div>
                  <p className="text-[#1a1a1a]">Erranza service fee</p>
                  <p className="text-xs text-gray-400 hidden sm:block mt-0.5">This includes VAT.</p>
                </div>
                <span className="text-[#1a1a1a]">Ksh {fee.toLocaleString()}</span>
              </div>

              {/* Weekly discount — only shown if 7+ nights */}
              {weeklyDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#1a1a1a]">Weekly stay discount</span>
                  <span style={{ color: '#22c55e' }}>-Ksh {weeklyDiscount.toLocaleString()}</span>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between text-sm font-bold pt-4" style={{ borderTop: '1px solid #e8e8e8' }}>
                <span className="text-[#1a1a1a]">Total <span className="underline font-bold">KES</span></span>
                <span className="text-[#1a1a1a]">Ksh {(total + fee - weeklyDiscount).toLocaleString()}</span>
              </div>
            </div>

          </div>
        </div>
      )}


    </div>
  )
}