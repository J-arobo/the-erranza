'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export default function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10)
    const hide = setTimeout(() => setVisible(false), 2800)
    const remove = setTimeout(onDone, 3100)
    return () => { clearTimeout(show); clearTimeout(hide); clearTimeout(remove) }
  }, [onDone])

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2
                  bg-[#1a1a1a] text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg
                  transition-all duration-300
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <CheckCircle2 size={16} color="#7dd88a" />
      {message}
    </div>
  )
}
