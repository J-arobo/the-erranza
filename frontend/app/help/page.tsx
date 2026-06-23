'use client'
import { useRouter } from 'next/navigation'
import {
  MessageCircle, Phone, ChevronDown, ChevronRight,
  ArrowLeft, Shield
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

const FAQ_CATEGORIES = ['Stays', 'Flights', 'Safari', 'Payments', 'Safety', 'Other']

const FAQS = [
  { q: 'How do I cancel a booking?', a: 'You can cancel a booking from your Trips page. Go to the booking and tap "Manage booking" then "Cancel". Refund eligibility depends on the vendor\'s cancellation policy.' },
  { q: 'How do I contact a vendor?', a: 'Once you\'ve made a booking, go to Messages in your account. You can message the vendor directly from there.' },
  { q: 'What payment methods are accepted?', a: 'We accept credit/debit cards, M-Pesa, and bank transfers. Payment methods vary by vendor.' },
  { q: 'Is my payment secure?', a: 'Yes. All payments are processed securely through Erranza. Never pay a vendor outside the platform.' },
  { q: 'How do I become a vendor?', a: 'Tap "Become a vendor" in the menu. You\'ll be guided through creating your vendor account and first listing.' },
  { q: 'What is ErranzaCover?', a: 'ErranzaCover is our optional travel insurance that covers cancellations, trip interruptions and more. You can add it during booking.' },
]

export default function HelpPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [activeCategory, setActiveCategory] = useState('Stays')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center gap-3
                      sticky top-0 bg-white z-40">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
                     sm:hidden"
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

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2">
          Welcome to the Help Centre
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in to contact Customer Service, available 24 hours a day
        </p>

        {/* Stay safe notice */}
        <div className="flex items-start gap-3 border border-gray-200 rounded-xl p-4 mb-6">
          <Shield size={18} color="#2c4a1e" className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">Stay safe online</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Erranza will never ask for your account or payment info by phone, email or chat.
              If in doubt, please report it to Erranza.
            </p>
          </div>
        </div>

        {/* Contact options */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle size={20} color="#2c4a1e" />
                <p className="text-sm font-bold text-[#1a1a1a]">Send us a message</p>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                Contact our agents about your booking, and we'll reply as soon as possible.
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Phone size={20} color="#2c4a1e" />
                <p className="text-sm font-bold text-[#1a1a1a]">Call us</p>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                For anything urgent, you can call us 24/7 on a local or international phone number.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-100 p-4 flex flex-col gap-3">
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/messages')}
                className="w-full py-3 bg-[#2c4a1e] text-white rounded-xl text-sm
                           font-semibold hover:bg-[#3d6b28] transition-colors"
              >
                Go to messages
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push('/login?redirect=/help')}
                  className="w-full py-3 bg-[#2c4a1e] text-white rounded-xl text-sm
                             font-semibold hover:bg-[#3d6b28] transition-colors"
                >
                  Sign in
                </button>
                <button
                  className="w-full py-3 border border-gray-200 text-[#1a1a1a] rounded-xl
                             text-sm font-semibold hover:bg-gray-50 transition-colors"
                >
                  Continue without an account
                </button>
              </>
            )}
          </div>
        </div>

        {/* FAQ categories */}
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">
          Frequently asked questions
        </h2>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold
                          border transition-all
                ${activeCategory === cat
                  ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                  : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ accordion */}
        <div className="flex flex-col divide-y divide-gray-100 border border-gray-200
                        rounded-2xl overflow-hidden">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4
                           text-left hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold text-[#1a1a1a] flex-1 pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  color="#888"
                  className={`flex-shrink-0 transition-transform
                    ${openFaq === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4">
                  <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom links */}
        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {[
            { label: 'Cancellation policies',  path: '/' },
            { label: 'Payment questions',       path: '/' },
            { label: 'Booking details',         path: '/' },
            { label: 'Safety & security',       path: '/' },
          ].map(({ label, path }) => (
            <button
              key={label}
              onClick={() => router.push(path)}
              className="flex items-center justify-between px-4 py-3 border border-gray-200
                         rounded-xl text-sm font-medium text-[#1a1a1a] hover:bg-gray-50
                         transition-colors text-left"
            >
              {label}
              <ChevronRight size={14} color="#aaa" />
            </button>
          ))}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Erranza Help Centre · Available 24/7
        </p>
      </div>
    </div>
  )
}