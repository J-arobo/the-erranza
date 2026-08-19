'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { ApiError, apiFetch, apiErrorMessage } from '@/lib/api'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

export default function PartnerSignupPage() {
  const router = useRouter()
  const { isLoggedIn, user, register, logout, becomePartner } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; email?: string; password?: string; passwordConfirmation?: string }>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  const canCreate = fullName.trim() && email.trim() && password.trim() && agreed

  async function handleCreateAccount() {
    if (!canCreate) return

    const errors: typeof fieldErrors = {}
    if (password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (passwordConfirmation !== password) errors.passwordConfirmation = 'Passwords do not match'
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})
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
    setConfirmPasswordError('')
    setError('')
    setLoading(true)
    try {
      await apiFetch('/auth/verify-password', {
        method: 'POST',
        body: JSON.stringify({ password: confirmPassword }),
      })
      await becomePartner()
      router.push('/vendor/onboarding')
    } catch (err) {
      if (err instanceof ApiError && err.errors?.password) {
        setConfirmPasswordError(err.errors.password[0])
      } else {
        setError(apiErrorMessage(err))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      <div className="px-6 sm:px-8 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
        <button
          onClick={() => router.push(isLoggedIn ? '/partner/signup' : '/partner/login')}
          className="text-sm font-semibold text-[#304333] hover:text-[#2c4a1e] transition-colors"
        >
          Sign in
        </button>
      </div>


      <div className="flex-1 flex items-start justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-[480px]">

        {isLoggedIn && user ? (
            // ── Screen c1: link existing traveller account ──
            <>
              <h2 className="text-2xl font-bold text-[#304333] mb-2">
                {(Date.now() - new Date(user.createdAt).getTime()) < 10 * 60 * 1000
                  ? `Great, ${user.name.split(' ')[0]}!`
                  : `Welcome back, ${user.name.split(' ')[0]}`}
              </h2>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {(Date.now() - new Date(user.createdAt).getTime()) < 10 * 60 * 1000
                  ? "You've just created your Erranza account. Add partner access to it now — you'll be able to switch between booking trips and managing listings."
                  : "You already have a traveller account on Erranza. Add partner access to the same login — you'll be able to switch between booking trips and managing listings."}
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
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError('') }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleContinueAsPartner() }}
                    className={`w-full border rounded-xl pl-4 pr-10 py-3 text-sm
                               outline-none focus:border-[#304333] transition-colors
                               ${confirmPasswordError ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPasswordError && <p className="text-xs text-red-500 mt-1">{confirmPasswordError}</p>}
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
                you list on Erranza.{' '}
                <button onClick={() => router.push('/partner/login')}
                  className="text-[#304333] font-semibold underline"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Already have an account? Log in
                </button>
              </p>

              <div className="flex flex-col gap-4 mb-5">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Full name</p>
                  <input
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); setFieldErrors(fe => ({ ...fe, fullName: undefined })) }}
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
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(fe => ({ ...fe, email: undefined })) }}
                    placeholder="sarah@maraexpeditions.co.ke"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                               outline-none focus:border-[#304333] transition-colors"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password</p>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setFieldErrors(fe => ({ ...fe, password: undefined })) }}
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
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Confirm password</p>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordConfirmation}
                    onChange={(e) => { setPasswordConfirmation(e.target.value); setFieldErrors(fe => ({ ...fe, passwordConfirmation: undefined })) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleCreateAccount() }}
                    className={`w-full border rounded-xl px-4 py-3 text-sm
                               outline-none focus:border-[#304333] transition-colors
                               ${fieldErrors.passwordConfirmation ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {fieldErrors.passwordConfirmation && <p className="text-xs text-red-500 mt-1">{fieldErrors.passwordConfirmation}</p>}
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
