export type PlatformVendor = {
    id: string
    name: string
    email: string
    verificationStatus: 'pending' | 'approved' | 'rejected'
    suspended: boolean
    suspendReason?: string
    rating: number
    responseRate: number
    listingCount: number
  }
  
  export type PlatformListing = {
    id: string
    vendorId: string
    vendorName: string
    title: string
    category: string
    image: string
    status: 'active' | 'paused' | 'draft' | 'suspended'
    flagged: boolean
    flagReason?: string
  }
  
  export type VerificationSubmission = {
    id: string
    vendorId: string
    vendorName: string
    docType: 'Government ID' | 'Insurance certificate' | 'Business license'
    submittedDate: string
    status: 'pending' | 'approved' | 'rejected'
  }
  
  export type PlatformReview = {
    id: string
    vendorId: string
    vendorName: string
    listingTitle: string
    guestName: string
    rating: number
    comment: string
    date: string
    removed: boolean
    removeReason?: string
  }
  
  export type Dispute = {
    id: string
    bookingRef: string
    vendorName: string
    guestName: string
    amount: number
    reason: string
    status: 'open' | 'auto_approved' | 'escalated' | 'resolved'
    date: string
  }
  
  export type AuditLogEntry = {
    id: string
    adminId: string
    action: string
    target: string
    timestamp: string
  }
  
  //export const DISPUTE_CEILING = 20000
  
  export const PLATFORM_VENDORS: PlatformVendor[] = [
    {
      id: 'pv1', name: 'Mara Expeditions', email: 'info@maraexpeditions.co.ke',
      verificationStatus: 'approved', suspended: false, rating: 4.9, responseRate: 92, listingCount: 4,
    },
    {
      id: 'pv2', name: 'Savannah Tours', email: 'hello@savannahtours.co.ke',
      verificationStatus: 'approved', suspended: false, rating: 4.6, responseRate: 78, listingCount: 3,
    },
    {
      id: 'pv3', name: 'Kilimanjaro View Tours', email: 'contact@kilimanjaroview.co.ke',
      verificationStatus: 'pending', suspended: false, rating: 4.2, responseRate: 65, listingCount: 2,
    },
    {
      id: 'pv4', name: 'Rift Valley Adventures', email: 'team@riftvalleyadv.co.ke',
      verificationStatus: 'approved', suspended: true,
      suspendReason: 'Multiple guest complaints about vehicle safety.',
      rating: 3.4, responseRate: 40, listingCount: 5,
    },
    {
      id: 'pv5', name: 'Coastal Dhow Safaris', email: 'info@coastaldhow.co.ke',
      verificationStatus: 'rejected', suspended: false, rating: 0, responseRate: 0, listingCount: 1,
    },
  ]
  
  export const PLATFORM_LISTINGS: PlatformListing[] = [
    {
      id: 'pl1', vendorId: 'pv1', vendorName: 'Mara Expeditions',
      title: 'Maasai Mara Premium Safari', category: 'Safari',
      image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80',
      status: 'active', flagged: false,
    },
    {
      id: 'pl2', vendorId: 'pv2', vendorName: 'Savannah Tours',
      title: 'Serengeti Plains Day Trip', category: 'Safari',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&q=80',
      status: 'active', flagged: true,
      flagReason: 'Guest reported photos do not match the actual accommodation.',
    },
    {
      id: 'pl3', vendorId: 'pv3', vendorName: 'Kilimanjaro View Tours',
      title: 'Amboseli Sunrise Trek', category: 'Safari',
      image: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&q=80',
      status: 'active', flagged: false,
    },
    {
      id: 'pl4', vendorId: 'pv4', vendorName: 'Rift Valley Adventures',
      title: 'Lake Nakuru Budget Tour', category: 'Safari',
      image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=400&q=80',
      status: 'suspended', flagged: true,
      flagReason: 'Vendor account suspended — listing suspended alongside it.',
    },
    {
      id: 'pl5', vendorId: 'pv2', vendorName: 'Savannah Tours',
      title: 'Nairobi Night Market Walk', category: 'Experiences',
      image: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&q=80',
      status: 'active', flagged: false,
    },
    {
      id: 'pl6', vendorId: 'pv5', vendorName: 'Coastal Dhow Safaris',
      title: 'Sunset Dhow Cruise', category: 'Experiences',
      image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=400&q=80',
      status: 'draft', flagged: true,
      flagReason: 'Incomplete listing — missing description and pricing.',
    },
  ]
  
  export const VERIFICATION_SUBMISSIONS: VerificationSubmission[] = [
    {
      id: 'vs1', vendorId: 'pv3', vendorName: 'Kilimanjaro View Tours',
      docType: 'Business license', submittedDate: '18 Jul 2026', status: 'pending',
    },
    {
      id: 'vs2', vendorId: 'pv5', vendorName: 'Coastal Dhow Safaris',
      docType: 'Government ID', submittedDate: '15 Jul 2026', status: 'rejected',
    },
    {
      id: 'vs3', vendorId: 'pv2', vendorName: 'Savannah Tours',
      docType: 'Insurance certificate', submittedDate: '10 Jul 2026', status: 'approved',
    },
  ]
  
  export const PLATFORM_REVIEWS: PlatformReview[] = [
    {
      id: 'pr1', vendorId: 'pv1', vendorName: 'Mara Expeditions',
      listingTitle: 'Maasai Mara Premium Safari', guestName: 'Sarah Omondi',
      rating: 5, comment: 'Absolutely incredible experience. The guides were knowledgeable and patient.',
      date: 'April 2026', removed: false,
    },
    {
      id: 'pr2', vendorId: 'pv2', vendorName: 'Savannah Tours',
      listingTitle: 'Serengeti Plains Day Trip', guestName: 'Tom Baker',
      rating: 1, comment: 'This vendor is a SCAM, contact me directly at tom@email.com for a refund outside the app!!!',
      date: 'June 2026', removed: false,
    },
    {
      id: 'pr3', vendorId: 'pv4', vendorName: 'Rift Valley Adventures',
      listingTitle: 'Lake Nakuru Budget Tour', guestName: 'Linda Kim',
      rating: 2, comment: 'Vehicle broke down twice during the trip, felt unsafe.',
      date: 'May 2026', removed: false,
    },
  ]
  
  export const DISPUTES: Dispute[] = [
    {
      id: 'd1', bookingRef: 'BK-4821', vendorName: 'Mara Expeditions', guestName: 'David Omondi',
      amount: 8500, reason: 'Guest cancelled 2 hours before pickup, requesting partial refund.',
      status: 'open', date: '17 Jul 2026',
    },
    {
      id: 'd2', bookingRef: 'BK-4790', vendorName: 'Savannah Tours', guestName: 'Amina Yusuf',
      amount: 15000, reason: 'Tour shortened by half a day due to weather; guest requests partial refund.',
      status: 'auto_approved', date: '12 Jul 2026',
    },
    {
      id: 'd3', bookingRef: 'BK-4655', vendorName: 'Rift Valley Adventures', guestName: 'Peter Wanyama',
      amount: 45000, reason: 'Guest reports vehicle breakdown ended the trip early, requesting full refund.',
      status: 'escalated', date: '5 Jul 2026',
    },
  ]
  
  export const AUDIT_LOG: AuditLogEntry[] = [
    { id: 'al1', adminId: 'admin@erranza.com', action: 'Approved verification', target: 'Savannah Tours', timestamp: '2026-07-10T09:00:00' },
    { id: 'al2', adminId: 'admin@erranza.com', action: 'Suspended listing', target: 'Fake Balloon Rides', timestamp: '2026-07-08T14:30:00' },
  ]
  
  export function logAction(adminId: string, action: string, target: string) {
    AUDIT_LOG.unshift({
      id: `al_${Date.now()}`,
      adminId,
      action,
      target,
      timestamp: new Date().toISOString(),
    })
  }
  

  //Super Admin 
  export type PlatformAdmin = {
    id: string
    name: string
    email: string
    role: 'admin' | 'super_admin'
    addedDate: string
    revoked: boolean
  }
  
  export type PlatformTraveller = {
    id: string
    name: string
    email: string
    joinedDate: string
    tripCount: number
    suspended: boolean
    suspendReason?: string
  }
  
  export type PlatformConfig = {
    commissionStandard: number
    commissionPlus: number
    plusPriceMonthly: number
    categories: string[]
    defaultCancellationPolicy: 'flexible' | 'moderate' | 'strict'
    disputeCeiling: number
    maintenanceMode: boolean
    maintenanceMessage: string
  }
  
  export type PaymentConfig = {
    paystackPublicKey: string
    paystackSecretKey: string
    flutterwaveKey: string
    mpesaShortcode: string
    mpesaPasskey: string
  }
  
  export type VendorPayout = {
    vendorId: string
    vendorName: string
    totalEarned: number
    commissionCollected: number
    netPayout: number
  }
  
  export const PLATFORM_ADMINS: PlatformAdmin[] = [
    { id: 'pa1', name: 'Grace Njoroge', email: 'admin@erranza.com', role: 'admin', addedDate: '2 Jun 2026', revoked: false },
    { id: 'pa2', name: 'Brian Otieno', email: 'brian.otieno@erranza.com', role: 'admin', addedDate: '14 Jun 2026', revoked: false },
  ]
  
  export const PLATFORM_TRAVELLERS: PlatformTraveller[] = [
    { id: 'pt1', name: 'Sarah Omondi', email: 'sarah.omondi@gmail.com', joinedDate: '3 Jan 2026', tripCount: 3, suspended: false },
    { id: 'pt2', name: 'Mark Gillet', email: 'mark.gillet@gmail.com', joinedDate: '20 Feb 2026', tripCount: 1, suspended: false },
    { id: 'pt3', name: 'Tom Baker', email: 'tom.baker@gmail.com', joinedDate: '11 May 2026', tripCount: 1, suspended: false },
  ]
  
  export const PLATFORM_CONFIG: PlatformConfig = {
    commissionStandard: 12,
    commissionPlus: 8,
    plusPriceMonthly: 2500,
    categories: ['Safari', 'Stays', 'Experiences', 'Packages'],
    defaultCancellationPolicy: 'moderate',
    disputeCeiling: 20000,
    maintenanceMode: false,
    maintenanceMessage: '',
  }
  
  export const PAYMENT_CONFIG: PaymentConfig = {
    paystackPublicKey: 'pk_test_51Hxxxxxxxxxxxxxxxxxxxxxxxx',
    paystackSecretKey: 'sk_test_51Hxxxxxxxxxxxxxxxxxxxxxxxx',
    flutterwaveKey: 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxx',
    mpesaShortcode: '174379',
    mpesaPasskey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  }
  
  export const VENDOR_PAYOUTS: VendorPayout[] = [
    { vendorId: 'pv1', vendorName: 'Mara Expeditions', totalEarned: 1080000, commissionCollected: 129600, netPayout: 950400 },
    { vendorId: 'pv2', vendorName: 'Savannah Tours', totalEarned: 640000, commissionCollected: 76800, netPayout: 563200 },
    { vendorId: 'pv3', vendorName: 'Kilimanjaro View Tours', totalEarned: 210000, commissionCollected: 25200, netPayout: 184800 },
    { vendorId: 'pv4', vendorName: 'Rift Valley Adventures', totalEarned: 95000, commissionCollected: 11400, netPayout: 83600 },
    { vendorId: 'pv5', vendorName: 'Coastal Dhow Safaris', totalEarned: 0, commissionCollected: 0, netPayout: 0 },
  ]
  
  export const PLATFORM_MONTHLY_REVENUE: { month: string; amount: number }[] = [
    { month: 'Jan', amount: 620000 },
    { month: 'Feb', amount: 780000 },
    { month: 'Mar', amount: 690000 },
    { month: 'Apr', amount: 910000 },
    { month: 'May', amount: 1050000 },
    { month: 'Jun', amount: 980000 },
    { month: 'Jul', amount: 1120000 },
  ]
  