'use client'
// src/app/listings/stays/[id]/book/page.tsx

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, X, ChevronRight, Shield, Star } from 'lucide-react'
import { stays } from '@/data/stays'

type Props = { params: Promise<{ id: string }> }
type Step = 'review' | 'message' | 'confirm'
const STEPS: Step[] = ['review', 'message', 'confirm']

const STAY_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80',
  '2': 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&q=80',
  '3': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
}

export default function StayBookingPage({ params }: Props) {
  const { id }   = use(params)
  const router   = useRouter()
  const stay     = stays.find(s => s.id === id)

  const [step, setStep]           = useState<Step>('review')
  const [payMode, setPayMode]     = useState<'full' | 'instalments'>('full')
  const [message, setMessage]     = useState('')
  const [insurance, setInsurance] = useState(false)
  const [guests, setGuests]       = useState(1)
  const [nights, setNights]       = useState(2)

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

  const stepIndex   = STEPS.indexOf(step)
  const priceNum    = parseInt(stay.price.replace(/[^0-9]/g, '')) || 8500
  const total       = priceNum * nights * guests
  const fee         = Math.round(total * 0.12)
  const insureFee   = Math.round(total * 0.08)
  const grandTotal  = total + fee + (insurance ? insureFee : 0)
  const stayImage   = STAY_IMAGES[id] ?? stay.image

  function goNext() {
    if (step === 'review')  { setStep('message'); return }
    if (step === 'message') { setStep('confirm');  return }
    if (step === 'confirm') {
      router.push(`/listings/stays/${id}/book/success`)
    }
  }
  function goBack() {
    if (step === 'review')  { router.back(); return }
    if (step === 'message') { setStep('review');  return }
    if (step === 'confirm') { setStep('message'); return }
  }

  // ── Summary card ───────────────────────────────────────────────────────
  const SummaryCard = ({ highlighted = false }: { highlighted?: boolean }) => (
    <div className={`rounded-2xl border p-4 mb-4
      ${highlighted ? 'border-[#2c4a1e] border-2' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#e0d9cc] flex-shrink-0">
          <Image src={stayImage} alt={stay.title} fill sizes="64px" className="object-cover" />
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

      <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Dates</p>
            <p className="text-sm text-gray-500">Check-in – Check-out</p>
          </div>
          <button className="text-sm font-semibold text-[#1a1a1a] underline">Change</button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Guests</p>
            <div className="flex items-center gap-2 mt-0.5">
              <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                className="w-6 h-6 rounded-full border border-gray-300 text-sm flex
                           items-center justify-center hover:border-[#1a1a1a]">−</button>
              <span className="text-sm text-gray-500">{guests} adult{guests > 1 ? 's' : ''}</span>
              <button onClick={() => setGuests(g => g + 1)}
                className="w-6 h-6 rounded-full border border-gray-300 text-sm flex
                           items-center justify-center hover:border-[#1a1a1a]">+</button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Nights:</span>
            <button onClick={() => setNights(n => Math.max(1, n - 1))}
              className="w-6 h-6 rounded-full border border-gray-300 text-sm flex
                         items-center justify-center">−</button>
            <span className="text-sm font-semibold">{nights}</span>
            <button onClick={() => setNights(n => n + 1)}
              className="w-6 h-6 rounded-full border border-gray-300 text-sm flex
                         items-center justify-center">+</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Total price</p>
            <p className="text-sm text-gray-500">
              {stay.price} × {nights} night{nights !== 1 ? 's' : ''} × {guests} guest{guests !== 1 ? 's' : ''}
            </p>
          </div>
          <button className="text-sm font-semibold text-[#1a1a1a] underline">Details</button>
        </div>

        <div className="border-t border-gray-100 pt-3">
          <p className="text-sm font-semibold text-[#1a1a1a]">Free cancellation</p>
          <p className="text-sm text-gray-500">
            Cancel before check-in for a full refund.{' '}
            <button className="font-bold text-[#1a1a1a] underline">Full policy</button>
          </p>
        </div>
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
          {step === 'review' ? <X size={16} color="#1a1a1a" /> : <ArrowLeft size={16} color="#1a1a1a" />}
        </button>
        <h1 className="text-[15px] font-semibold text-[#1a1a1a]">
          {step === 'review'  && 'Review your trip'}
          {step === 'message' && 'Message the host'}
          {step === 'confirm' && 'Confirm and pay'}
        </h1>
        <button
          onClick={() => router.push('/')}
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
    </div>
  )
}