'use client'
import {
  Home, Plane, Binoculars, ShoppingBag,
  Star, BookOpen, Package, Car
} from 'lucide-react'

const tabs = [
  { name: 'Stays', Icon: Home },
  { name: 'Flights', Icon: Plane },
  { name: 'Safari', Icon: Binoculars },
  { name: 'Market', Icon: ShoppingBag },
  { name: 'Experiences', Icon: Star },
  { name: 'Directory', Icon: BookOpen },
  { name: 'Packages', Icon: Package },
  { name: 'Car Rentals', Icon: Car },
]

type Props = {
  scrollY: number
  active: string
  onSelect: (name: string) => void
  collapsed: boolean
}

export default function CategoryBar({ scrollY, active, onSelect, collapsed }: Props) {
  const ICON_FADE_START = 30
  const ICON_FADE_END = 80
  const iconOpacity = Math.max(
    0,
    Math.min(1, 1 - (scrollY - ICON_FADE_START) / (ICON_FADE_END - ICON_FADE_START))
  )
  const iconTranslate = Math.min(Math.max(0, scrollY - ICON_FADE_START) * 0.4, 20)
  const iconsGone = iconOpacity < 0.05

  return (
    // No border-b here — the shadow is added on the whole top section in AppShell
    <nav className="bg-[#f5f6f4] flex-shrink-0 w-full">
      <div className="flex overflow-x-auto scrollbar-hide px-2
                      sm:justify-center sm:overflow-x-visible sm:px-0">
        {tabs.map(({ name, Icon }) => (
          <button
            key={name}
            onClick={() => onSelect(name)}
            className={`flex flex-col items-center gap-0.5 px-3 sm:px-5
                                flex-shrink-0 min-w-[64px] transition-all duration-300
                                ${iconsGone ? 'py-0.5' : 'py-1'}`}
          >
            <div
              className={`rounded-full p-1 transition-all
                        ${active === name ? 'bg-[#304333]' : 'bg-transparent'}`}
              style={{
                opacity: iconOpacity,
                transform: `translateY(${iconTranslate}px)`,
                height: iconsGone ? 0 : 'auto',

                overflow: 'hidden',
                transition: 'opacity 0.2s, transform 0.2s, height 0.2s',
              }}
            >
              <Icon size={18} color={active === name ? '#EAF98E' : '#304333'} />
            </div>

            <span
              className={`text-[11px] whitespace-nowrap transition-all duration-200
                ${active === name
                  ? 'text-[#304333] font-bold border-b-2 border-[#304333] pb-0.5'
                  : 'text-[#304333] font-medium border-b-2 border-transparent pb-0.5'}`}
              style={{
                transform: iconsGone ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'transform 0.2s',
              }}
            >
              {name}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}