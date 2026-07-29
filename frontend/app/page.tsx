'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import AppShell from '@/components/AppShell'
import ListingCard from '@/components/ListingCard'
import FooterSection from '@/components/FooterSection'
import { apiFetch } from '@/lib/api'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80'

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

type SectionItem = {
  id: string
  location: string
  title: string
  price: string
  rating: number
  image: string
  video?: string
}

function mapItem(l: ApiListing): SectionItem {
  return {
    id: String(l.id),
    location: l.location,
    title: l.title,
    price: `Ksh ${Math.round(Number(l.price)).toLocaleString()}`,
    rating: l.reviews_avg_rating ? Number(l.reviews_avg_rating) : 4.5,
    image: l.images[0]?.url ?? FALLBACK_IMAGE,
  }
}

function mapSafariItem(l: ApiListing): SectionItem {
  return {
    ...mapItem(l),
    video: SAFARI_VIDEOS[Number(l.id) % SAFARI_VIDEOS.length],
  }
}

const SECTION_META = [
  { title: 'Popular Stays', slug: 'stays', category: 'Stays', listingCategory: 'stays', color: '#2c4a1e', map: mapItem },
  { title: 'Safari Destinations', slug: 'safari', category: 'Safari', listingCategory: 'safari', color: '#5a3e10', map: mapSafariItem },
  { title: 'Travel Packages', slug: 'packages', category: 'Packages', listingCategory: 'packages', color: '#163a4a', map: mapItem },
]

export default function Home() {
  const router = useRouter()
  const [sectionData, setSectionData] = useState<Record<string, SectionItem[]>>({})

  useEffect(() => {
    SECTION_META.forEach(({ slug, category, map }) => {
      apiFetch<PaginatedListings>(`/listings?category=${category}&per_page=10`)
        .then(({ data }) => setSectionData(s => ({ ...s, [slug]: data.map(map) })))
        .catch(() => setSectionData(s => ({ ...s, [slug]: [] })))
    })
  }, [])

  return (
    // showCollapse=true so homepage collapses bar on scroll
    <AppShell showCollapse={true}>

      {SECTION_META.map(({ title, slug, color, listingCategory }) => {
        const data = sectionData[slug]
        if (!data || data.length === 0) return null

        return (
          <div key={slug}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 sm:px-12 md:px-16 lg:px-20 pt-5 pb-2">
              <h2 className="text-[15px] sm:text-[17px] font-bold text-[#1a1a1a]">
                {title}
              </h2>
              <button
                onClick={() => router.push(`/destinations/${slug}`)}
                className="flex items-center gap-1 text-xs font-medium hover:opacity-70 transition-opacity"
                style={{ color }}
              >
                Show all
                <ChevronRight size={13} color={color} />
              </button>
            </div>

            {/* Scroll wrapper - NO padding here, clips cards at margin */}
            <div className="sm:px-12 md:px-16 lg:px-20 pb-2">
              <div className="overflow-x-auto scrollbar-hide">
                {/* Flex row - flat padding aligns first card, cards scroll underneath the wrapper padding above */}
                <div className="flex gap-3 px-6">
                  {data.map((item) => (
                    <div key={item.id} className="flex-shrink-0
                    w-[calc((100vw-60px)/2)]
                    sm:w-[calc((100vw-120px)/3)]
                    md:w-[calc((100vw-164px)/4)]
                    lg:w-[calc((100vw-196px)/4)]
                    xl:w-[calc((100vw-208px)/5)]">
                      <ListingCard
                        {...item}
                        listingCategory={listingCategory}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => router.push(`/destinations/${slug}`)}
                    className="flex-shrink-0 w-[36vw] sm:w-[26vw] md:w-[22vw] lg:w-[17vw] xl:w-[13vw] rounded-2xl border
                 border-[#e0d9cc] shadow-sm bg-white flex flex-col items-center
                 justify-center gap-2 hover:bg-[#f5f0e8] transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: color + '22' }}
                    >
                      <ChevronRight size={18} color={color} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color }}>
                      Show all
                    </span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )
      })}

      <FooterSection />
    </AppShell>
  )
}
