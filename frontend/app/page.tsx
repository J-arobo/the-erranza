'use client'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import AppShell from '@/components/AppShell'
import ListingCard from '@/components/ListingCard'
import FooterSection from '@/components/FooterSection'
import { packages } from '@/data/packages'
import { carRentals } from '@/data/carRentals'

import { stays } from '@/data/stays'
import { safari } from '@/data/safari'
import { flights } from '@/data/flights'
import { market } from '@/data/market'
import { experiences } from '@/data/experiences'
import { directory } from '@/data/directory'

const sections = [
  { title: 'Popular Stays', slug: 'stays', data: stays, color: '#2c4a1e', category: 'stays' },
  { title: 'Safari Destinations', slug: 'safari', data: safari, color: '#5a3e10', category: 'safari' },
  { title: 'Flights', slug: 'flights', data: flights, color: '#0d3550', category: 'flights' },
  { title: 'Marketplace', slug: 'market', data: market, color: '#6b1a12', category: 'market' },
  { title: 'Experiences', slug: 'experiences', data: experiences, color: '#163a0c', category: 'experiences' },
  { title: 'Directory', slug: 'directory', data: directory, color: '#1a3d50', category: 'directory' },
  { title: 'Travel Packages', slug: 'packages', data: packages, color: '#163a4a', category: 'packages' },
  { title: 'Car Rentals', slug: 'car-rentals', data: carRentals, color: '#1a1a2e', category: 'car-rentals' },
]

export default function Home() {
  const router = useRouter()

  return (
    // showCollapse=true so homepage collapses bar on scroll
    <AppShell showCollapse={true}>

      {/* Continue searching card */}
      <div className="mx-4 sm:mx-6 mt-3 bg-white rounded-2xl border border-[#e0d9cc] p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1a1a1a] leading-tight">
            Continue searching for homes in Nairobi
          </p>
          <p className="text-xs text-gray-400 mt-1">15–19 May · 2 guests ›</p>
        </div>
        <div className="w-14 h-14 rounded-xl bg-[#1a5c7a] flex-shrink-0" />
      </div>

      {/* Six destination snippets */}
      {sections.map(({ title, slug, data, color, category }) => (
        <div key={slug}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-20 pt-5 pb-2">
            <h2 className="text-[15px] sm:text-[17px] font-bold text-[#1a1a1a]">
              {title}
            </h2>
            <button
              onClick={() => router.push(`/destinations/${slug}`)}
              className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity"
              style={{ color }}
            >
              Show all
              <ChevronRight size={13} color={color} />
            </button>
          </div>

          {/* Scroll wrapper - NO padding here, clips cards at margin */}
          <div className="px-4 sm:px-10 md:px-14 lg:px-20 overflow-hidden pb-4">
            <div className="overflow-x-auto scrollbar-hide">
              {/* Flex row - padding here aligns first card with header */}
              <div className="flex gap-3 pr-4 sm:pr-10 md:pr-14 lg:pr-20"> {/* xl:px-24 pb-4 overflow-x-auto scrollbar-hide */}
                {data.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex-shrink-0 w-[30vw] sm:w-[23vw] md:w-[20vw] lg:w-[16vw] xl:w-[14vw]">
                    <ListingCard
                      {...item}
                      listingCategory={category}
                    />
                  </div>
                ))}
                <button
                  onClick={() => router.push(`/destinations/${slug}`)}
                  className="flex-shrink-0 w-[30vw] sm:w-[23vw] md:w-[20vw] lg:w-[16vw] xl:w-[14vw] rounded-2xl border
               border-[#e0d9cc] bg-white flex flex-col items-center
               justify-center gap-2 hover:bg-[#f5f0e8] transition-colors"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: color + '22' }}
                  >
                    <ChevronRight size={18} color={color} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color }}>
                    Show all
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      <FooterSection />
    </AppShell>
  )
}