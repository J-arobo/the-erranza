'use client'
import { useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import ListingCard from '@/components/ListingCard'
import BottomNav from '@/components/BottomNav'

export default function WishlistsPage() {
  const { isLoggedIn, wishlists } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 sm:px-8 lg:px-12 pt-8 pb-32">

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-6">
          Wishlists
        </h1>

        {/* Not logged in */}
        {!isLoggedIn && (
          <div className="mt-2">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
              Log in to view your wishlists
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              You can create, view, or edit wishlists once you've logged in.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-[#2c4a1e] text-white px-6 py-3 rounded-xl
                         font-semibold text-sm hover:bg-[#3d6b28] transition-colors"
            >
              Log in
            </button>
          </div>
        )}

        {/* Logged in — empty */}
        {isLoggedIn && wishlists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#e8f0e0] flex items-center
                            justify-center">
              <Heart size={28} color="#2c4a1e" />
            </div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">
              Create your first wishlist
            </h2>
            <p className="text-sm text-gray-500 max-w-xs">
              As you search, tap the ♡ heart icon on any listing to save it here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-2 border border-[#1a1a1a] text-[#1a1a1a] px-6 py-3
                         rounded-xl font-semibold text-sm hover:bg-[#f0ece4] transition-colors"
            >
              Start exploring
            </button>
          </div>
        )}

        {/* Logged in — has items */}
        {isLoggedIn && wishlists.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-5">
              {wishlists.length} saved {wishlists.length === 1 ? 'place' : 'places'}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-6">
              {wishlists.map((item) => (
                <ListingCard key={item.id} {...item} />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav active="Wishlists" onSelect={() => {}} scrollingDown={false} scrolled={false} />
    </div>
  )
}
