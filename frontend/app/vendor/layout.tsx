'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import VendorShell from '@/components/vendor/VendorShell'

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

useEffect(() => {
  if (!isLoggedIn) router.push('/login?redirect=/vendor')
}, [isLoggedIn])

  if (!isLoggedIn) return null
  return <VendorShell>{children}</VendorShell>
}