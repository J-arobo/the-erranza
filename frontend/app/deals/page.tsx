'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Star } from 'lucide-react'
import Image from 'next/image'
import { apiFetch } from '@/lib/api'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

type ApiSeasonalRate = { start_date: string; end_date: string; price: string; label: string }
type ApiDeal = {
  id: number
  title: string
  location: string
  price: string
  category: string
  images: { url: string }[]
  reviews_avg_rating: string | null
  seasonal_rates: ApiSeasonalRate[]
}

function activeRate(listing: ApiDeal): ApiSeasonalRate | null {
  const today = new Date().toISOString().slice(0, 10)
  return listing.seasonal_rates.find(r => r.start_date <= today && r.end_date >= today) ?? null
}

const CATEGORY_ROUTE: Record<string, string> = {
  Stays: 'stays', Safari: 'safari-vendor', Packages: 'packages',
}

export default function DealsPage() {
  const router = useRouter()
  const [deals, setDeals] = useState<ApiDeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<{ data: ApiDeal[] }>('/listings?deals=1&per_page=50')
      .then(({ data }) => setDeals(data))
      .catch(() => setDeals([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center gap-3
                      sticky top-0 bg-white z-40">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center sm:hidden">
          <ArrowLeft size={16} color="#1a1a1a" />
        </button>
        <span onClick={() => router.push('/')} className="hidden sm:block text-[#304333] text-xl font-bold cursor-pointer">
          Erranza
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2">Seasonal deals</h1>
        <p className="text-sm text-gray-500 mb-6">Listings with a lower price active right now.</p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
          </div>
        ) : deals.length === 0 ? (
          <p className="text-sm text-gray-400 py-16 text-center">No seasonal deals running right now — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {deals.map((listing) => {
              const rate = activeRate(listing)
              const base = Number(listing.price)
              const dealPrice = rate ? Number(rate.price) : base
              const pct = rate ? Math.round((1 - dealPrice / base) * 100) : 0
              const route = CATEGORY_ROUTE[listing.category] ?? 'stays'
              return (
                <button key={listing.id} onClick={() => router.push(`/listings/${route}/${listing.id}`)}
                  className="text-left group">
                  <div className="relative w-full aspect-[5/4] rounded-xl overflow-hidden bg-[#f5f5f5] mb-2">
                    <Image src={listing.images[0]?.url ?? FALLBACK_IMAGE} alt={listing.title} fill sizes="25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    {pct > 0 && (
                      <span className="absolute top-2 left-2 bg-[#e8734a] text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {pct}% off
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] font-semibold text-[#222] line-clamp-1">{listing.title}</p>
                  <p className="text-[12px] text-gray-500">{listing.location}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[12px] font-semibold text-[#2c4a1e]">Ksh {Math.round(dealPrice).toLocaleString()}</span>
                    {pct > 0 && <span className="text-[11px] text-gray-400 line-through">Ksh {Math.round(base).toLocaleString()}</span>}
                    <Star size={10} fill="#F5D06E" color="#304333" />
                    <span className="text-[11px] text-gray-500">{listing.reviews_avg_rating ? Number(listing.reviews_avg_rating).toFixed(1) : '4.5'}</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
