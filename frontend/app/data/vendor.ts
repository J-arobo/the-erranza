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
  blockedDates?: { id: string; start: string; end: string }[]
  fixedDates?: string[]
  cancellationPolicy?: 'flexible' | 'moderate' | 'strict' | 'custom'
  customCancellationPolicy?: string
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
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    message?: string
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