'use client'
import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ApiError, apiErrorMessage } from '@/lib/api'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function PartnerLoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const redirect = searchParams.get('redirect') ?? '/vendor'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    const errors: typeof fieldErrors = {}
    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = 'Enter a valid email address'
    }
    if (!password) {
      errors.password = 'Password is required'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('')
      return
    }

    setFieldErrors({})
    setError('')
    setLoading(true)
    try {
      const loggedInUser = await login(email.trim(), password)
      if (!loggedInUser.roles.includes('partner')) {
        router.push('/partner/signup')
        return
      }
      router.replace(redirect)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setError(err.errors?.email?.[0] ?? err.errors?.password?.[0] ?? 'These credentials do not match our records.')
      } else {
        setError(apiErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
    setFieldErrors({})
    setError('')
    setLoading(true)
    try {
      const loggedInUser = await login(email.trim(), password)
      if (!loggedInUser.roles.includes('partner')) {
        router.push('/partner/signup')
        return
      }
      router.replace(redirect)
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setError(err.errors?.email?.[0] ?? err.errors?.password?.[0] ?? 'These credentials do not match our records.')
      } else {
        setError(apiErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }

  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <div className="px-6 sm:px-8 py-4 border-b border-gray-200 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <ArrowLeft size={20} />
        </button>
        <span
          onClick={() => router.push('/')}
          className="text-[var(--dark-green)] text-41 font-bold text-buenard tracking-tight cursor-pointer"
        >
          Erranza
        </span>
      </div>


      <div className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px]">

          <h2 className="text-2xl font-bold text-[#304333] mb-2">
            Log in to your partner account
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Manage your listings, bookings and messages from your vendor dashboard.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4 mb-2">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</p>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFieldErrors(fe => ({ ...fe, email: undefined })) }}
                placeholder="sarah@maraexpeditions.co.ke"
                className={`w-full border rounded-xl px-4 py-3 text-sm
                           outline-none focus:border-[#304333] transition-colors
                           ${fieldErrors.email ? 'border-red-400' : 'border-gray-300'}`}
              />
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</p>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors(fe => ({ ...fe, password: undefined })) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                  className={`w-full border rounded-xl pl-4 pr-10 py-3 text-sm
                             outline-none focus:border-[#304333] transition-colors
                             ${fieldErrors.password ? 'border-red-400' : 'border-gray-300'}`}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>
          </div>

          <button onClick={() => router.push(`/forgot-password?email=${encodeURIComponent(email)}`)} type="button"
            className="text-xs text-[#304333] underline mb-5"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Forgot password?
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                       transition-colors mb-5 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
          >
            {loading ? 'Logging in…' : 'Log in →'}
          </button>

          <p className="text-center text-sm text-gray-500">
            New partner?{' '}
            <button onClick={() => router.push(`/partner/signup?redirect=${encodeURIComponent(redirect)}`)}
              className="text-[#304333] font-semibold underline"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PartnerLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    }>
      <PartnerLoginInner />
    </Suspense>
  )
}
