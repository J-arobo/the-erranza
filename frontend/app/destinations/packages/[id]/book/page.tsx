'use client'
import { use, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, X, ChevronRight, Shield } from 'lucide-react'
import { packages } from '@/data/packages'

type Props = {
  params: Promise<{ id: string }>
}

// 2 steps: review → confirm & pay (no "message the guide" — packages have no single operator)
type Step = 'review' | 'confirm'

const STEPS: Step[] = ['review', 'confirm']

export default function PackageBookingPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()

  const pkg = packages.find(p => p.id === id)

  const [step, setStep]           = useState<Step>('review')
  const [payMode, setPayMode]     = useState<'full' | 'instalments'>('full')
  const [insurance, setInsurance] = useState(false)
  const [guests, setGuests]       = useState(() => Number(searchParams.get('guests')) || 1)

  if (!pkg) {
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

  const stepIndex   = STEPS.indexOf(step)
  const basePrice   = parseFloat(pkg.price.replace(/[^0-9.]/g, '')) || 100
  const totalPrice  = basePrice * guests
  const insurancePrice = totalPrice * 0.12
  const finalTotal  = insurance ? totalPrice + insurancePrice : totalPrice

  function goNext() {
    if (step === 'review') setStep('confirm')
    if (step === 'confirm') {
      router.push(`/destinations/packages/${id}/book/success`)
    }
  }

  function goBack() {
    if (step === 'review')  router.back()
    if (step === 'confirm') setStep('review')
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

      {/* Package thumbnail + name */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#e0d9cc]
                        flex-shrink-0">
          <Image
            src={pkg.image} alt={pkg.title}
            fill sizes="56px" className="object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1a1a1a]">
            {pkg.title}
          </p>
          <p className="text-xs text-gray-400">
            {pkg.location} {pkg.duration ? `· ${pkg.duration}` : ''}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-3 flex flex-col gap-3">

        {/* Dates */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Dates</p>
            <p className="text-sm text-gray-500">
              Fixed itinerary — confirmed on booking
            </p>
          </div>
        </div>

        {/* Guests */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Guests</p>
            <p className="text-sm text-gray-500">{guests} {guests > 1 ? 'people' : 'person'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setGuests(g => Math.max(1, g - 1))}
              className="w-7 h-7 rounded-full border border-gray-300 text-sm
                         flex items-center justify-center hover:border-[#1a1a1a]"
            >−</button>
            <span className="text-sm font-semibold w-4 text-center">{guests}</span>
            <button
              onClick={() => setGuests(g => g + 1)}
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
              {pkg.price} × {guests} = {pkg.price.replace(/[\d,]+/, String(totalPrice))}
            </p>
          </div>
        </div>

        {/* Cancellation */}
        <div className="border-t border-gray-100 pt-3">
          <p className="text-sm font-semibold text-[#1a1a1a]">Free cancellation</p>
          <p className="text-sm text-gray-500">
            Cancel up to 7 days before departure for a full refund.{' '}
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
                      Pay {pkg.price} now
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
                      3 payments of {pkg.price.replace(/[\d,]+/, String(Math.round(totalPrice / 3)))} each ·{' '}
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

        {/* ── STEP 2: Confirm & Pay ── */}
        {step === 'confirm' && (
          <>
            <SummaryCard highlighted />

            {/* How you'll pay */}
            <button className="w-full flex items-center justify-between p-4 border
                               border-gray-200 rounded-2xl mb-3 hover:bg-gray-50 transition-colors">
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1a1a1a]">How you&apos;ll pay</p>
                <p className="text-sm text-gray-400">
                  {payMode === 'full'
                    ? `${pkg.price} now`
                    : `3 instalments of ${pkg.price.replace(/[\d,]+/, String(Math.round(totalPrice / 3)))}`}
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
                Add travel insurance?
              </h2>
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      Yes, add for {pkg.price.replace(/[\d,]+/, String(Math.round(insurancePrice)))}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">Only available when booking.</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Get up to 100% of the cost back if you cancel for covered reasons,
                      plus coverage for flights and activities.{' '}
                      <button className="font-semibold text-[#1a1a1a] underline">
                        What&apos;s covered
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
                    {guests} {guests === 1 ? 'person' : 'people'} × {pkg.price}
                  </span>
                  <span className="text-sm text-[#1a1a1a]">{pkg.price.replace(/[\d,]+/, String(totalPrice))}</span>
                </div>
                {insurance && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Travel insurance</span>
                    <span className="text-sm text-[#1a1a1a]">
                      +{pkg.price.replace(/[\d,]+/, String(Math.round(insurancePrice)))}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#1a1a1a]">Total</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">
                    {pkg.price.replace(/[\d,]+/, String(Math.round(finalTotal)))}
                  </span>
                </div>
                <button className="text-sm text-[#1a1a1a] underline text-left">
                  Price breakdown
                </button>
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
                className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold
                           text-base hover:bg-[#333] transition-colors active:scale-[0.99]"
              >
                Pay with Credit card
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
              className="w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-bold
                         text-base hover:bg-[#333] transition-colors active:scale-[0.99]"
            >
              Next
            </button>
          )}
        </div>
      </div>

    </div>
  )
}
