'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import VendorShell from '@/components/vendor/VendorShell'

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isOnboardingRoute = pathname === '/vendor/onboarding'
  const isPartner = !!user?.roles?.includes('partner')

  useEffect(() => {
    if (!isLoggedIn || !isPartner) {
      router.push('/partner')
      return
    }
    if (!user?.onboardingComplete && !isOnboardingRoute) {
      router.push('/vendor/onboarding')
      return
    }
    if (user?.onboardingComplete && isOnboardingRoute) {
      router.push('/vendor')
    }
  }, [isLoggedIn, isPartner, user?.onboardingComplete, isOnboardingRoute])

  if (!isLoggedIn || !isPartner) return null
  if (isOnboardingRoute) return <>{children}</>
  if (!user?.onboardingComplete) return null

  return <VendorShell>{children}</VendorShell>
}
