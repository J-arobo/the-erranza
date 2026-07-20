'use client'
import {
  createContext, useContext, useState,
  useEffect, ReactNode, useMemo
} from 'react'

type Role = 'traveller' | 'partner'

type User = {
  name: string
  email: string
  avatar?: string
  onboardingComplete?: boolean
  roles?: Role[]
  activeRole?: Role
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

type Message = {
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
  login: (user: User) => void
  logout: () => void
  isLoggedIn: boolean
  completeOnboarding: () => void
  addPartnerRole: () => void
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
  login: () => {},
  logout: () => {},
  isLoggedIn: false,
  completeOnboarding: () => {},
  addPartnerRole: () => {},
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<User | null>(null)
  const [wishlists, setWishlists] = useState<Listing[]>([])
  const [trips, setTrips]         = useState<Trip[]>(MOCK_TRIPS)
  const [mounted, setMounted]     = useState(false)

  // CRITICAL: Only mark as mounted after first client render
  // This prevents hydration mismatches
  useEffect(() => {
    setMounted(true)
  }, [])

  function login(u: User) {
    setUser({ roles: ['traveller'], activeRole: 'traveller', ...u })
  }
  function logout() { setUser(null); setWishlists([]) }

  function completeOnboarding() {
    setUser(u => u ? { ...u, onboardingComplete: true } : u)
  }

  function addPartnerRole() {
    setUser(u => {
      if (!u) return u
      const roles = Array.from(new Set([...(u.roles ?? ['traveller']), 'partner' as Role]))
      return { ...u, roles, activeRole: 'partner' }
    })
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

  // Memoize to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    login,
    logout,
    isLoggedIn: !!user,
    completeOnboarding,
    addPartnerRole,
    wishlists,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    trips,
    addTrip,
    messages: MOCK_MESSAGES,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, wishlists, trips])

  // Render children immediately — no loading gate
  // suppressHydrationWarning on children handles the mismatch
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
