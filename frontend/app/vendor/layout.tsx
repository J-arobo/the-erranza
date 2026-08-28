'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import VendorShell from '@/components/vendor/VendorShell'
import VerificationGate from '@/components/vendor/VerificationGate'
import VerificationCelebration from '@/components/vendor/VerificationCelebration'
import VendorTour from '@/components/vendor/VendorTour'

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, ready, markCelebrationSeen, markTourSeen } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isOnboardingRoute = pathname === '/vendor/onboarding'
  const isPartner = !!user?.roles?.includes('partner')
  const isVerified = user?.verificationStatus === 'approved'

  const [showCelebration, setShowCelebration] = useState(false)
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    if (!isVerified || !user || user.celebrationSeen) return
    setShowCelebration(true)
    markCelebrationSeen()
  }, [isVerified, user?.id, user?.celebrationSeen, markCelebrationSeen])

  useEffect(() => {
    if (!isVerified || !user || user.tourSeen || showCelebration) return
    setShowTour(true)
  }, [isVerified, user?.id, user?.tourSeen, showCelebration])

  useEffect(() => {
    if (!ready) return
    if (!isLoggedIn) {
      router.push('/')
      return
    }
    if (!isPartner) {
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
  }, [ready, isLoggedIn, isPartner, user?.onboardingComplete, isOnboardingRoute])

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }
  if (!isLoggedIn || !isPartner) return null
  if (isOnboardingRoute) return <>{children}</>
  if (!user?.onboardingComplete) return null
  if (!isVerified) return <VerificationGate />

  return (
    <>
      {showCelebration && <VerificationCelebration onDismiss={() => setShowCelebration(false)} />}
      {showTour && <VendorTour onFinish={() => { setShowTour(false); markTourSeen() }} />}
      <VendorShell>{children}</VendorShell>
    </>
  )
}
