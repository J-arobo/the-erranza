'use client'
import { useEffect, useState } from 'react'
import { X, List, Calendar, MessageCircle, TrendingUp, User as UserIcon } from 'lucide-react'

const STEPS = [
  { target: 'nav-listings', Icon: List, title: 'Your listings', body: "Create and manage your listings from here — add your first one to start getting booked." },
  { target: 'nav-bookings', Icon: Calendar, title: 'Bookings', body: "Guest requests land here. Accept, decline, or message a guest before confirming a booking." },
  { target: 'nav-messages', Icon: MessageCircle, title: 'Messages', body: "Chat with guests directly, and reach Erranza support any time you need help." },
  { target: 'nav-earnings', Icon: TrendingUp, title: 'Earnings', body: "Track your payouts and revenue over time, all in one place." },
  { target: 'nav-profile', Icon: UserIcon, title: 'Profile', body: "Update your business details, payout method, and verification documents here." },
]

type Rect = { top: number; left: number; width: number; height: number }

export default function VendorTour({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  // Measures the real nav item on every step change — and re-measures on
  // resize/scroll so the popover tracks it. Falls back to null (centered
  // popover, no arrow) if the target isn't in the DOM or has no size, which
  // covers narrow viewports where the sidebar lives behind a closed drawer.
  useEffect(() => {
    function measure() {
      const el = document.querySelector(`[data-tour="${current.target}"]`)
      const r = el?.getBoundingClientRect()
      if (r && r.width > 0 && r.height > 0) {
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
      } else {
        setRect(null)
      }
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [step, current.target])

  const popoverStyle: React.CSSProperties = rect
    ? {
        position: 'fixed',
        top: Math.min(Math.max(rect.top + rect.height / 2 - 90, 16), window.innerHeight - 260),
        left: Math.min(rect.left + rect.width + 16, window.innerWidth - 340),
      }
    : { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  return (
    <div className="fixed inset-0 z-[100]" style={{ background: 'rgba(26,26,26,0.55)' }}>
      {rect && (
        <div className="fixed rounded-xl ring-2 ring-[#EAF98E] pointer-events-none transition-all duration-300"
          style={{ top: rect.top - 4, left: rect.left - 4, width: rect.width + 8, height: rect.height + 8 }} />
      )}

      <div className="w-80 bg-white rounded-2xl shadow-2xl px-6 py-6 transition-all duration-300" style={popoverStyle}>
        {rect && (
          <div className="absolute w-3 h-3 bg-white rotate-45" style={{ left: -6, top: '50%', marginTop: -6 }} />
        )}

        <button onClick={onFinish} aria-label="Skip tour"
          className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-[#1a1a1a] transition-colors">
          <X size={14} />
        </button>

        <div className="w-11 h-11 rounded-full bg-[#eaf5e4] flex items-center justify-center mb-4">
          <current.Icon size={20} color="#2c4a1e" />
        </div>

        <p className="text-base font-bold text-[#1a1a1a] mb-1.5">{current.title}</p>
        <p className="text-sm text-gray-500 leading-relaxed mb-5">{current.body}</p>

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
              className="bg-[#2c4a1e] text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-[#3d6b28] transition-colors">
              {isLast ? 'Got it, thanks!' : 'Next'}
            </button>
          </div>
        </div>

        <button onClick={onFinish}
          className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-3 transition-colors">
          Skip tour
        </button>
      </div>
    </div>
  )
}
