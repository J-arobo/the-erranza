'use client'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Plus, Check, ArrowRight, ArrowLeft, SlidersHorizontal, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import AppShell from '@/components/AppShell'
import FooterSection from '@/components/FooterSection'
import HeartButton from '@/components/HeartButton'
import ListingCard from '@/components/ListingCard'
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
  itinerary: { day: number; title: string }[]
  reviews_avg_rating: string | null
  min_guests: number | null
  max_guests: number | null
}

type PaginatedListings = { data: ApiListing[] }

type PackageItem = {
  id: string
  location: string
  title: string
  price: string
  rating: number
  image: string
  itinerary: string[]
  minGuests: number | null
  maxGuests: number | null
}

function mapPackage(l: ApiListing): PackageItem {
  return {
    id: String(l.id),
    location: l.location,
    title: l.title,
    price: `Ksh ${Math.round(Number(l.price)).toLocaleString()}`,
    rating: l.reviews_avg_rating ? Number(l.reviews_avg_rating) : 4.5,
    image: l.images[0]?.url ?? FALLBACK_IMAGE,
    itinerary: l.itinerary.map(d => d.title),
    minGuests: l.min_guests,
    maxGuests: l.max_guests,
  }
}

type SafariCardItem = {
  id: string
  location: string
  title: string
  price: string
  rating: number
  image: string
  video: string
}

function mapSafariCard(l: ApiListing): SafariCardItem {
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

// Peek carousel on mobile (one full card + a peek of the next), wider cards
// at each larger breakpoint — shared by both sliding rows so they stay in sync.
const CARD_WIDTH_CLASSES = `flex-shrink-0 min-w-0
  w-[calc(100vw_-_120px)]
  sm:w-[calc((100vw_-_88px)/3)]
  md:w-[calc((100vw_-_164px)/4)]
  lg:w-[calc((100vw_-_164px)/4)]
  xl:w-[calc((100vw_-_496px)/5)]`

// ── Curated package card
function PackageCard({ pkg }: { pkg: PackageItem }) {
  const router = useRouter()
  const highlights = pkg.itinerary.slice(0, 2)

  return (
    <div
      onClick={() => router.push(`/destinations/packages/${pkg.id}`)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer
      shadow-[0_4px_16px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.18)]
      transition-shadow duration-200 active:scale-[0.98]"
    >
      <div className="relative w-full aspect-[4/3] rounded-b-2xl overflow-hidden bg-[#f5f5f5]">
        <Image
          src={pkg.image} alt={pkg.title} fill
          sizes="(max-width: 640px) 90vw, 30vw"
          className="object-cover"
        />
        <HeartButton listing={pkg} size={22} className="absolute top-3 right-3 z-10" />
        <span className="absolute bottom-3 left-3 bg-black/55 text-white text-[11px]
                         font-semibold px-2.5 py-1 rounded-full z-10">
          {pkg.location}
        </span>
      </div>

      <div className="pt-3 px-1 pb-1">
        <p className="text-[13px] text-[#222] font-semibold leading-snug line-clamp-2 mb-2">{pkg.title}</p>

        {highlights.length > 0 && (
          <div className="flex flex-col gap-1.5 mb-2">
            {highlights.map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check size={13} color="#2c4a1e" strokeWidth={2.5} className="flex-shrink-0 mt-[2px]" />
                <span className="text-[12px] text-gray-500 leading-snug">{step}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[12px] text-gray-500 mt-0.5">
          {pkg.price} . <span>★ {pkg.rating}</span>
        </p>
      </div>

    </div>
  )
}

// ── Section heading
function SectionHeading({ title, onClick }: { title: string; onClick?: () => void }) {
  return (
    <div className="flex items-center gap-2 px-4 sm:px-8 md:px-12 lg:px-52 mb-3 w-fit">
      <h2 className="text-base font-bold text-[#1a1a1a]">{title}</h2>
      <button onClick={onClick} disabled={!onClick}
        className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-default">
        <ArrowRight size={14} color="#1a1a1a" />
      </button>
    </div>
  )
}

// Sliding editorial hero for a section's results page — top-rated listings
// with a gradient overlay so white text stays legible over any photo.
function HeroCarousel({ items }: { items: PackageItem[] }) {
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
                <button onClick={() => router.push(`/destinations/packages/${item.id}`)}
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

function PackagesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState('')
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [safaris, setSafaris] = useState<SafariCardItem[]>([])
  const [loadingSafaris, setLoadingSafaris] = useState(true)
  const [safarisError, setSafarisError] = useState('')

  useEffect(() => {
    setSearch(searchParams.get('location') ?? '')
  }, [searchParams])

  useEffect(() => {
    apiFetch<PaginatedListings>('/listings?category=Packages&per_page=100')
      .then(({ data }) => setPackages(data.map(mapPackage)))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    apiFetch<PaginatedListings>('/listings?category=Safari&per_page=100')
      .then(({ data }) => setSafaris(data.map(mapSafariCard)))
      .catch((err) => setSafarisError(apiErrorMessage(err)))
      .finally(() => setLoadingSafaris(false))
  }, [])

  const guestsParam = Number(searchParams.get('guests') ?? '0') || 0

  const filtered = packages.filter(p => {
    const matchesText =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
    const matchesGuests = guestsParam === 0 || (
      (p.maxGuests === null || p.maxGuests >= guestsParam) &&
      (p.minGuests === null || p.minGuests <= guestsParam)
    )
    return matchesText && matchesGuests
  })

  const sectionParam = searchParams.get('section')
  const showCuratedSection = sectionParam === 'curated'

  // ─── Minimal, AppShell-free view for the curated packages section ───
  if (showCuratedSection) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 py-2.5 flex items-center gap-3">
          <button onClick={() => router.push('/destinations/packages')}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0">
            <ArrowLeft size={18} color="#1a1a1a" />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-xs sm:text-sm font-bold text-[#1a1a1a] truncate">Curated packages</h1>
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
            <HeroCarousel items={[...packages].sort((a, b) => b.rating - a.rating)} />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
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

        {/* ── Curated packages */}
        <div className="mb-2">
          <SectionHeading title="Curated packages" onClick={() => router.push('/destinations/packages?section=curated')} />

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600 px-4 sm:px-8 md:px-12 lg:px-52">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 sm:px-8 md:px-12 lg:px-52">No packages available yet.</p>
          ) : (
            <div className="sm:px-4 md:px-12 lg:px-52 pb-4">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 px-4">
                  {filtered.map((item) => (
                    <div key={item.id} className={CARD_WIDTH_CLASSES}>
                      <PackageCard pkg={item} />
                    </div>
                  ))}
                  <div className={CARD_WIDTH_CLASSES}>
                    <div onClick={() => router.push('/destinations/packages?section=curated')}
                      className="relative w-full aspect-[4/3] rounded-xl border border-[#e0d9cc] shadow-sm
                        bg-white flex flex-col items-center justify-center gap-2
                        hover:bg-[#f5f5f5] transition-colors cursor-pointer">
                      <div className="relative h-10 w-full flex items-center justify-center">
                        {filtered.slice(0, 3).map((it, i) => (
                          <div key={it.id} className="absolute w-10 h-10 rounded-lg overflow-hidden bg-[#f5f5f5]"
                            style={{ border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transform: `rotate(${(i - 1) * 10}deg)`, left: `calc(50% - 20px + ${(i - 1) * 16}px)`, zIndex: i === 1 ? 2 : 1 }}>
                            <img src={it.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-[#2c4a1e]">See all</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ── Safari tour packages — real listings, shared ListingCard so wishlist/routing work ── */}
        <div>
          <SectionHeading title="Safari tour packages" onClick={() => router.push(`/destinations/safari?section=${encodeURIComponent('All safaris')}`)} />

          {loadingSafaris ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
            </div>
          ) : safarisError ? (
            <p className="text-sm text-red-600 px-4 sm:px-8 md:px-12 lg:px-52">{safarisError}</p>
          ) : safaris.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 sm:px-8 md:px-12 lg:px-52">No safari tours available yet.</p>
          ) : (
            <div className="sm:px-4 md:px-12 lg:px-52 pb-2">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 px-4">
                  {safaris.map((item) => (
                    <div key={item.id} className={CARD_WIDTH_CLASSES}>
                      <ListingCard {...item} listingCategory="safari" />
                    </div>
                  ))}
                  <div className={CARD_WIDTH_CLASSES}>
                    <div onClick={() => router.push(`/destinations/safari?section=${encodeURIComponent('All safaris')}`)}
                      className="relative w-full aspect-[5/4] rounded-xl border border-[#e0d9cc] shadow-sm
                        bg-white flex flex-col items-center justify-center gap-2
                        hover:bg-[#f5f5f5] transition-colors cursor-pointer">
                      <div className="relative h-10 w-full flex items-center justify-center">
                        {safaris.slice(0, 3).map((it, i) => (
                          <div key={it.id} className="absolute w-10 h-10 rounded-lg overflow-hidden bg-[#f5f5f5]"
                            style={{ border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transform: `rotate(${(i - 1) * 10}deg)`, left: `calc(50% - 20px + ${(i - 1) * 16}px)`, zIndex: i === 1 ? 2 : 1 }}>
                            <img src={it.image} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-[#2c4a1e]">See all</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Build your own package CTA ── */}
        <div className="px-4 sm:px-8 md:px-12 lg:px-52 py-8 flex justify-center">
          <button
            onClick={() => router.push('/destinations/packages/create')}
            className="flex items-center gap-1.5 bg-[#2c4a1e] text-white px-5 py-3
                       rounded-xl text-sm font-semibold hover:bg-[#3d6b28] transition-colors"
          >
            <Plus size={16} />
            Build package
          </button>
        </div>

        <FooterSection />
      </div>
    </AppShell>
  )
}


export default function PackagesPage() {
  return (
    <Suspense fallback={null}>
      <PackagesPageContent />
    </Suspense>
  )
}
