'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Heart, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import AppShell from '@/components/AppShell'

export default function WishlistsPage() {
  const { isLoggedIn, wishlists, removeFromWishlist } = useAuth()
  const router = useRouter()

  return (
    <AppShell showCollapse={false}>
      <div className="px-5 sm:px-8 lg:px-12 pt-8 pb-32 min-h-full bg-[#f5f0e8]">

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {wishlists.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-[#e0d9cc]
                             hover:shadow-md transition-all cursor-pointer group"
                >
                  <div
                    className="relative h-[180px] bg-[#e0d9cc]"
                    onClick={() => router.push(`/listings/${item.id}`)}
                  >
                    <Image
                      src={item.image} alt={item.title} fill
                      sizes="(max-width: 640px) 100vw, 300px"
                      className="object-cover transition-transform duration-300
                                 group-hover:scale-105"
                    />
                    {item.badge && (
                      <span className="absolute top-2 left-2 bg-white/90 text-[#1a1a1a]
                                       text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                        {item.badge}
                      </span>
                    )}
                    {/* Remove from wishlist */}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromWishlist(item.id) }}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full
                                 flex items-center justify-center hover:bg-white
                                 transition-colors active:scale-90"
                    >
                      <Heart size={14} color="#e63946" fill="#e63946" />
                    </button>
                  </div>

                  <div
                    className="p-3"
                    onClick={() => router.push(`/listings/${item.id}`)}
                  >
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">
                      {item.location}
                    </p>
                    <p className="text-[13px] font-semibold text-[#1a1a1a] leading-tight">
                      {item.title}
                    </p>
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[12px] text-[#1a1a1a] font-medium">
                        {item.price}
                      </span>
                      <span className="text-[11px] text-[#3d6b28] font-semibold">
                        ★ {item.rating}
                      </span>
                    </div>
                  </div>

                  <div className="px-3 pb-3">
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="flex items-center gap-1.5 text-xs text-gray-400
                                 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={11} />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}