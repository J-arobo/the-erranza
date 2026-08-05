'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import AppShell from '@/components/AppShell'
import ListingCard from '@/components/ListingCard'
import FooterSection from '@/components/FooterSection'
import { type Listing } from '@/data/stays'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import { ArrowRight, ArrowLeft, SlidersHorizontal, Star, ChevronLeft, ChevronRight } from 'lucide-react'
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

// Sliding editorial hero for a section's results page — top-rated listings
// with a gradient overlay so white text stays legible over any photo.
function HeroCarousel({ items }: { items: StayListing[] }) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const slides = items.slice(0, 5)

  function scrollToIndex(i: number) {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  if (slides.length === 0) return null

  return (
    <div className="relative rounded-3xl overflow-hidden mb-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <div ref={scrollRef} onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {slides.map((item) => (
          <div key={item.id}
            className="relative flex-shrink-0 w-full snap-center h-[260px] sm:h-[320px] md:h-[360px] lg:h-[380px]">
            <img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

            <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
              <span className="inline-block bg-white text-[#1a1a1a] text-[11px] sm:text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded-full -rotate-2 shadow-sm">
                Featured this week
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
              <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-none truncate text-white"
                style={{ fontFamily: 'Georgia, serif' }}>
                {item.title}
              </h3>

              <div className="flex items-center justify-between gap-2 -mt-1">
                <p className="text-white/85 text-sm sm:text-base leading-none flex items-center gap-1.5 truncate min-w-0">
                  {item.location.split(',').pop()?.trim()} · from {item.price}
                  <span className="inline-flex items-center gap-1 ml-1 flex-shrink-0">
                    <Star size={12} fill="white" color="white" />{item.rating.toFixed(1)}
                  </span>
                </p>
                <button onClick={() => router.push(`/listings/stays/${item.id}`)}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-[#2c4a1e] hover:bg-[#233a17] transition-colors text-white text-xs sm:text-sm font-semibold px-3 sm:px-5 py-2 sm:py-2.5 rounded-full whitespace-nowrap">
                  Explore <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button onClick={() => scrollToIndex(Math.max(0, index - 1))}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 items-center justify-center shadow-sm hover:bg-white transition-colors">
            <ChevronLeft size={18} color="#1a1a1a" />
          </button>
          <button onClick={() => scrollToIndex(Math.min(slides.length - 1, index + 1))}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 items-center justify-center shadow-sm hover:bg-white transition-colors">
            <ChevronRight size={18} color="#1a1a1a" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => scrollToIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

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

  // ─── Minimal, AppShell-free view for a single section's results ───
  if (activeSection) {
    const sectionItems = stays.filter(activeSection.filter)
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 py-2.5 flex items-center gap-3">
          <button onClick={() => router.push('/destinations/stays')}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
            <ArrowLeft size={18} color="#1a1a1a" />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-xs sm:text-sm font-bold text-[#1a1a1a] truncate">{activeSection.title}</h1>
          </div>
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
            <SlidersHorizontal size={16} color="#1a1a1a" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="px-4 sm:px-8 md:px-12 lg:px-52 pt-3 pb-6">
            <HeroCarousel items={[...sectionItems].sort((a, b) => b.rating - a.rating)} />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {sectionItems.map((item) => (
                <ListingCard key={item.id} {...item} listingCategory="stays" />
              ))}
            </div>
          </div>
        )}
        <FooterSection />
      </div>
    )
  }

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
