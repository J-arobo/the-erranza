'use client'
import {
  createContext, useContext, useState,
  useEffect, ReactNode, useMemo, useCallback,
} from 'react'
import { apiFetch, getToken, setToken } from '@/lib/api'

type Role = 'traveller' | 'partner' | 'admin' | 'super_admin'

type User = {
  id: number
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
  onboardingComplete?: boolean
  roles: Role[]
  activeRole: Role
}

type Listing = {
  id: string
  location: string
  title: string
  price: string
  rating: number
  image: string
  badge?: string
  [key: string]: unknown
}

type Trip = {
  id: string
  listingId: string
  vendorId: string
  vendorName: string
  listingTitle: string
  image: string
  dates: string
  guests: number
  price: string
  status: 'upcoming' | 'completed' | 'cancelled'
}

export type Message = {
  id: string
  vendorName: string
  vendorImage: string
  lastMessage: string
  time: string
  unread: boolean
  listingTitle: string
  dates?: string
  coGuestName?: string
}

type AuthContextType = {
  user: User | null
  ready: boolean
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoggedIn: boolean
  completeOnboarding: () => void
  becomePartner: () => Promise<void>
  addAdminRole: () => void
  addSuperAdminRole: () => void
  setActiveRole: (role: Role) => void
  wishlists: Listing[]
  addToWishlist: (item: Listing) => void
  removeFromWishlist: (id: string) => void
  isWishlisted: (id: string) => boolean
  trips: Trip[]
  addTrip: (trip: Trip) => void
  messages: Message[]
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  ready: false,
  register: async () => {},
  login: async () => {},
  logout: () => {},
  isLoggedIn: false,
  completeOnboarding: () => {},
  becomePartner: async () => {},
  addAdminRole: () => {},
  addSuperAdminRole: () => {},
  setActiveRole: () => {},
  wishlists: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isWishlisted: () => false,
  trips: [],
  addTrip: () => {},
  messages: [],
})

const MOCK_TRIPS: Trip[] = [
  {
    id: 't1',
    listingId: '1',
    vendorId: 'v1',
    vendorName: 'Mara Expeditions',
    listingTitle: 'Maasai Mara',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80',
    dates: '15 May – 18 May 2026',
    guests: 2,
    price: 'Ksh 90,000',
    status: 'upcoming',
  },
  {
    id: 't2',
    listingId: '3',
    vendorId: 'v1',
    vendorName: 'Kilimanjaro View Tours',
    listingTitle: 'Amboseli National Park',
    image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&q=80',
    dates: '2 Mar – 4 Mar 2026',
    guests: 1,
    price: 'Ksh 28,000',
    status: 'completed',
  },
]

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    vendorName: 'Mara Expeditions',
    vendorImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=100&q=80',
    lastMessage: 'Your booking is confirmed! We will pick you up at 6am.',
    time: '10:32 AM',
    unread: true,
    listingTitle: 'Maasai Mara Safari',
  },
  {
    id: 'm2',
    vendorName: 'Savannah Tours',
    vendorImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=100&q=80',
    lastMessage: 'Hi! Do you have any questions about the tour?',
    time: 'Yesterday',
    unread: false,
    listingTitle: 'Serengeti Plains',
  },
]

type ApiUser = {
  id: number
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  roles: string[]
  activeRole: string
  onboardingComplete: boolean
}

function mapUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    phone: apiUser.phone,
    avatar: apiUser.avatarUrl ?? undefined,
    roles: apiUser.roles as Role[],
    activeRole: apiUser.activeRole as Role,
    onboardingComplete: apiUser.onboardingComplete,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null)
  const [wishlists, setWishlists] = useState<Listing[]>([])
  const [trips, setTrips]         = useState<Trip[]>(MOCK_TRIPS)
  const [ready, setReady]         = useState(false)

  // Restore session from a stored token on first load.
  useEffect(() => {
    const token = getToken()
    if (!token) { setReady(true); return }

    apiFetch<{ user: ApiUser }>('/auth/me')
      .then(({ user }) => setUser(mapUser(user)))
      .catch(() => setToken(null))
      .finally(() => setReady(true))
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, phone?: string) => {
    const { user, token } = await apiFetch<{ user: ApiUser; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name, email, password,
        password_confirmation: password,
        phone,
      }),
    })
    setToken(token)
    setUser(mapUser(user))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await apiFetch<{ user: ApiUser; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setToken(token)
    setUser(mapUser(user))
  }, [])

  const logout = useCallback(() => {
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => {})
    setToken(null)
    setUser(null)
    setWishlists([])
  }, [])

  function completeOnboarding() {
    setUser(u => u ? { ...u, onboardingComplete: true } : u)
  }

  const becomePartner = useCallback(async () => {
    await apiFetch('/become-partner', { method: 'POST' })
    setUser(u => {
      if (!u) return u
      const roles = Array.from(new Set([...u.roles, 'partner' as Role]))
      return { ...u, roles, activeRole: 'partner' }
    })
  }, [])

  // Dev-only shortcuts — local state only, not backed by the real backend.
  // Admin/super-admin elevation is deliberately not self-service; real accounts
  // are seeded server-side. Pages later wired to the real admin/super-admin API
  // will 403 for accounts "promoted" this way.
  function addAdminRole() {
    setUser(u => {
      if (!u) return u
      const roles = Array.from(new Set([...u.roles, 'admin' as Role]))
      return { ...u, roles }
    })
  }

  function addSuperAdminRole() {
    setUser(u => {
      if (!u) return u
      const roles = Array.from(new Set([...u.roles, 'super_admin' as Role]))
      return { ...u, roles }
    })
  }

  function setActiveRole(role: Role) {
    setUser(u => u ? { ...u, activeRole: role } : u)
  }

  function addToWishlist(item: Listing) {
    setWishlists(w => w.find(i => i.id === item.id) ? w : [...w, item])
  }
  function removeFromWishlist(id: string) {
    setWishlists(w => w.filter(i => i.id !== id))
  }
  function isWishlisted(id: string) {
    return wishlists.some(i => i.id === id)
  }
  function addTrip(trip: Trip) {
    setTrips(t => [trip, ...t])
  }

  const value = useMemo(() => ({
    user,
    ready,
    register,
    login,
    logout,
    isLoggedIn: !!user,
    completeOnboarding,
    becomePartner,
    addAdminRole,
    addSuperAdminRole,
    setActiveRole,
    wishlists,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    trips,
    addTrip,
    messages: MOCK_MESSAGES,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, ready, wishlists, trips, register, login, logout, becomePartner])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
