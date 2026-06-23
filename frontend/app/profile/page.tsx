'use client'
import { useRouter } from 'next/navigation'
import {
  Bell, Settings, HelpCircle, User, Shield,
  ChevronRight, LogOut, Gift, FileText, Users
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import AppShell from '@/components/AppShell'

export default function ProfilePage() {
  const { isLoggedIn, user, logout, trips, wishlists } = useAuth()
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <AppShell showCollapse={false}>
        <div className="px-5 pt-10 pb-32 min-h-full bg-white">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-[#1a1a1a]">Profile</h1>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Bell size={18} color="#1a1a1a" />
            </button>
          </div>
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

          {/* Guest menu */}
          {[
            { Icon: Settings,   label: 'Account settings' },
            { Icon: HelpCircle, label: 'Get help' },
            { Icon: User,       label: 'View profile' },
            { Icon: Shield,     label: 'Privacy' },
          ].map(({ Icon, label }) => (
            <button key={label}
              className="w-full flex items-center gap-4 py-4 border-b border-gray-100">
              <Icon size={22} color="#1a1a1a" />
              <span className="flex-1 text-sm font-medium text-[#1a1a1a] text-left">{label}</span>
              <ChevronRight size={16} color="#aaa" />
            </button>
          ))}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell showCollapse={false}>
      <div className="min-h-full bg-white">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-10 pb-4">
          <h1 className="text-3xl font-bold text-[#1a1a1a]">Profile</h1>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell size={18} color="#1a1a1a" />
          </button>
        </div>

        <div className="px-5 pb-32">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5
                          flex items-center gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-[#2c4a1e] flex items-center
                              justify-center text-white text-3xl font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'E'}
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#2c4a1e] rounded-full
                              border-2 border-white flex items-center justify-center">
                <Shield size={10} color="white" />
              </div>
            </div>

            {/* Name + location */}
            <div className="flex-1 min-w-0">
              <p className="text-xl font-bold text-[#1a1a1a]">{user?.name}</p>
              <p className="text-xs text-gray-400">Nairobi, Kenya</p>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-2 text-right">
              {[
                { value: trips.length, label: 'Trips' },
                { value: '1',          label: 'Reviews' },
                { value: '1',          label: 'Year on Erranza' },
              ].map(({ value, label }, i, arr) => (
                <div key={label}>
                  <p className="text-base font-bold text-[#1a1a1a]">{value}</p>
                  {i < arr.length - 1 && <div className="h-px bg-gray-200 my-1 w-20 ml-auto" />}
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick tiles — Past trips + Connections */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button onClick={() => router.push('/trips')}
              className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-left
                         hover:bg-gray-100 transition-colors relative overflow-hidden min-h-[120px]">
              <span className="absolute top-2 right-2 text-[10px] font-bold bg-gray-800
                               text-white px-2 py-0.5 rounded-full">NEW</span>
              <div className="flex gap-1 mb-3">
                {trips.slice(0, 2).map((t, i) => (
                  <div key={i} className="w-12 h-12 rounded-xl bg-[#e0d9cc] overflow-hidden
                                          relative border-2 border-white"
                    style={{ marginLeft: i > 0 ? '-12px' : '0', zIndex: 2 - i }}>
                    <img src={t.image} alt={t.listingTitle} className="w-full h-full object-cover" />
                  </div>
                ))}
                {trips.length === 0 && (
                  <div className="w-12 h-12 rounded-xl bg-gray-200" />
                )}
              </div>
              <p className="text-sm font-bold text-[#1a1a1a]">Past trips</p>
            </button>

            <button className="bg-gray-50 rounded-2xl border border-gray-200 p-4 text-left
                               hover:bg-gray-100 transition-colors relative overflow-hidden min-h-[120px]">
              <span className="absolute top-2 right-2 text-[10px] font-bold bg-gray-800
                               text-white px-2 py-0.5 rounded-full">NEW</span>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center
                              justify-center text-blue-600 text-xl font-bold mb-3">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <p className="text-sm font-bold text-[#1a1a1a]">Connections</p>
            </button>
          </div>

          {/* Become a host banner */}
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

          {/* Switch to vendor — only show when logged in */}
{isLoggedIn && (
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
)}

          {/* Menu items */}
          {[
            { Icon: Settings,   label: 'Account settings', dot: true },
            { Icon: HelpCircle, label: 'Get help' },
            { Icon: User,       label: 'View profile' },
            { Icon: Shield,     label: 'Privacy' },
          ].map(({ Icon, label, dot }) => (
            <button key={label}
              className="w-full flex items-center gap-4 py-4 border-b border-gray-100">
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
            { Icon: Users,    label: 'Refer a host' },
            { Icon: Users,    label: 'Find a co-host' },
            { Icon: Gift,     label: 'Gift cards' },
            { Icon: FileText, label: 'Legal' },
          ].map(({ Icon, label }) => (
            <button key={label}
              className="w-full flex items-center gap-4 py-4 border-b border-gray-100">
              <Icon size={22} color="#1a1a1a" />
              <span className="flex-1 text-sm font-medium text-[#1a1a1a] text-left">{label}</span>
              <ChevronRight size={16} color="#aaa" />
            </button>
          ))}

          {/* Log out */}
          <button
            onClick={() => { logout(); router.push('/') }}
            className="w-full flex items-center gap-4 py-4">
            <LogOut size={22} color="#1a1a1a" />
            <span className="text-sm font-medium text-[#1a1a1a]">Log out</span>
          </button>

          <p className="text-xs text-gray-400 mt-4">Erranza v1.0 · © 2026 Erranza Inc.</p>
        </div>
      </div>
    </AppShell>
  )
}