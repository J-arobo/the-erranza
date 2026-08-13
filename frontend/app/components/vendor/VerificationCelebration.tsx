'use client'
import { useState } from 'react'
import { PartyPopper } from 'lucide-react'

const CONFETTI_COLORS = ['#2c4a1e', '#f36336', '#EAF98E', '#78716c', '#eaf5e4']

export default function VerificationCelebration({ onDismiss }: { onDismiss: () => void }) {
  const [pieces] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: Math.random() * 360,
    }))
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{ background: 'rgba(26,26,26,0.55)' }}>
      {pieces.map((p, i) => (
        <span key={i}
          className="absolute top-[-20px] w-2 h-3 rounded-sm"
          style={{
            left: `${p.left}%`,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `erranza-confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }} />
      ))}

      <div className="relative bg-white rounded-3xl px-8 py-10 max-w-sm w-full mx-4 text-center"
        style={{ animation: 'erranza-celebration-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
        <div className="w-16 h-16 rounded-full bg-[#eaf5e4] flex items-center justify-center mx-auto mb-4"
          style={{ animation: 'erranza-celebration-bounce 1s ease-in-out 0.5s 2' }}>
          <PartyPopper size={28} color="#2c4a1e" />
        </div>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">You're verified! 🎉</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Your documents have been approved. You can now start listing on Erranza.
        </p>
        <button onClick={onDismiss}
          className="w-full bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#3d6b28] transition-colors">
          Let's go →
        </button>
      </div>

      <style>{`
        @keyframes erranza-confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0.8; }
        }
        @keyframes erranza-celebration-pop {
          0% { opacity: 0; transform: scale(0.7) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes erranza-celebration-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  )
}
