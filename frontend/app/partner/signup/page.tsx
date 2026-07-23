'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiErrorMessage } from '@/lib/api'

export default function PartnerSignupPage() {
  const router = useRouter()
  const { isLoggedIn, user, register, logout, becomePartner } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [confirmPassword, setConfirmPassword] = useState('')

  const canCreate = fullName.trim() && email.trim() && password.trim() && agreed

  async function handleCreateAccount() {
    if (!canCreate) return
    setError('')
    setLoading(true)
    try {
      await register(fullName.trim(), email.trim(), password)
      await becomePartner()
      router.push('/vendor/onboarding')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  async function handleContinueAsPartner() {
    if (!confirmPassword.trim()) return
    setError('')
    setLoading(true)
    try {
      await becomePartner()
      router.push('/vendor/onboarding')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <div className="px-6 sm:px-8 py-4 border-b border-gray-200 flex items-center">
        <span
          onClick={() => router.push('/')}
          className="text-[var(--dark-green)] text-41 font-bold text-buenard tracking-tight cursor-pointer"
        >
          Erranza
        </span>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px]">

          {isLoggedIn && user ? (
            // ── Screen c1: link existing traveller account ──
            <>
              <h2 className="text-2xl font-bold text-[#304333] mb-2">
                Welcome back, {user.name.split(' ')[0]}
              </h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                You already have a traveller account on Erranza. Add partner access to the
                same login — you'll be able to switch between booking trips and managing listings.
              </p>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-4 mb-5">
                <div className="w-10 h-10 rounded-full bg-[#304333] flex items-center
                                justify-center text-[#EAF98E] text-sm font-bold flex-shrink-0">
                  {user.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <label className="text-sm text-gray-600 mb-4 block">
                Confirm your password to continue as a partner:
              </label>
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</p>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                             outline-none focus:border-[#304333] transition-colors"
                />
              </div>

              {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

              <button
                onClick={handleContinueAsPartner}
                disabled={!confirmPassword.trim() || loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                           transition-colors mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
              >
                {loading ? 'Please wait…' : 'Continue as partner →'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Not you?{' '}
                <button onClick={() => logout()} className="text-[#304333] font-semibold underline">
                  Use a different account
                </button>
              </p>
            </>
          ) : (
            // ── Screen b: fresh partner account ──
            <>
              <h2 className="text-2xl font-bold text-[#304333] mb-2">
                Create your partner account
              </h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                This is separate from a traveller account — you'll use it to manage everything
                you list on Erranza.
              </p>

              <div className="flex flex-col gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full name</p>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Sarah Wanjiru"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                               outline-none focus:border-[#304333] transition-colors"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email</p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@maraexpeditions.co.ke"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                               outline-none focus:border-[#304333] transition-colors"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</p>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                               outline-none focus:border-[#304333] transition-colors"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer mb-5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#f36336] flex-shrink-0"
                />
                <span className="text-sm text-gray-600">
                  I agree to Erranza's Partner Terms and Payout Policy
                </span>
              </label>

              {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

              <button
                onClick={handleCreateAccount}
                disabled={!canCreate || loading}
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                           transition-colors mb-5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
              >
                {loading ? 'Please wait…' : 'Create account →'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
