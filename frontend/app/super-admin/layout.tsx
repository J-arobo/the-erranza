'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import SuperAdminShell from '@/components/super-admin/SuperAdminShell'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, ready, logout } = useAuth()
  const router = useRouter()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (!ready) return

    if (!isLoggedIn) {
      router.push('/login?redirect=/super-admin')
      return
    }

    // Same step-up requirement as /admin — a valid session that merely
    // happens to hold the super_admin role isn't enough on its own; it
    // has to have come through the super-admin-flagged login flow in
    // this tab. Kept as a separate sessionStorage key from admin's own,
    // since these are different privilege levels.
    if (sessionStorage.getItem('erranza_super_admin_verified') !== 'true') {
      logout()
      router.push('/login?redirect=/super-admin')
      return
    }

    apiFetch<{ user: { roles: string[] } }>('/auth/me')
      .then(({ user }) => {
        if (!user.roles.includes('super_admin')) {
          logout()
          router.push('/login?redirect=/super-admin')
          return
        }
        setVerified(true)
      })
      .catch(() => {
        logout()
        router.push('/login?redirect=/super-admin')
      })
  }, [ready, isLoggedIn])

  if (!ready || !isLoggedIn || !verified) return null

  return <SuperAdminShell>{children}</SuperAdminShell>
}
