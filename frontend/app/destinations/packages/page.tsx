'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import AppShell from '@/components/AppShell'
import ListingRow from '@/components/ListingRow'
import FooterSection from '@/components/FooterSection'
import { packages } from '@/data/packages'

const FILTERS = ['All', 'Beach', 'Safari', 'Cultural', 'Honeymoon', 'Family']

export default function PackagesPage() {
  const router = useRouter()
  const [activeFilter, setFilter] = useState('All')
  const [search, setSearch]       = useState('')

  const filtered = packages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell showCollapse={false}>
      <div className="bg-[#faf8f1] min-h-full">

        <div className="px-4 sm:px-6 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1a1a]">Travel Packages</h1>
            <p className="text-sm text-gray-500">Curated multi-day itineraries</p>
          </div>
          <button
            onClick={() => router.push('/destinations/packages/create')}
            className="flex items-center gap-1.5 bg-[#2c4a1e] text-white px-3 py-2
                       rounded-xl text-xs font-semibold hover:bg-[#3d6b28] transition-colors"
          >
            <Plus size={14} />
            Build package
          </button>
        </div>

        <div className="flex gap-2 px-4 sm:px-6 pb-4 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
                          border transition-all
                ${activeFilter === f
                  ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
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