'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import ListingCard from '@/components/ListingCard'
import FooterSection from '@/components/FooterSection'
import { stays } from '@/data/stays'
import { ArrowRight } from 'lucide-react'
import { ChevronRight } from 'lucide-react'





const filterTabs = ['All', 'Budget', 'Premium', 'Family', 'Solo']

// Group stays into themed sections
const SECTIONS = [
  {
    title: 'Popular stays in Nairobi',
    filter: (l: typeof stays[0]) => l.location.toLowerCase().includes('nairobi'),
  },
  {
    title: 'Beachfront villas in Kenya',
    filter: (l: typeof stays[0]) =>
      l.location.toLowerCase().includes('diani') ||
      l.location.toLowerCase().includes('mombasa') ||
      l.location.toLowerCase().includes('malindi'),
  },
  {
    title: 'Lakeside & nature retreats',
    filter: (l: typeof stays[0]) =>
      l.location.toLowerCase().includes('naivasha') ||
      l.location.toLowerCase().includes('kisumu') ||
      l.location.toLowerCase().includes('karen'),
  },
  {
    title: 'All stays',
    filter: () => true,
  },
]

export default function StaysPage() {
  const [activeFilter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = stays.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell showCollapse={false}>
      <div className="pt-4 bg-[#ffffff] min-h-full overflow-x-hidden w-full">

        {/* Filter tabs */}
        {/* 
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 px-4 sm:px-6">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
                          border transition-all
                          ${activeFilter === tab
                  ? 'bg-[#D4DAAD] text-[#304333] border-[#304333]'
                  : 'bg-white text-[#304333] border-gray-200 hover:border-[#5a3e10]'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        */}

        {search ? (
          <div className="px-4 sm:px-6 pb-6">
            <p className="text-sm text-gray-400 mb-4">{filtered.length} results</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(item => (
                <ListingCard key={item.id} {...item} listingCategory="stays" />
              ))}
            </div>
          </div>
        ) : (
          SECTIONS.map(({ title, filter }) => {
            const items = filtered.filter(filter)
            if (items.length === 0) return null
            return (
              <div key={title} className="mb-8">
                <div className='flex items-center gap-2 px-4 sm:px-8 md:px-12 lg:px-52 mb-3 w-fit'>
                  <h2 className="text-base font-bold text-[#1a1a1a] ">
                    {title}
                  </h2>
                  <button className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0' >
                    <ArrowRight size={14} color="#1a1a1a" />
                  </button>
                </div>

                {/* Scroll */}
                <div className='px-4 sm:px-8=4 md:px-12 lg:px-52 overflow-hidden pb-4'>
                  <div className='overflow-x-auto scrollbar-hide'>
                    <div className="flex gap-3 pr-4 sm:pr-4 md:pr-12 lg:pr-52">
                      {items.map(item => (
                        <div key={item.id}
                          className="flex-shrink-0
                          w-[calc((100vw-44px)/2)]
                          sm:w-[calc((100vw-88px)/3)]
                          md:w-[calc((100vw-132px)/4)]
                          lg:w-[calc((100vw-164px)/4)]
                          xl:w-[calc((100vw-464px)/5)]">
                          <ListingCard {...item} listingCategory="stays" />
                        </div>
                      ))}

                      {/* Show all card */}
                      <div className="flex-shrink-0
                            w-[calc((100vw-44px)/2)]
                            sm:w-[calc((100vw-120px)/3)]
                            md:w-[calc((100vw-164px)/4)]
                            lg:w-[calc((100vw-452px)/4)]
                            xl:w-[calc((100vw-464px)/5)]">
                        <div className="relative w-full aspect-[3/2] rounded-xl border border-[#e0d9cc]
                            bg-[#f5f0e8] flex flex-col items-center justify-center gap-2
                            hover:bg-[#ece8e0] transition-colors cursor-pointer">
                          <div className="w-10 h-10 rounded-full bg-[#2c4a1e22] flex items-center justify-center">
                            <ChevronRight size={18} color="#2c4a1e" />
                          </div>
                          <span className="text-xs font-semibold text-[#2c4a1e]">Show all</span>
                        </div>
                        <div className="pt-2">
                          <p className="text-[13px] invisible">·</p>
                          <p className="text-[12px] invisible">·</p>
                          <p className="text-[12px] invisible">·</p>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )
          })
        )}

        <FooterSection />
      </div>
    </AppShell>
  )
}

// ──card for mobile ──────────────────────────────────────────
function AirbnbCard({ id, location, title, price, rating, image, badge }: typeof stays[0]) {
  const { isWishlisted, addToWishlist, removeFromWishlist, isLoggedIn } =
    require('@/context/AuthContext').useAuth()
  const router = require('next/navigation').useRouter()
  const wishlisted = isWishlisted(id)

  const touchStartY = require('react').useRef(0)
  const touchStartX = require('react').useRef(0)

  return (
    <div
      onClick={() => router.push(`/listings/stays/${id}`)}
      onTouchStart={(e: any) => {
        touchStartY.current = e.touches[0].clientY
        touchStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e: any) => {
        const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
        const dx = Math.abs(e.changedTouches[0].clientX - touchStartX.current)
        if (dy < 8 && dx < 8) router.push(`/listings/stays/${id}`)
      }}
      className="flex-shrink-0 bg-white rounded-2xl overflow-hidden
                 cursor-pointer active:scale-[0.98] transition-all
                 shadow-sm hover:shadow-md"
      style={{ width: '148px' }}   // ← matches homepage card size
    >
      {/* Image — 4:3 ratio like homepage */}
      <div className="relative bg-[#e0d9cc] overflow-hidden"
        style={{ width: '148px', height: '111px' }}>
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {badge && (
          <span className="absolute top-2 left-2 bg-white text-[#1a1a1a] text-[9px]
                           font-semibold px-1.5 py-0.5 rounded-full shadow-sm">
            {badge}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!isLoggedIn) { router.push('/login'); return }
            wishlisted
              ? removeFromWishlist(id)
              : addToWishlist({ id, location, title, price, rating, image, badge })
          }}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <svg viewBox="0 0 32 32" style={{ width: 24, height: 24 }}>
            <path
              d="M16 28C16 28 3 20.5 3 11.5C3 7.91 5.91 5 9.5 5C11.24 5 12.91 5.68 14.17 6.83L16 8.5L17.83 6.83C19.09 5.68 20.76 5 22.5 5C26.09 5 29 7.91 29 11.5C29 20.5 16 28 16 28Z"
              fill={wishlisted ? '#e63946' : 'rgba(0,0,0,0.5)'}
              stroke="white"
              strokeWidth="2.5"
            />
          </svg>
        </button>
      </div>

      <div className="p-2">
        <p className="text-[10px] text-gray-400 truncate">{location}</p>
        <p className="text-[12px] font-semibold text-[#1a1a1a] leading-snug line-clamp-2">
          {title}
        </p>
        <div className="flex justify-between items-center mt-1">
          <p className="text-[11px] text-[#1a1a1a]">
            <span className="font-semibold">{price}</span>
          </p>
          <div className="flex items-center gap-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#1a1a1a">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-[11px] font-semibold text-[#1a1a1a]">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  )
}