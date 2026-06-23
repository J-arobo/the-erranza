'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { Listing } from '@/data/stays'
import HeartButton from './HeartButton'

type Props = Listing & { listingCategory?: string }

export default function ListingRow(listing: Props) {
  const { id, location, title, price, rating, image, badge, listingCategory } = listing
  const router = useRouter()

  const touchStartY = useRef<number>(0)
  const touchStartX = useRef<number>(0)

  function getRoute() {
    if (listingCategory === 'stays') return `/listings/stays/${id}`
    return `/listings/${id}`
  }

  function handleTap() {
    router.push(getRoute())
  }

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
    <>
      {/* MOBILE */}
      <div
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="sm:hidden flex gap-3 bg-white rounded-2xl p-3 w-full
                   border border-[#eeebe4] active:scale-[0.99] transition-all
                   hover:shadow-md cursor-pointer"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="relative w-[100px] h-[100px] rounded-xl overflow-hidden
                        flex-shrink-0 bg-[#e0d9cc]">
          <Image src={image} alt={title} fill sizes="100px" className="object-cover" />
          {badge && (
            <span className="absolute bottom-1.5 left-1.5 bg-white/90 text-[#1a1a1a]
                             text-[9px] font-semibold px-1.5 py-0.5 rounded-md z-10">
              {badge}
            </span>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-center gap-1">
          <p className="text-[11px] text-gray-400 uppercase tracking-wide">{location}</p>
          <p className="text-[14px] font-bold text-[#1a1a1a] leading-snug">{title}</p>
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#f5a623">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-[12px] font-semibold text-[#1a1a1a]">{rating}</span>
          </div>
          <p className="text-[12px] text-[#1a1a1a]">
            from <span className="font-bold">{price}</span>
          </p>
        </div>
        <HeartButton listing={listing} size={22} className="self-start mt-1 flex-shrink-0" />
      </div>

      {/* DESKTOP */}
      <div
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="hidden sm:flex group bg-white rounded-2xl overflow-hidden w-full
                   cursor-pointer border border-[#eeebe4] transition-all duration-200
                   hover:shadow-lg active:scale-[0.98] flex-col"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <div className="relative w-full aspect-[4/3] bg-[#e0d9cc] overflow-hidden">
          <Image src={image} alt={title} fill
            sizes="(max-width: 1024px) 300px, 400px"
            className="object-cover transition-transform duration-300 group-hover:scale-105" />
          {badge && (
            <span className="absolute top-2.5 left-2.5 bg-white/95 text-[#1a1a1a]
                             text-[10px] font-semibold px-2 py-0.5 rounded-lg z-10 shadow-sm">
              {badge}
            </span>
          )}
          <HeartButton listing={listing} size={26} className="absolute top-3 right-3 z-10" />
        </div>
        <div className="flex flex-col flex-1 p-4 gap-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-0.5">
                {location}
              </p>
              <p className="text-[14px] font-bold text-[#1a1a1a] leading-snug line-clamp-2">
                {title}
              </p>
            </div>
            <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="#1a1a1a">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="text-[13px] font-semibold text-[#1a1a1a]">{rating}</span>
            </div>
          </div>
          <div className="w-full h-px bg-[#f0ece4] my-1" />
          <p className="text-[12px] text-[#1a1a1a]">
            from <span className="font-bold text-[14px]">{price}</span>
            <span className="text-gray-400 text-[11px]"> / night</span>
          </p>
        </div>
      </div>
    </>
  )
}