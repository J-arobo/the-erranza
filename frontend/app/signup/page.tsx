'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ApiError, apiErrorMessage, apiFieldErrors } from '@/lib/api'
import { X, ChevronDown, Eye, EyeOff } from 'lucide-react'

const COUNTRY_CODES = [
    { name: 'Kenya', code: '+254', flag: '🇰🇪' },
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'Tanzania', code: '+255', flag: '🇹🇿' },
    { name: 'Uganda', code: '+256', flag: '🇺🇬' },
    { name: 'South Africa', code: '+27', flag: '🇿🇦' },
]

type Country = typeof COUNTRY_CODES[number]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^[0-9\s-]{7,15}$/

type FieldErrors = Partial<Record<'firstName' | 'lastName' | 'email' | 'password' | 'passwordConfirmation' | 'phone', string>>

function validate(firstName: string, lastName: string, email: string, password: string, passwordConfirmation: string, phone: string): FieldErrors {
    const errors: FieldErrors = {}

    if (!firstName.trim()) {
        errors.firstName = 'First name is required'
    }

    if (!lastName.trim()) {
        errors.lastName = 'Last name is required'
    }

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

    if (password && passwordConfirmation !== password) {
        errors.passwordConfirmation = 'Passwords do not match'
    }

    if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
        errors.phone = 'Enter a valid phone number'
    }

    return errors
}

type SignupFormProps = {
    firstName: string
    onFirstNameChange: (v: string) => void
    lastName: string
    onLastNameChange: (v: string) => void

    email: string
    onEmailChange: (v: string) => void
    password: string
    onPasswordChange: (v: string) => void
    passwordConfirmation: string
    onPasswordConfirmationChange: (v: string) => void
    showPassword: boolean
    onToggleShowPassword: () => void
    phone: string
    onPhoneChange: (v: string) => void
    country: Country
    onCountryChange: (c: Country) => void
    showCountry: boolean
    onToggleCountry: () => void
    fieldErrors: FieldErrors
    error: string
    loading: boolean
    onSubmit: () => void
    onGoToLogin: () => void
}

// Hoisted to module scope so its identity is stable across SignupInner re-renders —
// defining this inside the page component would redefine (and remount) it on
// every keystroke, killing input focus after each character typed.
function SignupForm({
    firstName, onFirstNameChange, lastName, onLastNameChange, email, onEmailChange,
    password, onPasswordChange, passwordConfirmation, onPasswordConfirmationChange,
    showPassword, onToggleShowPassword,
    phone, onPhoneChange, country, onCountryChange, showCountry, onToggleCountry,
    fieldErrors, error, loading, onSubmit, onGoToLogin,
}: SignupFormProps) {
    return (
        <div>
            <h2 className="text-2xl font-bold text-[#304333] mb-5">
                Create your account
            </h2>

            {error && (
                <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4">
                    {error}
                </div>
            )}

            <div className="flex flex-col gap-3 mb-3">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <p className="text-[10px] text-gray-500 mb-1">First name</p>
                        <input
                            value={firstName}
                            onChange={(e) => onFirstNameChange(e.target.value)}
                            placeholder="Jane"
                            className={`w-full border rounded-xl px-3 py-3 text-sm
                         text-[#304333] outline-none placeholder:text-gray-400 bg-white
                         ${fieldErrors.firstName ? 'border-red-400' : 'border-gray-400'}`}
                        />
                        {fieldErrors.firstName && <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] text-gray-500 mb-1">Last name</p>
                        <input
                            value={lastName}
                            onChange={(e) => onLastNameChange(e.target.value)}
                            placeholder="Traveller"
                            className={`w-full border rounded-xl px-3 py-3 text-sm
                         text-[#304333] outline-none placeholder:text-gray-400 bg-white
                         ${fieldErrors.lastName ? 'border-red-400' : 'border-gray-400'}`}
                        />
                        {fieldErrors.lastName && <p className="text-xs text-red-500 mt-1">{fieldErrors.lastName}</p>}
                    </div>
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
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => onPasswordChange(e.target.value)}
                            className={`w-full border rounded-xl pl-3 pr-10 py-3 text-sm
                         text-[#304333] outline-none bg-white
                         ${fieldErrors.password ? 'border-red-400' : 'border-gray-400'}`}
                        />
                        <button type="button" onClick={onToggleShowPassword}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                </div>

                <div>
                    <p className="text-[10px] text-gray-500 mb-1">Confirm password</p>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordConfirmation}
                        onChange={(e) => onPasswordConfirmationChange(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit() }}
                        className={`w-full border rounded-xl px-3 py-3 text-sm
                       text-[#304333] outline-none bg-white
                       ${fieldErrors.passwordConfirmation ? 'border-red-400' : 'border-gray-400'}`}
                    />
                    {fieldErrors.passwordConfirmation && <p className="text-xs text-red-500 mt-1">{fieldErrors.passwordConfirmation}</p>}
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

            <button
                onClick={onSubmit}
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                   transition-colors mb-4 mt-3 disabled:opacity-60"
                style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
            >
                {loading ? 'Creating account…' : 'Sign up'}
            </button>

            <p className="text-xs text-gray-400 text-center">
                Already have an account?{' '}
                <button type="button" onClick={onGoToLogin} className="text-[#304333] font-semibold underline"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Log in
                </button>
            </p>
        </div>
    )
}

function SignupInner() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { register } = useAuth()
    const redirect = searchParams.get('redirect') ?? '/'

    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [phone, setPhone] = useState('')
    const [country, setCountry] = useState<Country>(COUNTRY_CODES[0])
    const [showCountry, setShowCountry] = useState(false)
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function updateFirstName(v: string) {
        setFirstName(v)
        if (fieldErrors.firstName) setFieldErrors(fe => ({ ...fe, firstName: undefined }))
    }
    function updateLastName(v: string) {
        setLastName(v)
        if (fieldErrors.lastName) setFieldErrors(fe => ({ ...fe, lastName: undefined }))
    }

    function updateEmail(v: string) {
        setEmail(v)
        if (fieldErrors.email) setFieldErrors(fe => ({ ...fe, email: undefined }))
    }
    function updatePassword(v: string) {
        setPassword(v)
        if (fieldErrors.password) setFieldErrors(fe => ({ ...fe, password: undefined }))
    }
    function updatePasswordConfirmation(v: string) {
        setPasswordConfirmation(v)
        if (fieldErrors.passwordConfirmation) setFieldErrors(fe => ({ ...fe, passwordConfirmation: undefined }))
    }
    function updatePhone(v: string) {
        setPhone(v)
        if (fieldErrors.phone) setFieldErrors(fe => ({ ...fe, phone: undefined }))
    }

    async function handleSubmit() {
        const errors = validate(firstName, lastName, email, password, passwordConfirmation, phone)
        if (Object.keys(errors).length > 0) {
          setFieldErrors(errors)
          setError('')
          return
        }
    
        setFieldErrors({})
        setError('')
        setLoading(true)
        try {
          const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()
          await register(fullName, email.trim(), password, phone.trim() || undefined)
          router.replace(redirect)
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
    

    function goToLogin() {
        router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
    }

    const formProps: SignupFormProps = {
        firstName, onFirstNameChange: updateFirstName,
        lastName, onLastNameChange: updateLastName,    
        email, onEmailChange: updateEmail,
        password, onPasswordChange: updatePassword,
        passwordConfirmation, onPasswordConfirmationChange: updatePasswordConfirmation,
        showPassword, onToggleShowPassword: () => setShowPassword(s => !s),
        phone, onPhoneChange: updatePhone,
        country, onCountryChange: (c) => { setCountry(c); setShowCountry(false) },
        showCountry, onToggleCountry: () => setShowCountry(s => !s),
        fieldErrors, error, loading, onSubmit: handleSubmit, onGoToLogin: goToLogin,
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

                <div className="flex-1 flex items-start justify-center pt-10 px-4 pb-10">
                    <div className="w-full max-w-[568px] bg-[#ffffff] border border-gray-200
                          rounded-2xl shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4
                            border-b border-gray-100 bg-[#ffffff]">
                            <button onClick={() => router.back()}>
                                <X size={18} color="#1a1a1a" />
                            </button>
                            <span className="text-sm font-semibold text-[#304333]">
                                Sign up
                            </span>
                            <div className="w-5" />
                        </div>

                        <div className="px-8 py-6 bg-[#ffffff]">
                            <SignupForm {...formProps} />
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
                        Sign up
                    </span>
                    <div className="w-5" />
                </div>

                <div className="px-4 py-6 flex-1 overflow-y-auto">
                    <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm px-5 py-6">
                        <SignupForm {...formProps} />
                    </div>
                </div>
            </div>

        </div>
    )
}

export default function SignupPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#faf8f1] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e]
                        border-t-transparent animate-spin" />
            </div>
        }>
            <SignupInner />
        </Suspense>
    )
}
