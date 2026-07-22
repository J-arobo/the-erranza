'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import SuperAdminShell from '@/components/super-admin/SuperAdminShell'

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth()
  const router = useRouter()
  const isSuperAdmin = !!user?.roles?.includes('super_admin')

  useEffect(() => {
    if (!isLoggedIn || !isSuperAdmin) {
      router.push('/')
    }
  }, [isLoggedIn, isSuperAdmin])

  if (!isLoggedIn || !isSuperAdmin) return null

  return <SuperAdminShell>{children}</SuperAdminShell>
}
