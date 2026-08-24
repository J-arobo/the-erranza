'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import AdminShell from '@/components/admin/AdminShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, ready, logout } = useAuth()
  const router = useRouter()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!ready) return

    if (!isLoggedIn) {
      router.push('/login?redirect=/admin')
      return
    }

    // Re-verify with the server on every admin-area load instead of trusting
    // the cached client-side role — access can be revoked mid-session (token
    // expired, role changed, logged out elsewhere) without the local state
    // knowing, which used to leave the dashboard shell rendered with a raw
    // "Admin access required." error banner instead of a real login screen.
    apiFetch<{ user: { roles: string[] } }>('/auth/me')
      .then(({ user }) => {
        const stillAdmin = user.roles.includes('admin') || user.roles.includes('super_admin')
        if (!stillAdmin) {
          logout()
          router.push('/login?redirect=/admin')
          return
        }
        setVerified(true)
      })
      .catch(() => {
        logout()
        router.push('/login?redirect=/admin')
      })
  }, [ready, isLoggedIn])

  if (!ready || !isLoggedIn || !verified) return null

  return <AdminShell>{children}</AdminShell>
}
