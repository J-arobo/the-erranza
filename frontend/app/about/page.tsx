'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ShieldCheck, MapPin, Smartphone, Users } from 'lucide-react'

const STATS = [
  { value: '12k+', label: 'Monthly travellers' },
  { value: '340+', label: 'Active operators' },
  { value: '4.8★', label: 'Avg. operator rating' },
]

const VALUES = [
  {
    Icon: MapPin,
    title: 'Built for Kenya',
    description: "Stays, safaris, packages and experiences from operators who actually know the places they're listing — not a global catalog with Kenya bolted on.",
  },
  {
    Icon: ShieldCheck,
    title: 'Verified operators',
    description: "Every vendor is reviewed before their listings go live, so you're booking with someone real, not an anonymous listing.",
  },
  {
    Icon: Smartphone,
    title: 'Pay the way you already do',
    description: 'M-Pesa and card, secured through Erranza — never pay a vendor directly outside the platform.',
  },
  {
    Icon: Users,
    title: 'Two-sided, by design',
    description: 'The same platform that helps you find a trip also helps a small tour operator or homeowner reach travellers they\'d never have found on their own.',
  },
]

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center gap-3
                      sticky top-0 bg-white z-40">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center sm:hidden"
        >
          <ArrowLeft size={16} color="#1a1a1a" />
        </button>
        <span
          onClick={() => router.push('/')}
          className="hidden sm:block text-[#304333] text-xl font-bold cursor-pointer"
        >
          Erranza
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-3">
          About Erranza
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          Erranza is a booking platform for Kenya — stays, safaris, curated packages and experiences,
          all from local operators, in one place. We handle the discovery, the booking, and the payment,
          so you can focus on the trip.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 border border-gray-200 rounded-2xl divide-x divide-gray-100 mb-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="p-4 text-center">
              <p className="text-xl font-bold text-[#1a1a1a]">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="flex flex-col gap-5 mb-10">
          {VALUES.map(({ Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#eaf5e4] flex items-center justify-center flex-shrink-0">
                <Icon size={18} color="#2c4a1e" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-3 bg-[#2c4a1e] text-white rounded-xl text-sm font-semibold
                       hover:bg-[#3d6b28] transition-colors"
          >
            Explore trips
          </button>
          <button
            onClick={() => router.push('/partner')}
            className="flex-1 py-3 border border-gray-200 text-[#1a1a1a] rounded-xl text-sm
                       font-semibold hover:bg-gray-50 transition-colors"
          >
            List your business
          </button>
        </div>
      </div>
    </div>
  )
}
