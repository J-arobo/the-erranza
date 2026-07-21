export type VendorListing = {
  id: string
  title: string
  location: string
  price: string
  image: string
  status: 'active' | 'draft' | 'paused'
  bookings: number
  rating: number
  earnings: string
  category: string
  description: string
  views?: number
  amenities?: string[]
  extras?: { id: string; label: string; price: number; defaultSelected?: boolean }[]
  extraGuestPrice?: string
  seasonalRates?: { id: string; label: string; start: string; end: string; price: string }[]
  blockedDates?: { id: string; start: string; end: string; reason?: string }[]
  departures?: { id: string; date: string; capacity: number; booked: number }[]
  minLeadTimeDays?: number
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict' | 'custom'
  customCancellationPolicy?: string
  images?: string[]
  excluded?: string[]
  itinerary?: { day: number; title: string; description: string }[]
  minGuests?: number
  maxGuests?: number
  durationOptions?: { id: string; label: string; price?: string }[]
  childPrice?: string
  groupDiscounts?: { id: string; minGuests: number; discountPercent: number }[]
}

export type VendorBooking = {
  id: string
  listingId: string
  guestName: string
  guestInitial: string
  guestColor: string
  listingTitle: string
  listingImage: string
  dates: string
  checkIn: string
  checkOut: string
  guests: number
  total: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'alternative_proposed'
  message?: string
  travelers?: string[]
  specialRequests?: string
  proposedDates?: string
  refundPercent?: number | null
  refundAmount?: string
}

export type VendorEarning = {
  month: string
  amount: number
}

export type VendorReview = {
  id: string
  guestName: string
  guestInitial: string
  guestColor: string
  listingTitle: string
  rating: number
  date: string
  comment: string
  replied: boolean
  replyText?: string
}

export type VendorNotification = {
  id: string
  type: 'booking' | 'review' | 'message' | 'system'
  title: string
  message: string
  date: string
  read: boolean
  link: string
}

export type VendorTeamMember = {
  id: string
  name: string
  email: string
  role: 'Manager' | 'Co-host' | 'Support'
  avatarColor: string
  status: 'active' | 'pending'
}

export type VendorMessage = {
  id: string
  bookingId: string
  sender: 'guest' | 'vendor'
  text: string
  timestamp: string
}

export type VendorReport = {
  id: string
  bookingId?: string
  type: 'no_show' | 'dispute' | 'safety' | 'other'
  description: string
  status: 'submitted' | 'under_review' | 'resolved'
  date: string
}

export const CANCELLATION_POLICIES: {
  id: 'flexible' | 'moderate' | 'strict' | 'custom'
  label: string
  description: string
  refundPercent: number | null
}[] = [
  { id: 'flexible', label: 'Flexible', description: 'Full refund up to 24 hours before the start date.', refundPercent: 100 },
  { id: 'moderate', label: 'Moderate', description: 'Full refund up to 5 days before the start date, 50% refund after that.', refundPercent: 50 },
  { id: 'strict', label: 'Strict', description: 'Full refund up to 14 days before the start date. No refund after that.', refundPercent: 0 },
  { id: 'custom', label: 'Custom', description: 'Refund terms set by the operator.', refundPercent: null },
]

export const VENDOR_TEAM: VendorTeamMember[] = [
  {
    id: 'tm1',
    name: 'Grace Wanjiru',
    email: 'grace@erranzatours.co.ke',
    role: 'Co-host',
    avatarColor: '#c4d4f0',
    status: 'active',
  },
  {
    id: 'tm2',
    name: 'Peter Otieno',
    email: 'peter@erranzatours.co.ke',
    role: 'Manager',
    avatarColor: '#f0c4d4',
    status: 'pending',
  },
]

export const VENDOR_NOTIFICATIONS: VendorNotification[] = [
  {
    id: 'vn1',
    type: 'booking',
    title: 'New booking request',
    message: 'Mark Gillet requested Amboseli Elephant Trek for 20–22 May 2026.',
    date: '2 hours ago',
    read: false,
    link: '/vendor/bookings/vb2',
  },
  {
    id: 'vn2',
    type: 'review',
    title: 'New review',
    message: 'Sarah Omondi left a 5-star review on Maasai Mara Premium Safari.',
    date: '1 day ago',
    read: false,
    link: '/vendor/reviews',
  },
  {
    id: 'vn3',
    type: 'message',
    title: 'New message',
    message: 'Amina Hassan sent you a message about Nairobi City Walking Tour.',
    date: '2 days ago',
    read: true,
    link: '/vendor/messages',
  },
  {
    id: 'vn4',
    type: 'system',
    title: 'Boost your bookings',
    message: 'Listings with 5+ photos get 30% more bookings. Add more photos to Sunrise Balloon Safari.',
    date: '4 days ago',
    read: true,
    link: '/vendor/listings/vl4',
  },
]

export const VENDOR_LISTINGS: VendorListing[] = [
  {
    id: 'vl1',
    title: 'Maasai Mara Premium Safari',
    location: 'Narok County, Kenya',
    price: 'Ksh 45,000',
    image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80',
    status: 'active',
    bookings: 24,
    rating: 4.9,
    earnings: 'Ksh 1,080,000',
    category: 'Safari',
    description: '3-day full board safari with expert guides and luxury tented camp.',
    views: 860,
  },
  {
    id: 'vl2',
    title: 'Amboseli Elephant Trek',
    location: 'Kajiado County, Kenya',
    price: 'Ksh 28,000',
    image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&q=80',
    status: 'active',
    bookings: 18,
    rating: 4.8,
    earnings: 'Ksh 504,000',
    category: 'Safari',
    description: '2-day safari with Maasai village visit and sundowner.',
    views: 540,
  },
  {
    id: 'vl3',
    title: 'Nairobi City Walking Tour',
    location: 'Nairobi, Kenya',
    price: 'Ksh 3,500',
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80',
    status: 'paused',
    bookings: 41,
    rating: 4.7,
    earnings: 'Ksh 143,500',
    category: 'Experiences',
    description: 'Guided city walking tour covering history, culture and food.',
    views: 1240,
  },
  {
    id: 'vl4',
    title: 'Sunrise Balloon Safari',
    location: 'Maasai Mara, Kenya',
    price: 'Ksh 78,000',
    image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&q=80',
    status: 'draft',
    bookings: 0,
    rating: 0,
    earnings: 'Ksh 0',
    category: 'Experiences',
    description: 'Sunrise hot air balloon ride over the Maasai Mara.',
    views: 0,
  },
]

export const VENDOR_BOOKINGS: VendorBooking[] = [
  {
    id: 'vb1',
    listingId: 'vl1',
    guestName: 'Sarah Omondi',
    guestInitial: 'S',
    guestColor: '#c4d4f0',
    listingTitle: 'Maasai Mara Premium Safari',
    listingImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80',
    dates: '15 May – 18 May 2026',
    checkIn: '15 May 2026',
    checkOut: '18 May 2026',
    guests: 2,
    total: 'Ksh 90,000',
    status: 'confirmed',
    message: 'Hi, we are very excited for the trip!',
    travelers: ['Sarah Omondi', 'David Omondi'],
    specialRequests: 'One traveler uses a wheelchair — please confirm vehicle accessibility.',
  },
  {
    id: 'vb2',
    listingId: 'vl2',
    guestName: 'Mark Gillet',
    guestInitial: 'M',
    guestColor: '#f0c4d4',
    listingTitle: 'Amboseli Elephant Trek',
    listingImage: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&q=80',
    dates: '20 May – 22 May 2026',
    checkIn: '20 May 2026',
    checkOut: '22 May 2026',
    guests: 1,
    total: 'Ksh 28,000',
    status: 'pending',
    message: 'Can you accommodate a vegetarian diet?',
    travelers: ['Mark Gillet'],
    specialRequests: 'Vegetarian meals required.',
  },
  {
    id: 'vb3',
    listingId: 'vl1',
    guestName: 'James Kariuki',
    guestInitial: 'J',
    guestColor: '#c4f0d4',
    listingTitle: 'Maasai Mara Premium Safari',
    listingImage: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80',
    dates: '1 Apr – 4 Apr 2026',
    checkIn: '1 Apr 2026',
    checkOut: '4 Apr 2026',
    guests: 4,
    total: 'Ksh 180,000',
    status: 'completed',
    message: 'Do you offer transfers from JKIA airport?',
    travelers: ['James Kariuki', 'Grace Kariuki', 'Peter Kariuki', 'Lucy Kariuki'],
  },
  {
    id: 'vb4',
    listingId: 'vl3',
    guestName: 'Amina Hassan',
    guestInitial: 'A',
    guestColor: '#f0e4c4',
    listingTitle: 'Nairobi City Walking Tour',
    listingImage: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80',
    dates: '10 Mar – 10 Mar 2026',
    checkIn: '10 Mar 2026',
    checkOut: '10 Mar 2026',
    guests: 3,
    total: 'Ksh 10,500',
    status: 'completed',
    message: 'Is the walking tour suitable for kids under 10?',
    travelers: ['Amina Hassan', 'Yusuf Hassan', 'Fatima Hassan'],
  },
]

const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString()

export const VENDOR_MESSAGE_THREADS: VendorMessage[] = [
  {
    id: 'msg1',
    bookingId: 'vb1',
    sender: 'guest',
    text: 'Hi, we are very excited for the trip!',
    timestamp: minutesAgo(72 * 60),
  },
  {
    id: 'msg2',
    bookingId: 'vb1',
    sender: 'vendor',
    text: "So happy to hear that! We can't wait to host you. Let us know if you need anything before the trip.",
    timestamp: minutesAgo(72 * 60 - 125),
  },
  {
    id: 'msg3',
    bookingId: 'vb2',
    sender: 'guest',
    text: 'Can you accommodate a vegetarian diet?',
    timestamp: minutesAgo(20 * 60),
  },
  {
    id: 'msg4',
    bookingId: 'vb3',
    sender: 'guest',
    text: 'Do you offer transfers from JKIA airport?',
    timestamp: minutesAgo(120 * 60),
  },
  {
    id: 'msg5',
    bookingId: 'vb3',
    sender: 'vendor',
    text: "Yes! Airport transfers are included in your package — we'll be there to pick you up.",
    timestamp: minutesAgo(120 * 60 - 45),
  },
  {
    id: 'msg6',
    bookingId: 'vb4',
    sender: 'guest',
    text: 'Is the walking tour suitable for kids under 10?',
    timestamp: minutesAgo(144 * 60),
  },
  {
    id: 'msg7',
    bookingId: 'vb4',
    sender: 'vendor',
    text: "Absolutely, we've hosted many families with young kids — the pace is relaxed and kid-friendly.",
    timestamp: minutesAgo(144 * 60 - 315),
  },
]

// Support & Compliance - Reports
export const REPORT_TYPES: { id: VendorReport['type']; label: string }[] = [
  { id: 'no_show', label: 'Traveller no-show' },
  { id: 'dispute', label: 'Dispute' },
  { id: 'safety', label: 'Safety incident' },
  { id: 'other', label: 'Other' },
]

export const VENDOR_REPORTS: VendorReport[] = [
  {
    id: 'rep1',
    bookingId: 'vb3',
    type: 'no_show',
    description: 'One traveler in the group did not show up at the pickup point and could not be reached.',
    status: 'resolved',
    date: '5 Apr 2026',
  },
]



export const VENDOR_EARNINGS: VendorEarning[] = [
  { month: 'Jan', amount: 85000 },
  { month: 'Feb', amount: 120000 },
  { month: 'Mar', amount: 95000 },
  { month: 'Apr', amount: 180000 },
  { month: 'May', amount: 210000 },
  { month: 'Jun', amount: 165000 },
  { month: 'Jul', amount: 230000 },
  { month: 'Aug', amount: 195000 },
  { month: 'Sep', amount: 145000 },
  { month: 'Oct', amount: 170000 },
  { month: 'Nov', amount: 220000 },
  { month: 'Dec', amount: 280000 },
]

export const VENDOR_REVIEWS: VendorReview[] = [
  {
    id: 'vr1',
    guestName: 'Sarah Omondi',
    guestInitial: 'S',
    guestColor: '#c4d4f0',
    listingTitle: 'Maasai Mara Premium Safari',
    rating: 5,
    date: 'April 2026',
    comment: 'Absolutely incredible experience. The guides were knowledgeable and patient. We spotted all of the Big Five on day one. Would highly recommend!',
    replied: false,
  },
  {
    id: 'vr2',
    guestName: 'Mark Gillet',
    guestInitial: 'M',
    guestColor: '#f0c4d4',
    listingTitle: 'Amboseli Elephant Trek',
    rating: 4,
    date: 'March 2026',
    comment: 'Great experience overall. The elephant sightings were breathtaking. Could improve on the road transfer times.',
    replied: true,
    replyText: 'Thank you for your wonderful review!',
  },
  {
    id: 'vr3',
    guestName: 'James Kariuki',
    guestInitial: 'J',
    guestColor: '#c4f0d4',
    listingTitle: 'Nairobi City Walking Tour',
    rating: 5,
    date: 'March 2026',
    comment: 'Best city tour I have ever done. Our guide was funny, well-informed and made the whole experience memorable.',
    replied: false,
  },
]

export function bookingRequiresApproval(booking: VendorBooking): boolean {
  const listing = VENDOR_LISTINGS.find(l => l.id === booking.listingId)
  return listing?.category === 'Safari' || listing?.category === 'Packages'
}

export function getCancellationTerms(booking: VendorBooking) {
  const listing = VENDOR_LISTINGS.find(l => l.id === booking.listingId)
  const policy = CANCELLATION_POLICIES.find(p => p.id === (listing?.cancellationPolicy ?? 'moderate'))!
  return {
    ...policy,
    description: policy.id === 'custom' ? (listing?.customCancellationPolicy || policy.description) : policy.description,
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function getResponseStats() {
  const threadIds = Array.from(new Set(VENDOR_MESSAGE_THREADS.map(m => m.bookingId)))
  let answered = 0
  const responseTimes: number[] = []

  threadIds.forEach((id) => {
    const msgs = VENDOR_MESSAGE_THREADS
      .filter(m => m.bookingId === id)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    const firstGuest = msgs.find(m => m.sender === 'guest')
    const firstReply = msgs.find(m => m.sender === 'vendor' && firstGuest && m.timestamp > firstGuest.timestamp)
    if (firstGuest && firstReply) {
      answered++
      const diffMin = (new Date(firstReply.timestamp).getTime() - new Date(firstGuest.timestamp).getTime()) / 60000
      responseTimes.push(diffMin)
    }
  })

  return {
    totalThreads: threadIds.length,
    answeredThreads: answered,
    responseRate: threadIds.length > 0 ? Math.round((answered / threadIds.length) * 100) : 0,
    avgResponseMinutes: responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : null,
  }
}

export function getRankingEstimate(listing: VendorListing): { percentile: number; label: string } {
  const conversion = listing.views ? (listing.bookings / listing.views) * 100 : 0
  const score = listing.rating * 10 + conversion * 2
  let percentile: number
  if (score >= 55) percentile = 5
  else if (score >= 45) percentile = 15
  else if (score >= 35) percentile = 30
  else if (score >= 25) percentile = 50
  else percentile = 70
  return { percentile, label: `Est. top ${percentile}% for ${listing.category} listings` }
}
