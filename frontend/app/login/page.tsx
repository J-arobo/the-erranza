'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ApiError, apiErrorMessage, apiFieldErrors } from '@/lib/api'
import { X, ChevronDown } from 'lucide-react'

const COUNTRY_CODES = [
  { name: 'Kenya',          code: '+254', flag: '🇰🇪' },
  { name: 'United Kingdom', code: '+44',  flag: '🇬🇧' },
  { name: 'United States',  code: '+1',   flag: '🇺🇸' },
  { name: 'Tanzania',       code: '+255', flag: '🇹🇿' },
  { name: 'Uganda',         code: '+256', flag: '🇺🇬' },
  { name: 'South Africa',   code: '+27',  flag: '🇿🇦' },
]

type Country = typeof COUNTRY_CODES[number]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9\s-]{7,15}$/

type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'phone', string>>

function validate(name: string, email: string, password: string, phone: string, requireName: boolean): FieldErrors {
  const errors: FieldErrors = {}

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
    errors.phone = 'Enter a valid phone number'
  }

  if (requireName && !name.trim()) {
    errors.name = 'Name is required'
  } else if (requireName && name.trim().length < 2) {
    errors.name = 'Enter your full name'
  }

  return errors
}

type LoginFormProps = {
  name: string
  onNameChange: (v: string) => void
  email: string
  onEmailChange: (v: string) => void
  password: string
  onPasswordChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  country: Country
  onCountryChange: (c: Country) => void
  showCountry: boolean
  onToggleCountry: () => void
  fieldErrors: FieldErrors
  error: string
  loading: boolean
  onContinue: () => void
}

// Hoisted to module scope so its identity is stable across LoginInner re-renders —
// defining this inside LoginInner would redefine (and remount) it on every
// keystroke, which is what was killing input focus after each character typed.
function LoginForm({
  name, onNameChange, email, onEmailChange, password, onPasswordChange,
  phone, onPhoneChange, country, onCountryChange, showCountry, onToggleCountry,
  fieldErrors, error, loading, onContinue,
}: LoginFormProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#304333] mb-5">
        Welcome to Erranza
      </h2>

      <div className="flex flex-col gap-3 mb-3">
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Full name (for new accounts)</p>
          <input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Jane Traveller"
            className={`w-full border rounded-xl px-3 py-3 text-sm
                       text-[#304333] outline-none placeholder:text-gray-400 bg-white
                       ${fieldErrors.name ? 'border-red-400' : 'border-gray-400'}`}
          />
          {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@example.com"
            className={`w-full border rounded-xl px-3 py-3 text-sm
                       text-[#304333] outline-none placeholder:text-gray-400 bg-white
                       ${fieldErrors.email ? 'border-red-400' : 'border-gray-400'}`}
          />
          {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
        </div>
        <div>
          <p className="text-[10px] text-gray-500 mb-1">Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className={`w-full border rounded-xl px-3 py-3 text-sm
                       text-[#304333] outline-none bg-white
                       ${fieldErrors.password ? 'border-red-400' : 'border-gray-400'}`}
          />
          {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
        </div>
      </div>

      <div className={`border rounded-xl overflow-hidden mb-1
                       ${fieldErrors.phone ? 'border-red-400' : 'border-gray-400'}`}>
        <button
          onClick={onToggleCountry}
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
                onClick={() => onCountryChange(c)}
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
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="Phone number (optional)"
          className="w-full px-3 py-3 text-sm text-[#304333] outline-none
                     placeholder:text-gray-400 bg-white"
        />
      </div>
      {fieldErrors.phone && <p className="text-xs text-red-500 mb-2">{fieldErrors.phone}</p>}

      {error && <p className="text-xs text-red-500 mb-3 mt-2">{error}</p>}

      <button
        onClick={onContinue}
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                   transition-colors mb-2 mt-3 disabled:opacity-60"
        style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
      >
        {loading ? 'Please wait…' : 'Continue'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        New here? Just enter your name, email and a password above — we'll create your account.
      </p>

      <button className="w-full text-sm text-[#1a1a1a] underline mt-5 text-center">
        Need help?
      </button>
    </div>
  )
}

function LoginInner() {
  const router          = useRouter()
  const searchParams    = useSearchParams()
  const { login, register } = useAuth()
  const redirect        = searchParams.get('redirect') ?? '/'

  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [password, setPassword]       = useState('')
  const [phone, setPhone]             = useState('')
  const [country, setCountry]         = useState<Country>(COUNTRY_CODES[0])
  const [showCountry, setShowCountry] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)

  function updateName(v: string) {
    setName(v)
    if (fieldErrors.name) setFieldErrors(fe => ({ ...fe, name: undefined }))
  }
  function updateEmail(v: string) {
    setEmail(v)
    if (fieldErrors.email) setFieldErrors(fe => ({ ...fe, email: undefined }))
  }
  function updatePassword(v: string) {
    setPassword(v)
    if (fieldErrors.password) setFieldErrors(fe => ({ ...fe, password: undefined }))
  }
  function updatePhone(v: string) {
    setPhone(v)
    if (fieldErrors.phone) setFieldErrors(fe => ({ ...fe, phone: undefined }))
  }

  async function handleContinue() {
    // Client-side checks first — name isn't required yet since we don't know
    // if this will end up being a login or a registration.
    const errors = validate(name, email, password, phone, false)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('')
      return
    }

    setFieldErrors({})
    setError('')
    setLoading(true)

    try {
      await login(email.trim(), password)
      router.push(redirect)
      return
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const message = err.errors?.email?.[0] ?? ''
        if (message.toLowerCase().includes('suspended')) {
          setError(message)
          setLoading(false)
          return
        }
        // Otherwise: no account matches these credentials — fall through and
        // offer to create one instead.
      } else {
        setError(apiErrorMessage(err))
        setLoading(false)
        return
      }
    }

    const registerErrors = validate(name, email, password, phone, true)
    if (registerErrors.name) {
      setFieldErrors(registerErrors)
      setLoading(false)
      return
    }

    try {
      await register(name.trim(), email.trim(), password, phone.trim() || undefined)
      router.push(redirect)
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(apiFieldErrors(err) as FieldErrors)
      } else {
        setError(apiErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  const formProps: LoginFormProps = {
    name, onNameChange: updateName,
    email, onEmailChange: updateEmail,
    password, onPasswordChange: updatePassword,
    phone, onPhoneChange: updatePhone,
    country, onCountryChange: (c) => { setCountry(c); setShowCountry(false) },
    showCountry, onToggleCountry: () => setShowCountry(s => !s),
    fieldErrors, error, loading, onContinue: handleContinue,
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">

      {/* ── DESKTOP ── */}
      <div className="hidden sm:flex flex-col min-h-screen bg-[#ffffff]">
        <div className="px-8 py-4 border-b border-gray-200 bg-[#ffffff]
                        flex items-center">
          <span
            onClick={() => router.push('/')}
            className="text-[var(--dark-green)] text-41 font-bold text-buenard"
          >
            Erranza
          </span>
        </div>

        <div className="flex-1 flex items-start justify-center pt-10 px-4">
          <div className="w-full max-w-[568px] bg-[#ffffff] border border-gray-200
                          rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4
                            border-b border-gray-100 bg-[#ffffff]">
              <button onClick={() => router.back()}>
                <X size={18} color="#1a1a1a" />
              </button>
              <span className="text-sm font-semibold text-[#304333]">
                Log in or sign up
              </span>
              <div className="w-5" />
            </div>

            <div className="px-8 py-6 bg-[#ffffff]">
              <LoginForm {...formProps} />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE — full screen ── */}
      <div className="sm:hidden flex flex-col flex-1 min-h-screen bg-[#ffffff]">
        <div className="flex items-center justify-between px-4 py-3
                        border-b border-gray-200 sticky top-0 bg-[#ffffff] z-10">
          <button onClick={() => router.back()}>
            <X size={18} color="#1a1a1a" />
          </button>
          <span className="text-sm font-semibold text-[#1a1a1a]">
            Log in or sign up
          </span>
          <div className="w-5" />
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm px-5 py-6">
            <LoginForm {...formProps} />
          </div>
        </div>
      </div>

    </div>
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
