'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MessageCircle, AlertTriangle, LifeBuoy } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function PartnerDisputePage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()

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

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2">
          Having an issue with a host?
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Here's the fastest way to sort it out, depending on what's wrong.
        </p>

        <div className="flex flex-col gap-4 mb-8">
          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <MessageCircle size={20} color="#2c4a1e" />
              <p className="text-sm font-bold text-[#1a1a1a]">Message your host first</p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Most issues — a mix-up about check-in, a question about the space, anything about your specific
              trip — are solved fastest by messaging your host directly from your booking.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle size={20} color="#2c4a1e" />
              <p className="text-sm font-bold text-[#1a1a1a]">Don't agree with an extra charge?</p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              If a host has requested an extra charge on your booking that you don't think is right, decline it
              from the booking page instead of paying it — that opens a review with our team automatically, and
              you won't be charged while it's under review.
            </p>
          </div>

          <div className="border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <LifeBuoy size={20} color="#2c4a1e" />
              <p className="text-sm font-bold text-[#1a1a1a]">Still unresolved?</p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              If messaging your host didn't fix it, contact Erranza Support and we'll step in directly.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push(isLoggedIn ? '/messages' : '/login?redirect=/messages')}
            className="flex-1 py-3 bg-[#2c4a1e] text-white rounded-xl text-sm font-semibold
                       hover:bg-[#3d6b28] transition-colors"
          >
            Go to Messages
          </button>
          <button
            onClick={() => router.push('/help')}
            className="flex-1 py-3 border border-gray-200 text-[#1a1a1a] rounded-xl text-sm
                       font-semibold hover:bg-gray-50 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
