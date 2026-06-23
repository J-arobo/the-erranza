'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import ListingRow from '@/components/ListingRow'
import FooterSection from '@/components/FooterSection'
import { directory } from '@/data/directory'

const filterTabs = ['All', 'Budget', 'Premium', 'Family', 'Solo']

export default function DirectoryPage() {
  const [activeFilter, setFilter] = useState('All')

  return (
    <AppShell showCollapse={false}>
      <div className="px-4 sm:px-6 py-4 bg-[#faf8f1] min-h-full">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
                          border transition-all
                          ${activeFilter === tab
                            ? 'bg-[#1a3d50] text-white border-[#1a3d50]'
                            : 'bg-white text-[#1a1a1a] border-gray-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <h2 className="text-[17px] font-bold text-[#1a1a1a] mb-4">
          Services Available
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {directory.map((item) => (
            <ListingRow key={item.id} {...item} />
          ))}
        </div>
        
      </div>
      <FooterSection />
    </AppShell>
  )
}