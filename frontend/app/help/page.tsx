'use client'
import { useRouter } from 'next/navigation'
import {
  MessageCircle, Phone, ChevronDown, ChevronRight,
  ArrowLeft, Shield, CalendarX, CreditCard, ClipboardList
} from 'lucide-react'
import { useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

// TODO: replace with Erranza's real support line before shipping this page.
const SUPPORT_PHONE = '+254 700 000 000'

const FAQ_CATEGORIES = ['Stays', 'Flights', 'Safari', 'Payments', 'Safety', 'Other'] as const
type Category = typeof FAQ_CATEGORIES[number]

const FAQS: { q: string; a: string; category: Category }[] = [
  { category: 'Stays', q: 'How do I cancel a booking?', a: 'You can cancel a booking from your Trips page. Go to the booking and tap "Manage booking" then "Cancel". Refund eligibility depends on the vendor\'s cancellation policy for that listing.' },
  { category: 'Stays', q: "What's a listing's cancellation policy?", a: 'Each stay sets its own policy — Flexible, Moderate, or Strict — shown on the listing page before you book. Some hosts also write a custom policy for their property.' },
  { category: 'Stays', q: 'Can I see the property before booking?', a: "Yes — every listing has a full photo gallery, so you can browse real photos of the space before you book. Some stays also include a 360° virtual tour (not every listing has one) — where available, look for \"Take a 360° tour\" in the photo gallery. Drag to look around each room and click through doorways to explore." },
  { category: 'Flights', q: 'Do you offer flight bookings?', a: "Flights are coming soon to Erranza. Right now you can book Stays, Safaris and Packages — we'll let you know as soon as flights are available." },
  { category: 'Safari', q: 'How do I contact a vendor?', a: "Once you've made a booking, go to Messages in your account. You can message the vendor directly from there." },
  { category: 'Safari', q: 'What does "fixed departure dates" mean?', a: 'Some safaris and tours only run on specific pre-set dates rather than any date you choose — you\'ll see the available dates listed on the tour page, each with the number of spots left.' },
  { category: 'Payments', q: 'What payment methods are accepted?', a: 'We accept M-Pesa and card payments. Payment methods can vary slightly by vendor.' },
  { category: 'Payments', q: 'Is my payment secure?', a: 'Yes. All payments are processed securely through Erranza. Never pay a vendor directly outside the platform.' },
  { category: 'Payments', q: 'Can I pay in instalments?', a: 'Some bookings support paying in instalments instead of the full amount upfront — this is shown at checkout when it\'s available for that booking.' },
  { category: 'Safety', q: 'How are vendors verified?', a: 'Vendors submit identifying documents during onboarding and are reviewed before their listings go live. Look for the verified badge on a vendor\'s profile.' },
  { category: 'Safety', q: 'What is ErranzaCover?', a: 'ErranzaCover is our optional travel insurance that covers cancellations, trip interruptions and more. You can add it during booking.' },
  { category: 'Other', q: 'How do I become a vendor?', a: 'Tap "Become a vendor" in the menu. You\'ll be guided through creating your vendor account and first listing.' },
  { category: 'Other', q: "Can't find what you need?", a: 'Send us a message using the button above, or call us — we\'re here 24/7.' },
]

const INFO_CARDS = [
  {
    label: 'Cancellation policies',
    icon: CalendarX,
    content: "Each stay sets its own policy, shown on the listing before you book:\n\n• Flexible — full refund up to 24 hours before check-in.\n• Moderate — full refund up to 5 days before check-in.\n• Strict — 50% refund up to 7 days before check-in, no refund after.\n\nSome hosts write a custom policy instead — always check the listing page for the exact terms before booking.",
  },
  {
    label: 'Payment questions',
    icon: CreditCard,
    content: "We accept M-Pesa and card payments, processed securely through Erranza — never pay a vendor directly outside the platform. Some bookings let you pay in instalments instead of the full amount upfront; that option is shown at checkout when it's available. Refunds for eligible cancellations go back to your original payment method.",
  },
  {
    label: 'Booking details',
    icon: ClipboardList,
    content: "Find every booking under Trips in your account — dates, guest count, total paid, and the host's contact. From there you can message the host, view your confirmation, and manage or cancel the booking if the policy allows it.",
  },
  {
    label: 'Safety & security',
    icon: Shield,
    content: "Vendors are reviewed and verified before their listings go live — look for the verified badge on a vendor's profile. We'll never ask for your account or payment details by phone, email or chat. Add ErranzaCover at checkout for extra protection against cancellations and trip interruptions.",
  },
]

export default function HelpPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [activeCategory, setActiveCategory] = useState<Category>('Stays')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [openInfo, setOpenInfo] = useState<number | null>(null)
  const faqSectionRef = useRef<HTMLDivElement>(null)

  const visibleFaqs = FAQS.filter(f => f.category === activeCategory)

  function jumpToCategory(category: Category) {
    setActiveCategory(category)
    setOpenFaq(null)
    faqSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

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
              <p className="text-xs text-gray-500 mb-1">
                For anything urgent, you can call us 24/7.
              </p>
              <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
                className="text-sm font-semibold text-[#2c4a1e] hover:underline">
                {SUPPORT_PHONE}
              </a>
              {/* WhatsApp support line — deferred, add later */}
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
                  onClick={() => faqSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
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
        <h2 ref={faqSectionRef} className="text-lg font-bold text-[#1a1a1a] mb-4 scroll-mt-20">
          Frequently asked questions
        </h2>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5 pb-1">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenFaq(null) }}
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
          {visibleFaqs.map((faq, i) => (
            <div key={faq.q}>
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

        {/* Bottom links — jump straight into the matching FAQ category */}
        <h2 className="text-lg font-bold text-[#1a1a1a] mt-8 mb-4">
          More information
        </h2>
        <div className="flex flex-col divide-y divide-gray-100 border border-gray-200
                        rounded-2xl overflow-hidden">
          {INFO_CARDS.map((card, i) => {
            const Icon = card.icon
            return (
              <div key={card.label}>
                <button
                  onClick={() => setOpenInfo(openInfo === i ? null : i)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <Icon size={18} color="#2c4a1e" className="flex-shrink-0" />
                  <span className="text-sm font-semibold text-[#1a1a1a] flex-1">
                    {card.label}
                  </span>
                  <ChevronDown
                    size={16}
                    color="#888"
                    className={`flex-shrink-0 transition-transform ${openInfo === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {openInfo === i && (
                  <div className="px-5 pb-4 pl-[52px]">
                    <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{card.content}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Erranza Help Centre · Available 24/7
        </p>
      </div>
    </div>
  )
}
