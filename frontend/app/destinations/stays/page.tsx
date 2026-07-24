'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import ListingCard from '@/components/ListingCard'
import FooterSection from '@/components/FooterSection'
import { type Listing } from '@/data/stays'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { ArrowRight } from 'lucide-react'
import { ChevronRight } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80'

type ApiListing = {
  id: number
  title: string
  location: string
  price: string
  images: { url: string }[]
  reviews_avg_rating: string | null
}

type PaginatedListings = { data: ApiListing[] }

function mapListing(l: ApiListing): Listing {
  return {
    id: String(l.id),
    location: l.location,
    title: l.title,
    price: `Ksh ${Math.round(Number(l.price)).toLocaleString()}`,
    rating: l.reviews_avg_rating ? Number(l.reviews_avg_rating) : 4.5,
    image: l.images[0]?.url ?? FALLBACK_IMAGE,
  }
}

// Group stays into themed sections
const SECTIONS = [
  {
    title: 'Popular stays in Nairobi',
    filter: (l: Listing) => l.location.toLowerCase().includes('nairobi'),
  },
  {
    title: 'Beachfront villas in Kenya',
    filter: (l: Listing) =>
      l.location.toLowerCase().includes('diani') ||
      l.location.toLowerCase().includes('mombasa') ||
      l.location.toLowerCase().includes('malindi'),
  },
  {
    title: 'Lakeside & nature retreats',
    filter: (l: Listing) =>
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
  const [search, setSearch] = useState('')
  const [stays, setStays] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<PaginatedListings>('/listings?category=Stays&per_page=100')
      .then(({ data }) => setStays(data.map(mapListing)))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = stays.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell showCollapse={false}>
      <div className="pt-4 bg-[#ffffff] min-h-full overflow-x-hidden w-full">

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
          </div>
        ) : error ? (
          <div className="px-4 sm:px-6 py-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : stays.length === 0 ? (
          <div className="px-4 sm:px-6 py-20 text-center">
            <p className="text-sm text-gray-400">No stays available yet.</p>
          </div>
        ) : search ? (
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
              <div key={title} className="mb-2">
                <div className='flex items-center gap-2 px-4 sm:px-8 md:px-12 lg:px-52 mb-3 w-fit'>
                  <h2 className="text-base font-bold text-[#1a1a1a] ">
                    {title}
                  </h2>
                  <button className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0' >
                    <ArrowRight size={14} color="#1a1a1a" />
                  </button>
                </div>

                {/* Scroll */}
                <div className='sm:px-4 md:px-12 lg:px-52 pb-4'>
                  <div className='overflow-x-auto scrollbar-hide'>
                    <div className="flex gap-3 px-4">
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
                        <div className="relative w-full aspect-[3/2] rounded-xl border border-[#e0d9cc] shadow-sm
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
