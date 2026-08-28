'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import AdminShell from '@/components/admin/AdminShell'
import { NavigationGuardProvider } from '@/context/NavigationGuardContext'

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

    // Even a fully valid, role-matching session isn't enough on its own —
    // /admin requires having actually typed credentials into the
    // admin-flagged login flow in THIS browser tab. A traveller-context
    // session that happens to hold the admin role doesn't get waved
    // through just because the token is valid.
    if (sessionStorage.getItem('erranza_admin_verified') !== 'true') {
      logout()
      router.push('/login?redirect=/admin')
      return
    }

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

  return (
    <NavigationGuardProvider>
      <AdminShell>{children}</AdminShell>
    </NavigationGuardProvider>
  )
}
