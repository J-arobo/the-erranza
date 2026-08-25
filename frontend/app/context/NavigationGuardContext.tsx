'use client'
import { createContext, useContext, useRef, useCallback } from 'react'

type NavigationGuardContextType = {
  registerGuard: (check: () => boolean) => void
  unregisterGuard: () => void
  confirmNavigation: () => boolean
}

const NavigationGuardContext = createContext<NavigationGuardContextType>({
  registerGuard: () => {},
  unregisterGuard: () => {},
  confirmNavigation: () => true,
})

export function NavigationGuardProvider({ children }: { children: React.ReactNode }) {
  const guardRef = useRef<(() => boolean) | null>(null)

  const registerGuard = useCallback((check: () => boolean) => {
    guardRef.current = check
  }, [])
  const unregisterGuard = useCallback(() => {
    guardRef.current = null
  }, [])
  const confirmNavigation = useCallback(() => {
    if (guardRef.current && guardRef.current()) {
      return window.confirm('You have unsaved changes. Leave without saving?')
    }
    return true
  }, [])

  return (
    <NavigationGuardContext.Provider value={{ registerGuard, unregisterGuard, confirmNavigation }}>
      {children}
    </NavigationGuardContext.Provider>
  )
}

export function useNavigationGuard() {
  return useContext(NavigationGuardContext)
}
