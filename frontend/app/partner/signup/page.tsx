'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function PartnerSignupPage() {
  const router = useRouter()
  const { isLoggedIn, user, login, logout, addPartnerRole } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)

  const [confirmPassword, setConfirmPassword] = useState('')

  const canCreate = fullName.trim() && email.trim() && password.trim() && agreed

  function handleCreateAccount() {
    if (!canCreate) return
    login({ name: fullName.trim(), email: email.trim(), roles: ['traveller', 'partner'], activeRole: 'partner' })
    router.push('/vendor/onboarding')
  }

  function handleGoogleSignup() {
    login({ name: 'Google User', email: 'user@gmail.com', roles: ['traveller', 'partner'], activeRole: 'partner' })
    router.push('/vendor/onboarding')
  }

  function handleContinueAsPartner() {
    if (!confirmPassword.trim()) return
    addPartnerRole()
    router.push('/vendor/onboarding')
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

              <button
                onClick={handleContinueAsPartner}
                disabled={!confirmPassword.trim()}
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                           transition-colors mb-4 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
              >
                Continue as partner →
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

              <button
                onClick={handleCreateAccount}
                disabled={!canCreate}
                className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                           transition-colors mb-5 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
              >
                Create account →
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <button
                onClick={handleGoogleSignup}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#f0f0f0]
                           rounded-xl text-sm font-semibold text-[#1a1a1a]
                           hover:bg-[#e8e8e8] transition-colors"
              >
                <span className="flex-shrink-0 w-5 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
                <span className="flex-1 text-center">Continue with Google</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
