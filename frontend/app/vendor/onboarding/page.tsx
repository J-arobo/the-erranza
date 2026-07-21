'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, Layers, Package, CreditCard, Clock,
  Plus, X, Check, LogOut
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const STEP_LABELS = ['Business details', 'Categories', 'Plan', 'Payment', 'Pending review']
const STEP_ICONS = [Building2, Layers, Package, CreditCard, Clock]

const CATEGORY_OPTIONS = ['Safari', 'Stays', 'Experiences', 'Packages']

const CANCELLATION_OPTIONS: { id: 'flexible' | 'moderate' | 'strict'; label: string; description: string }[] = [
  { id: 'flexible', label: 'Flexible', description: 'Full refund up to 24 hours before the start date.' },
  { id: 'moderate', label: 'Moderate', description: 'Full refund up to 5 days before the start date, 50% refund after that.' },
  { id: 'strict', label: 'Strict', description: 'Full refund up to 14 days before the start date. No refund after that.' },
]

const PLANS: { id: 'standard' | 'plus'; name: string; price: string; commission: string; features: string[] }[] = [
  {
    id: 'standard',
    name: 'Standard',
    price: 'Free',
    commission: '12% commission per booking',
    features: ['Standard search placement', 'Booking & payout management', 'Guest messaging'],
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 'Ksh 2,500/month',
    commission: '8% commission per booking',
    features: ['Featured search placement', 'Priority support', 'Lower commission rate'],
  },
]

export default function VendorOnboardingPage() {
  const { user, logout, completeOnboarding } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)

  // Step 1 — Business details
  const [companyName, setCompanyName] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [taxPin, setTaxPin] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [payoutMethod, setPayoutMethod] = useState<'mobile' | 'bank'>('mobile')
  const [payoutDetails, setPayoutDetails] = useState('')
  const [idUploaded, setIdUploaded] = useState(false)
  const [insuranceUploaded, setInsuranceUploaded] = useState(false)

  // Step 2 — Categories
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [regions, setRegions] = useState<string[]>([])
  const [regionInput, setRegionInput] = useState('')

  // Step 3 — Plan
  const [plan, setPlan] = useState<'standard' | 'plus'>('standard')
  const [defaultCancellationPolicy, setDefaultCancellationPolicy] = useState<'flexible' | 'moderate' | 'strict'>('moderate')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedLiability, setAgreedLiability] = useState(false)

  // Step 4 — Payment
  const [cardName, setCardName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')

  function toggleCategory(cat: string) {
    setSelectedCategories(c => c.includes(cat) ? c.filter(x => x !== cat) : [...c, cat])
  }
  function addRegion() {
    const val = regionInput.trim()
    if (val && !regions.includes(val)) setRegions(r => [...r, val])
    setRegionInput('')
  }
  function removeRegion(region: string) {
    setRegions(r => r.filter(x => x !== region))
  }

  const canContinue = [
    !!companyName.trim() && !!contactPhone.trim() && !!payoutDetails.trim() && idUploaded,
    selectedCategories.length > 0,
    agreedTerms && agreedLiability,
    plan === 'standard' || (!!cardName.trim() && !!cardNumber.trim() && !!cardExpiry.trim() && !!cardCvc.trim()),
    true,
  ][step]

  function handleBack() {
    if (step > 0) setStep(s => s - 1)
  }

  function handleContinue() {
    if (!canContinue) return
    if (step < STEP_LABELS.length - 1) {
      setStep(s => s + 1)
    } else {
      completeOnboarding()
      router.push('/vendor')
    }
  }

  const percent = ((step + 1) / STEP_LABELS.length) * 100
  const StepIcon = STEP_ICONS[step]
  const selectedPlan = PLANS.find(p => p.id === plan)!

  return (
    <div className="min-h-screen bg-[#f5f0e8] px-5 py-8 sm:py-12">
      <div className="max-w-xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-lg font-bold text-[#1a1a1a]">Erranza</p>
            <p className="text-xs text-gray-500">Set up your vendor account</p>
          </div>
          <button
            onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-1.5 bg-white rounded-full overflow-hidden mb-2 border border-[#e0d9cc]">
            <div className="h-full bg-[#2c4a1e] rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Step {step + 1} of {STEP_LABELS.length}
            </p>
            <p className="text-xs font-semibold text-[#2c4a1e]">{STEP_LABELS[step]}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e0d9cc] p-6 sm:p-8">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#eaf5e4] flex items-center justify-center flex-shrink-0">
              <StepIcon size={16} color="#2c4a1e" />
            </div>
            <h1 className="text-lg font-bold text-[#1a1a1a]">{STEP_LABELS[step]}</h1>
          </div>

          {/* ── STEP 1: Business details ── */}
          {step === 0 && (
            <div className="flex flex-col gap-4 mt-5">
              <p className="text-sm text-gray-500 -mt-2">
                Tell us about your business so guests and Erranza can identify you.
              </p>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Company / business name</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Mara Expeditions Ltd"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
                    Business license no. <span className="text-gray-400 font-normal">(if required)</span>
                  </label>
                  <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="Optional"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">KRA PIN</label>
                  <input value={taxPin} onChange={(e) => setTaxPin(e.target.value)}
                    placeholder="e.g. P051234567X"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Contact phone</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+254 7XX XXX XXX"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Payout method</label>
                <div className="flex gap-2 mb-2">
                  {(['mobile', 'bank'] as const).map((m) => (
                    <button key={m} onClick={() => setPayoutMethod(m)}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
                        ${payoutMethod === m
                          ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                          : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
                      {m === 'mobile' ? 'Mobile money' : 'Bank transfer'}
                    </button>
                  ))}
                </div>
                <input value={payoutDetails} onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder={payoutMethod === 'mobile' ? 'M-Pesa number' : 'Bank account number'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
              </div>

              <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Government-issued ID</p>
                  <p className="text-xs text-gray-400 mt-0.5">National ID, passport, or business registration certificate.</p>
                </div>
                {idUploaded ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#2c4a1e] flex-shrink-0">
                    <Check size={14} /> Uploaded
                  </span>
                ) : (
                  <button onClick={() => setIdUploaded(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#2c4a1e] text-white text-xs font-semibold
                               hover:bg-[#3d6b28] transition-colors flex-shrink-0">
                    Upload
                  </button>
                )}
              </div>

              <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    Insurance certificate <span className="text-gray-400 font-normal">(recommended)</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Liability cover for tours involving physical activity.</p>
                </div>
                {insuranceUploaded ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#2c4a1e] flex-shrink-0">
                    <Check size={14} /> Uploaded
                  </span>
                ) : (
                  <button onClick={() => setInsuranceUploaded(true)}
                    className="px-3 py-1.5 rounded-lg bg-gray-100 text-[#1a1a1a] text-xs font-semibold
                               hover:bg-gray-200 transition-colors flex-shrink-0">
                    Upload
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 2: Categories ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4 mt-5">
              <p className="text-sm text-gray-500 -mt-2">
                Choose what you'll be listing. This determines what you can publish and how guests find you.
              </p>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const selected = selectedCategories.includes(cat)
                    return (
                      <button key={cat} onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all
                          ${selected
                            ? 'border-[#2c4a1e] bg-[#eaf5e4]'
                            : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2
                          ${selected ? 'border-[#2c4a1e] bg-[#2c4a1e]' : 'border-gray-300'}`}>
                          {selected && <Check size={11} color="white" />}
                        </div>
                        <span className="text-sm font-semibold text-[#1a1a1a]">{cat}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Operating regions</label>
                <div className="flex gap-2 mb-2">
                  <input value={regionInput} onChange={(e) => setRegionInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRegion() } }}
                    placeholder="e.g. Maasai Mara"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                  <button onClick={addRegion}
                    className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                {regions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {regions.map((region) => (
                      <span key={region}
                        className="flex items-center gap-1.5 bg-[#eaf5e4] text-[#2c4a1e]
                                   text-xs font-semibold px-3 py-1.5 rounded-full">
                        {region}
                        <button onClick={() => removeRegion(region)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STEP 3: Plan ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4 mt-5">
              <p className="text-sm text-gray-500 -mt-2">Choose the plan that fits your business.</p>

              <div className="flex flex-col gap-2">
                {PLANS.map((p) => (
                  <button key={p.id} onClick={() => setPlan(p.id)}
                    className={`text-left p-4 rounded-xl border transition-all
                      ${plan === p.id
                        ? 'border-[#2c4a1e] bg-[#eaf5e4]'
                        : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0
                          ${plan === p.id ? 'border-[#2c4a1e] bg-[#2c4a1e]' : 'border-gray-300'}`} />
                        <p className="text-sm font-bold text-[#1a1a1a]">{p.name}</p>
                      </div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{p.price}</p>
                    </div>
                    <p className="text-xs text-gray-500 ml-[26px] mb-1.5">{p.commission}</p>
                    <ul className="ml-[26px] flex flex-col gap-0.5">
                      {p.features.map((f) => (
                        <li key={f} className="text-xs text-gray-500">• {f}</li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
                  Default cancellation policy
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Applied to new listings by default — you can override this per listing later.
                </p>
                <div className="flex flex-col gap-2">
                  {CANCELLATION_OPTIONS.map((p) => (
                    <button key={p.id} onClick={() => setDefaultCancellationPolicy(p.id)}
                      className={`flex items-start gap-3 text-left p-3 rounded-xl border transition-all
                        ${defaultCancellationPolicy === p.id
                          ? 'border-[#2c4a1e] bg-[#eaf5e4]'
                          : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5
                        ${defaultCancellationPolicy === p.id ? 'border-[#2c4a1e] bg-[#2c4a1e]' : 'border-gray-300'}`} />
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{p.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreedLiability}
                  onChange={(e) => setAgreedLiability(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#2c4a1e] flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  I confirm I carry appropriate liability insurance and/or licensing for the activities I list.
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#2c4a1e] flex-shrink-0" />
                <span className="text-sm text-gray-600">
                  I agree to Erranza's Vendor Terms of Service and Commission Agreement.
                </span>
              </label>
            </div>
          )}

          {/* ── STEP 4: Payment ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4 mt-5">
              {plan === 'standard' ? (
                <div className="bg-[#f5f0e8] rounded-xl p-4">
                  <p className="text-sm font-semibold text-[#1a1a1a] mb-1">No payment required</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    You're on the Standard plan — no subscription fee. Erranza's 12% commission is
                    deducted automatically from each payout. You can upgrade to Plus anytime from your dashboard.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 -mt-2">
                    You selected the Plus plan (Ksh 2,500/month). Enter your card details to continue.
                  </p>
                  <div>
                    <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Name on card</label>
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                                 outline-none focus:border-[#2c4a1e] transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Card number</label>
                    <input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                                 outline-none focus:border-[#2c4a1e] transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Expiry</label>
                      <input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                                   outline-none focus:border-[#2c4a1e] transition-colors" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">CVC</label>
                      <input value={cardCvc} onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                                   outline-none focus:border-[#2c4a1e] transition-colors" />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 5: Pending review ── */}
          {step === 4 && (
            <div className="flex flex-col gap-4 mt-5">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#eaf5e4] flex items-center justify-center mb-4">
                  <Clock size={24} color="#2c4a1e" />
                </div>
                <p className="text-base font-bold text-[#1a1a1a] mb-1">Your application is under review</p>
                <p className="text-sm text-gray-500 max-w-xs">
                  We typically review new partner applications within 1–2 business days.
                  You'll get an email once you're fully verified.
                </p>
              </div>

              <div className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-xl px-4">
                {[
                  { label: 'Business details', value: companyName || '—' },
                  { label: 'Categories', value: selectedCategories.length > 0 ? selectedCategories.join(', ') : '—' },
                  { label: 'Plan', value: selectedPlan.name },
                  { label: 'Payment', value: plan === 'standard' ? 'None required' : 'Card on file' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-500">{row.label}</span>
                    <span className="text-sm font-semibold text-[#1a1a1a] text-right ml-3 truncate max-w-[60%]">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-400 text-center">
                You'll have provisional dashboard access while your documents are reviewed.
              </p>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex gap-3 mt-7">
            {step > 0 && (
              <button onClick={handleBack}
                className="px-5 py-3 rounded-xl font-semibold text-sm border border-gray-200
                           text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                Back
              </button>
            )}
            <button onClick={handleContinue} disabled={!canContinue}
              className="flex-1 bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {step < STEP_LABELS.length - 1 ? 'Continue' : 'Go to dashboard →'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Signed in as {user?.email}
        </p>
      </div>
    </div>
  )
}
