'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ApiError, apiFetch, apiErrorMessage } from '@/lib/api'
import { X, Eye, EyeOff } from 'lucide-react'

function ResetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const email = searchParams.get('email') ?? ''

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; passwordConfirmation?: string }>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    const errors: typeof fieldErrors = {}
    if (!password) errors.password = 'Password is required'
    else if (password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (passwordConfirmation !== password) errors.passwordConfirmation = 'Passwords do not match'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
    setError('')
    setLoading(true)
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email, token, password,
          password_confirmation: passwordConfirmation,
        }),
      })
      setDone(true)
    } catch (err) {
      if (err instanceof ApiError && err.errors?.email) {
        setError(err.errors.email[0])
      } else {
        setError(apiErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-bold text-[#304333] mb-2">Invalid reset link</h2>
          <p className="text-sm text-gray-500 mb-6">This password reset link is missing or malformed. Request a new one below.</p>
          <button onClick={() => router.push('/forgot-password')} className="text-sm text-[#304333] font-semibold underline"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Request a new link
          </button>
        </div>
      </div>
    )
  }

  const content = done ? (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-[#304333] mb-2">Password updated</h2>
      <p className="text-sm text-gray-500 mb-6">You can now log in with your new password.</p>
      <button onClick={() => router.push('/login')}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold"
        style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}>
        Go to log in
      </button>
    </div>
  ) : (
    <div>
      <h2 className="text-2xl font-bold text-[#304333] mb-1">Set a new password</h2>
      <p className="text-sm text-gray-500 mb-5">for {email}</p>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3 mb-1">
        <div>
          <p className="text-[10px] text-gray-500 mb-1">New password</p>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors(fe => ({ ...fe, password: undefined })) }}
              className={`w-full border rounded-xl pl-3 pr-10 py-3 text-sm
                         text-[#304333] outline-none bg-white
                         ${fieldErrors.password ? 'border-red-400' : 'border-gray-400'}`}
            />
            <button type="button" onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
        </div>

        <div>
          <p className="text-[10px] text-gray-500 mb-1">Confirm new password</p>
          <input
            type={showPassword ? 'text' : 'password'}
            value={passwordConfirmation}
            onChange={(e) => { setPasswordConfirmation(e.target.value); setFieldErrors(fe => ({ ...fe, passwordConfirmation: undefined })) }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            className={`w-full border rounded-xl px-3 py-3 text-sm
                       text-[#304333] outline-none bg-white
                       ${fieldErrors.passwordConfirmation ? 'border-red-400' : 'border-gray-400'}`}
          />
          {fieldErrors.passwordConfirmation && <p className="text-xs text-red-500 mt-1">{fieldErrors.passwordConfirmation}</p>}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                   transition-colors mb-2 mt-4 disabled:opacity-60"
        style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
      >
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </div>
  )

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
              <button onClick={() => router.push('/login')}>
                <X size={18} color="#1a1a1a" />
              </button>
              <span className="text-sm font-semibold text-[#304333]">
                Reset password
              </span>
              <div className="w-5" />
            </div>

            <div className="px-8 py-6 bg-[#ffffff]">
              {content}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE — full screen ── */}
      <div className="sm:hidden flex flex-col flex-1 min-h-screen bg-[#ffffff]">
        <div className="flex items-center justify-between px-4 py-3
                        border-b border-gray-200 sticky top-0 bg-[#ffffff] z-10">
          <button onClick={() => router.push('/login')}>
            <X size={18} color="#1a1a1a" />
          </button>
          <span className="text-sm font-semibold text-[#1a1a1a]">
            Reset password
          </span>
          <div className="w-5" />
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-gray-100
                          shadow-sm px-5 py-6">
            {content}
          </div>
        </div>
      </div>

    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f1] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e]
                        border-t-transparent animate-spin" />
      </div>
    }>
      <ResetPasswordInner />
    </Suspense>
  )
}
