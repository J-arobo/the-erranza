'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export default function CountdownBanner({ message, durationMs = 6000, onDone }: { message: string; durationMs?: number; onDone: () => void }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / durationMs) * 100)
      setProgress(remaining)
      if (remaining <= 0) {
        clearInterval(interval)
        onDone()
      }
    }, 50)
    return () => clearInterval(interval)
  }, [durationMs, onDone])

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-lg overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <CheckCircle2 size={20} color="#2c4a1e" className="flex-shrink-0" />
          <p className="text-sm font-semibold text-[#1a1a1a] flex-1">{message}</p>
          <button onClick={onDone} className="text-gray-400 hover:text-[#1a1a1a] flex-shrink-0 focus:outline-none">
            <X size={16} />
          </button>
        </div>
        <div className="h-1 bg-gray-100">
          <div className="h-full bg-[#2c4a1e] transition-all duration-75 ease-linear" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
