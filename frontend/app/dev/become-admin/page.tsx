'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function DevBecomeAdminPage() {
  const { isLoggedIn, user, addAdminRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/dev/become-admin')
      return
    }
    if (!user?.roles?.includes('admin')) {
      addAdminRole()
      return
    }
    router.push('/admin')
  }, [isLoggedIn, user, addAdminRole, router])

  return null
}
