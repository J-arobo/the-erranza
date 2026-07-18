'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, Settings, HelpCircle, User, Shield,
  ChevronRight, LogOut, Gift, FileText, Users,
  ArrowLeft, Sun, Mountain, Camera, Landmark,
  MessageSquare, Compass, Waves, Binoculars,
  Briefcase, PawPrint, Lightbulb, GraduationCap,
  Globe, Heart, ShieldCheck, Menu, X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import FooterSection from '@/components/FooterSection'
import BottomNav from '@/components/BottomNav'


const WHERE_IVE_BEEN = [
  { name: 'Nairobi', country: 'Kenya', date: 'March 2026', Icon: Sun, color: '#e8612a' },
  { name: 'Maasai Mara', country: 'Kenya', date: 'January 2026', Icon: Mountain, color: '#2c4a1e' },
  { name: 'Diani Beach', country: 'Kenya', date: 'November 2025', Icon: Waves, color: '#304333' },
]

const MY_REVIEWS = [
  { name: 'Wanjiru', location: 'Nairobi, Kenya', date: 'March 2026', text: 'Great guest — communicated clearly and left everything tidy. Would host again.' },
  { name: 'Otieno', location: 'Mombasa, Kenya', date: 'January 2026', text: 'Easy booking, respectful of house rules, arrived and left on time.' },
  { name: 'Achieng', location: 'Naivasha, Kenya', date: 'November 2025', text: 'Lovely to host — friendly and low-maintenance. Highly recommend.' },
]

const MY_INTERESTS = [
  { label: 'Wildlife safaris', Icon: Binoculars },
  { label: 'Beaches', Icon: Waves },
  { label: 'Photography', Icon: Camera },
  { label: 'Culture & heritage', Icon: Landmark },
  { label: 'Adventure', Icon: Compass },
]

const BIO_BULLETS = [
  { Icon: Briefcase, label: 'My work: Travel enthusiast' },
  { Icon: Compass, label: 'Dream destination: Zanzibar' },
  { Icon: PawPrint, label: 'Pets: No' },
  { Icon: Lightbulb, label: 'Fun fact: Always chasing sunsets' },
  { Icon: GraduationCap, label: 'Where I studied: University of Nairobi' },
  { Icon: Globe, label: 'Speaks: English and Swahili' },
  { Icon: Heart, label: 'Obsessed with: Wildlife photography' },
]

export default function ProfilePage() {
  const { isLoggedIn, user, logout, trips } = useAuth()
  const router = useRouter()
  const [showReviewsModal, setShowReviewsModal] = useState(false)

  const STATS = [
    { value: trips.length, label: 'Trips' },
    { value: MY_REVIEWS.length, label: 'Reviews' },
    { value: '1', label: 'Yr on Erranza' },
  ]

  // ── Square profile card — same pattern as "Meet your host"/"Meet your tour operator" ──
  const ProfileCard = () => (
    <>
      <div className="sm:hidden bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', maxWidth: 380 }}>
        <div className="flex items-center">
          <div className="w-1/2 flex flex-col items-center">
            <div className="relative mb-1.5">
              <div className="w-20 h-20 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-2xl font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'E'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                <Shield size={10} color="white" />
              </div>
            </div>
            <p className="text-base font-bold text-[#1a1a1a] text-center">{user?.name}</p>
            <p className="text-xs text-gray-400 text-center">Nairobi, Kenya</p>
          </div>
          <div className="w-1/2 pl-3">
            {STATS.map(({ value, label }, i, arr) => (
              <div key={label} className="py-2" style={{ borderBottom: i < arr.length - 1 ? '1px solid #e8e0d0' : 'none' }}>
                <p className="text-base font-bold text-[#1a1a1a]">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden sm:block bg-white rounded-2xl p-5 mb-5" style={{ border: '1px solid #e8e0d0', width: 450 }}>
        <div className="flex items-center">
          <div className="w-1/2 flex flex-col items-center">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-4xl font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'E'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                <Shield size={12} color="white" />
              </div>
            </div>
            <p className="text-xl font-bold text-[#1a1a1a] text-center">{user?.name}</p>
            <p className="text-sm text-gray-400 text-center">Nairobi, Kenya</p>
          </div>
          <div className="w-1/2 pl-4">
            {STATS.map(({ value, label }, i, arr) => (
              <div key={label} className="py-2.5" style={{ borderBottom: i < arr.length - 1 ? '1px solid #e8e0d0' : 'none' }}>
                <p className="text-xl font-bold text-[#1a1a1a]">{value}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )

  const BioBullets = () => (
    <div className="hidden md:flex flex-col gap-4 mb-6">
      {BIO_BULLETS.map(({ Icon, label }) => (
        <div key={label} className="flex items-center gap-3">
          <Icon size={20} color="#1a1a1a" strokeWidth={1.5} />
          <span className="text-sm text-[#1a1a1a]">{label}</span>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <ShieldCheck size={20} color="#1a1a1a" strokeWidth={1.5} />
        <span className="text-sm text-[#1a1a1a] underline font-semibold">Identity verified</span>
      </div>
    </div>
  )

  const ExtraSections = () => (
    <div className="hidden md:block">
      <div className="h-px bg-gray-100 my-6" />

      <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Where I've been</h2>
      <div className="flex gap-8 mb-8">
        {WHERE_IVE_BEEN.map(({ name, country, date, Icon, color }) => (
          <div key={name} className="text-center">
            <div className="w-20 h-20 rounded-full border-2 flex items-center justify-center mb-2 mx-auto"
              style={{ borderColor: color }}>
              <Icon size={28} color={color} strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-[#1a1a1a]">{name}, {country}</p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-100 my-6" />

      <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">My reviews</h2>
      <div className="grid grid-cols-3 gap-6 mb-4">
        {MY_REVIEWS.map((review) => (
          <div key={review.name}>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-9 h-9 rounded-full bg-[#2c4a1e] flex items-center justify-center
                              text-white text-sm font-bold flex-shrink-0">
                {review.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">{review.name}</p>
                <p className="text-xs text-gray-400">{review.location}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-1.5">{review.date}</p>
            <p className="text-sm text-[#1a1a1a] leading-relaxed">{review.text}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => setShowReviewsModal(true)}
        className="transition-colors text-sm font-semibold text-[#304333] px-5 py-2.5 rounded-xl mb-8"
        style={{ background: '#F1F5E4' }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#ede8df')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#F1F5E4')}
      >
        Show all reviews
      </button>

      <div className="h-px bg-gray-100 my-6" />

      <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">My interests</h2>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {MY_INTERESTS.map(({ label, Icon }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon size={20} color="#1a1a1a" strokeWidth={1.5} />
            <span className="text-sm text-[#1a1a1a]">{label}</span>
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-100 my-6" />

      <button className="w-full flex items-center gap-4 py-2">
        <MessageSquare size={20} color="#1a1a1a" />
        <span className="text-sm font-medium text-[#1a1a1a]">Show reviews I&apos;ve written</span>
      </button>

      <div className="h-px bg-gray-100 my-6" />
    </div>
  )

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="hidden lg:flex items-center justify-between px-5 lg:px-8 py-4 border-b border-gray-100">

          <button onClick={() => router.push('/')} className="text-2xl font-bold text-[#2c4a1e]"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Erranza
          </button>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell size={18} color="#1a1a1a" />
          </button>
        </div>

        <div className="flex-1 px-5 pb-16 lg:max-w-2xl lg:mx-auto lg:w-full">
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6 mt-6">Profile</h1>
          <p className="text-sm text-gray-500 mb-5">
            Log in to manage your bookings, wishlists and profile.
          </p>
          <div className="flex gap-3 mb-8">
            <button onClick={() => router.push('/login')}
              className="flex-1 bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm">
              Log in
            </button>
            <button onClick={() => router.push('/login')}
              className="flex-1 border border-[#1a1a1a] text-[#1a1a1a] py-3 rounded-xl
                         font-semibold text-sm">
              Sign up
            </button>
          </div>

          {[
            { Icon: Settings, label: 'Account settings' },
            { Icon: HelpCircle, label: 'Get help' },
            { Icon: User, label: 'View profile' },
            { Icon: Shield, label: 'Privacy' },
          ].map(({ Icon, label }) => (
            <button key={label} className="w-full flex items-center gap-4 py-4">
              <Icon size={22} color="#1a1a1a" />
              <span className="flex-1 text-sm font-medium text-[#1a1a1a] text-left">{label}</span>
              <ChevronRight size={16} color="#aaa" />
            </button>
          ))}
        </div>

        <BottomNav active="Profile" onSelect={() => { }} scrollingDown={false} scrolled={false} />
        <FooterSection />

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Top bar — no navbar/searchbar/categorybar, just brand + avatar + menu ── */}
      <div className="hidden lg:flex items-center justify-between px-5 lg:px-8 py-4 border-b border-gray-100">
        <button onClick={() => router.push('/')} className="text-2xl font-bold text-[#2c4a1e]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          Erranza
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/vendor')}
            className="hidden sm:block text-sm font-medium text-[#304333] hover:text-[#2c4a1e] transition-colors">
            Switch to vendor
          </button>
          <div className="w-9 h-9 rounded-full bg-[#2c4a1e] flex items-center justify-center
                          text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'E'}
          </div>
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <Menu size={16} color="#1a1a1a" />
          </button>
        </div>
      </div>

      <div className="flex-1 lg:max-w-4xl lg:mx-auto lg:w-full">
        <div className="lg:flex">

          {/* ── Left sidebar — lg+ only ── */}
          <div className="hidden lg:block w-72 flex-shrink-0 px-6 pt-8">

            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6">Profile</h1>
            <div className="flex flex-col gap-1">
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-100 text-left">
                <div className="w-9 h-9 rounded-full bg-[#2c4a1e] flex items-center justify-center
                              text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() ?? 'E'}
                </div>
                <span className="text-sm font-semibold text-[#1a1a1a]">About me</span>
              </button>
              <button onClick={() => router.push('/trips')}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#e0d9cc] flex-shrink-0">
                  {trips[0] && <img src={trips[0].image} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="text-sm text-[#1a1a1a]">Past trips</span>
              </button>
              <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: '#F1F5E4', color: '#2c4a1e' }}>
                  {user?.name?.[0]?.toUpperCase() ?? 'E'}
                </div>
                <span className="text-sm text-[#1a1a1a]">Connections</span>
              </button>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0 px-5 lg:px-6 lg:pt-8 lg:border-l lg:border-gray-100 pb-16">

            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">About me</h2>
              <button className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition-colors">
                Edit
              </button>
            </div>
            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6 mt-6 lg:hidden">Profile</h1>

            <ProfileCard />
            <BioBullets />

            {/* Quick tiles — mobile/tablet only; desktop uses the sidebar instead */}
            <div className="grid grid-cols-2 gap-4 mb-5 lg:hidden">
              <button onClick={() => router.push('/trips')}
                className="bg-white rounded-2xl p-5 text-left relative min-h-[180px] transition-shadow"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#304333]
                               text-white px-2.5 py-1 rounded-full">NEW</span>
                <div className="relative h-16 mb-4" style={{ width: 90 }}>
                  {trips.length > 0 ? trips.slice(0, 2).map((t, i) => (
                    <div key={i} className="absolute w-14 h-14 rounded-xl overflow-hidden bg-[#e0d9cc]"
                      style={{
                        border: '3px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        transform: `rotate(${i === 0 ? -8 : 8}deg)`,
                        left: i * 22,
                        zIndex: i,
                      }}>
                      <img src={t.image} alt={t.listingTitle} className="w-full h-full object-cover" />
                    </div>
                  )) : (
                    <div className="absolute w-14 h-14 rounded-xl bg-gray-100" style={{ border: '3px solid white' }} />
                  )}
                </div>
                <p className="text-sm font-bold text-[#1a1a1a]">Past trips</p>
              </button>

              <button className="bg-white rounded-2xl p-5 text-left relative min-h-[180px] transition-shadow"
                style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
                <span className="absolute top-3 right-3 text-[10px] font-bold bg-[#304333]
                               text-white px-2.5 py-1 rounded-full">NEW</span>
                <div className="w-14 h-14 rounded-full flex items-center justify-center
                              text-2xl font-bold mb-4" style={{ background: '#F1F5E4', color: '#2c4a1e' }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <p className="text-sm font-bold text-[#1a1a1a]">Connections</p>
              </button>
            </div>

            {/* Become a host + Switch to vendor — mobile/tablet only */}
            <div className="lg:hidden">
              <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-5
                            flex items-center gap-4">
                <div className="text-3xl">👩‍💼</div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#1a1a1a]">Become a host</p>
                  <p className="text-xs text-gray-500">
                    It's easy to start hosting and earn extra income.
                  </p>
                </div>
                <ChevronRight size={16} color="#aaa" />
              </div>

              <button
                onClick={() => router.push('/vendor')}
                className="w-full flex items-center gap-4 bg-[#2c4a1e] rounded-2xl p-5 mb-5
               hover:bg-[#3d6b28] transition-colors text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EAF98E] flex items-center
                    justify-center flex-shrink-0 text-2xl">
                  🧭
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">Switch to vendor mode</p>
                  <p className="text-white/60 text-xs mt-0.5">
                    Manage your listings, bookings and earnings
                  </p>
                </div>
                <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
              </button>
            </div>

            <ExtraSections />

            {/* Menu items — no per-item dividers; one divider between the two groups */}
            <div className="mt-2">
              {[
                { Icon: Settings, label: 'Account settings', dot: true },
                { Icon: HelpCircle, label: 'Get help' },
                { Icon: User, label: 'View profile' },
                { Icon: Shield, label: 'Privacy' },
              ].map(({ Icon, label, dot }) => (
                <button key={label} className="w-full flex items-center gap-4 py-4">
                  <div className="relative">
                    <Icon size={22} color="#1a1a1a" />
                    {dot && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
                    )}
                  </div>
                  <span className="flex-1 text-sm font-medium text-[#1a1a1a] text-left">{label}</span>
                  <ChevronRight size={16} color="#aaa" />
                </button>
              ))}

              <div className="h-px bg-gray-100 my-2" />

              {[
                { Icon: Users, label: 'Refer a host' },
                { Icon: Users, label: 'Find a co-host' },
                { Icon: Gift, label: 'Gift cards' },
                { Icon: FileText, label: 'Legal' },
              ].map(({ Icon, label }) => (
                <button key={label} className="w-full flex items-center gap-4 py-4">
                  <Icon size={22} color="#1a1a1a" />
                  <span className="flex-1 text-sm font-medium text-[#1a1a1a] text-left">{label}</span>
                  <ChevronRight size={16} color="#aaa" />
                </button>
              ))}

              <button
                onClick={() => { logout(); router.push('/') }}
                className="w-full flex items-center gap-4 py-4">
                <LogOut size={22} color="#1a1a1a" />
                <span className="text-sm font-medium text-[#1a1a1a]">Log out</span>
              </button>

              <p className="text-xs text-gray-400 mt-4">Erranza v1.0 · © 2026 Erranza Inc.</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="Profile" onSelect={() => { }} scrollingDown={false} scrolled={false} />
      <FooterSection />


      {/* ── Reviews modal ── */}
      {showReviewsModal && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowReviewsModal(false) }}>
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#1a1a1a]">{MY_REVIEWS.length} reviews</h2>
              <button onClick={() => setShowReviewsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
                <X size={18} color="#1a1a1a" />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {MY_REVIEWS.map((review, i) => (
                <div key={review.name}
                  style={{ borderBottom: i < MY_REVIEWS.length - 1 ? '1px solid #f0ede8' : 'none', paddingBottom: 16 }}>
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-9 h-9 rounded-full bg-[#2c4a1e] flex items-center justify-center
                                    text-white text-sm font-bold flex-shrink-0">
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{review.name}</p>
                      <p className="text-xs text-gray-400">{review.location}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-1.5">{review.date}</p>
                  <p className="text-sm text-[#1a1a1a] leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
