'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Navbar from './Navbar'
import CategoryBar from './CategoryBar'
import SearchBar from './SearchBar'
import BottomNav from './BottomNav'

const slugMap: Record<string, string> = {
  'Stays':       '/destinations/stays',
  'Flights':     '/destinations/flights',
  'Safari':      '/destinations/safari',
  'Market':      '/destinations/market',
  'Experiences': '/destinations/experiences',
  'Directory':   '/destinations/directory',
  'Packages':    '/destinations/packages',
  'Car Rentals': '/destinations/car-rentals',
}

const pathToTab: Record<string, string> = {
  '/':                         'Stays',
  '/destinations/stays':       'Stays',
  '/destinations/flights':     'Flights',
  '/destinations/safari':      'Safari',
  '/destinations/market':      'Market',
  '/destinations/experiences': 'Experiences',
  '/destinations/directory':   'Directory',
  '/destinations/packages':    'Packages',
  '/destinations/car-rentals': 'Car Rentals',
}

const pathToNav: Record<string, string> = {
  '/':          'Explore',
  '/wishlists': 'Wishlists',
  '/trips':     'Trips',
  '/messages':  'Messages',
  '/profile':   'Profile',
  '/login':     'Log in',
}

type Props = { children: React.ReactNode; showCollapse?: boolean }

export default function AppShell({ children, showCollapse = false }: Props) {
  const router   = useRouter()
  const pathname = usePathname()

  const [scrollY, setScrollY]             = useState(0)
  const [scrollingDown, setScrollingDown] = useState(false)

  const lastScrollY  = useRef<number>(0)
  const ticking      = useRef<boolean>(false)
  const mainRef      = useRef<HTMLDivElement | null>(null)
  const hideTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── NEW: accumulative scroll tracking ──────────────────────────────────
  const scrollAccum = useRef<number>(0)
  const lastDir     = useRef<'up' | 'down' | null>(null)
  // ───────────────────────────────────────────────────────────────────────

  const activeTab = pathToTab[pathname] ?? 'Stays'
  const scrolled  = scrollY > 10

  const handleScroll = useCallback(() => {
    if (ticking.current) return
    ticking.current = true
    requestAnimationFrame(() => {
      const el = mainRef.current
      if (!el) { ticking.current = false; return }

      const current = el.scrollTop
      const delta   = current - lastScrollY.current

      setScrollY(current)

      // ── Accumulate scroll in same direction ──────────────────────────
      if (delta > 0) {
        if (lastDir.current !== 'down') {
          scrollAccum.current = 0        // reset on direction change
          lastDir.current = 'down'
        }
        scrollAccum.current += delta
      } else if (delta < 0) {
        if (lastDir.current !== 'up') {
          scrollAccum.current = 0
          lastDir.current = 'up'
        }
        scrollAccum.current += Math.abs(delta)
      }

      // Only hide after scrolling DOWN 120px continuously
      if (lastDir.current === 'down' && scrollAccum.current > 120) {
        if (hideTimeout.current) clearTimeout(hideTimeout.current)
        hideTimeout.current = setTimeout(() => setScrollingDown(true), 150)
        scrollAccum.current = 0          // reset after triggering
      }

      // Show after scrolling UP 40px
      if (lastDir.current === 'up' && scrollAccum.current > 40) {
        if (hideTimeout.current) clearTimeout(hideTimeout.current)
        setScrollingDown(false)
        scrollAccum.current = 0
      }

      // Always show when near the very top
      if (current < 60) {
        if (hideTimeout.current) clearTimeout(hideTimeout.current)
        setScrollingDown(false)
        scrollAccum.current = 0
      }
      // ────────────────────────────────────────────────────────────────

      lastScrollY.current = current
      ticking.current = false
    })
  }, [])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      el.removeEventListener('scroll', handleScroll)
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
    }
  }, [handleScroll])

  function handleTabSelect(name: string) {
    const path = slugMap[name]
    if (path) router.push(path)
  }

  function handleNavSelect(name: string) {
    const routes: Record<string, string> = {
      'Explore':   '/',
      'Wishlists': '/wishlists',
      'Trips':     '/trips',
      'Messages':  '/messages',
      'Profile':   '/profile',
      'Log in':    '/login',
    }
    const path = routes[name]
    if (path) router.push(path)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        backgroundColor: '#faf8f1',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          backgroundColor: '#faf8f1',
          boxShadow: scrolled ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div
          style={{
            overflow: 'hidden',
            maxHeight: scrollingDown ? '0px' : '200px',
            opacity: scrollingDown ? 0 : 1,
            transition: 'max-height 0.3s ease, opacity 0.2s ease',
          }}
        >
          <Navbar />
          <CategoryBar
            active={activeTab}
            onSelect={handleTabSelect}
            scrollY={scrollY}
            collapsed={false}
          />
        </div>

        <SearchBar
          collapsed={scrolled}
          activeCat={activeTab}
          activeTab={activeTab}
          onTabSelect={handleTabSelect}
          scrollY={scrollY}
        />
      </div>

      <div
        ref={mainRef}
        style={{
          flex: 1,
          overflowY: 'scroll',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '80px',
        }}
      >
        {children}
      </div>

      <BottomNav
        active={pathToNav[pathname] ?? 'Explore'}
        onSelect={handleNavSelect}
        scrollingDown={scrollingDown}
        scrolled={scrolled}
      />
    </div>
  )
}