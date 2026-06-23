'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, List, Calendar, MessageCircle,
  TrendingUp, Star, User, LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard',  Icon: LayoutDashboard, path: '/vendor' },
  { label: 'Listings',   Icon: List,            path: '/vendor/listings' },
  { label: 'Bookings',   Icon: Calendar,        path: '/vendor/bookings' },
  { label: 'Messages',   Icon: MessageCircle,   path: '/vendor/messages' },
  { label: 'Earnings',   Icon: TrendingUp,      path: '/vendor/earnings' },
  { label: 'Reviews',    Icon: Star,            path: '/vendor/reviews' },
  { label: 'Profile',    Icon: User,            path: '/vendor/profile' },
]

export default function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(path: string) {
    if (path === '/vendor') return pathname === '/vendor'
    return pathname.startsWith(path)
  }

  function navigate(path: string) {
    router.push(path)
    setMobileOpen(false)
  }

  const currentLabel = NAV_ITEMS.find(i => isActive(i.path))?.label ?? 'Dashboard'

  return (
    <div className="flex h-screen bg-[#f5f0e8] overflow-hidden">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#2c4a1e] flex-shrink-0">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <button onClick={() => router.push('/')}
            className="text-white text-xl font-bold tracking-tight">
            Erranza
          </button>
          <p className="text-white/50 text-xs mt-0.5">Vendor Dashboard</p>

          {/* Back to guest view */}
          <button
            onClick={() => router.push('/')}
            className="mt-3 flex items-center gap-1.5 text-white/50 text-xs
                      hover:text-white/80 transition-colors"
          >
            ← Back to Erranza
          </button>
        </div>
        

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, Icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                          font-medium transition-all text-left w-full
                ${isActive(path)
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'}`}
            >
              <Icon size={18} />
              {label}
              {label === 'Bookings' && (
                <span className="ml-auto bg-[#EAF98E] text-[#2c4a1e] text-[10px]
                                 font-bold px-1.5 py-0.5 rounded-full">2</span>
              )}
            </button>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#EAF98E] flex items-center
                            justify-center text-[#2c4a1e] text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'V'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">
                {user?.name ?? 'Vendor'}
              </p>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                       text-white/60 hover:bg-white/10 hover:text-white transition-all w-full"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col w-72 bg-[#2c4a1e] h-full shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center
                            justify-between">
              <div>
                <p className="text-white text-lg font-bold">Erranza</p>
                <p className="text-white/50 text-xs">Vendor Dashboard</p>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X size={20} color="white" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
              {NAV_ITEMS.map(({ label, Icon, path }) => (
                <button key={path} onClick={() => navigate(path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                              font-medium transition-all text-left w-full
                    ${isActive(path)
                      ? 'bg-white/15 text-white'
                      : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                  <Icon size={18} />
                  {label}
                  {label === 'Bookings' && (
                    <span className="ml-auto bg-[#EAF98E] text-[#2c4a1e] text-[10px]
                                     font-bold px-1.5 py-0.5 rounded-full">2</span>
                  )}
                </button>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-white/10">
              <button onClick={() => { logout(); router.push('/') }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                           text-white/60 hover:bg-white/10 hover:text-white w-full">
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
          {/* Backdrop */}
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3
                        bg-white border-b border-gray-100 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl bg-[#f5f0e8] flex items-center justify-center">
            <Menu size={18} color="#2c4a1e" />
          </button>
          <p className="text-sm font-bold text-[#1a1a1a]">{currentLabel}</p>
          <div className="w-9 h-9 rounded-full bg-[#2c4a1e] flex items-center
                          justify-center text-[#EAF98E] text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() ?? 'V'}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  )
}