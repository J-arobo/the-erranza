'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type ApiListing = { id: number; title: string; price: string; category: string }
type ApiListingDetail = ApiListing & {
  min_guests: number | null
  max_guests: number | null
  unavailable_dates: { start: string; end: string }[]
}

// Traveller search
type ApiTraveller = { id: number; name: string; email: string }

const CATEGORIES = ['All', 'Safari', 'Stays', 'Experiences', 'Packages']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type DateRange = { start: Date; end: Date }

function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
function parseUnavailable(ranges: { start: string; end: string }[]): DateRange[] {
  return ranges.map(r => ({ start: new Date(r.start + 'T00:00:00'), end: new Date(r.end + 'T00:00:00') }))
}
function isDateBlocked(date: Date, ranges: DateRange[]): boolean {
  return ranges.some(r => date >= r.start && date < r.end)
}

// ── Same range-picker used on the traveller-facing booking pages (Stays,
// Safari, Packages each keep their own local copy — this mirrors that
// pattern rather than introducing a new shared component). ──
function BookMonthGrid({ year, month, checkIn, checkOut, onSelect, hideLabel, disabledRanges }: {
  year: number; month: number; checkIn: Date | null; checkOut: Date | null; onSelect: (d: Date) => void; hideLabel?: boolean; disabledRanges: DateRange[]
}) {
  const today = new Date()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isPast = (d: number) => new Date(year, month, d) < todayMid
  const isBlocked = (d: number) => isDateBlocked(new Date(year, month, d), disabledRanges)
  const isStart = (d: number) => checkIn?.toDateString() === new Date(year, month, d).toDateString()
  const isEnd = (d: number) => checkOut?.toDateString() === new Date(year, month, d).toDateString()
  const isInRange = (d: number) => { if (!checkIn || !checkOut) return false; const date = new Date(year, month, d); return date > checkIn && date < checkOut }
  const stripBg = '#e8f0d4'
  return (
    <div>
      {!hideLabel && (
        <p className="text-center font-bold text-[#1a1a1a] mb-3" style={{ fontSize: 15 }}>{MONTHS[month]} {year}</p>
      )}
      <div className="grid grid-cols-7 mb-1">
        {WDAYS.map((d, i) => <div key={i} className="text-center py-1" style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af' }}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7" style={{ rowGap: 2 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const past = isPast(d) || isBlocked(d), start = isStart(d), end = isEnd(d), inRange = isInRange(d)
          const hasRange = !!(checkIn && checkOut)
          const inStrip = hasRange && (inRange || start || end)
          const col = i % 7
          const prevInStrip = d > 1 && hasRange && (() => { const p = new Date(year, month, d - 1); return p >= checkIn! && p <= checkOut! })()
          const nextInStrip = hasRange && (() => { const n = new Date(year, month, d + 1); if (n.getMonth() !== month) return false; return n >= checkIn! && n <= checkOut! })()
          const roundLeft = inStrip && (!prevInStrip || col === 0)
          const roundRight = inStrip && (!nextInStrip || col === 6)
          return (
            <div key={i} style={{
              height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: inStrip ? stripBg : 'transparent',
              borderRadius: inStrip ? `${roundLeft ? 20 : 0}px ${roundRight ? 20 : 0}px ${roundRight ? 20 : 0}px ${roundLeft ? 20 : 0}px` : 0,
              ...(start && !end && hasRange ? { background: `linear-gradient(to right, transparent 50%, ${stripBg} 50%)`, borderRadius: 0 } : {}),
              ...(end && !start && hasRange ? { background: `linear-gradient(to left, transparent 50%, ${stripBg} 50%)`, borderRadius: 0 } : {}),
              ...(start && end ? { background: 'transparent', borderRadius: 0 } : {}),
            }}>
              <button disabled={past} onClick={() => !past && onSelect(new Date(year, month, d))}
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: start || end ? 700 : 400, background: start || end ? '#1a1a1a' : 'transparent',
                  color: start || end ? '#fff' : past ? '#d1d5db' : '#1a1a1a', cursor: past ? 'not-allowed' : 'pointer',
                  flexShrink: 0, WebkitTapHighlightColor: 'transparent', position: 'relative', zIndex: 1
                }}>
                {d}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BookCalendar({ checkIn, checkOut, onSelect, disabledRanges }: {
  checkIn: Date | null; checkOut: Date | null; onSelect: (d: Date) => void; disabledRanges: DateRange[]
}) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  function goBack() { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  function goFwd() { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button onClick={goBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 focus:outline-none">
          <ChevronLeft size={14} color="#1a1a1a" />
        </button>
        <span className="text-sm font-bold text-[#1a1a1a]">{MONTHS[month]} {year}</span>
        <button onClick={goFwd} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 focus:outline-none">
          <ChevronRight size={14} color="#1a1a1a" />
        </button>
      </div>
      <BookMonthGrid year={year} month={month} checkIn={checkIn} checkOut={checkOut} onSelect={onSelect} hideLabel disabledRanges={disabledRanges} />
    </div>
  )
}

export default function AdminNewBookingPage() {
  const router = useRouter()
  const [category, setCategory] = useState('All')
  const [listingQuery, setListingQuery] = useState('')
  const [listings, setListings] = useState<ApiListing[]>([])
  const [listingId, setListingId] = useState<number | null>(null)
  const [selectedListing, setSelectedListing] = useState<ApiListing | null>(null)
  const [listingDetail, setListingDetail] = useState<ApiListingDetail | null>(null)

  const [guests, setGuests] = useState('1')
  const [checkIn, setCheckIn] = useState<Date | null>(null)
  const [checkOut, setCheckOut] = useState<Date | null>(null)
  const [total, setTotal] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  const [travellerMode, setTravellerMode] = useState<'existing' | 'new'>('new')
  const [travellerId, setTravellerId] = useState('')
  const [travellerName, setTravellerName] = useState('')
  const [travellerEmail, setTravellerEmail] = useState('')
  const [travellerPhone, setTravellerPhone] = useState('')

  // Company/Business Booking
  const [bookingFor, setBookingFor] = useState<'individual' | 'company'>('individual')
  const [companyName, setCompanyName] = useState('')
  const [companyTaxPin, setCompanyTaxPin] = useState('')
  const [billingEmail, setBillingEmail] = useState('')

  const [paymentMethod, setPaymentMethod] = useState<'mark_paid' | 'invoice'>('invoice')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ paymentLink?: string } | null>(null)
  // Traveller Search
  const [travellerQuery, setTravellerQuery] = useState('')
  const [travellerResults, setTravellerResults] = useState<ApiTraveller[]>([])
  const [selectedTraveller, setSelectedTraveller] = useState<ApiTraveller | null>(null)

  useEffect(() => {
    if (!listingQuery.trim() || listingId) { setListings([]); return }
    const handle = setTimeout(() => {
      const params = new URLSearchParams({ search: listingQuery })
      if (category !== 'All') params.set('category', category)
      apiFetch<{ listings: ApiListing[] }>(`/admin/listings?${params.toString()}`)
        .then(({ listings }) => setListings(listings))
        .catch((err) => setError(apiErrorMessage(err)))
    }, 300)
    return () => clearTimeout(handle)
  }, [listingQuery, listingId, category])

  function selectListing(l: ApiListing) {
    setListingId(l.id)
    setSelectedListing(l)
    setListingQuery('')
    setListings([])
    setCheckIn(null)
    setCheckOut(null)
    apiFetch<{ listing: ApiListingDetail }>(`/listings/${l.id}`)
      .then(({ listing }) => setListingDetail(listing))
      .catch((err) => setError(apiErrorMessage(err)))
  }
  function clearListing() {
    setListingId(null)
    setSelectedListing(null)
    setListingDetail(null)
    setCheckIn(null)
    setCheckOut(null)
  }

  function handleDateSelect(d: Date) {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(d)
      setCheckOut(null)
    } else if (d > checkIn) {
      setCheckOut(d)
    } else {
      setCheckIn(d)
    }
  }

  // Auto-computed total — still editable, for negotiated/custom amounts.
  useEffect(() => {
    if (!listingDetail) return
    const nights = listingDetail.category === 'Stays' && checkIn && checkOut
      ? Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000))
      : 1
    const computed = Number(listingDetail.price) * (Number(guests) || 1) * nights
    setTotal(String(Math.round(computed)))
  }, [listingDetail, guests, checkIn, checkOut])

  // Traveller Search
  useEffect(() => {
    if (!travellerQuery.trim() || selectedTraveller) { setTravellerResults([]); return }
    const handle = setTimeout(() => {
      apiFetch<{ users: ApiTraveller[] }>(`/admin/travellers?search=${encodeURIComponent(travellerQuery)}`)
        .then(({ users }) => setTravellerResults(users))
        .catch((err) => setError(apiErrorMessage(err)))
    }, 300)
    return () => clearTimeout(handle)
  }, [travellerQuery, selectedTraveller])

  function selectTraveller(u: ApiTraveller) {
    setSelectedTraveller(u)
    setTravellerId(String(u.id))
    setTravellerQuery('')
    setTravellerResults([])
  }
  function clearTraveller() {
    setSelectedTraveller(null)
    setTravellerId('')
  }

  const disabledRanges = listingDetail ? parseUnavailable(listingDetail.unavailable_dates) : []

  async function submit() {
    if (!listingId || !guests || !total) return

    setSubmitting(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        listing_id: listingId,
        guests: Number(guests),
        check_in: checkIn ? toDateStr(checkIn) : null,
        check_out: checkOut ? toDateStr(checkOut) : null,
        total: Number(total),
        special_requests: specialRequests.trim() || null,
        payment_method: paymentMethod,
      }
      if (bookingFor === 'company') {
        body.company_name = companyName.trim() || null
        body.company_tax_pin = companyTaxPin.trim() || null
        body.billing_email = billingEmail.trim() || null
      }
      if (travellerMode === 'existing') {
        body.traveller_id = Number(travellerId)
      } else {
        body.traveller_name = travellerName.trim()
        body.traveller_email = travellerEmail.trim()
        body.traveller_phone = travellerPhone.trim() || null
      }

      const res = await apiFetch<{ payment_link?: string }>('/admin/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setResult({ paymentLink: res.payment_link })
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="p-5 lg:p-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-3">Booking created</h1>
        {result.paymentLink ? (
          <>
            <p className="text-sm text-gray-500 mb-3">An invoice email has been sent. You can also share this link directly:</p>
            <div className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm break-all">{result.paymentLink}</div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Marked as paid — no invoice needed.</p>
        )}
        <button onClick={() => router.push('/admin/bookings/new')}
          className="mt-5 text-sm font-semibold text-[#2c4a1e] underline">
          Create another booking
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Create a booking</h1>

      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Category</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => { setCategory(c); clearListing() }}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all focus:outline-none
                              ${category === c ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200 hover:border-[#2c4a1e]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Listing</label>
          {selectedListing ? (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-[#2c4a1e] bg-[#eaf5e4]">
              <span className="text-sm font-semibold text-[#1a1a1a]">
                {selectedListing.title} — Ksh {Number(selectedListing.price).toLocaleString()}
              </span>
              <button onClick={clearListing} className="text-xs font-semibold text-[#2c4a1e] underline flex-shrink-0">
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input value={listingQuery} onChange={(e) => setListingQuery(e.target.value)}
                placeholder="Search listing title..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
              {listings.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200
                                rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {listings.map((l) => (
                    <button key={l.id} onClick={() => selectListing(l)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#eaf5e4] transition-colors">
                      {l.title} — Ksh {Number(l.price).toLocaleString()} <span className="text-gray-400">· {l.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Traveller</label>
          <div className="flex gap-2 mb-2">
            <button onClick={() => { setTravellerMode('new'); clearTraveller() }}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${travellerMode === 'new' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200'}`}>
              New guest
            </button>
            <button onClick={() => setTravellerMode('existing')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${travellerMode === 'existing' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200'}`}>
              Existing traveller
            </button>
          </div>
          {travellerMode === 'new' ? (
            <div className="flex flex-col gap-2">
              <input value={travellerName} onChange={(e) => setTravellerName(e.target.value)} placeholder="Full name"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
              <input value={travellerEmail} onChange={(e) => setTravellerEmail(e.target.value)} placeholder="Email"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
              <input value={travellerPhone} onChange={(e) => setTravellerPhone(e.target.value)} placeholder="Phone (optional)"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
            </div>
          ) : selectedTraveller ? (
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-[#2c4a1e] bg-[#eaf5e4]">
              <span className="text-sm font-semibold text-[#1a1a1a]">
                {selectedTraveller.name} — {selectedTraveller.email}
              </span>
              <button onClick={clearTraveller} className="text-xs font-semibold text-[#2c4a1e] underline flex-shrink-0">
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input value={travellerQuery} onChange={(e) => setTravellerQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
              {travellerResults.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200
                                rounded-xl shadow-lg max-h-64 overflow-y-auto">
                  {travellerResults.map((u) => (
                    <button key={u.id} onClick={() => selectTraveller(u)}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#eaf5e4] transition-colors">
                      {u.name} <span className="text-gray-400">· {u.email}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Company booking */}
        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Booking for</label>
          <div className="flex gap-2 mb-2">
            <button onClick={() => setBookingFor('individual')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${bookingFor === 'individual' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200'}`}>
              Individual
            </button>
            <button onClick={() => setBookingFor('company')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${bookingFor === 'company' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200'}`}>
              Company / organization
            </button>
          </div>
          {bookingFor === 'company' && (
            <div className="flex flex-col gap-2">
              <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Company name"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
              <input value={companyTaxPin} onChange={(e) => setCompanyTaxPin(e.target.value.toUpperCase())} placeholder="KRA PIN (optional)"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
              <input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="Billing email (optional, defaults to traveller email)"
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
            </div>
          )}
        </div>



        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Guests</label>
            <input value={guests} onChange={(e) => setGuests(e.target.value)} type="number" min="1"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Total (Ksh)</label>
            <input value={total} onChange={(e) => setTotal(e.target.value)} type="number" min="0"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e]" />
            {listingDetail && (
              <p className="text-xs text-gray-400 mt-1">Auto-filled from listing price — edit if the deal is different.</p>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Dates</label>
          {!listingId ? (
            <p className="text-xs text-gray-400">Select a listing first to see its availability.</p>
          ) : (
            <>
              <p className="text-sm text-[#1a1a1a] mb-2">
                {checkIn ? toDateStr(checkIn) : 'Select check-in'} → {checkOut ? toDateStr(checkOut) : 'Select check-out'}
                {(checkIn || checkOut) && (
                  <button onClick={() => { setCheckIn(null); setCheckOut(null) }} className="ml-2 text-xs text-red-500 underline">
                    Clear
                  </button>
                )}
              </p>
              <div className="border border-gray-200 rounded-xl p-4">
                <BookCalendar checkIn={checkIn} checkOut={checkOut} onSelect={handleDateSelect} disabledRanges={disabledRanges} />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Payment</label>
          <div className="flex gap-2">
            <button onClick={() => setPaymentMethod('invoice')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${paymentMethod === 'invoice' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200'}`}>
              Send invoice link
            </button>
            <button onClick={() => setPaymentMethod('mark_paid')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${paymentMethod === 'mark_paid' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'border-gray-200'}`}>
              Mark as already paid
            </button>
          </div>
        </div>

        {error && <div className="px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

        <button onClick={submit} disabled={submitting || !listingId || !total}
          className="bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#3d6b28] disabled:opacity-50">
          {submitting ? 'Creating…' : 'Create booking'}
        </button>

        {listingId && !total && (
          <p className="text-xs text-red-500 -mt-3">Enter a total before creating the booking.</p>
        )}
      </div>
    </div>
  )
}