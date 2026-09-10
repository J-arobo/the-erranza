'use client'
import { useEffect, useState } from 'react'
import { Mail, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'

// Toast, only for an established account confirming a *new* email address.
// A never-verified account is handled by the full-screen gate instead.
export default function EmailVerificationBanner() {
  const { user, refreshUser } = useAuth()
  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [resending, setResending] = useState(false)
  const [resentJustNow, setResentJustNow] = useState(false)
  const [error, setError] = useState('')

  const needsVerification = !!user && user.emailVerified && !!user.pendingEmail
  const suppressed = pathname?.startsWith('/vendor/onboarding')
    || pathname?.startsWith('/verify-email')
    || pathname?.startsWith('/team-invite')

  useEffect(() => {
    setError(''); setResentJustNow(false)
    if (!user || !needsVerification) { setVisible(false); return }
    const key = `erranza_email_verify_toast_shown_${user.id}`
    try {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1')
        setVisible(true)
      } else { setVisible(false) }
    } catch { setVisible(true) }
  }, [user?.id, needsVerification])

  useEffect(() => {
    if (!needsVerification || !visible || suppressed) return
    const id = setInterval(() => { refreshUser().catch(() => {}) }, 5000)
    return () => clearInterval(id)
  }, [needsVerification, visible, suppressed, refreshUser])

  if (!needsVerification || !visible || suppressed) return null

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

  return (
    <div className="fixed bottom-5 right-5 z-[300] w-80 max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-[#fbe4d8] flex items-center justify-center flex-shrink-0">
        <Mail size={18} color="#c2542f" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#1a1a1a]">Confirm your new email</p>
        <p className="text-xs text-gray-500 mt-0.5">
          We sent a link to {user!.pendingEmail}. Open it to finish the change.
        </p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        <button onClick={handleResend} disabled={resending || resentJustNow}
          className="mt-2 px-3 py-1.5 rounded-full bg-[#e8734a] text-white text-xs font-semibold hover:bg-[#d4642f] transition-colors disabled:opacity-50">
          {resentJustNow ? 'Link sent' : resending ? 'Sending…' : 'Resend link'}
        </button>
      </div>
      <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}
