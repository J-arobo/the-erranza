'use client'
import { use, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, X, ChevronRight, Shield, Star } from 'lucide-react'
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

  const [step, setStep] = useState<Step>('review')
  const [payMode, setPayMode] = useState<'full' | 'instalments'>('full')
  const [insurance, setInsurance] = useState(false)
  const [showGuestSheet, setShowGuestSheet] = useState(false)
  const [adults, setAdults] = useState(() => Number(searchParams.get('adults')) || 1)
  const [children, setChildren] = useState(() => Number(searchParams.get('children')) || 0)
  const [infants, setInfants] = useState(() => Number(searchParams.get('infants')) || 0)
  const [pets, setPets] = useState(() => Number(searchParams.get('pets')) || 0)
  const guests = adults + children

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

  const stepIndex = STEPS.indexOf(step)
  const basePrice = parseFloat(pkg.price.replace(/[^0-9.]/g, '')) || 100
  const totalPrice = basePrice * guests
  const insurancePrice = totalPrice * 0.12
  const finalTotal = insurance ? totalPrice + insurancePrice : totalPrice

  function goNext() {
    if (step === 'review') setStep('confirm')
    if (step === 'confirm') {
      router.push(`/destinations/packages/${id}/book/success`)
    }
  }

  function goBack() {
    if (step === 'review') router.back()
    if (step === 'confirm') setStep('review')
  }

  // ── Summary card — image/title/rating, fixed dates, guests w/ Change, price, cancellation ──
  const SummaryCard = ({ highlighted = false }: { highlighted?: boolean }) => (
    <div className={`rounded-2xl border p-4 mb-4 ${highlighted ? 'border-2 border-[#304333]' : 'border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#e0d9cc] flex-shrink-0">
          <Image src={pkg.image} alt={pkg.title} fill sizes="80px" className="object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#1a1a1a] leading-snug">{pkg.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={11} fill="#1a1a1a" color="#1a1a1a" />
            <span className="text-xs font-semibold text-[#1a1a1a]">{pkg.rating}</span>
            <span className="text-xs text-gray-400">({pkg.operatorReviews ?? 0} reviews)</span>
          </div>
        </div>
      </div>

      <div className="py-3" style={{ borderTop: '1px solid #f0ede8', borderBottom: '1px solid #f0ede8' }}>
        <p className="text-sm font-semibold text-[#1a1a1a]">Free cancellation</p>
        <p className="text-sm text-gray-500">
          Cancel up to 7 days before departure for a full refund.{' '}
          <button className="font-bold text-[#1a1a1a] underline"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>
            Full policy
          </button>
        </p>
      </div>

      <div>

        {/* Dates — fixed, not editable */}
        <div className="py-3" style={{ borderBottom: '1px solid #f0ede8' }}>
          <p className="text-sm font-semibold text-[#1a1a1a]">Dates</p>
          <p className="text-sm text-gray-500">{pkg.dates ?? 'To be confirmed'}</p>
        </div>

        {/* Guests */}
        <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #f0ede8' }}>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Guests</p>
            <p className="text-sm text-gray-500">
              {adults} adult{adults > 1 ? 's' : ''}
              {children > 0 ? `, ${children} child${children > 1 ? 'ren' : ''}` : ''}
              {infants > 0 ? `, ${infants} infant${infants > 1 ? 's' : ''}` : ''}
              {pets > 0 ? `, ${pets} pet${pets > 1 ? 's' : ''}` : ''}
            </p>
          </div>
          <button onClick={() => setShowGuestSheet(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#304333]"
            style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Change
          </button>
        </div>

        {/* Price details */}
        <div className="py-3" style={{ borderBottom: '1px solid #f0ede8' }}>
          <p className="text-sm font-bold text-[#1a1a1a] mb-2">Price details</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{pkg.price} × {guests} guest{guests !== 1 ? 's' : ''}</span>
              <span className="text-[#1a1a1a]">{pkg.price.replace(/[\d,]+/, String(totalPrice))}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 mt-1" style={{ borderTop: '1px solid #f0ede8' }}>
              <span className="font-bold text-[#1a1a1a]">Total</span>
              <span className="font-bold text-[#1a1a1a]">{pkg.price.replace(/[\d,]+/, String(totalPrice))}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )


  return (
    <div className="flex flex-col min-h-screen bg-white max-w-lg mx-auto">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3
                      border-b border-gray-100 sticky top-0 bg-white z-40">
        <button onClick={goBack}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          style={{ WebkitTapHighlightColor: 'transparent' }}>
          <ArrowLeft size={16} color="#1a1a1a" />
        </button>
        <h1 className="text-[15px] font-semibold text-[#1a1a1a]">
          {step === 'review' && 'Review your trip'}
          {step === 'confirm' && 'Confirm and pay'}
        </h1>
        <button onClick={() => router.push('/')}
          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
          style={{ WebkitTapHighlightColor: 'transparent' }}>
          <X size={16} color="#1a1a1a" />
        </button>
      </div>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-40">

        {/* ── STEP 1: Review ── */}
        {step === 'review' && (
          <>
            <SummaryCard />

            <div className="mb-4">
              <h2 className="text-base font-bold text-[#1a1a1a] mb-3">Choose how to pay</h2>
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Pay {pkg.price.replace(/[\d,]+/, String(totalPrice))} now</p>
                  <input type="radio" name="pay" checked={payMode === 'full'} onChange={() => setPayMode('full')}
                    className="w-5 h-5 accent-[#1a1a1a]" />
                </label>
                <div className="border-t border-gray-100" />
                <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">Pay in 3 instalments</p>
                    <p className="text-xs text-gray-400">
                      3 payments of {pkg.price.replace(/[\d,]+/, String(Math.round(totalPrice / 3)))} each
                    </p>
                  </div>
                  <input type="radio" name="pay" checked={payMode === 'instalments'} onChange={() => setPayMode('instalments')}
                    className="w-5 h-5 accent-[#1a1a1a]" />
                </label>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2: Confirm & Pay ── */}
        {step === 'confirm' && (
          <>
            <SummaryCard />
            
            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-2xl mb-3 hover:bg-gray-50 transition-colors">
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

            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-2xl mb-5 hover:bg-gray-50 transition-colors">
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1a1a1a]">Payment method</p>
                <p className="text-sm text-gray-400">Credit or Debit Card</p>
              </div>
              <ChevronRight size={16} color="#aaa" />
            </button>

            <div className="mb-5">
              <h2 className="text-sm font-bold text-[#1a1a1a] mb-3">Add travel insurance?</h2>
              <div className="border border-gray-200 rounded-2xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      Yes, add for {pkg.price.replace(/[\d,]+/, String(Math.round(insurancePrice)))}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">Only available when booking.</p>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Get up to 100% of the cost back if you cancel for covered reasons, plus coverage for flights and activities.{' '}
                      <button className="font-semibold text-[#1a1a1a] underline">What&apos;s covered</button>
                    </p>
                  </div>
                  <button onClick={() => setInsurance(i => !i)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all flex-shrink-0
                      ${insurance ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'bg-white text-[#1a1a1a] border-gray-300'}`}>
                    {insurance ? 'Added ✓' : 'Add'}
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-sm font-bold text-[#1a1a1a] mb-3">Price details</h2>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{guests} guest{guests !== 1 ? 's' : ''} × {pkg.price}</span>
                  <span className="text-sm text-[#1a1a1a]">{pkg.price.replace(/[\d,]+/, String(totalPrice))}</span>
                </div>
                {insurance && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Travel insurance</span>
                    <span className="text-sm text-[#1a1a1a]">+{pkg.price.replace(/[\d,]+/, String(Math.round(insurancePrice)))}</span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-2 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#1a1a1a]">Total</span>
                  <span className="text-sm font-bold text-[#1a1a1a]">{pkg.price.replace(/[\d,]+/, String(Math.round(finalTotal)))}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5 p-3 bg-gray-50 rounded-xl">
              <Shield size={16} color="#2c4a1e" />
              <p className="text-xs text-gray-500">🔒 To help protect your payment, always book through Erranza.</p>
            </div>
          </>
        )}

      </div>

      {/* ── PROGRESS + NEXT BUTTON ── */}
      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-100">
        <div className="flex gap-1.5 px-5 pt-3">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${i <= stepIndex ? 'bg-[#2c4a1e]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <div className="px-5 py-4 pb-8">
          {step === 'confirm' ? (
            <>
              <button onClick={goNext}
                className="w-full bg-[#2c4a1e] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#3d6b28] transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}>
                Confirm and pay · {pkg.price.replace(/[\d,]+/, String(Math.round(finalTotal)))}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                By tapping, I agree to the{' '}
                <button className="underline text-[#1a1a1a]">booking terms</button>{', '}
                <button className="underline text-[#1a1a1a]">Terms of Service</button>{' and '}
                <button className="underline text-[#1a1a1a]">Privacy Policy</button>.
              </p>
            </>
          ) : (
            <button onClick={goNext}
              className="w-full bg-[#2c4a1e] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#3d6b28] transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}>
              Next
            </button>
          )}
        </div>
      </div>

      {/* ── GUEST CHANGE SHEET ── */}
      {showGuestSheet && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowGuestSheet(false) }}>
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[#1a1a1a]">Guests</h2>
              <button onClick={() => setShowGuestSheet(false)}
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center">
                <X size={14} color="#1a1a1a" />
              </button>
            </div>
            {[
              { label: 'Adults', sub: 'Age 13+', count: adults, set: setAdults, min: 1, max: 16 },
              { label: 'Children', sub: 'Ages 2–12', count: children, set: setChildren, min: 0, max: Math.max(0, 16 - adults) },
              { label: 'Infants', sub: 'Under 2', count: infants, set: setInfants, min: 0, max: 5 },
              { label: 'Pets', sub: 'Bringing a service animal?', count: pets, set: setPets, min: 0, max: 5 },
            ].map(({ label, sub, count, set, min, max }, idx, arr) => (
              <div key={label} className="flex items-center justify-between py-4"
                style={{ borderBottom: idx < arr.length - 1 ? '1px solid #f0ede8' : 'none' }}>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{label}</p>
                  <p className="text-sm text-gray-500">{sub}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => set((c: number) => Math.max(min, c - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    style={{ cursor: count <= min ? 'not-allowed' : 'pointer', opacity: count <= min ? 0.4 : 1 }}>−</button>
                  <span className="text-sm font-semibold w-4 text-center">{count}</span>
                  <button onClick={() => set((c: number) => Math.min(max, c + 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                    style={{ cursor: count >= max ? 'not-allowed' : 'pointer', opacity: count >= max ? 0.4 : 1 }}>+</button>
                </div>
              </div>
            ))}
            <button onClick={() => setShowGuestSheet(false)}
              className="w-full mt-4 py-3.5 rounded-xl font-semibold text-sm text-white"
              style={{ background: '#1a1a1a', border: 'none', cursor: 'pointer' }}>
              Save
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
