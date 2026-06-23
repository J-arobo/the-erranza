'use client'
import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Listing } from '@/data/stays'

type Props = {
  listing: Listing
  size?: number
  className?: string
}

export default function HeartButton({ listing, size = 24, className = '' }: Props) {
  const router = useRouter()
  const { isWishlisted, addToWishlist, removeFromWishlist, isLoggedIn } = useAuth()
  const wishlisted = isWishlisted(listing.id)

  const touchStartY = useRef<number>(0)
  const touchStartX = useRef<number>(0)

  function handleTouchStart(e: React.TouchEvent) {
    e.stopPropagation()
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    e.stopPropagation()
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
    if (deltaY < 8 && deltaX < 8) {
      e.preventDefault()
      if (!isLoggedIn) { router.push('/login'); return }
      if (wishlisted) removeFromWishlist(listing.id)
      else addToWishlist(listing)
    }
  }

  return (
    <button
      type="button"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={(e) => {
        e.stopPropagation()
        if (!isLoggedIn) { router.push('/login'); return }
        if (wishlisted) removeFromWishlist(listing.id)
        else addToWishlist(listing)
      }}
      className={`flex items-center justify-center ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <svg
        viewBox="0 0 32 32"
        style={{ width: size, height: size }}
        className="drop-shadow-md"
      >
        <path
          d="M16 28C16 28 3 20.5 3 11.5C3 7.91 5.91 5 9.5 5C11.24 5 12.91 5.68 14.17 6.83L16 8.5L17.83 6.83C19.09 5.68 20.76 5 22.5 5C26.09 5 29 7.91 29 11.5C29 20.5 16 28 16 28Z"
          fill={wishlisted ? '#e63946' : 'rgba(0,0,0,0.5)'}
          stroke="white"
          strokeWidth="2.5"
        />
      </svg>
    </button>
  )
}