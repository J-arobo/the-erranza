'use client'
import { Search, Heart, User, Calendar, MessageCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

type Props = {
  active: string
  onSelect: (name: string) => void
  scrollingDown: boolean
  scrolled: boolean
}

export default function BottomNav({ active, onSelect, scrollingDown, scrolled }: Props) {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const guestItems = [
    { name: 'Explore',   Icon: Search },
    { name: 'Wishlists', Icon: Heart },
    { name: 'Log in',    Icon: User },
  ]

  const authItems = [
    { name: 'Explore',   Icon: Search },
    { name: 'Wishlists', Icon: Heart },
    { name: 'Trips',     Icon: Calendar },
    { name: 'Messages',  Icon: MessageCircle },
    { name: 'Profile',   Icon: User },
  ]

  const items = isLoggedIn ? authItems : guestItems

  function handleSelect(name: string) {
    const routes: Record<string, string> = {
      'Explore':   '/',
      'Wishlists': '/wishlists',
      'Log in':    '/login',
      'Trips':     '/trips',
      'Messages':  '/messages',
      'Profile':   '/profile',
    }
    const path = routes[name]
    if (path) router.push(path)
    onSelect(name)
  }

  return (
    // FIXED: pointer-events-none when hidden so it cannot block taps on content
    // FIXED: removed opacity-0 translate which left invisible blocking layer
    // FIXED: using style not className for the critical pointer-events
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        // When scrolling down: move off screen AND disable pointer events
        transform: scrollingDown ? 'translateY(100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
        // CRITICAL: this is what was missing — without this,
        // the hidden nav still catches all taps
        pointerEvents: scrollingDown ? 'none' : 'auto',
        // Safe area for iPhone home indicator
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: '8px',
      }}
    >
      <nav
        style={{
          backgroundColor: '#2c4a1e',
          borderRadius: '9999px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: scrolled ? '70%' : '80%',
          maxWidth: scrolled ? '280px' : '360px',
          padding: scrolled ? '6px 8px' : '8px 8px',
          transition: 'width 0.3s ease, max-width 0.3s ease, padding 0.3s ease',
        }}
      >
        {items.map(({ name, Icon }) => (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              flex: 1,
              // CRITICAL: minimum 44×44pt touch target (Apple HIG requirement)
              minHeight: '44px',
              minWidth: '44px',
              justifyContent: 'center',
              padding: '4px',
              cursor: 'pointer',
              // Remove iOS grey flash on tap
              WebkitTapHighlightColor: 'transparent',
              border: 'none',
              background: 'transparent',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon
                size={scrolled ? 18 : 20}
                color={active === name ? '#EAF98E' : '#f5f0e8'}
              />
              {name === 'Profile' && isLoggedIn && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#EAF98E',
                    border: '1.5px solid #2c4a1e',
                  }}
                />
              )}
            </div>

            {!scrolled && (
              <span
                style={{
                  fontSize: '10px',
                  color: active === name ? '#EAF98E' : '#f5f0e8',
                  fontWeight: active === name ? 700 : 500,
                  whiteSpace: 'nowrap',
                  lineHeight: 1,
                }}
              >
                {name === 'Messages' ? 'Messages' : name}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}