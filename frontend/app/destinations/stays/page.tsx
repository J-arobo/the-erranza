'use client'
import { Suspense, useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import ListingCard from '@/components/ListingCard'
import FooterSection from '@/components/FooterSection'
import { type Listing } from '@/data/stays'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { ArrowRight } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'


const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80'

type ApiListing = {
  id: number
  title: string
  location: string
  price: string
  images: { url: string }[]
  reviews_avg_rating: string | null
  min_guests: number | null
  max_guests: number | null
}

type PaginatedListings = { data: ApiListing[] }

type StayListing = Listing & { minGuests: number | null; maxGuests: number | null }

function mapListing(l: ApiListing): StayListing {
  return {
    id: String(l.id),
    location: l.location,
    title: l.title,
    price: `Ksh ${Math.round(Number(l.price)).toLocaleString()}`,
    rating: l.reviews_avg_rating ? Number(l.reviews_avg_rating) : 4.5,
    image: l.images[0]?.url ?? FALLBACK_IMAGE,
    minGuests: l.min_guests,
    maxGuests: l.max_guests,
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

function StaysPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [stays, setStays] = useState<StayListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setSearch(searchParams.get('location') ?? '')
  }, [searchParams])

  useEffect(() => {
    apiFetch<PaginatedListings>('/listings?category=Stays&per_page=100')
      .then(({ data }) => setStays(data.map(mapListing)))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const guestsParam = Number(searchParams.get('guests') ?? '0') || 0
  const sectionParam = searchParams.get('section')
  const activeSection = sectionParam ? SECTIONS.find(s => s.title === sectionParam) : null

  const filtered = stays.filter(item => {
    const matchesText =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase())
    const matchesGuests = guestsParam === 0 || (
      (item.maxGuests === null || item.maxGuests >= guestsParam) &&
      (item.minGuests === null || item.minGuests <= guestsParam)
    )
    return matchesText && matchesGuests
  })

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
        ) : activeSection ? (
          <div className="px-4 sm:px-8 md:px-12 lg:px-52 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[17px] font-bold text-[#1a1a1a]">{activeSection.title}</h2>
              <span className="text-xs text-gray-400">{stays.filter(activeSection.filter).length} results</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {stays.filter(activeSection.filter).map(item => (
                <ListingCard key={item.id} {...item} listingCategory="stays" />
              ))}
            </div>
          </div>
        ) : search ? (
          <div className="px-4 sm:px-8 md:px-12 lg:px-52 pb-6">
            <p className="text-sm text-gray-400 mb-4">{filtered.length} results</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(item => (
                <ListingCard key={item.id} {...item} listingCategory="stays" />
              ))}
            </div>
          </div>
        ) :(
          SECTIONS.map(({ title, filter }) => {
            const items = filtered.filter(filter)
            if (items.length === 0) return null
            return (
              <div key={title} className="mb-2">
                <div className='flex items-center gap-2 px-4 sm:px-8 md:px-12 lg:px-52 mb-3 w-fit'>
                  <h2 className="text-base font-bold text-[#1a1a1a] ">
                    {title}
                  </h2>
                  <button onClick={() => router.push(`/destinations/stays?section=${encodeURIComponent(title)}`)}
                    className='w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0' >
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
                        <div onClick={() => router.push(`/destinations/stays?section=${encodeURIComponent(title)}`)}
                          className="relative w-full aspect-[5/4] rounded-xl border border-[#e0d9cc] shadow-sm
                            bg-white flex flex-col items-center justify-center gap-2
                            hover:bg-[#f5f5f5] transition-colors cursor-pointer">
                          <div className="relative h-10 w-full flex items-center justify-center">
                            {items.slice(0, 3).map((it, i) => (
                              <div key={it.id} className="absolute w-10 h-10 rounded-lg overflow-hidden bg-[#f5f5f5]"
                                style={{ border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transform: `rotate(${(i - 1) * 10}deg)`, left: `calc(50% - 20px + ${(i - 1) * 16}px)`, zIndex: i === 1 ? 2 : 1 }}>
                                <img src={it.image} alt="" className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-[#2c4a1e]">See all</span>
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



export default function StaysPage() {
  return (
    <Suspense fallback={null}>
      <StaysPageContent />
    </Suspense>
  )
}
