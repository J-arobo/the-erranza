'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { X } from 'lucide-react'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function ForgotPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState(() => searchParams.get('email') ?? '')
  const [fieldError, setFieldError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit() {
    if (!email.trim()) {
      setFieldError('Email is required')
      return
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setFieldError('Enter a valid email address')
      return
    }

    setFieldError('')
    setError('')
    setLoading(true)
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      })
      setSent(true)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const content = sent ? (
    <div className="text-center py-6">
      <h2 className="text-xl font-bold text-[#304333] mb-2">Check your email</h2>
      <p className="text-sm text-gray-500 mb-6">
        If an account exists for <span className="font-semibold text-[#304333]">{email}</span>, we&apos;ve sent a link to reset your password.
      </p>
      <button onClick={() => router.push('/login')} className="text-sm text-[#304333] font-semibold underline"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        Back to log in
      </button>
    </div>
  ) : (
    <div>
      <h2 className="text-2xl font-bold text-[#304333] mb-2">Forgot your password?</h2>
      <p className="text-sm text-gray-500 mb-5">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs rounded-xl px-3 py-2.5 mb-4">
          {error}
        </div>
      )}

      <p className="text-[10px] text-gray-500 mb-1">Email</p>
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setFieldError('') }}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
        placeholder="you@example.com"
        className={`w-full border rounded-xl px-3 py-3 text-sm mb-1
                   text-[#304333] outline-none placeholder:text-gray-400 bg-white
                   ${fieldError ? 'border-red-400' : 'border-gray-400'}`}
      />
      {fieldError && <p className="text-xs text-red-500 mb-2">{fieldError}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                   transition-colors mb-4 mt-3 disabled:opacity-60"
        style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
      >
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <p className="text-xs text-gray-400 text-center">
        <button type="button" onClick={() => router.push('/login')} className="text-[#304333] font-semibold underline"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          Back to log in
        </button>
      </p>
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
              <button onClick={() => router.back()}>
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
          <button onClick={() => router.back()}>
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

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#faf8f1] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e]
                        border-t-transparent animate-spin" />
      </div>
    }>
      <ForgotPasswordInner />
    </Suspense>
  )
}
