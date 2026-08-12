'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import AdminShell from '@/components/admin/AdminShell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth()
  const router = useRouter()
  const isAdmin = !!user?.roles?.includes('admin') || !!user?.roles?.includes('super_admin')

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/admin')
      return
    }
    if (!isAdmin) {
      router.push('/')
    }
  }, [isLoggedIn, isAdmin])

  if (!isLoggedIn || !isAdmin) return null

  return <AdminShell>{children}</AdminShell>
}
