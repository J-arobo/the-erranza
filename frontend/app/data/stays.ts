export type Vendor = {
  id: string
  name: string
  description: string
  price: string
  rating: number
  image: string
  reviews: number
  // fields for details page
  yearsTouring?: number
  responseRate?: number
  responseTime?: string
  amenities?: string[]
  features?: { icon: string; title: string; description: string }[]
  lat?: number
  lng?: number
  locationLabel?: string
  availability?: string
}

export type Listing = {
  id: string
  location: string
  title: string
  price: string
  rating: number
  image: string
  badge?: string
  // Detail page extras
  images?: string[]
  description?: string
  vendors?: Vendor[]
  packageIncludes?: string[]
  flightFrom?: string
}

export const stays: Listing[] = [
  {
    id: '1',
    location: 'Nairobi',
    title: 'Cosy 1-bed apt',
    price: 'Ksh 8,500',
    rating: 4.97,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80',
  },
  {
    id: '2',
    location: 'Diani Beach',
    title: 'Ocean view villa',
    price: 'Ksh 12,000',
    rating: 4.94,
    image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400&q=80',
  },
  {
    id: '3',
    location: 'Mombasa',
    title: 'Beachfront stay',
    price: 'Ksh 9,800',
    rating: 4.66,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80',
  },
  {
    id: '4',
    location: 'Westlands, Nairobi',
    title: 'Loft in Westlands',
    price: 'Ksh 11,000',
    rating: 4.78,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80',
    badge: 'Guest favourite',
  },
  {
    id: '5',
    location: 'Karen, Nairobi',
    title: 'Garden cottage',
    price: 'Ksh 7,500',
    rating: 4.85,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=400&q=80',
  },
  {
    id: '6',
    location: 'Malindi',
    title: 'Seafront bungalow',
    price: 'Ksh 14,000',
    rating: 4.92,
    image: 'https://images.unsplash.com/photo-1582610116397-edb72a8b8a6a?w=400&q=80',
    badge: 'Popular',
  },
  {
    id: '7',
    location: 'Naivasha',
    title: 'Lakeside cabin',
    price: 'Ksh 9,200',
    rating: 4.88,
    image: 'https://images.unsplash.com/photo-1521401830884-6c03c1c87ebb?w=400&q=80',
  },
  {
    id: '8',
    location: 'Nairobi',
    title: 'Cosy 1-bed apt',
    price: 'Ksh 10,500',
    rating: 4.77,
    image: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=400&q=80',
  },
  {
    id: '9',
    location: 'Mombasa',
    title: '2 floors Bungalow',
    price: 'Ksh 15,500',
    rating: 4.99,
    image: 'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=400&q=80',
  },
  {
    id: '10',
    location: 'Lavington, Nairobi',
    title: 'Standalone Cottage',
    price: 'Ksh 19,500',
    rating: 4.99,
    image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=400&q=80',
  },
  {
    id: '11',
    location: 'Laikipia',
    title: 'Wooden House',
    price: 'Ksh 21,500',
    rating: 4.90,
    image: 'https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=400&q=80',
  },
  {
    id: '12',
    location: 'Kilifi, Mombasa',
    title: 'Excluded Nature',
    price: 'Ksh 165,500',
    rating: 4.79,
    image: 'https://images.unsplash.com/photo-1589419896452-b460b8b390a3?w=400&q=80',
  },
  {
    id: '13',
    location: 'Limuru, Nairobi',
    title: 'Nature, in the middle of a river',
    price: 'Ksh 116,500',
    rating: 4.99,
    image: 'https://images.unsplash.com/photo-1644027622521-d0ca669c40d7?w=400&q=80',
  },
  {
    id: '14',
    location: 'Nyeri',
    title: 'top floor beach house',
    price: 'Ksh 111,500',
    rating: 4.91,
    image: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=400&q=80',
  },

  {
    id: '15',
    location: 'Karen Bixen, Nairobi',
    title: 'Forest house',
    price: 'Ksh 157,500',
    rating: 4.79,
    image: 'https://images.unsplash.com/photo-1697807650304-907257330a3e?w=400&q=80',
  },{
    id: '16',
    location: 'Lamu Beach, Mombasa',
    title: 'Tiny cottage',
    price: 'Ksh 95,500',
    rating: 4.69,
    image: 'https://images.unsplash.com/photo-1647771167457-c82f4850bb7e?w=400&q=80',
  },
  {
    id: '17',
    location: 'Nairobi South',
    title: 'Lake house',
    price: 'Ksh 159,500',
    rating: 3.89,
    image: 'https://images.unsplash.com/photo-1659720879195-d5a108231648?w=400&q=80',
  },
  {
    id: '18',
    location: 'Kisumu',
    title: 'Estate house',
    price: 'Ksh 135,500',
    rating: 4.09,
    image: 'https://images.unsplash.com/photo-1563052081-6e3aff8a7e9c?w=400&q=80',
  },
  {
    id: '19',
    location: 'Mtwapa, Mombasa',
    title: 'Bungalow',
    price: 'Ksh 153,500',
    rating: 4.91,
    image: 'https://images.unsplash.com/photo-1529901863866-23b6145f394b?w=400&q=80',
  },{
    id: '20',
    location: 'Nairobi Central',
    title: 'Tree House',
    price: 'Ksh 155,500',
    rating: 4.95,
    image: 'https://images.unsplash.com/photo-1763128273975-eb0865b8cc08?w=400&q=80',
  },

  
]
