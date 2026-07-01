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
      className="flex-shrink-0 w-full overflow-hidden
                transition-all
                 cursor-pointer active:scale-[0.98] group text-left"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <div className="relative w-full aspect-[3/2] rounded-xl bg-[#e0d9cc] overflow-hidden">
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
      <div className="pt-2">
        <p className="text-[13px] text-[#222] font-semibold line-clamp-2 leading-snug ">{title}</p>
        <p className="text-[12px] font-semibold text-gray-500 truncate mt-0.5">
        {location}
        </p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          {price} . <span>★ {rating}</span>
        </p>
      </div>
    </div>
  )
}