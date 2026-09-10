'use client'
import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MailCheck, XCircle } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'


type Props = { params: Promise<{ token: string }> }

export default function VerifyEmailPage({ params }: Props) {
  const { token } = use(params)
  const router = useRouter()
  const { isLoggedIn, refreshUser } = useAuth()
  
  const [state, setState] = useState<'working' | 'done' | 'error'>('working')
  const [error, setError] = useState('')
  const fired = useRef(false)
  const [result, setResult] = useState<{ changed: boolean; email: string } | null>(null)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    apiFetch(`/auth/email/verify/${token}`)
    apiFetch<{ verified: boolean; changed: boolean; email: string }>(`/auth/email/verify/${token}`)
      .then(async (res) => {
        setResult({ changed: res.changed, email: res.email })
        setState('done')
        if (isLoggedIn) await refreshUser().catch(() => {})
      })
      .catch((err) => {
        setState('error')
        setError(apiErrorMessage(err))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])


  useEffect(() => {
    let cancelled = false
    apiFetch(`/auth/email/verify/${token}`)
    apiFetch<{ verified: boolean; changed: boolean; email: string }>(`/auth/email/verify/${token}`)
      .then(async (res) => {
        setResult({ changed: res.changed, email: res.email })
        setState('done')
        if (isLoggedIn) await refreshUser().catch(() => {})
      })
      .catch((err) => {
        if (cancelled) return
        setState('error')
        setError(apiErrorMessage(err))
      })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-white">
      <div className="w-full max-w-sm text-center">
        {state === 'working' && (
          <>
            <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500">Confirming your email…</p>
          </>
        )}
        {state === 'done' && (
          <>
            <div className="w-14 h-14 rounded-full bg-[#e6f0e0] flex items-center justify-center mx-auto mb-5">
              <MailCheck size={24} color="#2c4a1e" />
            </div>
            <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">
              {result?.changed ? 'Email changed' : 'Email confirmed'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {result?.changed
                ? <>Your login email is now <span className="font-semibold text-[#1a1a1a]">{result.email}</span>. You can close this tab.</>
                : "You're all set. You can close this tab and continue in the app."}
            </p>
            <button onClick={() => router.push(isLoggedIn ? '/' : '/login')}
              className="px-5 py-2.5 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold hover:bg-[#3d6b28] transition-colors">
              Continue
            </button>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5">
              <XCircle size={24} color="#dc2626" />
            </div>
            <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">Link expired</h1>
            <p className="text-sm text-gray-500 mb-6">{error || 'This confirmation link is invalid or has expired.'}</p>
            <button onClick={() => router.push('/')}
              className="px-5 py-2.5 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold hover:bg-[#3d6b28] transition-colors">
              Go to Erranza
            </button>
            <p className="text-xs text-gray-400 mt-4">You can request a new link from inside the app.</p>
          </>
        )}
      </div>
    </div>
  )
}
