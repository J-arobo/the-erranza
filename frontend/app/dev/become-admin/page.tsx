'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function DevBecomeAdminPage() {
  const { isLoggedIn, addAdminRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/dev/become-admin')
      return
    }
    addAdminRole()
    router.push('/admin')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  return null
}
