'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowLeft, SlidersHorizontal } from 'lucide-react'
import ListingRow from './ListingRow'
import BottomNav from './BottomNav'
import FooterSection from './FooterSection'
import { Listing } from '@/data/stays'

const filterTabs = ['All', 'Budget', 'Premium', 'Family', 'Solo']

type Props = {
  title: string
  subtitle: string
  listings: Listing[]
  accentColor?: string
  emptyEmoji?: string
  sectionHeading?: string
}

export default function DestinationLayout({
  title,
  subtitle,
  listings,
  accentColor = '#2c4a1e',
  emptyEmoji = '🔍',
  sectionHeading,
}: Props) {
  const router = useRouter()

  const [search, setSearch]               = useState('')
  const [activeFilter, setFilter]         = useState('All')
  const [activeNav, setActiveNav]         = useState('Explore')
  const [focused, setFocused]             = useState(false)
  const [scrolled, setScrolled]           = useState(false)
  const [scrollingDown, setScrollingDown] = useState(false)

  const lastScrollY = useRef<number>(0)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleMainScroll(e: React.UIEvent<HTMLElement>) {
    const current = (e.target as HTMLElement).scrollTop

    if (current > lastScrollY.current + 5) {
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
      hideTimeout.current = setTimeout(() => setScrollingDown(true), 100)
    } else if (current < lastScrollY.current - 5) {
      if (hideTimeout.current) clearTimeout(hideTimeout.current)
      setScrollingDown(false)
    }

    setScrolled(current > 20)
    lastScrollY.current = current
  }

  const filtered = listings.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-screen bg-white">

      {/* COLOURED HEADER */}
      <div
        className="flex-shrink-0 px-4 sm:px-8 pt-12 pb-5"
        style={{ background: accentColor }}
      >
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft size={18} color="#fff" />
          </button>
          <button className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <SlidersHorizontal size={16} color="#fff" />
          </button>
        </div>

        <h1 className="text-white text-2xl font-bold">{title}</h1>
        <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>
        <p className="text-white/50 text-xs mt-1 mb-4">
          {filtered.length} results
        </p>

        {/* Search */}
        <div
          className={`flex items-center bg-white rounded-full px-4 gap-3 h-11
                      border transition-all
                      ${focused ? 'border-white' : 'border-transparent'}`}
        >
          <Search size={15} color="#aaa" className="flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="flex-1 text-sm text-[#1a1a1a] bg-transparent border-none
                       outline-none placeholder:text-gray-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-gray-400 text-xl">
              ×
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
                          border transition-all
                          ${activeFilter === tab
                            ? 'text-white border-transparent'
                            : 'bg-white text-[#1a1a1a] border-gray-200'}`}
              style={activeFilter === tab ? { background: accentColor } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <main
        className="flex-1 overflow-y-auto scrollbar-hide bg-[#f7f7f7]"
        onScroll={handleMainScroll}
      >
        <div className="px-4 sm:px-6 py-5">
          {sectionHeading && (
            <h2 className="text-[17px] font-bold text-[#1a1a1a] mb-4">
              {sectionHeading}
            </h2>
          )}

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <ListingRow key={item.id} {...item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-5xl">{emptyEmoji}</span>
              <p className="text-sm text-gray-400 text-center">
                No results for &quot;{search}&quot;
              </p>
              <button
                onClick={() => setSearch('')}
                className="text-xs font-semibold underline"
                style={{ color: accentColor }}
              >
                Clear search
              </button>
            </div>
          )}
        </div>
        <FooterSection />
      </main>

      {/* BOTTOM NAV — now has correct props */}
      <BottomNav
        active={activeNav}
        onSelect={setActiveNav}
        scrollingDown={scrollingDown}
        scrolled={scrolled}
      />
    </div>
  )
}