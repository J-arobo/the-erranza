'use client'
import { useState } from 'react'
import { Search } from 'lucide-react'
import AppShell from '@/components/AppShell'
import ListingRow from '@/components/ListingRow'
import FooterSection from '@/components/FooterSection'
import { carRentals } from '@/data/carRentals'

const FILTERS = ['All', 'Economy', 'SUV', 'Luxury', 'Safari 4x4', 'Minibus']

export default function CarRentalsPage() {
  const [activeFilter, setFilter] = useState('All')
  const [search, setSearch]       = useState('')

  const filtered = carRentals.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell showCollapse={false}>
      <div className="bg-[#faf8f1] min-h-full">

        <div className="px-4 sm:px-6 pt-5 pb-3">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Car Rentals</h1>
          <p className="text-sm text-gray-500">Self-drive and chauffeured vehicles across Kenya</p>
        </div>

        <div className="flex gap-2 px-4 sm:px-6 pb-4 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
                          border transition-all
                ${activeFilter === f
                  ? 'bg-[#1a1a2e] text-white border-[#1a1a2e]'
                  : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="px-4 sm:px-6 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <ListingRow key={item.id} {...item} />
            ))}
          </div>
        </div>

        <FooterSection />
      </div>
    </AppShell>
  )
}