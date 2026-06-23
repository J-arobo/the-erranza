'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { X, ChevronDown, Mail } from 'lucide-react'

const COUNTRY_CODES = [
  { name: 'Kenya',          code: '+254', flag: '🇰🇪' },
  { name: 'United Kingdom', code: '+44',  flag: '🇬🇧' },
  { name: 'United States',  code: '+1',   flag: '🇺🇸' },
  { name: 'Tanzania',       code: '+255', flag: '🇹🇿' },
  { name: 'Uganda',         code: '+256', flag: '🇺🇬' },
  { name: 'South Africa',   code: '+27',  flag: '🇿🇦' },
]

function LoginInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { login }    = useAuth()
  const redirect     = searchParams.get('redirect') ?? '/'

  const [phone, setPhone]             = useState('')
  const [country, setCountry]         = useState(COUNTRY_CODES[0])
  const [showCountry, setShowCountry] = useState(false)
  const [step, setStep]               = useState<'entry' | 'verify'>('entry')
  const [otp, setOtp]                 = useState(['', '', '', '', '', ''])
  const [error, setError]             = useState('')

  function handleContinue() {
    if (phone.length < 7) { setError('Enter a valid phone number'); return }
    setError('')
    setStep('verify')
  }

  function handleOtpChange(val: string, idx: number) {
    const next = [...otp]
    next[idx]  = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
  }

  function handleVerify() {
    if (otp.join('').length === 6) {
      login({ name: 'Explorer', email: `${phone}@erranza.com` })
      router.push(redirect)
    } else {
      setError('Enter the 6-digit code')
    }
  }

  function handleSocial(provider: string) {
    login({ name: `${provider} User`, email: `user@${provider.toLowerCase()}.com` })
    router.push(redirect)
  }

  const FormContent = () => (
    <div>
      {step === 'entry' ? (
        <>
          <h2 className="text-2xl font-bold text-[#304333] mb-5">
            Welcome to Erranza
          </h2>

          <div className="border border-gray-400 rounded-xl overflow-hidden mb-3">
            <button
              onClick={() => setShowCountry(!showCountry)}
              className="w-full flex items-center justify-between px-3 py-3
                         border-b border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <div className="text-left">
                <p className="text-[10px] text-gray-500 leading-none mb-0.5">
                  Country code
                </p>
                <p className="text-sm text-[#304333]">
                  {country.name} ({country.code})
                </p>
              </div>
              <ChevronDown size={16} color="#555"
                className={`transition-transform ${showCountry ? 'rotate-180' : ''}`} />
            </button>

            {showCountry && (
              <div className="max-h-52 overflow-y-auto border-b border-gray-300">
                {COUNTRY_CODES.map((c) => (
                  <button key={c.code}
                    onClick={() => { setCountry(c); setShowCountry(false) }}
                    className="w-full flex items-center gap-3 px-4 py-3
                               hover:bg-gray-50 text-left">
                    <span>{c.flag}</span>
                    <span className="text-sm text-[#304333] flex-1">{c.name}</span>
                    <span className="text-sm text-gray-400">{c.code}</span>
                  </button>
                ))}
              </div>
            )}

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full px-3 py-3 text-sm text-[#304333] outline-none
                         placeholder:text-gray-400 bg-white"
            />
          </div>

          <p className="text-xs text-gray-500 mb-4 leading-relaxed">
            We'll call or text you to confirm your number. Standard message and
            data rates apply.{' '}
            <button className="underline text-[#304333] font-medium">
              Privacy Policy
            </button>
          </p>

          {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

          <button
            onClick={handleContinue}
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                       transition-colors mb-5"
            style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
          >
            Continue
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="flex flex-col gap-3">
            <SocialBtn onClick={() => handleSocial('Google')} label="Continue with Google"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              }
            />
            <SocialBtn onClick={() => handleSocial('Apple')} label="Continue with Apple"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a1a">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.16 1.26-2.14 3.76.03 2.97 2.6 3.96 2.63 3.97l-.04.09M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              }
            />
            <SocialBtn onClick={() => handleSocial('Email')} label="Continue with email"
              icon={<Mail size={18} color="#1a1a1a" />}
            />
            <SocialBtn onClick={() => handleSocial('Facebook')} label="Continue with Facebook"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              }
            />
          </div>

          <button className="w-full text-sm text-[#1a1a1a] underline mt-5 text-center">
            Need help?
          </button>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">
            Confirm your number
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter the 6-digit code sent to{' '}
            <span className="font-semibold text-[#1a1a1a]">
              {country.code} {phone}
            </span>
          </p>

          <div className="flex gap-2 mb-6 justify-center">
            {otp.map((val, i) => (
              <input key={i} id={`otp-${i}`} type="text" inputMode="numeric"
                maxLength={1} value={val}
                onChange={(e) => handleOtpChange(e.target.value, i)}
                className="w-10 h-12 sm:w-12 sm:h-14 border border-gray-300 rounded-xl
                           text-center text-xl font-bold text-[#1a1a1a] outline-none
                           focus:border-[#1a1a1a] transition-colors bg-white" />
            ))}
          </div>

          {error && <p className="text-xs text-red-500 mb-3 text-center">{error}</p>}

          <button onClick={handleVerify}
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold mb-4"
            style={{ background: 'linear-gradient(to right, #e31c5f, #c40048)' }}>
            Verify
          </button>
          <button className="w-full text-sm text-[#1a1a1a] underline text-center">
            Resend code
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#faf8f1] flex flex-col">

      {/* ── DESKTOP ── */}
      <div className="hidden sm:flex flex-col min-h-screen bg-[#faf8f1]">
        {/* Desktop navbar */}
        <div className="px-8 py-4 border-b border-gray-200 bg-[#faf8f1]
                        flex items-center">
          <span
            onClick={() => router.push('/')}
            className="text-[var(--dark-green)] text-41 font-bold text-buenard"
          >
            Erranza
          </span>
        </div>

        {/* Centred card — stays white */}
        <div className="flex-1 flex items-start justify-center pt-10 px-4">
          <div className="w-full max-w-[568px] bg-[#FEFDFC] border border-gray-200
                          rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4
                            border-b border-gray-100 bg-[#FEFDFC">
              <button onClick={() => router.back()}>
                <X size={18} color="#1a1a1a" />
              </button>
              <span className="text-sm font-semibold text-[#304333]">
                Log in or sign up
              </span>
              <div className="w-5" />
            </div>

            <div className="px-8 py-6 bg-[#FEFDFC]">
              <FormContent />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE — full screen ── */}
      <div className="sm:hidden flex flex-col flex-1 min-h-screen bg-[#faf8f1]">
        {/* Mobile header — cream background */}
        <div className="flex items-center justify-between px-4 py-3
                        border-b border-gray-200 sticky top-0 bg-[#faf8f1] z-10">
          <button onClick={() => router.back()}>
            <X size={18} color="#1a1a1a" />
          </button>
          <span className="text-sm font-semibold text-[#1a1a1a]">
            Log in or sign up
          </span>
          <div className="w-5" />
        </div>

        {/* Form area — white card feel on cream background */}
        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm px-5 py-6">
            <FormContent />
          </div>
        </div>
      </div>

    </div>
  )
}

function SocialBtn({
  onClick, icon, label,
}: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-[#f0f0f0]
                 rounded-xl text-sm font-semibold text-[#1a1a1a]
                 hover:bg-[#e8e8e8] transition-colors">
      <span className="flex-shrink-0 w-5 flex items-center justify-center">
        {icon}
      </span>
      <span className="flex-1 text-center">{label}</span>
    </button>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f1] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e]
                        border-t-transparent animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  )
}