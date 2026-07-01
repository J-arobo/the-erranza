'use client'
// src/app/listings/stays/[id]/page.tsx

import { use, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import {
  ArrowLeft, Share2, Heart, Star, ChevronRight, ChevronLeft,
  Grid2X2, X, Shield, Check, Award,
  Wifi, Wind, Tv, Car, UtensilsCrossed, Waves,
  ShowerHead, Dumbbell, Coffee, Snowflake, Home,
  MapPin, Camera, Globe, Calendar,
  CalendarX2, Key, ShieldHalf,
} from 'lucide-react'
import { stays } from '@/data/stays'
import { useAuth } from '@/context/AuthContext'

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-xl flex items-center justify-center"
      style={{ height: 240, background: '#ffffff' }}>
      <p className="text-sm text-[#a8a29e]">Loading map…</p>
    </div>
  ),
})

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'High-speed WiFi': <Wifi size={22} strokeWidth={1.5} />,
  'WiFi': <Wifi size={22} strokeWidth={1.5} />,
  'Air conditioning': <Wind size={22} strokeWidth={1.5} />,
  'Smart TV': <Tv size={22} strokeWidth={1.5} />,
  'Free parking': <Car size={22} strokeWidth={1.5} />,
  'Full kitchen': <UtensilsCrossed size={22} strokeWidth={1.5} />,
  'Kitchen': <UtensilsCrossed size={22} strokeWidth={1.5} />,
  'Pool access': <Waves size={22} strokeWidth={1.5} />,
  'Private pool': <Waves size={22} strokeWidth={1.5} />,
  'Beachfront access': <Waves size={22} strokeWidth={1.5} />,
  'Beach access': <Waves size={22} strokeWidth={1.5} />,
  'Hot water': <ShowerHead size={22} strokeWidth={1.5} />,
  'Gym access': <Dumbbell size={22} strokeWidth={1.5} />,
  'Breakfast included': <Coffee size={22} strokeWidth={1.5} />,
  'Infinity pool': <Waves size={22} strokeWidth={1.5} />,
  'Spa access': <Snowflake size={22} strokeWidth={1.5} />,
  'Washing machine': <ShowerHead size={22} strokeWidth={1.5} />,
  'Balcony': <Home size={22} strokeWidth={1.5} />,
}
const getIcon = (label: string) => AMENITY_ICONS[label] ?? <Check size={22} strokeWidth={1.5} />

const DETAILS: Record<string, any> = {
  '1': {
    type: 'Entire apartment', lat: -1.2637, lng: 36.8030,
    guests: 2, bedrooms: 1, beds: 1, baths: 1,
    hostName: 'Sarah', cohostName: 'James',
    hostBio: "Hi! I'm Sarah, a Nairobi local who loves helping travellers discover the best of the city.",
    hostSpeaks: 'English and Swahili', hostObsessed: 'Coffee and travel',
    isSuperhost: true, yearsHosting: 3, responseRate: 100, responseTime: 'within an hour',
    description: "A beautifully designed, light-filled apartment in the heart of Westlands.Perfect for couples or solo travellers looking to explore Nairobi in style. The apartment features floor-to-ceiling windows with city views, a fully equipped kitchen, and high-speed WiFi throughout. The apartment features floor-to-ceiling windows with city views, a fully equipped kitchen, and high-speed WiFi throughout\n\nYou're walking distance from the best restaurants, cafes and shopping that Nairobi has to offer. Quick access to the CBD and major business districts makes this perfect for both leisure and business travellers.",
    images: [
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80',
      'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80',
      'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800&q=80',
    ],
    amenities: ['High-speed WiFi', 'Air conditioning', 'Smart TV', 'Free parking', 'Full kitchen', 'Pool access', 'Hot water', 'Gym access', 'Washing machine', 'Balcony'],
    highlights: [
      { icon: '🏠', title: 'Outdoor entertainment', desc: 'The sun deck and pool area are great for relaxation.' },
      { icon: '❄️', title: 'Designed for staying cool', desc: 'Beat the heat with the AC and ceiling fan.' },
      { icon: '🔑', title: 'Self check-in', desc: 'Check yourself in with the lockbox.' },
    ],
    reviews: [
      { name: 'Amina', date: '2 weeks ago', rating: 5, avatar: 'A', years: '2 years on Erranza', text: "An amazing stay from start to finish. The apartment is exactly as described — spacious, spotless, and beautifully put together. Sarah was incredibly helpful throughout." },
      { name: 'David', date: '1 month ago', rating: 5, avatar: 'D', years: '1 year on Erranza', text: "Perfect location, perfect host. Will definitely be back next time I'm in Nairobi. The WiFi was super fast and the kitchen had everything I needed." },
      { name: 'Grace', date: '2 months ago', rating: 4, avatar: 'G', years: '3 years on Erranza', text: "Lovely apartment in a great area. Very clean and well maintained. The city views are stunning especially at night. Would definitely recommend." },
      { name: 'James', date: '3 months ago', rating: 5, avatar: 'J', years: '5 years on Erranza', text: "One of the best experiences I've had. Sarah is incredibly responsive and the apartment exceeded all expectations. Perfect for business travel." },
    ],
  },
  '2': {
    type: 'Entire villa', lat: -4.2950, lng: 39.5823,
    guests: 6, bedrooms: 3, beds: 4, baths: 2,
    hostName: 'James', cohostName: 'Fatuma',
    hostBio: "Born and raised on the Kenyan coast, I know every hidden gem Diani has to offer.",
    hostSpeaks: 'English and Swahili', hostObsessed: 'The ocean and sunsets',
    isSuperhost: true, yearsHosting: 5, responseRate: 98, responseTime: 'within a few hours',
    description: "Stunning beachfront villa with panoramic Indian Ocean views.\n\nFall asleep to the sound of waves and wake up to breathtaking sunrises. The villa features a private pool, direct beach access, and a fully staffed kitchen.\n\nPerfect for families or groups seeking a luxury coastal retreat.",
    images: [
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1582610116397-edb72a8b8a6a?w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    ],
    amenities: ['Private pool', 'Beachfront access', 'WiFi', 'Air conditioning', 'Smart TV', 'Full kitchen', 'Free parking', 'Hot water'],
    highlights: [
      { icon: '🌊', title: 'Beachfront', desc: 'Direct access to a private beach.' },
      { icon: '🏊', title: 'Private pool', desc: 'Exclusive pool for guests only.' },
      { icon: '✅', title: 'Free cancellation', desc: 'Cancel before 3 days for a full refund.' },
    ],
    reviews: [
      { name: 'Sophia', date: '1 week ago', rating: 5, avatar: 'S', years: '2 years on Erranza', text: "Absolutely breathtaking villa. Waking up to the ocean every morning was a dream." },
      { name: 'Omar', date: '3 weeks ago', rating: 5, avatar: 'O', years: '4 years on Erranza', text: "Best holiday we've ever had. The private pool is incredible and the beach is just steps away." },
    ],
  },
  '3': {
    type: 'Private room in hotel', lat: -4.0435, lng: 39.6682,
    guests: 2, bedrooms: 1, beds: 1, baths: 1,
    hostName: 'Fatuma', cohostName: 'Ali',
    hostBio: "Mombasa born and bred. Passionate about showcasing the beauty of the coast.",
    hostSpeaks: 'English, Swahili and Arabic', hostObsessed: 'Coastal cuisine',
    isSuperhost: false, yearsHosting: 2, responseRate: 92, responseTime: 'within a day',
    description: "A stylish beachfront room with sweeping ocean views at one of Mombasa's finest boutique hotels.\n\nComplimentary breakfast is included, and you'll have access to all hotel facilities including the infinity pool and spa.",
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80',
      'https://images.unsplash.com/photo-1582610116397-edb72a8b8a6a?w=800&q=80',
      'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    ],
    amenities: ['Breakfast included', 'Infinity pool', 'Spa access', 'WiFi', 'Air conditioning', 'Hot water', 'Beach access'],
    highlights: [
      { icon: '🌅', title: 'Ocean views', desc: 'Wake up to the Indian Ocean every day.' },
      { icon: '🍳', title: 'Breakfast included', desc: 'Complimentary daily breakfast for 2.' },
      { icon: '♾️', title: 'Infinity pool', desc: 'Exclusive access to the rooftop pool.' },
    ],
    reviews: [
      { name: 'Lena', date: '2 weeks ago', rating: 5, avatar: 'L', years: '1 year on Erranza', text: "Absolutely loved this place. The views are stunning and the breakfast was delicious every morning." },
    ],
  },
}

const DEFAULT: any = {
  type: 'Entire rental unit', lat: -1.2864, lng: 36.8172,
  guests: 2, bedrooms: 1, beds: 1, baths: 1,
  hostName: 'Host', cohostName: '',
  hostBio: 'Experienced host committed to making your stay memorable.',
  hostSpeaks: 'English', hostObsessed: 'Travel',
  isSuperhost: false, yearsHosting: 1, responseRate: 95, responseTime: 'within a few hours',
  description: 'A wonderful place to stay in Kenya. Comfortable, clean and well-located.',
  images: [], amenities: ['WiFi', 'Air conditioning', 'Hot water', 'Kitchen'],
  highlights: [
    { icon: '📍', title: 'Great location', desc: 'Close to local attractions.' },
    { icon: '🔑', title: 'Easy check-in', desc: 'Flexible check-in times.' },
  ],
  reviews: [],
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// ── Mobile single-month calendar (unchanged) ──
function MiniCalendar({ checkIn, checkOut, onSelect }: {
  checkIn: Date | null; checkOut: Date | null; onSelect: (d: Date) => void
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const isPast = (d: number) => new Date(year, month, d) < todayMid
  const isStart = (d: number) => checkIn?.toDateString() === new Date(year, month, d).toDateString()
  const isEnd = (d: number) => checkOut?.toDateString() === new Date(year, month, d).toDateString()
  const isInRange = (d: number) => {
    if (!checkIn || !checkOut) return false
    const date = new Date(year, month, d)
    return date > checkIn && date < checkOut
  }

  return (
    <div style={{ background: '#FEFDFC', borderRadius: 16, padding: '16px 8px', border: '1px solid #e8e0d0' }}>
      <div className="flex items-center justify-between mb-4 px-2">
        <button onClick={() => month === 0 ? (setMonth(11), setYear(y => y - 1)) : setMonth(m => m - 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ WebkitTapHighlightColor: 'transparent', border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <ChevronLeft size={16} color="#304333" />
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#304333', fontFamily: "Georgia, 'Times New Roman', serif" }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={() => month === 11 ? (setMonth(0), setYear(y => y + 1)) : setMonth(m => m + 1)}
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ WebkitTapHighlightColor: 'transparent', border: 'none', background: 'transparent', cursor: 'pointer' }}>
          <ChevronRight size={16} color="#304333" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WDAYS.map((d, i) => (
          <div key={i} className="text-center py-1" style={{ fontSize: 11, fontWeight: 600, color: '#78716c' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7" style={{ rowGap: 4 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const past = isPast(d), start = isStart(d), end = isEnd(d), inRange = isInRange(d)
          const hasRange = !!(checkIn && checkOut)
          const inStrip = hasRange && (inRange || start || end)
          const col = i % 7
          const prevInStrip = d > 1 && hasRange && (() => {
            const prevDate = new Date(year, month, d - 1)
            return prevDate >= checkIn! && prevDate <= checkOut!
          })()
          const nextInStrip = hasRange && (() => {
            const nextDate = new Date(year, month, d + 1)
            if (nextDate.getMonth() !== month) return false
            return nextDate >= checkIn! && nextDate <= checkOut!
          })()
          const roundLeft = inStrip && (!prevInStrip || col === 0)
          const roundRight = inStrip && (!nextInStrip || col === 6)
          const borderRadius = inStrip ? `${roundLeft ? 24 : 0}px ${roundRight ? 24 : 0}px ${roundRight ? 24 : 0}px ${roundLeft ? 24 : 0}px` : '0'

          return (
            <div key={i} style={{
              background: inStrip ? '#D4DAAD' : 'transparent', borderRadius,
              display: 'flex', alignItems: 'center', justifyContent: 'center', height: 40,
              ...(start && !end && hasRange ? { background: `linear-gradient(to right, transparent 50%, #D4DAAD 50%)`, borderRadius: `0 ${roundRight ? 24 : 0}px ${roundRight ? 24 : 0}px 0` } : {}),
              ...(end && !start && hasRange ? { background: `linear-gradient(to left, transparent 50%, #D4DAAD 50%)`, borderRadius: `${roundLeft ? 24 : 0}px 0 0 ${roundLeft ? 24 : 0}px` } : {}),
              ...(start && end ? { background: 'transparent', borderRadius: '50%' } : {}),
            }}>
              <button disabled={past} onClick={() => !past && onSelect(new Date(year, month, d))}
                style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontFamily: "Georgia, 'Times New Roman', serif",
                  fontWeight: start || end ? 700 : 400,
                  background: start || end ? '#304333' : 'transparent',
                  color: start || end ? '#EAF98E' : past ? '#c8c0b4' : '#304333',
                  cursor: past ? 'not-allowed' : 'pointer', border: 'none',
                  WebkitTapHighlightColor: 'transparent', position: 'relative', zIndex: 1,
                }}>
                {past && (
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <span style={{ position: 'absolute', width: '130%', height: '1px', background: '#c8c0b4', transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
                  </span>
                )}
                {d}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Desktop two-month calendar ──
function DesktopCalendar({ checkIn, checkOut, onSelect }: {
  checkIn: Date | null; checkOut: Date | null; onSelect: (d: Date) => void
}) {
  const today = new Date()
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const [startYear, setStartYear] = useState(today.getFullYear())
  const [startMonth, setStartMonth] = useState(today.getMonth())

  // Second month = startMonth + 1
  const secondMonth = startMonth === 11 ? 0 : startMonth + 1
  const secondYear = startMonth === 11 ? startYear + 1 : startYear

  function prevMonth() {
    if (startMonth === 0) { setStartMonth(11); setStartYear(y => y - 1) }
    else setStartMonth(m => m - 1)
  }
  function nextMonth() {
    if (startMonth === 11) { setStartMonth(0); setStartYear(y => y + 1) }
    else setStartMonth(m => m + 1)
  }

  function renderMonth(year: number, month: number, isLeft: boolean) {
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

    const isPast = (d: number) => new Date(year, month, d) < todayMid
    const isStart = (d: number) => checkIn?.toDateString() === new Date(year, month, d).toDateString()
    const isEnd = (d: number) => checkOut?.toDateString() === new Date(year, month, d).toDateString()
    const isInRange = (d: number) => {
      if (!checkIn || !checkOut) return false
      const date = new Date(year, month, d)
      return date > checkIn && date < checkOut
    }

    return (
      <div style={{ flex: 1 }}>
        {/* Month header */}
        <div className="flex items-center justify-between mb-4">
          {isLeft ? (
            <button onClick={prevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f5f0e6]"
              style={{ border: '1px solid #e8e0d0', background: 'transparent', cursor: 'pointer' }}>
              <ChevronLeft size={15} color="#304333" />
            </button>
          ) : <div className="w-8" />}
          <span style={{ fontSize: 15, fontWeight: 600, color: '#304333', fontFamily: "Georgia, 'Times New Roman', serif" }}>
            {MONTHS[month]} {year}
          </span>
          {!isLeft ? (
            <button onClick={nextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f5f0e6]"
              style={{ border: '1px solid #e8e0d0', background: 'transparent', cursor: 'pointer' }}>
              <ChevronRight size={15} color="#304333" />
            </button>
          ) : <div className="w-8" />}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d, i) => (
            <div key={i} className="text-center py-1" style={{ fontSize: 12, fontWeight: 600, color: '#78716c' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7" style={{ rowGap: 2 }}>
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const past = isPast(d), start = isStart(d), end = isEnd(d), inRange = isInRange(d)
            const hasRange = !!(checkIn && checkOut)
            const inStrip = hasRange && (inRange || start || end)
            const col = i % 7

            const prevDate = d > 1 ? new Date(year, month, d - 1) : null
            const prevInStrip = prevDate && hasRange ? prevDate >= checkIn! && prevDate <= checkOut! : false
            const nextDateObj = new Date(year, month, d + 1)
            const nextInStrip = hasRange && nextDateObj.getMonth() === month
              ? nextDateObj >= checkIn! && nextDateObj <= checkOut!
              : false

            const roundLeft = inStrip && (!prevInStrip || col === 0)
            const roundRight = inStrip && (!nextInStrip || col === 6)
            const br = inStrip ? `${roundLeft ? 24 : 0}px ${roundRight ? 24 : 0}px ${roundRight ? 24 : 0}px ${roundLeft ? 24 : 0}px` : '0'

            return (
              <div key={i} style={{
                background: inStrip ? '#D4DAAD' : 'transparent',
                borderRadius: br,
                display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44,
                ...(start && !end && hasRange ? { background: `linear-gradient(to right, transparent 50%, #D4DAAD 50%)`, borderRadius: `0 ${roundRight ? 24 : 0}px ${roundRight ? 24 : 0}px 0` } : {}),
                ...(end && !start && hasRange ? { background: `linear-gradient(to left, transparent 50%, #D4DAAD 50%)`, borderRadius: `${roundLeft ? 24 : 0}px 0 0 ${roundLeft ? 24 : 0}px` } : {}),
                ...(start && end ? { background: 'transparent', borderRadius: '50%' } : {}),
              }}>
                <button disabled={past} onClick={() => !past && onSelect(new Date(year, month, d))}
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontFamily: "Georgia, 'Times New Roman', serif",
                    fontWeight: start || end ? 700 : 400,
                    background: start || end ? '#304333' : 'transparent',
                    color: start || end ? '#EAF98E' : past ? '#c8c0b4' : '#304333',
                    cursor: past ? 'not-allowed' : 'pointer', border: 'none',
                    WebkitTapHighlightColor: 'transparent', position: 'relative', zIndex: 1,
                  }}>
                  {past && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <span style={{ position: 'absolute', width: '130%', height: '1px', background: '#c8c0b4', transform: 'rotate(-45deg)', transformOrigin: 'center' }} />
                    </span>
                  )}
                  {d}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={{ borderRadius: 16, padding: '24px', background: '#FEFDFC' }}>
      <div style={{ display: 'flex', gap: 32 }}>
        {renderMonth(startYear, startMonth, true)}
        {/* Thin vertical divider */}
        <div style={{ width: 1, background: '#e8e0d0', flexShrink: 0 }} />
        {renderMonth(secondYear, secondMonth, false)}
      </div>
    </div>
  )
}

const Divider = () => <div className="border-t border-[#e8e0d0] my-6" />
const MOB_PAD = { paddingLeft: 16, paddingRight: 16 } as const

type Props = { params: Promise<{ id: string }> }

export default function StayDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { isWishlisted, addToWishlist, removeFromWishlist, isLoggedIn } = useAuth()

  const base = stays.find(s => s.id === id)
  const detail = DETAILS[id] ?? { ...DEFAULT, images: base ? [base.image] : [] }

  const [activeImg, setActiveImg] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [showDescModal, setShowDescModal] = useState(false)
  const [showAllAmen, setShowAllAmen] = useState(false)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [nights, setNights] = useState(2)
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [desktopNavVisible, setDesktopNavVisible] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const photoGridRef = useRef<HTMLDivElement>(null)

  const wishlisted = isWishlisted(id)
  const images = detail.images.length > 0 ? detail.images : ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80']
  const title = base?.title ?? 'Cosy stay in Kenya'
  const location = base?.location ?? 'Kenya'
  const price = base?.price ?? 'Ksh 8,500'
  const rating = base?.rating ?? 4.8
  const reviewCount = detail.reviews.length || 89
  const priceNum = parseInt(price.replace(/[^0-9]/g, '')) || 8500
  const calNights = (checkIn && checkOut) ? Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000)) : nights
  const total = priceNum * calNights
  const fee = Math.round(total * 0.12)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const photoGrid = photoGridRef.current
      if (photoGrid) {
        const rect = photoGrid.getBoundingClientRect()
        setDesktopNavVisible(rect.bottom < 0)
      }
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (showDescModal) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [showDescModal])

  function fmtDate(d: Date | null) {
    if (!d) return null
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }
  function fmtDateFull(d: Date | null) {
    if (!d) return null
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  function handleCalSelect(date: Date) {
    if (!checkIn || (checkIn && checkOut)) { setCheckIn(date); setCheckOut(null) }
    else if (date <= checkIn) { setCheckIn(date); setCheckOut(null) }
    else setCheckOut(date)
  }
  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isLoggedIn) { router.push('/login'); return }
    const listing = { id, location, title, price, rating, image: images[0], badge: base?.badge }
    if (wishlisted) removeFromWishlist(id); else addToWishlist(listing)
  }

  if (showGallery) {
    return (
      <div className="fixed inset-0 bg-black z-[200] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-12 pb-3 flex-shrink-0">
          <button onClick={() => setShowGallery(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            <X size={18} color="white" />
          </button>
          <span className="text-sm font-semibold text-white">{activeImg + 1} / {images.length}</span>
          <div className="w-9" />
        </div>
        <div className="flex-1 relative">
          <Image src={images[activeImg]} alt={title} fill sizes="100vw" className="object-contain" />
        </div>
        <div className="flex gap-2 justify-center py-4 px-4 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {images.map((img: string, i: number) => (
            <button key={i} onClick={() => setActiveImg(i)}
              className="relative flex-shrink-0 rounded-lg overflow-hidden"
              style={{ width: 56, height: 56, border: `2px solid ${i === activeImg ? 'white' : 'transparent'}`, opacity: i === activeImg ? 1 : 0.5, padding: 0, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              <Image src={img} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col"
      style={{ background: '#FEFDFC', fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* ── DESCRIPTION MODAL (mobile full-screen) ── */}
      {showDescModal && (
        <div className="sm:hidden fixed inset-0 z-[300] flex flex-col" style={{ background: '#FEFDFC' }}>
          <div className="flex font-bold flex-col px-4 flex-shrink-0"
            style={{ paddingTop: '16px', paddingBottom: 16 }}>
            <button onClick={() => setShowDescModal(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center mb-5"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              <X size={25} color="#304333" />
            </button>
            <h2 style={{ fontSize: 25, fontWeight: 800, color: '#304333' }}>About this space</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6" style={{ WebkitOverflowScrolling: 'touch' }}>
            <p className="text-base text-[#304333] leading-relaxed whitespace-pre-line">{detail.description}</p>
          </div>
        </div>
      )}

      {/* ── DESKTOP STICKY NAV ── */}
      <div className="hidden sm:block"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: '#FEFDFC',
          borderBottom: desktopNavVisible ? '1px solid #e8e0d0' : '1px solid transparent',
          transform: desktopNavVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.25s ease, border-color 0.25s ease',
        }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-20 flex items-center justify-between" style={{ height: 64 }}>
          <div className="flex items-center gap-6">
            {['Photos', 'Amenities', 'Reviews', 'Location'].map(section => (
              <button key={section}
                className="text-sm font-semibold text-[#304333] pb-1 transition-colors"
                style={{ background: 'none', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                {section}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold text-[#304333]">{price}</span>
                <span className="text-sm text-[#78716c]">/ night</span>
              </div>
              <div className="flex items-center gap-1 justify-end">
                <Star size={12} fill="#F5D06E" color="#304333" />
                <span className="text-xs font-semibold text-[#304333]">{rating}</span>
                <span className="text-xs text-[#78716c]">· {reviewCount} reviews</span>
              </div>
            </div>
            <button onClick={() => router.push(`/listings/stays/${id}/book`)}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              Reserve
            </button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden "
        style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 100, background: '#FEFDFC' }}>

        {/* ══ MOBILE photo carousel — completely unchanged ══ */}
        <div className="sm:hidden relative" style={{ aspectRatio: '4/3', width: '100%' }}>
          <Image src={images[activeImg]} alt={title} fill sizes="100vw"
            className="object-cover" onClick={() => setShowGallery(true)} />
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4"
            style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))', paddingBottom: 12 }}>
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
              <ArrowLeft size={18} color="#304333" />
            </button>
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                <Share2 size={16} strokeWidth={1.5} color="#304333" />
              </button>
              <button onClick={handleWishlist}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                <Heart size={16} strokeWidth={1.5} color={wishlisted ? '#e8612a' : '#304333'} fill={wishlisted ? '#e8612a' : 'none'} />
              </button>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/60 text-white text-xs font-semibold px-2.5 py-1.5 rounded-full">
            <Camera size={12} />{activeImg + 1} / {images.length}
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_: string, i: number) => (
              <button key={i} onClick={() => setActiveImg(i)} className="rounded-full transition-all"
                style={{ width: activeImg === i ? 16 : 6, height: 6, background: 'white', opacity: activeImg === i ? 1 : 0.6, border: 'none', padding: 0, cursor: 'pointer' }} />
            ))}
          </div>
          <button className="absolute left-0 top-0 w-1/3 h-full"
            onClick={() => setActiveImg(i => Math.max(0, i - 1))}
            style={{ background: 'transparent', border: 'none', WebkitTapHighlightColor: 'transparent' }} />
          <button className="absolute right-0 top-0 w-1/3 h-full"
            onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
            style={{ background: 'transparent', border: 'none', WebkitTapHighlightColor: 'transparent' }} />
        </div>

        {/* ══ DESKTOP photo section — unchanged ══ */}
        <div className="hidden sm:block" ref={photoGridRef}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 xl:px-20">
            <div className="flex items-center justify-between pt-4 pb-3">
              <button onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#304333] hover:underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                <ArrowLeft size={16} strokeWidth={2} color="#304333" /> Back
              </button>
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', textDecoration: 'underline' }}>
                  <Share2 size={15} strokeWidth={1.5} /> Share
                </button>
                <button onClick={handleWishlist}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', textDecoration: 'underline' }}>
                  <Heart size={15} strokeWidth={1.5} color={wishlisted ? '#e8612a' : '#304333'} fill={wishlisted ? '#e8612a' : 'none'} /> Save
                </button>
              </div>
            </div>

            {/* Desktop (lg+): 1 large left + 2×2 right */}
            <div className="hidden md:block relative rounded-2xl overflow-hidden" style={{ height: 480 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, height: '100%' }}>
                <div className="relative overflow-hidden group cursor-pointer"
                  onClick={() => { setActiveImg(0); setShowGallery(true) }}>
                  <Image src={images[0]} alt={title} fill sizes="(min-width: 1280px) 560px, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" priority />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3 }}>
                  {[1, 2, 3, 4].map((imgIdx) => (
                    <div key={imgIdx} className="relative overflow-hidden group cursor-pointer"
                      onClick={() => { setActiveImg(imgIdx); setShowGallery(true) }}>
                      <Image src={images[imgIdx] ?? images[0]} alt="" fill
                        sizes="(min-width: 1280px) 280px, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setShowGallery(true)}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors z-10"
                style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: '1px solid #d4cfc8', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }}>
                <Grid2X2 size={14} /> Show all photos
              </button>
            </div>

            {/* Tablet (sm–lg) */}
            <div className="md:hidden relative rounded-2xl overflow-hidden" style={{ height: 320 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 3, height: '100%' }}>
                {images.slice(0, 3).map((img: string, i: number) => (
                  <div key={i} className="relative overflow-hidden group cursor-pointer"
                    onClick={() => { setActiveImg(i); setShowGallery(true) }}>
                    <Image src={img} alt="" fill sizes="33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105" priority={i === 0} />
                  </div>
                ))}
              </div>
              <button onClick={() => setShowGallery(true)}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white rounded-xl px-3 py-2 text-xs font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors z-10"
                style={{ cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: '1px solid #d4cfc8' }}>
                <Grid2X2 size={13} /> Show all
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            PAGE LAYOUT — 2-col desktop, single col mobile
        ══════════════════════════════════════════════════════ */}
        <div className="sm:px-6 lg:px-8 xl:px-20 max-w-7xl mx-auto">
          <div className="md:grid md:gap-12" style={{ gridTemplateColumns: '1fr 380px' }}>

            {/* ══ LEFT COLUMN ══ */}
            <div>

              {/* ── Title + meta ── */}
              <div className="pt-5 pb-1 sm:pt-6 sm:px-0" style={{ ...MOB_PAD }}>
                {/* Mobile: centered; Desktop: left-aligned */}
                <h1 className="text-2xl sm:text-[28px] font-semibold text-[#304333] leading-tight mb-1 text-center sm:text-left">{title}</h1>
                {/* Desktop: type · location on one line */}
                <p className="hidden sm:block text-base text-[#304333] mb-1">{detail.type} · {location}</p>
                {/* Desktop: guests · bedrooms · beds · baths */}
                <p className="hidden sm:block text-sm text-[#304333] mb-2">
                  {detail.guests} guests · {detail.bedrooms} bedroom{detail.bedrooms !== 1 ? 's' : ''} · {detail.beds} bed{detail.beds !== 1 ? 's' : ''} · {detail.baths} bath{detail.baths !== 1 ? 's' : ''}
                </p>
                {/* Mobile: all on one line */}
                <p className="sm:hidden text-base text-[#78716c] mb-2 text-center">{detail.type} · {location}</p>
                <p className="sm:hidden text-sm text-[#78716c] mb-2 text-center">
                  {detail.guests} guests · {detail.bedrooms} bedroom{detail.bedrooms !== 1 ? 's' : ''} · {detail.beds} bed{detail.beds !== 1 ? 's' : ''} · {detail.baths} bath{detail.baths !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Star size={14} fill="#F5D06E" color="#304333" />
                  <span className="text-sm font-semibold text-[#304333]">{rating}</span>
                  <button className="text-sm text-[#304333] font-semibold underline" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {reviewCount} reviews
                  </button>
                  {detail.isSuperhost && (
                    <>
                      <span className="text-[#a8a29e]">·</span>
                      <span className="text-sm font-semibold text-[#304333]">Superhost</span>
                    </>
                  )}
                </div>
              </div>

              <Divider />

              {/* ── Host row ── */}
              <div className="flex items-center gap-4 pb-1 sm:px-0" style={{ ...MOB_PAD }}>
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-lg font-semibold">
                    {detail.hostName[0]}
                  </div>
                  {detail.isSuperhost && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <Award size={10} color="white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-base font-semibold text-[#304333]">Hosted by {detail.hostName}</p>
                  <p className="text-sm text-[#78716c]">{detail.yearsHosting} year{detail.yearsHosting !== 1 ? 's' : ''} hosting</p>
                </div>
              </div>

              <Divider />

              {/* ── Highlights ── */}
              <div className="flex flex-col gap-5 pb-1 sm:px-0" style={{ ...MOB_PAD }}>
                {detail.highlights.map(({ icon, title: ht, desc }: any) => (
                  <div key={ht} className="flex items-start gap-4">
                    <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-[#304333]">{ht}</p>
                      <p className="text-sm text-[#78716c] mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Divider />

              {/* ── Description ── */}
              <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
                {/* Desktop: inline expand with Show more button styled */}
                <div className="hidden sm:block">
                  <p className="text-base text-[#304333] leading-relaxed whitespace-pre-line"
                    style={!showFullDesc ? { display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' } : {}}>
                    {detail.description}
                  </p>
                  <button onClick={() => setShowFullDesc(s => !s)}
                    className="mt-4 px-8 py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df]"
                    style={{ background: '#F1F5E4', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: 'none', color: '#304333', fontFamily: 'inherit' }}>
                    {showFullDesc ? 'Show less' : 'Show more'}
                  </button>


                </div>
                {/* Mobile: clamped + full-screen modal */}
                <div className="sm:hidden">
                  <p className="text-base text-[#304333] leading-relaxed whitespace-pre-line"
                    style={{ display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                    {detail.description}
                  </p>
                  <button onClick={() => setShowDescModal(true)}
                    className="mt-4 w-full py-3 rounded-xl text-sm font-semibold text-center transition-colors hover:bg-[#ede8df]"
                    style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', color: '#304333' }}>
                    Show more
                  </button>
                </div>
              </div>

              <Divider />

              {/* ── Amenities ──
                  Desktop: 2-column grid (like Airbnb)
                  Mobile: single column (unchanged)              */}
              <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
                <h2 className="text-xl font-semibold text-[#304333] mb-5">What this place offers</h2>

                {/* Desktop 2-col grid */}
                <div className="hidden sm:grid grid-cols-2 gap-x-8 gap-y-4">
                  {(showAllAmen ? detail.amenities : detail.amenities.slice(0, 8)).map((label: string) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-[#304333] flex-shrink-0">{getIcon(label)}</span>
                      <span className="text-sm text-[#304333]">{label}</span>
                    </div>
                  ))}
                </div>
                {/* Mobile single col */}
                <div className="sm:hidden flex flex-col gap-4">
                  {(showAllAmen ? detail.amenities : detail.amenities.slice(0, 6)).map((label: string) => (
                    <div key={label} className="flex items-center gap-4">
                      <span className="text-[#304333]">{getIcon(label)}</span>
                      <span className="text-base text-[#304333]">{label}</span>
                    </div>
                  ))}
                </div>

                {detail.amenities.length > 6 && (
                  <button onClick={() => setShowAllAmen(s => !s)}
                    className="mt-6 px-8 py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df]"
                    style={{ background: '#F1F5E4', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: 'none', color: '#304333', fontFamily: 'inherit' }}>
                    {showAllAmen ? 'Show less' : `Show all ${detail.amenities.length} amenities`}
                  </button>



                )}
              </div>

              {/* Divider /> */}
            </div>

            {/* ══ DESKTOP BOOKING SIDEBAR ══
                Airbnb style: shows total for X nights when dates selected,
                otherwise per-night price. No nights stepper on desktop.   */}
            <div className="hidden md:block">
              <div className="sticky top-24 mt-6">
                <div className="rounded-2xl shadow-xl p-6 bg-white" style={{ border: '1px solid #e8e0d0' }}>

                  {/* Price header — total for nights when dates set, else per night */}
                  {checkIn && checkOut ? (
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-[#304333] underline cursor-pointer">
                          Ksh {(total + fee).toLocaleString()}
                        </span>
                        <span className="text-base text-[#304333]">for {calNights} night{calNights !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} fill="#F5D06E" color="#304333" />
                        <span className="text-xs font-semibold text-[#304333]">{rating}</span>
                        <span className="text-xs text-[#78716c]">· {reviewCount} reviews</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-2xl font-semibold text-[#304333]">{price}</span>
                      <span className="text-base text-[#78716c]">/ night</span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Star size={13} fill="#F5D06E" color="#304333" />
                        <span className="text-sm font-semibold text-[#304333]">{rating}</span>
                        <span className="text-sm text-[#78716c]">({reviewCount})</span>
                      </div>
                    </div>
                  )}

                  {/* Date + guests picker */}
                  <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #b0a898' }}>
                    <div className="grid grid-cols-2" style={{ borderBottom: '1px solid #b0a898' }}>
                      <div className="p-3 cursor-pointer hover:bg-[#f9f5ef] transition-colors"
                        style={{ borderRight: '1px solid #b0a898' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Check-in</p>
                        <p className="text-sm font-semibold" style={{ color: checkIn ? '#304333' : '#78716c' }}>
                          {checkIn ? checkIn.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'Add date'}
                        </p>
                      </div>
                      <div className="p-3 cursor-pointer hover:bg-[#f9f5ef] transition-colors">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Checkout</p>
                        <p className="text-sm font-semibold" style={{ color: checkOut ? '#304333' : '#78716c' }}>
                          {checkOut ? checkOut.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : 'Add date'}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#f9f5ef] transition-colors">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Guests</p>
                        <p className="text-sm font-semibold text-[#304333]">1 guest</p>
                      </div>
                      <ChevronRight size={16} color="#78716c" style={{ transform: 'rotate(90deg)' }} />
                    </div>
                  </div>

                  {/* Reserve button */}
                  <button onClick={() => router.push(`/listings/stays/${id}/book`)}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm text-white mb-3 transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                    Reserve
                  </button>
                  <p className="text-xs text-center text-[#78716c] mb-4">You won't be charged yet</p>

                  {/* Price breakdown — only when dates are selected */}
                  {checkIn && checkOut && (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#304333] underline cursor-pointer">{price} × {calNights} night{calNights !== 1 ? 's' : ''}</span>
                        <span className="text-[#304333]">Ksh {total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#304333] underline cursor-pointer">Erranza service fee</span>
                        <span className="text-[#304333]">Ksh {fee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                        <span className="text-sm font-semibold text-[#304333]">Total before taxes</span>
                        <span className="text-sm font-semibold text-[#304333]">Ksh {(total + fee).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  {/* No dates: show static placeholder breakdown */}
                  {!checkIn && (
                    <div className="flex flex-col gap-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#78716c] underline cursor-pointer">{price} × {nights} nights</span>
                        <span className="text-[#304333]">Ksh {(priceNum * nights).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#78716c] underline cursor-pointer">Erranza service fee</span>
                        <span className="text-[#304333]">Ksh {Math.round(priceNum * nights * 0.12).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                        <span className="text-sm font-semibold text-[#304333]">Total before taxes</span>
                        <span className="text-sm font-semibold text-[#304333]">
                          Ksh {(priceNum * nights + Math.round(priceNum * nights * 0.12)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        <div className="sm:px-6 md:px-8 xl:px-20 max-w-7xl mx-auto">


          {/* Zone 2 */}
          {/* ── Calendar ──
                  Desktop: 2-month side-by-side 
                  Mobile: single month (unchanged)               */}
          <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-1">
              {checkIn && checkOut
                ? `${calNights} night${calNights !== 1 ? 's' : ''} in ${location.split(',')[0]}`
                : 'Select dates'}
            </h2>
            {checkIn && checkOut && (
              <p className="text-sm text-[#78716c] mb-3">
                {fmtDateFull(checkIn)} – {fmtDateFull(checkOut)}
              </p>
            )}
            {!checkIn && (
              <p className="text-sm text-[#78716c] mb-4">Add your travel dates for exact pricing</p>
            )}

            {/* Desktop: 2-month calendar */}
            <div className="hidden sm:block mt-4">
              <DesktopCalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleCalSelect} />
            </div>
            {/* Mobile: single month */}
            <div className="sm:hidden mt-4">
              <MiniCalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleCalSelect} />
            </div>

            {(checkIn || checkOut) && (
              <button onClick={() => { setCheckIn(null); setCheckOut(null) }}
                className="mt-3 text-sm font-semibold text-[#304333] underline"
                style={{ background: 'none', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', padding: 0 }}>
                Clear dates
              </button>
            )}
          </div>

          <Divider />

          {/* ── Map ── */}
          <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-1">Where you'll be</h2>
            <p className="text-sm text-[#78716c] mb-4 flex items-center gap-1">
              <MapPin size={13} /> {location}
            </p>
            <MapComponent lat={detail.lat} lng={detail.lng} label={title} />
            <p className="text-sm text-[#78716c] mt-3">{location} · Exact address provided after booking</p>
          </div>

          <Divider />


          {/* ── Reviews ──
                  Desktop: 2-column grid
                  Mobile: horizontal scroll (unchanged)          */}
          {detail.reviews.length > 0 && (
            <div className="pb-1">
              <div className="flex items-center gap-2 mb-5 sm:px-0" style={{ ...MOB_PAD }}>
                <Star size={18} fill="#F5D06E" color="#304333" />
                <span className="text-xl font-semibold text-[#304333]">{rating}</span>
                <span className="text-[#a8a29e]">·</span>
                <span className="text-xl font-semibold text-[#304333]">{reviewCount} reviews</span>
              </div>

              {/* Desktop: 2-col grid */}
              <div className="hidden sm:grid grid-cols-2 gap-6">
                {detail.reviews.map((rev: any, i: number) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {rev.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#304333]">{rev.name}</p>
                        <p className="text-xs text-[#78716c]">{rev.years}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: rev.rating }).map((_: unknown, j: number) => (
                          <Star key={j} size={11} fill="#304333" color="#304333" />
                        ))}
                      </div>
                      <span className="text-xs text-[#78716c]">· {rev.date}</span>
                    </div>
                    <p className="text-sm text-[#304333] leading-relaxed"
                      style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rev.text}
                    </p>
                    <button className="text-sm font-semibold text-[#304333] underline text-left"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Show more
                    </button>
                  </div>
                ))}
              </div>

              {/* Mobile: horizontal scroll */}
              <div className="sm:hidden overflow-x-auto -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
                <div className="flex gap-4" style={{ width: 'max-content' }}>
                  {detail.reviews.map((rev: any, i: number) => (
                    <div key={i} className="flex-shrink-0 p-4 rounded-2xl bg-white"
                      style={{ width: 300, border: '1px solid #e8e0d0' }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {rev.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#304333]">{rev.name}</p>
                          <p className="text-xs text-[#78716c]">{rev.years}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: rev.rating }).map((_: unknown, j: number) => (
                            <Star key={j} size={12} fill="#F5D06E" color="#304333" />
                          ))}
                        </div>
                        <span className="text-xs text-[#78716c]">· {rev.date}</span>
                      </div>
                      <p className="text-sm text-[#304333] leading-relaxed"
                        style={{ display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {rev.text}
                      </p>
                      <button className="text-xs font-semibold mt-2 underline text-[#304333]"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Show more</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <Divider />

          {/* ── Meet your host ──
                  Desktop: host card (left) + co-hosts/details (right)
                  Mobile: stacked (unchanged)                                                      */}
          <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-5">Meet your host</h2>

            {/* Desktop layout: 2-col */}
            <div className="hidden sm:flex gap-8 items-start">
              {/* Left: host card */}
              <div className="rounded-2xl p-6 flex-shrink-0" style={{ width: 260, border: '1px solid #e8e0d0', background: 'white' }}>
                <div className="flex flex-col items-center mb-4">
                  <div className="relative mb-2">
                    <div className="w-16 h-16 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-2xl font-bold">
                      {detail.hostName[0]}
                    </div>
                    {detail.isSuperhost && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                        <Award size={12} color="white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xl font-bold text-[#304333]">{detail.hostName}</p>
                  <p className="text-sm text-[#78716c]">Host</p>
                </div>
                {/* Stats row */}
                <div style={{ borderTop: '1px solid #e8e0d0', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#304333]">{reviewCount}</p>
                    <p style={{ fontSize: 11, color: '#78716c' }}>Reviews</p>
                  </div>
                  <div className="text-center" style={{ borderLeft: '1px solid #e8e0d0', borderRight: '1px solid #e8e0d0' }}>
                    <p className="text-xl font-bold text-[#304333]">{rating}<span style={{ fontSize: 14 }}>★</span></p>
                    <p style={{ fontSize: 11, color: '#78716c' }}>Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-[#304333]">{detail.yearsHosting * 12}</p>
                    <p style={{ fontSize: 11, color: '#78716c' }}>Months</p>
                  </div>
                </div>
              </div>

              {/* Right: details */}
              <div className="flex-1">
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <Globe size={18} strokeWidth={1.5} color="#304333" />
                    <span className="text-sm text-[#304333]">Speaks {detail.hostSpeaks}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Heart size={18} strokeWidth={1.5} color="#304333" />
                    <span className="text-sm text-[#304333]">I'm obsessed with: {detail.hostObsessed}</span>
                  </div>
                </div>

                {detail.cohostName && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[#304333] mb-2">Co-hosts</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#3d6b28] flex items-center justify-center text-white text-xs font-semibold">
                        {detail.cohostName[0]}
                      </div>
                      <span className="text-sm text-[#304333]">{detail.cohostName}</span>
                    </div>
                  </div>
                )}

                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-[#304333] mb-1">Host details</h3>
                  <p className="text-sm text-[#78716c]">Response rate: {detail.responseRate}%</p>
                  <p className="text-sm text-[#78716c]">Responds {detail.responseTime}</p>
                </div>

                <button onClick={() => router.push('/messages')}
                  className="py-3 px-6 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#f5f0e6]"
                  style={{ background: 'transparent', border: '1px solid #304333', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                  Message host
                </button>

                <div className="flex items-start gap-2 mt-4">
                  <Shield size={14} color="#a8a29e" className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-[#78716c]">To protect your payment, always communicate and pay through Erranza.</p>
                </div>
              </div>
            </div>

            {/* Mobile layout: stacked (unchanged) */}
            <div className="sm:hidden">
              <div className="bg-white rounded-2xl p-5 mb-5 shadow-sm" style={{ border: '1px solid #e8e0d0' }}>
                <div className="flex items-start gap-4">
                  <div className="text-center flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-2xl font-semibold mb-2">
                      {detail.hostName[0]}
                    </div>
                    <p className="text-lg font-bold text-[#304333] leading-tight">{detail.hostName}</p>
                    <p className="text-sm text-[#78716c]">Host</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-3">
                      <div className="pb-3" style={{ borderBottom: '1px solid #e8e0d0' }}>
                        <p className="text-xl font-bold text-[#304333]">{reviewCount}</p>
                        <p className="text-sm text-[#78716c]">Reviews</p>
                      </div>
                      <div className="pb-3" style={{ borderBottom: '1px solid #e8e0d0' }}>
                        <p className="text-xl font-bold text-[#304333]">{rating} <span className="text-base">★</span></p>
                        <p className="text-sm text-[#78716c]">Rating</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-[#304333]">{detail.yearsHosting * 12}</p>
                        <p className="text-sm text-[#78716c]">Months hosting</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-4 mb-5">
                <div className="flex items-center gap-3">
                  <Globe size={20} strokeWidth={1.5} color="#304333" className="flex-shrink-0" />
                  <span className="text-sm text-[#304333]">Speaks {detail.hostSpeaks}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart size={20} strokeWidth={1.5} color="#304333" className="flex-shrink-0" />
                  <span className="text-sm text-[#304333]">I'm obsessed with: {detail.hostObsessed}</span>
                </div>
              </div>
              {detail.cohostName && (
                <div className="mb-5">
                  <h3 className="text-base font-semibold text-[#304333] mb-3">Co-hosts</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3d6b28] flex items-center justify-center text-white text-sm font-semibold">
                      {detail.cohostName[0]}
                    </div>
                    <span className="text-base text-[#304333]">{detail.cohostName}</span>
                  </div>
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-base font-semibold text-[#304333] mb-3">Host details</h3>
                <p className="text-sm text-[#78716c]">Response rate: {detail.responseRate}%</p>
                <p className="text-sm text-[#78716c]">Responds {detail.responseTime}</p>
              </div>
              <button onClick={() => router.push('/messages')}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-center transition-colors hover:bg-[#ede8df]"
                style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', color: '#304333' }}>
                Message host
              </button>
              <div className="flex items-start gap-2 mt-4">
                <Shield size={14} color="#a8a29e" className="flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#78716c]">To protect your payment, always communicate and pay through Erranza.</p>
              </div>
            </div>
          </div>

          <Divider />

          {/* ── Things to know ──
                  Desktop: 3-column with icon above title (Airbnb style)
                  Mobile: stacked rows with icon + chevron (unchanged)    */}
          <div className="pb-1 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-6">Things to know</h2>

            {/* Desktop 3-col */}
            <div className="hidden sm:grid grid-cols-3 gap-8">
              {[
                { icon: <CalendarX2 size={32} strokeWidth={1.5} />, title: 'Cancellation policy', items: ['Cancel before check-in for a partial refund.', 'After that, this reservation is non-refundable.', "Review this host's full policy for details."] },
                { icon: <Key size={32} strokeWidth={1.5} />, title: 'House rules', items: ['Check-in after 2:00 PM', 'Checkout before 11:00 AM', `${detail.guests} guests maximum`] },
                { icon: <ShieldHalf size={32} strokeWidth={1.5} />, title: 'Safety & property', items: ['Smoke alarm not reported', 'Exterior security cameras on property', 'Carbon monoxide alarm'] },
              ].map(({ icon, title: st, items }) => (
                <div key={st}>
                  <div className="mb-4 text-[#222]">{icon}</div>
                  <p className="text-base font-semibold text-[#222] mb-3">{st}</p>
                  {items.map(item => <p key={item} className="text-sm text-[#78716c] mb-0.5">{item}</p>)}
                  <button className="text-sm font-semibold text-[#222] underline mt-3"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Learn more</button>
                </div>
              ))}
            </div>


            {/* Mobile stacked rows */}
            <div className="sm:hidden">
              {[
                { icon: <Calendar size={22} strokeWidth={1.5} />, title: 'Cancellation policy', items: ['Cancel before check-in for a partial refund.', 'After that, this reservation is non-refundable.', "Review this host's full policy for details."] },
                { icon: <Home size={22} strokeWidth={1.5} />, title: 'House rules', items: ['Check-in after 2:00 PM', 'Checkout before 11:00 AM', `${detail.guests} guests maximum`] },
                { icon: <Shield size={22} strokeWidth={1.5} />, title: 'Safety & property', items: ['Smoke alarm not reported', 'Exterior security cameras on property', 'Carbon monoxide alarm'] },
              ].map(({ icon, title: st, items }) => (
                <div key={st} className="flex items-start gap-4 py-4" style={{ borderBottom: '1px solid #e8e0d0' }}>
                  <span className="text-[#304333] flex-shrink-0 mt-0.5">{icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#304333] mb-1">{st}</p>
                    {items.map(item => <p key={item} className="text-sm text-[#78716c]">{item}</p>)}
                  </div>
                  <ChevronRight size={18} color="#a8a29e" className="flex-shrink-0 mt-0.5" />
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* ── Explore nearby ── */}
          <div className="pb-4 sm:px-0" style={{ ...MOB_PAD }}>
            <h2 className="text-xl font-semibold text-[#304333] mb-4">
              Explore other options in and around {location.split(',')[0]}
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {['Nairobi', 'Diani Beach', 'Mombasa', 'Zanzibar', 'Malindi', 'Watamu', 'Karen', 'Westlands'].map(place => (
                <button key={place} className="text-left"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' }}>
                  <p className="text-sm font-semibold text-[#304333]">{place}</p>
                  <p className="text-xs text-[#78716c]">Vacation rentals</p>
                </button>
              ))}

            </div>
          </div>

        </div>
      </div>



      {/* ══ MOBILE STICKY BOTTOM BAR — completely unchanged ══ */}
      <div className="md:hidden flex-shrink-0 bg-white flex items-center justify-between px-5"
        style={{ borderTop: '1px solid #e8e0d0', paddingTop: 14, paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))', zIndex: 50 }}>
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-semibold text-[#304333]">{price}</span>
            <span className="text-sm text-[#78716c]">/ night</span>
          </div>
          {checkIn && checkOut ? (
            <p className="text-xs font-semibold" style={{ color: '#2c4a1e' }}>
              {fmtDate(checkIn)} – {fmtDate(checkOut)} · Ksh {total.toLocaleString()}
            </p>
          ) : (
            <button className="text-sm text-[#304333] underline font-semibold"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {reviewCount} reviews
            </button>
          )}
        </div>
        <button onClick={() => router.push(`/listings/stays/${id}/book`)}
          className="px-7 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
          Reserve
        </button>
      </div>

    </div>
  )
}