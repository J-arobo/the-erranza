'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, List, Calendar, MessageCircle,
  TrendingUp, Star, User, LogOut, Menu, X, Bell, Info, LifeBuoy
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch } from '@/lib/api'

const NAV_ITEMS = [
  { label: 'Dashboard', Icon: LayoutDashboard, path: '/vendor' },
  { label: 'Listings', Icon: List, path: '/vendor/listings' },
  { label: 'Bookings', Icon: Calendar, path: '/vendor/bookings' },
  { label: 'Messages', Icon: MessageCircle, path: '/vendor/messages' },
  { label: 'Earnings', Icon: TrendingUp, path: '/vendor/earnings' },
  { label: 'Reviews', Icon: Star, path: '/vendor/reviews' },
  { label: 'Support', Icon: LifeBuoy, path: '/vendor/support' },
  { label: 'Profile', Icon: User, path: '/vendor/profile' },
]

const NOTIF_ICON: Record<string, typeof Calendar> = {
  booking: Calendar,
  review: Star,
  message: MessageCircle,
  system: Info,
}

type ApiNotification = {
  id: number
  type: 'booking' | 'review' | 'message' | 'system'
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function VendorShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, setActiveRole } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const [pendingCount, setPendingCount] = useState(0)
  const [notifications, setNotifications] = useState<ApiNotification[]>([])

  useEffect(() => {
    apiFetch<{ bookings: { status: string }[] }>('/vendor/bookings')
      .then(({ bookings }) => setPendingCount(bookings.filter(b => b.status === 'pending').length))
      .catch(() => {})

    apiFetch<{ notifications: ApiNotification[] }>('/vendor/notifications')
      .then(({ notifications }) => setNotifications(notifications))
      .catch(() => {})
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length
  const activeRole = user?.activeRole ?? 'partner'

  function isActive(path: string) {
    if (path === '/vendor') return pathname === '/vendor'
    return pathname.startsWith(path)
  }

  function navigate(path: string) {
    router.push(path)
    setMobileOpen(false)
  }

  function handleSwitchRole(role: 'traveller' | 'partner') {
    setActiveRole(role)
    setMobileOpen(false)
    router.push(role === 'traveller' ? '/' : '/vendor')
  }

  function handleBackToErranza() {
    setActiveRole('traveller')
    router.push('/')
  }

  async function markAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })))
    try {
      await apiFetch('/vendor/notifications/read-all', { method: 'POST' })
    } catch {
      // optimistic update already applied — a refresh will resync if this failed
    }
  }

  async function handleNotifClick(n: ApiNotification) {
    setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))
    setNotifOpen(false)
    if (n.link) navigate(n.link)
    try {
      await apiFetch(`/vendor/notifications/${n.id}/read`, { method: 'POST' })
    } catch {
      // optimistic update already applied
    }
  }

  const currentLabel = NAV_ITEMS.find(i => isActive(i.path))?.label ?? 'Dashboard'

  const RoleSwitcher = () => (
    <div className="flex bg-white/10 rounded-full p-1">
      {(['traveller', 'partner'] as const).map((r) => (
        <button key={r}
          onClick={() => handleSwitchRole(r)}
          className={`flex-1 text-xs font-semibold py-1.5 rounded-full capitalize transition-all
            ${activeRole === r ? 'bg-white text-[#2c4a1e]' : 'text-white/60 hover:text-white'}`}>
          {r}
        </button>
      ))}
    </div>
  )

  const NotifPanel = notifOpen && (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
      <div className="fixed top-16 right-4 lg:top-20 lg:left-6 lg:right-auto z-50
                      w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl
                      border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <p className="text-sm font-bold text-[#1a1a1a]">Notifications</p>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold text-[#2c4a1e]">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
          ) : (
            notifications.map((n) => {
              const Icon = NOTIF_ICON[n.type] ?? Info
              return (
                <button key={n.id} onClick={() => handleNotifClick(n)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b
                              border-gray-50 last:border-b-0 hover:bg-gray-50 transition-colors
                              ${!n.read ? 'bg-[#f5f9f0]' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-[#eaf5e4] text-[#2c4a1e]
                                  flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#1a1a1a]">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-[#2c4a1e] flex-shrink-0 mt-1.5" />}
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )

  return (
    <div className="flex h-screen bg-[#f9fafb] overflow-hidden">
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#2c4a1e] flex-shrink-0">

        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <button onClick={() => router.push('/')}
                className="text-white text-xl font-bold tracking-tight">
                Erranza
              </button>
              <p className="text-white/50 text-xs mt-0.5">Vendor Dashboard</p>
            </div>
            <button onClick={() => setNotifOpen(o => !o)}
              className="relative w-8 h-8 rounded-lg flex items-center justify-center
                         hover:bg-white/10 transition-colors flex-shrink-0">
              <Bell size={16} color="white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#EAF98E]
                                 text-[#2c4a1e] text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Back to guest view */}
          <button
            onClick={handleBackToErranza}
            className="mt-3 flex items-center gap-1.5 text-white/50 text-xs
                      hover:text-white/80 transition-colors"
          >
            ← Back to Erranza
          </button>
        </div>

        {/* Role switcher */}
        <div className="px-3 pt-4">
          <RoleSwitcher />
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
              {label === 'Bookings' && pendingCount > 0 && (
                <span className="ml-auto bg-[#EAF98E] text-[#2c4a1e] text-[10px]
                                 font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
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

            {/* Role switcher */}
            <div className="px-3 pt-4">
              <RoleSwitcher />
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
                  {label === 'Bookings' && pendingCount > 0 && (
                    <span className="ml-auto bg-[#EAF98E] text-[#2c4a1e] text-[10px]
                                     font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
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
            className="w-9 h-9 rounded-xl bg-[#f3f4f6] flex items-center justify-center">
            <Menu size={18} color="#2c4a1e" />
          </button>
          <p className="text-sm font-bold text-[#1a1a1a]">{currentLabel}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setNotifOpen(o => !o)}
              className="relative w-9 h-9 rounded-xl bg-[#f3f4f6] flex items-center justify-center">
              <Bell size={17} color="#2c4a1e" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2c4a1e]
                                 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <div className="w-9 h-9 rounded-full bg-[#2c4a1e] flex items-center
                            justify-center text-[#EAF98E] text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'V'}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </main>
      </div>

      {NotifPanel}
    </div>
  )
}
