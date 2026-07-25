'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function DevBecomeSuperAdminPage() {
  const { isLoggedIn, user, addSuperAdminRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/dev/become-super-admin')
      return
    }
    if (!user?.roles?.includes('super_admin')) {
      addSuperAdminRole()
      return
    }
    router.push('/super-admin')
  }, [isLoggedIn, user, addSuperAdminRole, router])

  return null
}
