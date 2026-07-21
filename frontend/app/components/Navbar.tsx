'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  User, LayoutDashboard, X, Globe, HelpCircle,
  Home, Newspaper, Briefcase, Shield,
  LogIn, UserPlus, Star, LogOut
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const MENU_SECTIONS_GUEST = [
  {
    section: null,
    items: [
      { icon: LogIn,           label: 'Log in',           path: '/login' },
      { icon: UserPlus,        label: 'Sign up',          path: '/login' },
      { icon: LayoutDashboard, label: 'Become a vendor',  path: '/partner' },
    ],
  },
  {
    section: 'Help & support',
    items: [
      { icon: HelpCircle, label: 'Help Centre',      path: '/help' },
      { icon: Shield,     label: 'Partner dispute',  path: '/help' },
    ],
  },
  {
    section: 'Inspiration',
    items: [
      { icon: Star,      label: 'Seasonal deals',   path: '/' },
      { icon: Newspaper, label: 'Travel articles',  path: '/' },
    ],
  },
  {
    section: 'Settings and legal',
    items: [
      { icon: Home,      label: 'About Erranza',      path: '/' },
      { icon: Briefcase, label: 'Careers',            path: '/' },
      { icon: Globe,     label: 'Language · English', path: '/' },
      { icon: Shield,    label: 'Privacy Notice',     path: '/' },
    ],
  },
]

const MENU_SECTIONS_LOGGEDIN = [
  {
    section: null,
    items: [
      { icon: User,            label: 'Profile',          path: '/profile' },
      { icon: LayoutDashboard, label: 'Vendor dashboard', path: '/vendor' },
    ],
  },
  {
    section: 'Help & support',
    items: [
      { icon: HelpCircle, label: 'Help Centre',     path: '/help' },
      { icon: Shield,     label: 'Partner dispute', path: '/help' },
    ],
  },
  {
    section: 'Inspiration',
    items: [
      { icon: Star,      label: 'Seasonal deals',   path: '/' },
      { icon: Newspaper, label: 'Travel articles',  path: '/' },
    ],
  },
  {
    section: 'Settings and legal',
    items: [
      { icon: Home,      label: 'About Erranza',      path: '/' },
      { icon: Briefcase, label: 'Careers',            path: '/' },
      { icon: Globe,     label: 'Language · English', path: '/' },
      { icon: Shield,    label: 'Privacy Notice',     path: '/' },
    ],
  },
]

export default function Navbar({categoryBar }: {categoryBar?: React.ReactNode}) {
  const router = useRouter()
  const { isLoggedIn, user, logout, setActiveRole } = useAuth()
  const [menuOpen, setMenuOpen]     = useState(false)
  const [helpTooltip, setHelpTooltip] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [profileMenuPos, setProfileMenuPos] = useState({ top: 0, right: 0 })
  const [mounted, setMounted]       = useState(false)
  const helpRef = useRef<HTMLButtonElement>(null)
  const profileBtnRef = useRef<HTMLButtonElement>(null)

  const isPartner = !!user?.roles?.includes('partner')
  const activeRole = user?.activeRole ?? 'traveller'
  const menuSections = isLoggedIn ? MENU_SECTIONS_LOGGEDIN : MENU_SECTIONS_GUEST

  // Wait for client mount before rendering portal
  useEffect(() => { setMounted(true) }, [])


  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (helpRef.current && !helpRef.current.contains(e.target as Node)) {
        setHelpTooltip(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggleProfileMenu() {
    if (!profileMenuOpen && profileBtnRef.current) {
      const rect = profileBtnRef.current.getBoundingClientRect()
      setProfileMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    setProfileMenuOpen(o => !o)
  }

  function handleSwitchRole(role: 'traveller' | 'partner') {
    setActiveRole(role)
    setProfileMenuOpen(false)
    setMenuOpen(false)
    router.push(role === 'partner' ? '/vendor' : '/')
  }

  // Drawer rendered via portal — escapes any stacking context
  const Drawer = () => (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 lg:hidden"
        style={{ zIndex: 9998 }}
        onClick={() => setMenuOpen(false)}
      />

      {/* Panel */}
      <div
        className="fixed inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:bottom-0
                   sm:w-[420px] bg-white overflow-y-auto flex flex-col
                   shadow-2xl lg:hidden"
        style={{ zIndex: 9999 }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 pt-12 sm:pt-8 pb-4
                        border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#1a1a1a]">More</h2>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center
                       justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={16} color="#1a1a1a" />
          </button>
        </div>

        {/* Role switcher */}
        {isLoggedIn && isPartner && (
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex bg-gray-100 rounded-full p-1">
              {(['traveller', 'partner'] as const).map((r) => (
                <button key={r}
                  onClick={() => handleSwitchRole(r)}
                  className={`flex-1 text-xs font-semibold py-2 rounded-full capitalize transition-all
                    ${activeRole === r ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-gray-500'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Currency + language */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col gap-4">
          <button className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left">
            <span className="text-sm font-bold text-[#1a1a1a] w-10">KES</span>
            <span className="text-sm text-gray-500">Kenyan Shilling</span>
          </button>
          <button className="flex items-center gap-3 hover:opacity-70 transition-opacity text-left">
            <span className="text-xl">🇰🇪</span>
            <span className="text-sm text-gray-500">English (Kenya)</span>
          </button>
        </div>

        {/* Menu sections */}
        <div className="flex-1 px-5 py-2">
          {menuSections.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <p className="text-xs font-bold text-[#1a1a1a] uppercase tracking-wider
                              mt-5 mb-2">
                  {group.section}
                </p>
              )}
              {group.items.map(({ icon: Icon, label, path }) => {
                const isVendorItem = label === 'Vendor dashboard'
                const finalLabel = isVendorItem && !isPartner ? 'Become a vendor' : label
                const finalPath  = isVendorItem && !isPartner ? '/partner' : path
                return (
                  <button
                    key={label}
                    onClick={() => { setMenuOpen(false); router.push(finalPath) }}
                    className="w-full flex items-center gap-4 py-4 border-b border-gray-100
                               hover:opacity-70 transition-opacity text-left"
                  >
                    <Icon size={20} color="#1a1a1a" className="flex-shrink-0" />
                    <span className="text-sm text-[#1a1a1a]">{finalLabel}</span>
                  </button>
                )
              })}
            </div>
          ))}

          {isLoggedIn && (
            <button
              onClick={() => { setMenuOpen(false); logout(); router.push('/') }}
              className="w-full flex items-center gap-4 py-4 mt-2
                         hover:opacity-70 transition-opacity text-left"
            >
              <LogOut size={20} color="#e63946" className="flex-shrink-0" />
              <span className="text-sm text-red-500 font-medium">Log out</span>
            </button>
          )}
        </div>
      </div>
    </>
  )

  // Profile dropdown rendered via portal — escapes AppShell's overflow:hidden scroll wrapper
  const ProfileMenu = () => (
    <>
      <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setProfileMenuOpen(false)} />
      <div
        className="fixed w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        style={{ zIndex: 9999, top: profileMenuPos.top, right: profileMenuPos.right }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-[#304333] flex items-center
                          justify-center text-[#EAF98E] text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'E'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1a1a1a] truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {isPartner && (
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex bg-gray-100 rounded-full p-1">
              {(['traveller', 'partner'] as const).map((r) => (
                <button key={r}
                  onClick={() => handleSwitchRole(r)}
                  className={`flex-1 text-xs font-semibold py-1.5 rounded-full capitalize transition-all
                    ${activeRole === r ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-gray-500'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="py-1">
          <button
            onClick={() => { setProfileMenuOpen(false); router.push('/profile') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a1a1a]
                       hover:bg-gray-50 transition-colors text-left"
          >
            <User size={15} /> Profile
          </button>
          <button
            onClick={() => { setProfileMenuOpen(false); router.push(isPartner ? '/vendor' : '/partner') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a1a1a]
                       hover:bg-gray-50 transition-colors text-left"
          >
            <LayoutDashboard size={15} /> {isPartner ? 'Vendor dashboard' : 'Become a vendor'}
          </button>
          <button
            onClick={() => { setProfileMenuOpen(false); router.push('/help') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a1a1a]
                       hover:bg-gray-50 transition-colors text-left"
          >
            <HelpCircle size={15} /> Help Centre
          </button>
        </div>

        <div className="border-t border-gray-100 py-1">
          <button
            onClick={() => { setProfileMenuOpen(false); logout(); router.push('/') }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500
                       hover:bg-red-50 transition-colors text-left"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <header className="bg-[#f5f6f4] px-4 sm:px-6 py-3 relative flex items-center
                         justify-between flex-shrink-0">

        {/* Brand */}
        <span
          onClick={() => router.push('/')}
          className="text-[var(--dark-green)] text-41 font-bold text-buenard
                     tracking-tight cursor-pointer"
        >
          Erranza
        </span>

        {/* category bar in the middle - hidden on mobile */}
        <div className='hidden xl:flex absolute left-1/2 -translate-x-1/2'>
          {categoryBar}
        </div>

        <div className="flex items-center gap-2">

          {/* ── DESKTOP (lg+) ── */}
          <div className="hidden lg:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => router.push(isPartner ? '/vendor' : '/partner')}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#304333]
                             hover:text-[#2c4a1e] transition-colors"
                >
                  <LayoutDashboard size={15} />
                  {isPartner ? 'Vendor dashboard' : 'Become a vendor'}
                </button>

                <div className="relative">
                  <button
                    ref={helpRef}
                    onClick={() => setHelpTooltip(h => !h)}
                    onMouseEnter={() => setHelpTooltip(true)}
                    onMouseLeave={() => setHelpTooltip(false)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center
                               justify-center hover:border-[#304333] transition-colors"
                  >
                    <HelpCircle size={16} color="#304333" />
                  </button>
                  {helpTooltip && (
                    <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] text-white
                                    text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap
                                    shadow-lg z-50">
                      Contact Customer Service
                      <div className="absolute -top-1 right-3 w-2 h-2 bg-[#1a1a1a] rotate-45" />
                    </div>
                  )}
                </div>

                <button
                  ref={profileBtnRef}
                  onClick={toggleProfileMenu}
                  className="w-8 h-8 rounded-full bg-[#304333] flex items-center
                             justify-center text-[#EAF98E] text-sm font-bold
                             hover:bg-[#2c4a1e] transition-colors"
                >
                  {user?.name?.[0]?.toUpperCase() ?? 'E'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => router.push('/partner')}
                  className="text-sm font-medium text-[#304333] hover:text-[#2c4a1e]
                             transition-colors"
                >
                  List your property
                </button>

                <div className="relative">
                  <button
                    ref={helpRef}
                    onClick={() => router.push('/help')}
                    onMouseEnter={() => setHelpTooltip(true)}
                    onMouseLeave={() => setHelpTooltip(false)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center
                               justify-center hover:border-[#304333] transition-colors"
                  >
                    <HelpCircle size={16} color="#304333" />
                  </button>
                  {helpTooltip && (
                    <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] text-white
                                    text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap
                                    shadow-lg z-50">
                      Contact Customer Service
                      <div className="absolute -top-1 right-3 w-2 h-2 bg-[#1a1a1a] rotate-45" />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push('/login')}
                  className="border border-[#304333] text-[#304333] text-sm font-semibold
                             px-4 py-1.5 rounded-lg hover:bg-[#f0ece4] transition-colors"
                >
                  Register
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-[#304333] text-white text-sm font-semibold px-4 py-1.5
                             rounded-lg hover:bg-[#2c4a1e] transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </div>

          {/* ── TABLET (sm–lg) ── */}
          <div className="hidden sm:flex lg:hidden items-center gap-2">
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/profile')}
                className="w-8 h-8 rounded-full bg-[#304333] flex items-center
                           justify-center text-[#EAF98E] text-sm font-bold"
              >
                {user?.name?.[0]?.toUpperCase() ?? 'E'}
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="w-8 h-8 rounded-full border border-gray-300 bg-white
                           flex items-center justify-center hover:border-[#304333] transition-colors"
              >
                <User size={16} color="#304333" />
              </button>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white
                         flex flex-col items-center justify-center gap-1.5
                         hover:border-[#304333] transition-colors"
            >
              <span className="block w-4 h-[2px] bg-gray-700 rounded" />
              <span className="block w-4 h-[2px] bg-gray-700 rounded" />
            </button>
          </div>

          {/* ── MOBILE ── */}
          <div className="flex sm:hidden items-center gap-2">
            {isLoggedIn ? (
              <button
                onClick={() => router.push('/profile')}
                className="w-8 h-8 rounded-full bg-[#304333] flex items-center
                           justify-center text-[#EAF98E] text-sm font-bold"
              >
                {user?.name?.[0]?.toUpperCase() ?? 'E'}
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="w-8 h-8 rounded-full border border-gray-300 bg-white
                           flex items-center justify-center hover:border-[#304333] transition-colors"
              >
                <User size={16} color="#304333" />
              </button>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white
                         flex flex-col items-center justify-center gap-1.5
                         hover:border-[#304333] transition-colors"
            >
              <span className="block w-4 h-[2px] bg-gray-700 rounded" />
              <span className="block w-4 h-[2px] bg-gray-700 rounded" />
            </button>
          </div>

        </div>
      </header>

      {/* Drawer / dropdown rendered into document.body via portal — escapes any stacking/clip context */}
      {mounted && menuOpen && createPortal(<Drawer />, document.body)}
      {mounted && profileMenuOpen && createPortal(<ProfileMenu />, document.body)}
    </>
  )
}
