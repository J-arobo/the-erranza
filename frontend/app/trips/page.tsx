'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Calendar, ChevronRight, MapPin, Users } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import AppShell from '@/components/AppShell'

const STATUS_STYLES = {
  upcoming:  { bg: 'bg-[#eaf5e4]', text: 'text-[#2c4a1e]', label: 'Upcoming' },
  completed: { bg: 'bg-gray-100',  text: 'text-gray-500',   label: 'Completed' },
  cancelled: { bg: 'bg-red-50',    text: 'text-red-500',    label: 'Cancelled' },
}

export default function TripsPage() {
  const { isLoggedIn, trips } = useAuth()
  const router = useRouter()

  return (
    <AppShell showCollapse={false}>
      <div className="px-5 sm:px-8 lg:px-12 pt-8 pb-32 min-h-full bg-[#f5f0e8]">

        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2">Trips</h1>

        {!isLoggedIn ? (
          <div className="mt-4">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
              Log in to view your trips
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Once you've booked a tour or stay, it will appear here.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-[#2c4a1e] text-white px-6 py-3 rounded-xl font-semibold
                         text-sm hover:bg-[#3d6b28] transition-colors"
            >
              Log in
            </button>
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#e8f0e0] flex items-center
                            justify-center">
              <Calendar size={28} color="#2c4a1e" />
            </div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">No trips yet</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              When you book a safari, stay or experience, it will appear here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-2 border border-[#1a1a1a] text-[#1a1a1a] px-6 py-3
                         rounded-xl font-semibold text-sm hover:bg-[#f0ece4] transition-colors"
            >
              Start exploring
            </button>
          </div>
        ) : (
          <>
            {/* Upcoming */}
            {trips.filter(t => t.status === 'upcoming').length > 0 && (
              <div className="mb-6">
                <h2 className="text-base font-bold text-[#1a1a1a] mb-3">Upcoming</h2>
                <div className="flex flex-col gap-3">
                  {trips
                    .filter(t => t.status === 'upcoming')
                    .map(trip => (
                      <TripCard key={trip.id} trip={trip} router={router} />
                    ))}
                </div>
              </div>
            )}

            {/* Past trips */}
            {trips.filter(t => t.status !== 'upcoming').length > 0 && (
              <div>
                <h2 className="text-base font-bold text-[#1a1a1a] mb-3">Past trips</h2>
                <div className="flex flex-col gap-3">
                  {trips
                    .filter(t => t.status !== 'upcoming')
                    .map(trip => (
                      <TripCard key={trip.id} trip={trip} router={router} />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}

function TripCard({ trip, router }: { trip: any; router: any }) {
  const style = STATUS_STYLES[trip.status as keyof typeof STATUS_STYLES]

  return (
    <div
      onClick={() => router.push(`/listings/${trip.listingId}/vendor/${trip.vendorId}`)}
      className="bg-white rounded-2xl overflow-hidden border border-[#e0d9cc]
                 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
    >
      <div className="flex gap-4 p-4">
        <div className="relative w-[90px] h-[90px] rounded-xl overflow-hidden
                        flex-shrink-0 bg-[#e0d9cc]">
          <Image src={trip.image} alt={trip.listingTitle} fill
            sizes="90px" className="object-cover" />
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-center gap-1">
          {/* Status badge */}
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full
                            w-fit ${style.bg} ${style.text}`}>
            {style.label}
          </span>
          <p className="text-[14px] font-bold text-[#1a1a1a] leading-snug truncate">
            {trip.listingTitle}
          </p>
          <p className="text-[12px] text-gray-500">{trip.vendorName}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex items-center gap-1">
              <Calendar size={11} color="#888" />
              <span className="text-[11px] text-gray-400">{trip.dates}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={11} color="#888" />
              <span className="text-[11px] text-gray-400">
                {trip.guests} guest{trip.guests > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <p className="text-[12px] font-semibold text-[#2c4a1e] mt-0.5">{trip.price}</p>
        </div>
        <ChevronRight size={16} color="#aaa" className="self-center flex-shrink-0" />
      </div>

      {/* Actions for upcoming trips */}
      {trip.status === 'upcoming' && (
        <div className="flex border-t border-gray-100">
          <button className="flex-1 py-3 text-xs font-semibold text-[#1a1a1a]
                             hover:bg-gray-50 transition-colors border-r border-gray-100">
            Manage booking
          </button>
          <button className="flex-1 py-3 text-xs font-semibold text-[#1a1a1a]
                             hover:bg-gray-50 transition-colors">
            Message host
          </button>
        </div>
      )}

      {/* Review for completed trips */}
      {trip.status === 'completed' && (
        <div className="border-t border-gray-100">
          <button className="w-full py-3 text-xs font-semibold text-[#2c4a1e]
                             hover:bg-gray-50 transition-colors">
            Leave a review ★
          </button>
        </div>
      )}
    </div>
  )
}