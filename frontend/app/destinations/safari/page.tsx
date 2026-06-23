'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import ListingRow from '@/components/ListingRow'
import FooterSection from '@/components/FooterSection'
import { safari } from '@/data/safari'

const filterTabs = ['All', 'Budget', 'Premium', 'Family', 'Solo']

export default function SafariPage() {
  const [search, setSearch]       = useState('')
  const [activeFilter, setFilter] = useState('All')

  const filtered = safari.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    // showCollapse=false — bar always visible on destination pages
    <AppShell showCollapse={false}>
      <div className="px-4 sm:px-6 py-4 bg-[#faf8f1] min-h-full">

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
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

        {/* Section heading + result count */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-[#1a1a1a]">
            Popular Safaris in the Country
          </h2>
          <span className="text-xs text-gray-400">
            {filtered.length} results
          </span>
        </div>

        {/* Listings */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <ListingRow key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">🦁</span>
            <p className="text-sm text-gray-400 text-center">
              No results for &quot;{search}&quot;
            </p>
            <button
              onClick={() => setSearch('')}
              className="text-xs text-[#5a3e10] font-semibold underline"
            >
              Clear search
            </button>
          </div>
        )}

      </div>
      <FooterSection />
    </AppShell>
  )
}