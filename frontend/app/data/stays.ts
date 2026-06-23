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
]