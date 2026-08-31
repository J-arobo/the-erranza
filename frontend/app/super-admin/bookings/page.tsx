'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type ApiBooking = {
  id: number
  status: string
  total: string
  check_in: string | null
  check_out: string | null
  listing: { id: number; title: string; vendor: { business_name: string } }
  traveller: { id: number; name: string; email: string }
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-[#eaf5e4] text-[#2c4a1e]',
  cancelled: 'bg-red-50 text-red-600',
}

function formatDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
function formatKsh(v: string | number) {
  return `Ksh ${Math.round(Number(v)).toLocaleString()}`
}

export default function SuperAdminBookingsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setPage(1)
    const params = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
    const handle = setTimeout(() => {
      apiFetch<{ data: ApiBooking[]; current_page: number; last_page: number }>(`/super-admin/bookings${params}`)
        .then((res) => { setBookings(res.data); setLastPage(res.last_page) })
        .catch((err) => setError(apiErrorMessage(err)))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(handle)
  }, [search])

  function loadMore() {
    setLoadingMore(true)
    const nextPage = page + 1
    const params = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : ''
    apiFetch<{ data: ApiBooking[]; current_page: number; last_page: number }>(`/super-admin/bookings?page=${nextPage}${params}`)
      .then((res) => { setBookings(b => [...b, ...res.data]); setPage(res.current_page); setLastPage(res.last_page) })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoadingMore(false))
  }

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Booking tracker</h1>
      <p className="text-sm text-gray-500 mb-6">Track a booking's payment, completion, and payout status end to end.</p>

      <div className="flex items-center bg-white border border-gray-200 rounded-xl px-4 h-11 gap-2 mb-6">
        <Search size={16} color="#888" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by booking ID, traveller, or listing..."
          className="flex-1 text-sm outline-none" />
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#161616] border-t-transparent animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-16">No bookings found.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => (
            <button key={b.id} onClick={() => router.push(`/super-admin/bookings/${b.id}`)}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-left hover:shadow-md transition-all">
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-sm font-bold text-[#1a1a1a]">#{b.id} · {b.listing.title}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-500'}`}>
                  {b.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {b.traveller.name} · {b.listing.vendor.business_name} · {formatDate(b.check_in)} – {formatDate(b.check_out)} · {formatKsh(b.total)}
              </p>
            </button>
          ))}
        </div>
      )}

      {!loading && page < lastPage && (
        <button onClick={loadMore} disabled={loadingMore}
          className="w-full text-center text-sm font-semibold text-[#161616] py-3 mt-3 focus:outline-none disabled:opacity-50">
          {loadingMore ? 'Loading…' : 'Show more'}
        </button>
      )}
    </div>
  )
}
