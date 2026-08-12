'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Bell, Settings, HelpCircle, User, Shield,
  ChevronRight, LogOut, Gift, FileText, Users,
  Menu, MapPin, Camera, Plane, Heart, Calendar,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'
import FooterSection from '@/components/FooterSection'
import BottomNav from '@/components/BottomNav'
import ListingCard from '@/components/ListingCard'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

type ApiBooking = {
  id: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'alternative_proposed'
  guests: number
  total: string
  payment_plan: 'full' | 'instalments'
  check_in: string | null
  check_out: string | null
  listing: {
    id: number
    title: string
    location: string
    images: { url: string }[]
    vendor: { id: number; business_name: string }
  }
}

type Stat = { value: number | string; label: string }

function formatMonthYear(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
}

// Trip helpers/component
const STATUS_STYLES = {
  upcoming: { bg: 'bg-[#eaf5e4]', text: 'text-[#2c4a1e]', label: 'Upcoming' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Completed' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-500', label: 'Cancelled' },
}

type Trip = {
  id: number
  listingId: number
  vendorId: number
  listingTitle: string
  vendorName: string
  image: string
  dates: string
  guests: number
  price: string
  instalments: boolean
  status: 'upcoming' | 'completed' | 'cancelled'
}

function mapTripStatus(status: ApiBooking['status']): Trip['status'] {
  if (status === 'completed') return 'completed'
  if (status === 'cancelled') return 'cancelled'
  return 'upcoming'
}

function formatTripDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
function formatTripDateRange(start: string | null, end: string | null) {
  if (!start) return '—'
  if (!end || end === start) return formatTripDate(start)
  return `${formatTripDate(start)} – ${formatTripDate(end)}`
}
function formatKsh(v: string | number) {
  return `Ksh ${Math.round(Number(v)).toLocaleString()}`
}

function mapBookingToTrip(b: ApiBooking): Trip {
  return {
    id: b.id,
    listingId: b.listing.id,
    vendorId: b.listing.vendor.id,
    listingTitle: b.listing.title,
    vendorName: b.listing.vendor.business_name,
    image: b.listing.images[0]?.url ?? FALLBACK_IMAGE,
    dates: formatTripDateRange(b.check_in, b.check_out),
    guests: b.guests,
    price: formatKsh(b.total),
    instalments: b.payment_plan === 'instalments',
    status: mapTripStatus(b.status),
  }
}

function TripListCard({ trip }: { trip: Trip }) {
  const style = STATUS_STYLES[trip.status]
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/trips/${trip.id}`)}
      className="bg-white rounded-2xl overflow-hidden w-full cursor-pointer"
      style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-[90px] h-[90px] rounded-xl overflow-hidden
                        flex-shrink-0 bg-[#f5f5f5]">
          <Image src={trip.image} alt={trip.listingTitle} fill
            sizes="90px" className="object-cover" />
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-center gap-1">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md
                            w-fit ${style.bg} ${style.text}`}>
            {style.label}
          </span>
          <p className="text-[14px] font-bold text-[#1a1a1a] leading-snug truncate">
            {trip.listingTitle}
          </p>
          <p className="text-[12px] text-gray-500">{trip.vendorName}</p>
          <div className="flex flex-col gap-1 mt-0.5">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} color="#888" />
              <span className="text-[11px] text-gray-400">{trip.dates}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} color="#888" />
              <span className="text-[11px] text-gray-400">
                {trip.guests} guest{trip.guests > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <p className="text-[12px] font-semibold text-[#2c4a1e] mt-0.5">
            {trip.price}{trip.instalments && <span className="text-gray-400 font-normal"> · 3 instalments</span>}
          </p>
        </div>
      </div>

      {trip.status === 'upcoming' && (
        <div className="flex border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/trips/${trip.id}`) }}
            className="flex-1 py-3 text-xs font-semibold text-[#1a1a1a]
                             hover:bg-gray-50 transition-colors border-r border-gray-100">
            Manage booking
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/messages?vendor=${trip.vendorId}&listing=${trip.listingId}`) }}
            className="flex-1 py-3 text-xs font-semibold text-[#1a1a1a]
                             hover:bg-gray-50 transition-colors">
            Message host
          </button>
        </div>
      )}

      {trip.status === 'completed' && (
        <div className="border-t border-gray-100">
          <button
            onClick={(e) => { e.stopPropagation(); router.push(`/trips/${trip.id}`) }}
            className="w-full py-3 text-xs font-semibold text-[#2c4a1e]
                             hover:bg-gray-50 transition-colors">
            Leave a review ★
          </button>
        </div>
      )}
    </div>
  )
}




// ── Square profile card " ──
function ProfileCard({ name, avatar, onEditPhoto, stats }: { name?: string; avatar?: string | null; onEditPhoto: (dataUrl: string) => Promise<void>; stats: Stat[] }) {
  const [pending, setPending] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const displayAvatar = pending ?? avatar

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setPending(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function handleSave() {
    if (!pending) return
    setSaving(true)
    try {
      await onEditPhoto(pending)
      setPending(null)
    } finally {
      setSaving(false)
    }
  }

  const SaveRow = (
    pending && (
      <div className="flex gap-2 mt-2">
        <button onClick={handleSave} disabled={saving}
          className="text-xs font-semibold text-white bg-[#2c4a1e] px-3 py-1.5 rounded-full disabled:opacity-50">
          {saving ? 'Saving…' : 'Save photo'}
        </button>
        <button onClick={() => setPending(null)} disabled={saving}
          className="text-xs font-semibold text-[#1a1a1a] bg-gray-100 px-3 py-1.5 rounded-full">
          Cancel
        </button>
      </div>
    )
  )

  return (
    <>
      <div className="sm:hidden bg-white rounded-2xl p-4 mb-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', maxWidth: 380 }}>
        <div className="flex items-center">
          <div className="w-1/2 flex flex-col items-center">
            <div className="relative mb-1.5">
              {displayAvatar ? (
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <img src={displayAvatar} alt={name ?? 'Profile'} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-2xl font-bold">
                  {name?.[0]?.toUpperCase() ?? 'E'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition-colors">
                <Camera size={13} color="#1a1a1a" />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-base font-bold text-[#1a1a1a] text-center">{name}</p>
            {SaveRow}
          </div>
          <div className="w-1/2 pl-3">
            {stats.map(({ value, label }, i, arr) => (
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
              {displayAvatar ? (
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <img src={displayAvatar} alt={name ?? 'Profile'} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-4xl font-bold">
                  {name?.[0]?.toUpperCase() ?? 'E'}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition-colors">
                <Camera size={14} color="#1a1a1a" />
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-xl font-bold text-[#1a1a1a] text-center">{name}</p>
            {SaveRow}
          </div>
          <div className="w-1/2 pl-4">
            {stats.map(({ value, label }, i, arr) => (
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
}


function VisitedPlaces({ loading, places }: { loading: boolean; places: ApiBooking[] }) {
  return (
    <div className="hidden md:block">
      <div className="h-px bg-gray-100 my-6" />

      <h2 className="text-xl font-bold text-[#1a1a1a] mb-4">Where I&apos;ve been</h2>
      {loading ? (
        <p className="text-sm text-gray-400 mb-8">Loading…</p>
      ) : places.length === 0 ? (
        <p className="text-sm text-gray-400 mb-8">Your completed trips will show up here.</p>
      ) : (
        <div className="flex gap-8 mb-8 flex-wrap">
          {places.map((b) => (
            <div key={b.listing.location} className="text-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden mb-2 mx-auto bg-[#f5f5f5]">
                {b.listing.images[0] ? (
                  <img src={b.listing.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin size={24} color="#78716c" />
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold text-[#1a1a1a] max-w-[100px] truncate">{b.listing.location}</p>
              <p className="text-xs text-gray-400">{formatMonthYear(b.check_in)}</p>
            </div>
          ))}
        </div>
      )}

      <div className="h-px bg-gray-100 my-6" />
    </div>
  )
}

export default function ProfilePage() {
  const { isLoggedIn, user, updateProfile, logout, wishlists, wishlistsReady } = useAuth()
  async function handleAvatarChange(dataUrl: string) {
    await updateProfile({ avatarUrl: dataUrl })
  }
  const router = useRouter()

  //Desktop display of the tabs
  const [desktopTab, setDesktopTab] = useState<'about' | 'trips' | 'saved'>('about')

  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) { setLoadingBookings(false); return }
    apiFetch<{ bookings: ApiBooking[] }>('/bookings')
      .then(({ bookings }) => setBookings(bookings))
      .catch(() => { })
      .finally(() => setLoadingBookings(false))
  }, [isLoggedIn])

  const memberSinceYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : null

  // Only bookings that actually happened count as "past trips" — excludes
  // upcoming/pending bookings and ones that were cancelled.
  const pastTrips = bookings.filter(b => b.status === 'completed')

  // Unique real destinations from completed bookings, keeping the first occurrence's date.
  const visitedPlaces = Array.from(
    new Map(
      pastTrips.map(b => [b.listing.location, b])
    ).values()
  )

  // trips page on desktop
  const trips = bookings.map(mapBookingToTrip)

  const stats: Stat[] = [
    { value: pastTrips.length, label: 'Trips' },
    { value: wishlists.length, label: 'Saved' },
    { value: memberSinceYear ?? '—', label: 'Member since' },
  ]



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
            <button onClick={() => router.push('/signup')}
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
              <button onClick={() => setDesktopTab('about')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors
                  ${desktopTab === 'about' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                <div className="w-9 h-9 rounded-full bg-[#2c4a1e] flex items-center justify-center
                              text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() ?? 'E'}
                </div>
                <span className="text-sm font-semibold text-[#1a1a1a]">About me</span>
              </button>
              <button onClick={() => setDesktopTab('trips')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left
                  ${desktopTab === 'trips' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#F1F5E4] flex items-center justify-center flex-shrink-0">
                  {pastTrips[0] ? (
                    <img src={pastTrips[0].listing.images[0]?.url ?? FALLBACK_IMAGE} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Calendar size={16} color="#2c4a1e" />
                  )}
                </div>
                <span className="text-sm text-[#1a1a1a]">Past trips</span>
              </button>
              <button onClick={() => setDesktopTab('saved')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left
                  ${desktopTab === 'saved' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: '#F1F5E4', color: '#2c4a1e' }}>
                  {wishlists.length}
                </div>
                <span className="text-sm text-[#1a1a1a]">Saved</span>
              </button>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="flex-1 w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0 px-5 lg:px-6 lg:pt-8 lg:border-l lg:border-gray-100 pb-16">

            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">
                {desktopTab === 'about' ? 'About me' : desktopTab === 'trips' ? 'Past trips' : 'Saved'}
              </h2>
            </div>

            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-6 mt-6 lg:hidden">Profile</h1>

            {desktopTab === 'about' && (
              <>
                <ProfileCard name={user?.name} avatar={user?.avatar} onEditPhoto={handleAvatarChange} stats={stats} />

                {/* Quick tiles — mobile/tablet only; desktop uses the sidebar instead */}
                <div className="grid grid-cols-2 gap-4 mb-5 lg:hidden">
                  <button onClick={() => router.push('/trips')}
                    className="bg-white rounded-2xl p-5 text-left relative min-h-[180px] transition-shadow"
                    style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
                    {bookings.length > 0 ? (
                      <>
                        <div className="relative h-16 mb-4" style={{ width: 90 }}>
                          {bookings.slice(0, 2).map((b, i) => (
                            <div key={b.id} className="absolute w-14 h-14 rounded-xl overflow-hidden bg-[#f5f5f5]"
                              style={{
                                border: '3px solid white',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                transform: `rotate(${i === 0 ? -8 : 8}deg)`,
                                left: i * 22,
                                zIndex: i,
                              }}>
                              <img src={b.listing.images[0]?.url ?? FALLBACK_IMAGE} alt={b.listing.title} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                        <p className="text-sm font-bold text-[#1a1a1a]">Past trips</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                          style={{ background: '#F1F5E4' }}>
                          <Plane size={22} color="#2c4a1e" />
                        </div>
                        <p className="text-sm font-bold text-[#1a1a1a] mb-1">Past trips</p>
                        <p className="text-xs text-gray-400 leading-snug">Your trips will show up here once you book one.</p>
                      </>
                    )}
                  </button>

                  <button onClick={() => router.push('/wishlists')}
                    className="bg-white rounded-2xl p-5 text-left relative min-h-[180px] transition-shadow"
                    style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
                    {wishlists.length > 0 ? (
                      <>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center
                                  text-2xl font-bold mb-4" style={{ background: '#F1F5E4', color: '#2c4a1e' }}>
                          {wishlists.length}
                        </div>
                        <p className="text-sm font-bold text-[#1a1a1a]">Saved</p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                          style={{ background: '#F1F5E4' }}>
                          <Heart size={22} color="#2c4a1e" />
                        </div>
                        <p className="text-sm font-bold text-[#1a1a1a] mb-1">Saved</p>
                        <p className="text-xs text-gray-400 leading-snug">Places you save will show up here.</p>
                      </>
                    )}
                  </button>
                </div>

                {/* Become a host + Switch to vendor — mobile/tablet only */}
                <div className="lg:hidden">
                  <button
                    onClick={() => router.push('/vendor')}
                    className="w-full bg-gray-50 rounded-2xl border border-gray-200 p-5 mb-5
                            flex items-center gap-4 text-left hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-3xl">👩‍💼</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-[#1a1a1a]">Become a host</p>
                      <p className="text-xs text-gray-500">
                        It's easy to start hosting and earn extra income.
                      </p>
                    </div>
                    <ChevronRight size={16} color="#aaa" />
                  </button>

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

                <VisitedPlaces loading={loadingBookings} places={visitedPlaces} />

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
              </>
            )}

            {desktopTab === 'trips' && (
              <div className="hidden lg:block">
                {loadingBookings ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
                  </div>
                ) : trips.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#e8f0e0] flex items-center justify-center">
                      <Calendar size={28} color="#2c4a1e" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1a1a1a]">No trips yet</h2>
                    <p className="text-sm text-gray-500 max-w-xs">
                      When you book a safari, stay or experience, it will appear here.
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="mt-2 border border-[#1a1a1a] text-[#1a1a1a] px-6 py-3
                                 rounded-xl font-semibold text-sm hover:bg-[#f0ece4] transition-colors"
                    >
                      Start exploring
                    </button>
                  </div>
                ) : (
                  <>
                    {trips.filter(t => t.status === 'upcoming').length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-base font-bold text-[#1a1a1a] mb-3">Upcoming</h3>
                        <div className="flex flex-col gap-3">
                          {trips.filter(t => t.status === 'upcoming').map(trip => (
                            <TripListCard key={trip.id} trip={trip} />
                          ))}
                        </div>
                      </div>
                    )}
                    {trips.filter(t => t.status !== 'upcoming').length > 0 && (
                      <div>
                        <h3 className="text-base font-bold text-[#1a1a1a] mb-3">Past trips</h3>
                        <div className="flex flex-col gap-3">
                          {trips.filter(t => t.status !== 'upcoming').map(trip => (
                            <TripListCard key={trip.id} trip={trip} />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {desktopTab === 'saved' && (
              <div className="hidden lg:block">
                {!wishlistsReady ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
                  </div>
                ) : wishlists.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-[#e8f0e0] flex items-center justify-center">
                      <Heart size={28} color="#2c4a1e" />
                    </div>
                    <h2 className="text-lg font-bold text-[#1a1a1a]">Create your first wishlist</h2>
                    <p className="text-sm text-gray-500 max-w-xs">
                      As you search, tap the ♡ heart icon on any listing to save it here.
                    </p>
                    <button
                      onClick={() => router.push('/')}
                      className="mt-2 border border-[#1a1a1a] text-[#1a1a1a] px-6 py-3
                                 rounded-xl font-semibold text-sm hover:bg-[#f0ece4] transition-colors"
                    >
                      Start exploring
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-500 mb-5">
                      {wishlists.length} saved {wishlists.length === 1 ? 'place' : 'places'}
                    </p>
                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-6">
                      {wishlists.map((item) => (
                        <ListingCard key={item.id} {...item} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      <BottomNav active="Profile" onSelect={() => { }} scrollingDown={false} scrolled={false} />
      <FooterSection />
    </div>
  )
}
