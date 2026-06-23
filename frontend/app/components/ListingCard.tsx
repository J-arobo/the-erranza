'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { Listing } from '@/data/stays'
import HeartButton from './HeartButton'

type Props = Listing & { listingCategory?: string }  // ← renamed to avoid collision

export default function ListingCard(listing: Props) {
  const { id, location, title, price, rating, image, badge, listingCategory } = listing
  const router = useRouter()

  const touchStartY = useRef<number>(0)
  const touchStartX = useRef<number>(0)

  function getRoute() {
    if (listingCategory === 'stays') return `/listings/stays/${id}`
    return `/listings/${id}`
  }

  function handleTap() { router.push(getRoute()) }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
    if (deltaY < 8 && deltaX < 8) handleTap()
  }

  return (
    <div
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="flex-shrink-0 w-full bg-white rounded-2xl overflow-hidden
                 border border-[#f0ece4] hover:shadow-lg transition-all
                 cursor-pointer active:scale-[0.98] group text-left"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="relative w-full aspect-[4/3] bg-[#e0d9cc] overflow-hidden">
        <Image
          src={image} alt={title} fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-white text-[#1a1a1a] text-[10px]
                           font-semibold px-2 py-1 rounded-full shadow-sm z-10">
            {badge}
          </span>
        )}
        <HeartButton listing={listing} size={26} className="absolute top-3 right-3 z-10" />
      </div>
      <div className="p-3">
        <p className="text-[10px] text-gray-400 mb-0.5 truncate">{location}</p>
        <p className="text-[13px] font-semibold text-[#1a1a1a] leading-snug mb-1 line-clamp-2">
          {title}
        </p>
        <div className="flex justify-between items-center">
          <p className="text-[12px] text-[#1a1a1a]">
            <span className="font-semibold">{price}</span>
          </p>
          <div className="flex items-center gap-0.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#1a1a1a">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-[12px] font-semibold text-[#1a1a1a]">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  )
}