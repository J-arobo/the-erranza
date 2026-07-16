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
    { name: 'Explore', Icon: Search },
    { name: 'Wishlists', Icon: Heart },
    { name: 'Log in', Icon: User },
  ]

  const authItems = [
    { name: 'Explore', Icon: Search },
    { name: 'Wishlists', Icon: Heart },
    { name: 'Trips', Icon: Calendar },
    { name: 'Messages', Icon: MessageCircle },
    { name: 'Profile', Icon: User },
  ]

  const items = isLoggedIn ? authItems : guestItems

  function handleSelect(name: string) {
    const routes: Record<string, string> = {
      'Explore': '/',
      'Wishlists': '/wishlists',
      'Log in': '/login',
      'Trips': '/trips',
      'Messages': '/messages',
      'Profile': '/profile',
    }
    const path = routes[name]
    if (path) router.push(path)
    onSelect(name)
  }

  return (
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
        transform: scrollingDown ? 'translateY(100%)' : 'translateY(0)',
        transition: 'transform 0.3s ease',
        pointerEvents: scrollingDown ? 'none' : 'auto',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: '8px',
      }}
    >

      <nav
        style={{
          // Glassmorphism with balanced depth
          background: 'rgba(30, 30, 30, 0.35)', // darker translucency for contrast
          backdropFilter: 'blur(14px) saturate(180%)',
          WebkitBackdropFilter: 'blur(14px) saturate(180%)',
          borderRadius: '9999px',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25), inset 0 1px 2px rgba(255,255,255,0.2)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          width: scrolled ? '70%' : '80%',
          maxWidth: scrolled ? '280px' : '360px',
          padding: scrolled ? '6px 8px' : '8px 8px',
          transition: 'width 0.3s ease, max-width 0.3s ease, padding 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient shimmer overlay */}
        {/* 
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.15) 100%)',
            animation: 'shimmer 6s infinite linear',
            pointerEvents: 'none',
          }}
        /> */}
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
              minHeight: '44px',
              minWidth: '44px',
              justifyContent: 'center',
              padding: '4px',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              border: 'none',
              background: 'transparent',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Icon
                size={scrolled ? 18 : 20}
                color={active === name ? '#EAF98E' : '#ffffff'}
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
                    border: '1.5px solid rgba(255,255,255,0.6)',
                  }}
                />
              )}
            </div>

            {!scrolled && (
              <span
                style={{
                  fontSize: '10px',
                  color: active === name ? '#EAF98E' : '#ffffff',
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


