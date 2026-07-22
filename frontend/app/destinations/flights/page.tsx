'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Plane, Clock, ArrowRight } from 'lucide-react'
import AppShell from '@/components/AppShell'
import FooterSection from '@/components/FooterSection'
import HeartButton from '@/components/HeartButton'
import { flights } from '@/data/flights'

const FILTERS = ['All', 'Morning', 'Afternoon', 'Evening', 'Direct']

// Mock vendors per flight
const FLIGHT_VENDORS: Record<string, { name: string; logo: string; price: string; seats: number; duration: string; departure: string; arrival: string }[]> = {
  '1': [
    { name: 'Kenya Airways', logo: '🛫', price: 'Ksh 6,500', seats: 14, duration: '55 min', departure: '07:00', arrival: '07:55' },
    { name: 'Jambojet',      logo: '✈️', price: 'Ksh 5,200', seats: 8,  duration: '55 min', departure: '10:30', arrival: '11:25' },
    { name: 'Safarilink',    logo: '🛩️', price: 'Ksh 8,900', seats: 4,  duration: '45 min', departure: '14:00', arrival: '14:45' },
  ],
  '2': [
    { name: 'Kenya Airways', logo: '🛫', price: 'Ksh 5,800', seats: 20, duration: '1h 10m', departure: '06:30', arrival: '07:40' },
    { name: 'Jambojet',      logo: '✈️', price: 'Ksh 4,900', seats: 12, duration: '1h 10m', departure: '12:00', arrival: '13:10' },
  ],
  '3': [
    { name: 'Safarilink',    logo: '🛩️', price: 'Ksh 7,200', seats: 6,  duration: '1h 05m', departure: '08:00', arrival: '09:05' },
    { name: 'Kenya Airways', logo: '🛫', price: 'Ksh 8,500', seats: 18, duration: '1h 05m', departure: '16:00', arrival: '17:05' },
  ],
}

function getVendors(id: string) {
  return FLIGHT_VENDORS[id] ?? [
    { name: 'Kenya Airways', logo: '🛫', price: 'Ksh 7,000', seats: 10, duration: '1h', departure: '09:00', arrival: '10:00' },
    { name: 'Jambojet',      logo: '✈️', price: 'Ksh 5,500', seats: 8,  duration: '1h', departure: '14:00', arrival: '15:00' },
  ]
}

export default function FlightsPage() {
  const router = useRouter()
  const [activeFilter, setFilter] = useState('All')
  const [search, setSearch]       = useState('')
  const [expanded, setExpanded]   = useState<string | null>(null)

  const filtered = flights.filter(f =>
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    f.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppShell showCollapse={false}>
      <div className="bg-[#faf8f1] min-h-full">

        <div className="px-4 sm:px-6 pt-5 pb-3">
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Flights</h1>
          <p className="text-sm text-gray-500">Domestic flights across Kenya</p>
        </div>

        <div className="flex gap-2 px-4 sm:px-6 pb-4 overflow-x-auto scrollbar-hide">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
                          border transition-all
                ${activeFilter === f
                  ? 'bg-[#0d3550] text-white border-[#0d3550]'
                  : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Flight cards */}
        <div className="px-4 sm:px-6 pb-6 flex flex-col gap-4">
          {filtered.map((flight) => {
            const vendors = getVendors(flight.id)
            const isExpanded = expanded === flight.id

            return (
              <div key={flight.id}
                className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm overflow-hidden
                           shadow-sm">

                {/* Flight header */}
                <div className="flex gap-4 p-4">
                  <div className="relative w-[90px] h-[90px] rounded-xl overflow-hidden
                                  bg-[#e0d9cc] flex-shrink-0">
                    <Image src={flight.image} alt={flight.title} fill
                      sizes="90px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] text-gray-400 mb-0.5">{flight.location}</p>
                        <p className="text-[14px] font-bold text-[#1a1a1a]">{flight.title}</p>
                      </div>
                      <HeartButton listing={flight} size={22} />
                    </div>

                    {/* Route visual */}
                    <div className="flex items-center gap-2 my-2">
                      <div className="flex items-center gap-1">
                        <Plane size={12} color="#0d3550" />
                        <span className="text-[11px] font-semibold text-[#0d3550]">NBO</span>
                      </div>
                      <div className="flex-1 border-t border-dashed border-gray-300 relative">
                        <ArrowRight size={10} color="#aaa"
                          className="absolute -right-1 -top-1.5" />
                      </div>
                      <span className="text-[11px] font-semibold text-[#0d3550]">
                        {flight.location.split(' ')[0].toUpperCase().slice(0, 3)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-[#1a1a1a]">
                        from <span className="font-bold">{flight.price}</span>
                      </p>
                      <button
                        onClick={() => setExpanded(isExpanded ? null : flight.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full
                                    transition-all
                          ${isExpanded
                            ? 'bg-gray-100 text-gray-600'
                            : 'bg-[#0d3550] text-white'}`}>
                        {isExpanded ? 'Hide' : `${vendors.length} options`}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vendor options — expandable */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {vendors.map((v, i) => (
                      <div key={i}
                        className={`flex items-center gap-4 px-4 py-3
                          ${i < vendors.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="text-2xl flex-shrink-0">{v.logo}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1a1a1a]">{v.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <div className="flex items-center gap-1">
                              <Clock size={10} color="#888" />
                              <span className="text-[11px] text-gray-400">{v.duration}</span>
                            </div>
                            <span className="text-[11px] text-gray-400">
                              {v.departure} – {v.arrival}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {v.seats} seats left
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-bold text-[#1a1a1a]">{v.price}</p>
                          <button
                            onClick={() => router.push(`/listings/${flight.id}/vendor/v${i + 1}/book`)}
                            className="mt-1 text-xs font-semibold bg-[#0d3550] text-white
                                       px-3 py-1.5 rounded-xl hover:bg-[#1a5c7a]
                                       transition-colors">
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <FooterSection />
      </div>
    </AppShell>
  )
}