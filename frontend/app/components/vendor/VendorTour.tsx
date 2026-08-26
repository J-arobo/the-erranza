'use client'
import { useState } from 'react'
import { X, List, Calendar, MessageCircle, TrendingUp, User as UserIcon } from 'lucide-react'

const STEPS = [
  {
    Icon: List,
    title: 'Your listings',
    body: "Create and manage your listings from here — add your first one to start getting booked.",
  },
  {
    Icon: Calendar,
    title: 'Bookings',
    body: "Guest requests land here. Accept, decline, or message a guest before confirming a booking.",
  },
  {
    Icon: MessageCircle,
    title: 'Messages',
    body: "Chat with guests directly, and reach Erranza support any time you need help.",
  },
  {
    Icon: TrendingUp,
    title: 'Earnings',
    body: "Track your payouts and revenue over time, all in one place.",
  },
  {
    Icon: UserIcon,
    title: 'Profile',
    body: "Update your business details, payout method, and verification documents here.",
  },
]

export default function VendorTour({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(26,26,26,0.55)' }}>
      <div className="relative bg-white rounded-3xl px-8 py-8 max-w-sm w-full"
        style={{ animation: 'erranza-celebration-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <button onClick={onFinish} aria-label="Skip tour"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1a1a1a] transition-colors">
          <X size={16} />
        </button>

        <div className="w-14 h-14 rounded-full bg-[#eaf5e4] flex items-center justify-center mb-5">
          <current.Icon size={24} color="#2c4a1e" />
        </div>

        <p className="text-lg font-bold text-[#1a1a1a] mb-2">{current.title}</p>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">{current.body}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-4 bg-[#2c4a1e]' : 'w-1.5 bg-gray-200'}`} />
            ))}
          </div>
          <div className="flex items-center gap-3">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="text-sm font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors">
                Back
              </button>
            )}
            <button onClick={() => isLast ? onFinish() : setStep(s => s + 1)}
              className="bg-[#2c4a1e] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#3d6b28] transition-colors">
              {isLast ? 'Got it, thanks!' : 'Next'}
            </button>
          </div>
        </div>

        <button onClick={onFinish}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4 transition-colors">
          Skip tour
        </button>
      </div>
    </div>
  )
}