'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ApiError, apiErrorMessage } from '@/lib/api'
import { X, Eye, EyeOff } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = Partial<Record<'email' | 'password', string>>

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Enter a valid email address'
  }
  if (!password) {
    errors.password = 'Password is required'
  }
  return errors
}

type LoginFormProps = {
  email: string
  onEmailChange: (v: string) => void
  password: string
  onPasswordChange: (v: string) => void
  showPassword: boolean
  onToggleShowPassword: () => void
  fieldErrors: FieldErrors
  error: string
  loading: boolean
  onSubmit: () => void
  onForgotPassword: () => void
  onGoToSignup: () => void
  isAdminLogin: boolean
}

// Hoisted to module scope so its identity is stable across LoginInner re-renders —
// defining this inside the page component would redefine (and remount) it on
// every keystroke, killing input focus after each character typed.
function LoginForm({
  email, onEmailChange, password, onPasswordChange, showPassword, onToggleShowPassword,
  fieldErrors, error, loading, onSubmit, onForgotPassword, onGoToSignup, isAdminLogin,
}: LoginFormProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#304333] mb-5">
        Welcome back
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 mb-1">
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
              onKeyDown={(e) => { if (e.key === 'Enter') onSubmit() }}
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
      </div>

      <button onClick={onForgotPassword} type="button"
        className="text-xs text-[#304333] underline mb-4"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        Forgot password?
      </button>

      <button
        onClick={onSubmit}
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                   transition-colors mb-4 disabled:opacity-60"
        style={{ background: isAdminLogin ? '#1e293b' : 'linear-gradient(to right, #f98a66, #f36336)' }}
      >
        {loading ? 'Logging in…' : 'Log in'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onGoToSignup} className="text-[#304333] font-semibold underline"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Sign up
        </button>
      </p>
    </div>
  )
}

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const redirect = searchParams.get('redirect') ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateEmail(v: string) {
    setEmail(v)
    if (fieldErrors.email) setFieldErrors(fe => ({ ...fe, email: undefined }))
  }
  function updatePassword(v: string) {
    setPassword(v)
    if (fieldErrors.password) setFieldErrors(fe => ({ ...fe, password: undefined }))
  }

  async function handleSubmit() {
    const errors = validate(email, password)
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
      if (redirect.startsWith('/admin')) {
        sessionStorage.setItem('erranza_admin_verified', 'true')
      } else if (redirect.startsWith('/super-admin')) {
        sessionStorage.setItem('erranza_super_admin_verified', 'true')
      }
      router.replace(redirect)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setError(err.errors?.email?.[0] ?? 'These credentials do not match our records.')
      } else {
        setError(apiErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  function goToSignup() {
    router.push(`/signup?redirect=${encodeURIComponent(redirect)}`)
  }
  function goToForgotPassword() {
    router.push(`/forgot-password?email=${encodeURIComponent(email)}`)
  }

  const formProps: LoginFormProps = {
    email, onEmailChange: updateEmail,
    password, onPasswordChange: updatePassword,
    showPassword, onToggleShowPassword: () => setShowPassword(s => !s),
    fieldErrors, error, loading, onSubmit: handleSubmit,
    onForgotPassword: goToForgotPassword, onGoToSignup: goToSignup,
    isAdminLogin: redirect.startsWith('/admin') || redirect.startsWith('/super-admin'),
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
                Log in
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
            Log in
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
