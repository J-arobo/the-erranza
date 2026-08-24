'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const STATUSES = ['All', 'pending', 'confirmed', 'completed', 'cancelled']

type ApiBooking = {
  id: number
  status: string
  guests: number
  total: string
  check_in: string | null
  check_out: string | null
  created_by_admin: boolean
  company_name: string | null
  listing: { id: number; title: string; vendor: { id: number; business_name: string } }
  traveller: { id: number; name: string; email: string }
  payments: { id: number; status: string; amount: string }[]
}

function formatKsh(v: string | number) {
  return `Ksh ${Math.round(Number(v)).toLocaleString()}`
}
function formatDate(v: string | null) {
  return v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}
function paymentStatus(payments: ApiBooking['payments']) {
  const latest = payments[payments.length - 1]
  return latest?.status ?? 'none'
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [status, setStatus] = useState('All')
  const [bookings, setBookings] = useState<ApiBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = status !== 'All' ? `?status=${status}` : ''
    apiFetch<{ data: ApiBooking[] }>(`/admin/bookings${params}`)
      .then((res) => setBookings(res.data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">Bookings</h1>
          <p className="text-sm text-gray-500">{bookings.length} shown</p>
        </div>
        <button onClick={() => router.push('/admin/bookings/new')}
          className="flex items-center gap-2 bg-[#2c4a1e] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#3d6b28] transition-colors">
          <Plus size={16} /> New booking
        </button>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="flex gap-2 mb-5 overflow-x-auto">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border capitalize transition-all focus:outline-none
              ${status === s ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">No bookings found.</div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((b) => {
            const payStatus = paymentStatus(b.payments)
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#1a1a1a] truncate">{b.listing.title}</p>
                    <p className="text-xs text-gray-400">{b.listing.vendor.business_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#1a1a1a]">{formatKsh(b.total)}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize
                      ${payStatus === 'paid' ? 'bg-[#eaf5e4] text-[#2c4a1e]' : payStatus === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                      {payStatus}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>
                    {b.company_name ? `${b.company_name} (via ${b.traveller.name})` : b.traveller.name}
                    {' · '}{b.guests} guest{b.guests > 1 ? 's' : ''}
                    {' · '}{formatDate(b.check_in)}{b.check_out ? ` – ${formatDate(b.check_out)}` : ''}
                  </span>
                  <span className={`font-semibold capitalize px-2 py-0.5 rounded-full
                    ${b.status === 'confirmed' ? 'bg-[#eaf5e4] text-[#2c4a1e]' : b.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                    {b.status}
                  </span>
                </div>
                {b.created_by_admin && (
                  <p className="text-[10px] text-gray-400 mt-2">Created by admin</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
