'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function DevBecomeSuperAdminPage() {
  const { isLoggedIn, addSuperAdminRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/dev/become-super-admin')
      return
    }
    addSuperAdminRole()
    router.push('/super-admin')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  return null
}
