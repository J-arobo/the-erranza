'use client'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Briefcase, CreditCard } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const VALUE_PROPS = [
  {
    Icon: CheckCircle2,
    title: 'Get discovered',
    description: 'Show up when travellers search your destination or category.',
  },
  {
    Icon: Briefcase,
    title: 'Manage bookings in one place',
    description: 'Approve requests, message guests, track your calendar.',
  },
  {
    Icon: CreditCard,
    title: 'Get paid via M-Pesa',
    description: 'Fast payouts after each completed trip.',
  },
]

export default function PartnerLandingPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="px-6 sm:px-8 py-4 border-b border-gray-200 flex items-center justify-between">
        <span
          onClick={() => router.push('/')}
          className="text-[var(--dark-green)] text-41 font-bold text-buenard tracking-tight cursor-pointer"
        >
          Erranza
        </span>
        <button
          onClick={() => router.push(isLoggedIn ? '/partner/signup' : '/login?redirect=/vendor')}
          className="text-sm font-semibold text-[#304333] hover:text-[#2c4a1e] transition-colors"
        >
          Sign in
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-[568px]">

          {/* Hero */}
          <div className="relative rounded-2xl overflow-hidden mb-6 h-64 sm:h-72">
            <img
              src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=900&q=80"
              alt="Safari at sunset"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.15) 60%)' }} />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h1 className="text-buenard text-3xl sm:text-4xl font-bold text-white leading-tight">
                Reach travellers across Kenya and beyond
              </h1>
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            List your tours, stays or experiences on Erranza and manage bookings, payouts,
            and guests in one place.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 border-y border-gray-200 py-5 mb-6">
            {[
              { value: '12k+', label: 'Monthly travellers' },
              { value: '340+', label: 'Active operators' },
              { value: '4.8★', label: 'Avg. operator rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Value props */}
          <div className="flex flex-col divide-y divide-gray-100 mb-8">
            {VALUE_PROPS.map(({ Icon, title, description }) => (
              <div key={title} className="flex items-start gap-3.5 py-4">
                <div className="w-9 h-9 rounded-full bg-[#fdeee7] flex items-center justify-center flex-shrink-0">
                  <Icon size={17} color="#f36336" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a1a1a]">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push('/partner/signup')}
            className="w-full py-3.5 rounded-xl text-white text-sm font-semibold
                       transition-colors mb-4"
            style={{ background: 'linear-gradient(to right, #f98a66, #f36336)' }}
          >
            Get started →
          </button>

          <p className="text-center text-sm text-gray-500">
            Already listing with us?{' '}
            <button
              onClick={() => router.push('/login?redirect=/vendor')}
              className="text-[#304333] font-semibold underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
