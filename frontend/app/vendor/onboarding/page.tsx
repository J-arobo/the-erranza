'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Building2, ShieldCheck, FileText, User as UserIcon,
  Plus, X, Check, LogOut
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const STEP_LABELS = ['Business details', 'Verification', 'Terms', 'Public profile']
const STEP_ICONS = [Building2, ShieldCheck, FileText, UserIcon]

const CANCELLATION_OPTIONS: { id: 'flexible' | 'moderate' | 'strict'; label: string; description: string }[] = [
  { id: 'flexible', label: 'Flexible', description: 'Full refund up to 24 hours before the start date.' },
  { id: 'moderate', label: 'Moderate', description: 'Full refund up to 5 days before the start date, 50% refund after that.' },
  { id: 'strict', label: 'Strict', description: 'Full refund up to 14 days before the start date. No refund after that.' },
]

const RESPONSE_TIMES = ['Within an hour', 'Within a day', 'Within 2 days']

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

  // Step 2 — Verification
  const [idUploaded, setIdUploaded] = useState(false)
  const [insuranceUploaded, setInsuranceUploaded] = useState(false)

  // Step 3 — Terms
  const [defaultCancellationPolicy, setDefaultCancellationPolicy] = useState<'flexible' | 'moderate' | 'strict'>('moderate')
  const [agreedTerms, setAgreedTerms] = useState(false)
  const [agreedLiability, setAgreedLiability] = useState(false)

  // Step 4 — Public profile
  const [bio, setBio] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [languageInput, setLanguageInput] = useState('')
  const [yearsOperating, setYearsOperating] = useState('')
  const [responseTime, setResponseTime] = useState(RESPONSE_TIMES[1])

  function addLanguage() {
    const val = languageInput.trim()
    if (val && !languages.includes(val)) setLanguages(l => [...l, val])
    setLanguageInput('')
  }
  function removeLanguage(lang: string) {
    setLanguages(l => l.filter(x => x !== lang))
  }

  const canContinue = [
    !!companyName.trim() && !!contactPhone.trim() && !!payoutDetails.trim(),
    idUploaded,
    agreedTerms && agreedLiability,
    !!bio.trim() && languages.length > 0,
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
            </div>
          )}

          {/* ── STEP 2: Verification ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4 mt-5">
              <p className="text-sm text-gray-500 -mt-2">
                Since guests pay before their trip happens, we verify every operator before you can publish a listing.
              </p>

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

              <p className="text-xs text-gray-400">
                Once submitted, our team reviews your documents within 1–2 business days. You can continue setting up while this is in progress.
              </p>
            </div>
          )}

          {/* ── STEP 3: Terms ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4 mt-5">
              <div className="bg-[#f5f0e8] rounded-xl p-4">
                <p className="text-sm font-semibold text-[#1a1a1a] mb-1">Commission</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Erranza charges a <span className="font-semibold text-[#1a1a1a]">12% commission</span> on
                  completed bookings, deducted automatically from your payout. No listing or subscription fees.
                </p>
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

          {/* ── STEP 4: Public profile ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4 mt-5">
              <p className="text-sm text-gray-500 -mt-2">
                This is what guests see on your listings before they book.
              </p>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Business bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                  rows={3} placeholder="Tell guests who you are and what makes your tours special..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Logo / photo URL</label>
                <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Languages spoken</label>
                <div className="flex gap-2 mb-2">
                  <input value={languageInput} onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage() } }}
                    placeholder="e.g. English"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                  <button onClick={addLanguage}
                    className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                {languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {languages.map((lang) => (
                      <span key={lang}
                        className="flex items-center gap-1.5 bg-[#eaf5e4] text-[#2c4a1e]
                                   text-xs font-semibold px-3 py-1.5 rounded-full">
                        {lang}
                        <button onClick={() => removeLanguage(lang)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Years operating</label>
                  <input value={yearsOperating} onChange={(e) => setYearsOperating(e.target.value)}
                    type="number" placeholder="e.g. 5"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Response time</label>
                  <select value={responseTime} onChange={(e) => setResponseTime(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors bg-white">
                    {RESPONSE_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
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
              {step < STEP_LABELS.length - 1 ? 'Continue' : 'Finish setup'}
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
