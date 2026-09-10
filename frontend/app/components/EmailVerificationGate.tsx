'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MailCheck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'

// Full-screen block for a brand-new account that has never confirmed its email.
// An established account mid email-change keeps its access and uses the toast.
export default function EmailVerificationGate() {
  const { user, ready, refreshUser, logout } = useAuth()
  const pathname = usePathname()

  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [resentJustNow, setResentJustNow] = useState(false)

  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)

  useEffect(() => {
    setError(''); setResentJustNow(false)
    setEditingEmail(false); setNewEmail('')
  }, [user?.id])

  const mustVerify = ready && !!user && !user.emailVerified
  const suppressed = pathname?.startsWith('/team-invite') || pathname?.startsWith('/verify-email')

  // While the gate is up, quietly re-check so it clears itself the moment
  // they open the link on their phone or in another tab.
  useEffect(() => {
    if (!mustVerify || suppressed) return
    const id = setInterval(() => { refreshUser().catch(() => {}) }, 4000)
    return () => clearInterval(id)
  }, [mustVerify, suppressed, refreshUser])

  if (!mustVerify || suppressed) return null

  const targetEmail = user!.pendingEmail || user!.email

  async function handleResend() {
    setResending(true); setError('')
    try {
      await apiFetch('/auth/email/send-verification', { method: 'POST' })
      setResentJustNow(true)
      setTimeout(() => setResentJustNow(false), 30000)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setResending(false)
    }
  }

  async function handleSaveEmail() {
    if (!newEmail.trim()) return
    setSavingEmail(true); setError('')
    try {
      await apiFetch('/auth/email/change-unverified', {
        method: 'POST',
        body: JSON.stringify({ new_email: newEmail.trim() }),
      })
      await refreshUser()
      setEditingEmail(false); setNewEmail('')
      setResentJustNow(true)
      setTimeout(() => setResentJustNow(false), 30000)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSavingEmail(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[400] bg-white flex items-center justify-center px-5 overflow-y-auto">
      <div className="w-full max-w-sm text-center py-10">
        <div className="w-14 h-14 rounded-full bg-[#fbe4d8] flex items-center justify-center mx-auto mb-5">
          <MailCheck size={24} color="#c2542f" />
        </div>
        <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">Confirm your email to get started</h1>
        <p className="text-sm text-gray-500 mb-6">
          We sent a confirmation link to <span className="font-semibold text-[#1a1a1a]">{targetEmail}</span>.
          Open it to activate your account — this screen will update on its own.
        </p>

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        {!editingEmail ? (
          <>
            <button onClick={handleResend} disabled={resending || resentJustNow}
              className="w-full py-3 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-40 mb-2">
              {resentJustNow ? 'New link sent — check your inbox' : resending ? 'Sending…' : "Didn't get it? Resend link"}
            </button>

            <p className="text-xs text-gray-400 mt-3">Check your spam folder if it's not in your inbox.</p>

            <button onClick={() => { setEditingEmail(true); setNewEmail(user!.pendingEmail || user!.email); setError('') }}
              className="text-xs text-gray-400 underline mt-4 block mx-auto">
              Wrong email address?
            </button>
          </>
        ) : (
          <>
            <input type="email" value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="you@example.com" autoFocus
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors mb-3" />
            <button onClick={handleSaveEmail} disabled={savingEmail || !newEmail.trim()}
              className="w-full py-3 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-40 mb-2">
              {savingEmail ? 'Saving…' : 'Save & send new link'}
            </button>
            <button onClick={() => { setEditingEmail(false); setError('') }}
              className="w-full py-2 text-sm font-semibold text-gray-400">Cancel</button>
          </>
        )}

        <button onClick={logout} className="text-xs text-gray-400 underline mt-8 block mx-auto">
          Sign out
        </button>
      </div>
    </div>
  )
}
