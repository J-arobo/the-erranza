'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const ARTICLES = [
  {
    title: 'When to go on safari in Kenya',
    body: "The Maasai Mara's Great Migration typically runs July–October, when wildebeest cross the Mara River — the busiest and most dramatic time to visit, but also the priciest. For fewer crowds and lush green scenery, the short rains season (November–December) and January–February offer excellent game viewing at lower rates.",
  },
  {
    title: 'What to pack for a safari',
    body: 'Neutral-coloured clothing (khaki, olive, brown) rather than bright colours or all-black, a warm layer for early-morning game drives, a hat and sunscreen, binoculars, and a dust-proof bag for your camera. Most lodges offer laundry service, so you can pack lighter than you think.',
  },
  {
    title: "Kenya's coast beyond Diani",
    body: 'Diani gets most of the attention, but Watamu and Malindi offer quieter beaches and excellent snorkelling in their marine parks, while Lamu Old Town — a UNESCO World Heritage site with no cars, only donkeys and dhows — is one of the best-preserved Swahili settlements on the coast.',
  },
  {
    title: 'Booking a stay vs. a package',
    body: "A Stay gives you a place to sleep and full control over your itinerary. A Package bundles accommodation with activities, transport, or guiding into one price — usually the simpler choice for a first-time visitor to an area, while a Stay suits travellers who already know what they want to do.",
  },
]

export default function TravelArticlesPage() {
  const router = useRouter()

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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2">Travel articles</h1>
        <p className="text-sm text-gray-500 mb-8">A few notes from the Erranza team to help you plan.</p>

        <div className="flex flex-col gap-8">
          {ARTICLES.map((a) => (
            <div key={a.title} className="border-b border-gray-100 pb-8 last:border-0">
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">{a.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
