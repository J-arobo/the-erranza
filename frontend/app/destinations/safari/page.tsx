'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import ListingCard from '@/components/ListingCard'
import FooterSection from '@/components/FooterSection'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

const SAFARI_VIDEOS = [
  'https://assets.mixkit.co/videos/3668/3668-720.mp4',
  'https://assets.mixkit.co/videos/11326/11326-720.mp4',
  'https://assets.mixkit.co/videos/11067/11067-720.mp4',
  'https://assets.mixkit.co/videos/11087/11087-720.mp4',
  'https://assets.mixkit.co/videos/51501/51501-720.mp4',
  'https://assets.mixkit.co/videos/4681/4681-720.mp4',
  'https://assets.mixkit.co/videos/11165/11165-720.mp4',
]

type ApiListing = {
  id: number
  title: string
  location: string
  price: string
  images: { url: string }[]
  reviews_avg_rating: string | null
}

type PaginatedListings = { data: ApiListing[] }

type SafariItem = {
  id: string
  location: string
  title: string
  price: string
  rating: number
  image: string
  video: string
}

function mapSafari(l: ApiListing): SafariItem {
  return {
    id: String(l.id),
    location: l.location,
    title: l.title,
    price: `Ksh ${Math.round(Number(l.price)).toLocaleString()}`,
    rating: l.reviews_avg_rating ? Number(l.reviews_avg_rating) : 4.5,
    image: l.images[0]?.url ?? FALLBACK_IMAGE,
    video: SAFARI_VIDEOS[Number(l.id) % SAFARI_VIDEOS.length],
  }
}

const filterTabs = ['All', 'Budget', 'Premium', 'Family', 'Solo']

// Popular Kenyan safari destinations — grouping is purely a display
// convenience derived from each listing's title/location text, not a
// stored category, since vendors just type location freely.
const SECTIONS = [
  {
    title: 'Maasai Mara safaris',
    filter: (l: SafariItem) =>
      l.location.toLowerCase().includes('maasai mara') || l.location.toLowerCase().includes('narok') ||
      l.title.toLowerCase().includes('maasai mara'),
  },
  {
    title: 'Amboseli safaris',
    filter: (l: SafariItem) =>
      l.location.toLowerCase().includes('amboseli') || l.location.toLowerCase().includes('kajiado') ||
      l.title.toLowerCase().includes('amboseli'),
  },
  {
    title: 'All safaris',
    filter: () => true,
  },
]

export default function SafariPage() {
  const [search, setSearch] = useState('')
  const [activeFilter, setFilter] = useState('All')
  const [safaris, setSafaris] = useState<SafariItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<PaginatedListings>('/listings?category=Safari&per_page=100')
      .then(({ data }) => setSafaris(data.map(mapSafari)))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = safaris.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell showCollapse={false}>
      <div className="px-4 sm:px-6 py-4 bg-[#ffffff] min-h-full">

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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : search ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#1a1a1a]">Search results</h2>
              <span className="text-xs text-gray-400">{filtered.length} results</span>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((item) => (
                  <ListingCard key={item.id} {...item} listingCategory="safari" />
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
          </>
        ) : safaris.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">🦁</span>
            <p className="text-sm text-gray-400 text-center">No safaris available yet.</p>
          </div>
        ) : (
          SECTIONS.map(({ title, filter }) => {
            const items = safaris.filter(filter)
            if (items.length === 0) return null
            return (
              <div key={title} className="mb-8 -mx-4 sm:-mx-6">
                <div className="flex items-center justify-between px-4 sm:px-8 md:px-12 lg:px-52 mb-4">
                  <h2 className="text-[17px] font-bold text-[#1a1a1a]">{title}</h2>
                  <span className="text-xs text-gray-400">{items.length} results</span>
                </div>
                <div className="sm:px-4 md:px-12 lg:px-52 pb-1">
                  <div className="overflow-x-auto scrollbar-hide">
                    <div className="flex gap-4 px-4">
                      {items.map((item) => (
                        <div key={item.id}
                          className="flex-shrink-0 w-[82vw] sm:w-[50vw] md:w-[34vw] lg:w-[25vw] xl:w-[19vw]">
                          <ListingCard {...item} listingCategory="safari" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}

      </div>
      <FooterSection />
    </AppShell>
  )
}
