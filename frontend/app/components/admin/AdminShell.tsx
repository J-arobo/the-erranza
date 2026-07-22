'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShieldAlert, Building2, Scale, History,
  LogOut, Menu, X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { label: 'Dashboard',   Icon: LayoutDashboard, path: '/admin' },
  { label: 'Moderation',  Icon: ShieldAlert,      path: '/admin/moderation' },
  { label: 'Vendors',     Icon: Building2,        path: '/admin/vendors' },
  { label: 'Disputes',    Icon: Scale,            path: '/admin/disputes' },
  { label: 'Audit Log',   Icon: History,          path: '/admin/audit-log' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(path: string) {
    if (path === '/admin') return pathname === '/admin'
    return pathname.startsWith(path)
  }

  function navigate(path: string) {
    router.push(path)
    setMobileOpen(false)
  }

  const currentLabel = NAV_ITEMS.find(i => isActive(i.path))?.label ?? 'Dashboard'

  return (
    <div className="flex h-screen bg-white overflow-hidden">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1e293b] flex-shrink-0">
        <div className="px-6 py-5 border-b border-white/10">
          <button onClick={() => router.push('/')}
            className="text-white text-xl font-bold tracking-tight">
            Erranza
          </button>
          <p className="text-white/40 text-xs mt-0.5">Admin</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, Icon, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                          font-medium transition-all text-left w-full
                ${isActive(path)
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center
                            justify-center text-[#1e293b] text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-white/40 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                       text-white/50 hover:bg-white/5 hover:text-white transition-all w-full"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="flex flex-col w-72 bg-[#1e293b] h-full shadow-2xl">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <p className="text-white text-lg font-bold">Erranza</p>
                <p className="text-white/40 text-xs">Admin</p>
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
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
            <div className="px-3 py-4 border-t border-white/10">
              <button onClick={() => { logout(); router.push('/') }}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm
                           text-white/50 hover:bg-white/5 hover:text-white w-full">
                <LogOut size={16} />
                Log out
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        <div className="lg:hidden flex items-center justify-between px-4 py-3
                        bg-[#1e293b] flex-shrink-0">
          <button onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
            <Menu size={18} color="white" />
          </button>
          <p className="text-sm font-bold text-white">{currentLabel}</p>
          <div className="w-9 h-9 rounded-full bg-white flex items-center
                          justify-center text-[#1e293b] text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto scrollbar-hide bg-white">
          {children}
        </main>
      </div>
    </div>
  )
}
