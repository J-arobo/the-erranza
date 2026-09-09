'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Check, X } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type VendorListingSummary = {
  id: number
  title: string
  category: string
  price: string
  images: { url: string }[]
}

type ListingDetail = {
  id: number
  title: string
  category: string
  price: string
  min_guests: number | null
  max_guests: number | null
  departures: { id: number; date: string; capacity: number; booked: number }[]
  group_pricing_tiers: { id: number; people_count: number; total_price: string }[]
  duration_options: { id: number; label: string; price: string | null }[]
}

type TravellerHit = { id: number; name: string; email: string }

export default function VendorNewBookingPage() {
  const router = useRouter()

  const [listings, setListings] = useState<VendorListingSummary[]>([])
  const [listingSearch, setListingSearch] = useState('')
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null)
  const [listingDetail, setListingDetail] = useState<ListingDetail | null>(null)

  const [guests, setGuests] = useState('1')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [departureId, setDepartureId] = useState<number | null>(null)
  const [pricingMode, setPricingMode] = useState<'individual' | 'group'>('individual')
  const [groupTierId, setGroupTierId] = useState<number | null>(null)
  const [quotedTotal, setQuotedTotal] = useState<number | null>(null)
  const [quoting, setQuoting] = useState(false)

  const [travellerMode, setTravellerMode] = useState<'existing' | 'new'>('new')
  const [travellerSearch, setTravellerSearch] = useState('')
  const [travellerHits, setTravellerHits] = useState<TravellerHit[]>([])
  const [selectedTraveller, setSelectedTraveller] = useState<TravellerHit | null>(null)
  const [travellerName, setTravellerName] = useState('')
  const [travellerEmail, setTravellerEmail] = useState('')
  const [travellerPhone, setTravellerPhone] = useState('')

  const [isCompany, setIsCompany] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [companyTaxPin, setCompanyTaxPin] = useState('')
  const [billingEmail, setBillingEmail] = useState('')

  const [specialRequests, setSpecialRequests] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'mark_paid' | 'invoice'>('invoice')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ bookingId: number; paymentLink: string | null } | null>(null)

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    apiFetch<{ listings: VendorListingSummary[] }>('/vendor/listings')
      .then(({ listings }) => setListings(listings))
      .catch(() => { })
  }, [])

  useEffect(() => {
    if (!selectedListingId) { setListingDetail(null); return }
    apiFetch<{ listing: ListingDetail }>(`/vendor/listings/${selectedListingId}`)
      .then(({ listing }) => {
        setListingDetail(listing)
        setGuests(String(listing.min_guests || 1))
        setDepartureId(null)
        setPricingMode('individual')
        setGroupTierId(null)
        setCheckIn(''); setCheckOut('')
      })
      .catch(() => { })
  }, [selectedListingId])

  // Live quote — mirrors the traveller-facing flow so what's shown here
  // matches what the pricing engine will actually record.
  useEffect(() => {
    if (!listingDetail) return
    if (pricingMode === 'group' && !groupTierId) { setQuotedTotal(null); return }
    if (!departureId && !checkIn) { setQuotedTotal(null); return }

    const params: Record<string, unknown> = {
      guests: Number(guests) || 1,
      pricing_mode: pricingMode,
      group_tier_id: groupTierId,
    }
    if (departureId) params.departure_id = departureId
    else {
      params.check_in = checkIn
      if (checkOut) params.check_out = checkOut
    }

    let cancelled = false
    setQuoting(true)
    apiFetch<{ total: number }>(`/listings/${listingDetail.id}/quote`, {
      method: 'POST',
      body: JSON.stringify(params),
    })
      .then(({ total }) => { if (!cancelled) setQuotedTotal(total) })
      .catch(() => { if (!cancelled) setQuotedTotal(null) })
      .finally(() => { if (!cancelled) setQuoting(false) })
    return () => { cancelled = true }
  }, [listingDetail, guests, pricingMode, groupTierId, departureId, checkIn, checkOut])

  function handleTravellerSearchChange(value: string) {
    setTravellerSearch(value)
    setSelectedTraveller(null)
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    if (!value.trim()) { setTravellerHits([]); return }
    searchDebounce.current = setTimeout(() => {
      apiFetch<{ users: TravellerHit[] }>(`/vendor/travellers/search?search=${encodeURIComponent(value.trim())}`)
        .then(({ users }) => setTravellerHits(users))
        .catch(() => setTravellerHits([]))
    }, 300)
  }

  const filteredListings = listings.filter(l => l.title.toLowerCase().includes(listingSearch.toLowerCase()))
  const usesDepartures = (listingDetail?.departures.length ?? 0) > 0
  const upcomingDepartures = listingDetail
    ? listingDetail.departures.filter(d => d.date >= new Date().toISOString().slice(0, 10)).sort((a, b) => a.date.localeCompare(b.date))
    : []

  const canSubmit = !!listingDetail
    && quotedTotal !== null
    && (travellerMode === 'existing' ? !!selectedTraveller : (travellerName.trim() && travellerEmail.trim()))
    && (pricingMode === 'individual' ? (usesDepartures ? !!departureId : !!checkIn) : !!groupTierId)

  async function handleSubmit() {
    if (!canSubmit || !listingDetail) return
    setSubmitting(true)
    setError('')
    try {
      const body: Record<string, unknown> = {
        listing_id: listingDetail.id,
        guests: Number(guests) || 1,
        special_requests: specialRequests.trim() || null,
        payment_method: paymentMethod,
        pricing_mode: pricingMode,
      }
      if (pricingMode === 'group') {
        body.group_tier_id = groupTierId
      }
      if (departureId) {
        body.departure_id = departureId
      } else {
        body.check_in = checkIn
        if (checkOut) body.check_out = checkOut
      }
      if (travellerMode === 'existing' && selectedTraveller) {
        body.traveller_id = selectedTraveller.id
      } else {
        body.traveller_name = travellerName.trim()
        body.traveller_email = travellerEmail.trim()
        body.traveller_phone = travellerPhone.trim() || null
      }
      if (isCompany) {
        body.company_name = companyName.trim() || null
        body.company_tax_pin = companyTaxPin.trim() || null
        body.billing_email = billingEmail.trim() || null
      }

      const res = await apiFetch<{ booking: { id: number }; payment_link?: string }>('/vendor/bookings', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setResult({ bookingId: res.booking.id, paymentLink: res.payment_link ?? null })
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setResult(null)
    setSelectedListingId(null)
    setListingDetail(null)
    setListingSearch('')
    setGuests('1')
    setCheckIn(''); setCheckOut('')
    setDepartureId(null)
    setPricingMode('individual')
    setGroupTierId(null)
    setTravellerMode('new')
    setSelectedTraveller(null)
    setTravellerSearch(''); setTravellerHits([])
    setTravellerName(''); setTravellerEmail(''); setTravellerPhone('')
    setIsCompany(false)
    setCompanyName(''); setCompanyTaxPin(''); setBillingEmail('')
    setSpecialRequests('')
    setPaymentMethod('invoice')
  }

  const FIELD_CARD = 'bg-white border border-[#e0d9cc] rounded-2xl p-4 sm:p-5 shadow-sm'

  if (result) {
    return (
      <div className="p-5 lg:p-8 max-w-xl mx-auto text-center pt-16">
        <div className="w-14 h-14 rounded-full bg-[#eaf5e4] flex items-center justify-center mx-auto mb-4">
          <Check size={24} color="#2c4a1e" />
        </div>
        <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">Booking created</h1>
        {result.paymentLink ? (
          <>
            <p className="text-sm text-gray-500 mb-4">
              An invoice email has been sent to the traveller. You can also share this payment link directly:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1a1a1a] break-all mb-6">
              {result.paymentLink}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 mb-6">
            The booking has been marked as paid, and a receipt has been emailed to the traveller.
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push(`/vendor/bookings/${result.bookingId}`)}
            className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
            View booking
          </button>
          <button onClick={resetForm}
            className="px-5 py-3 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold hover:bg-[#3d6b28] transition-colors">
            Create another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.push('/vendor/bookings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to bookings
      </button>

      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">New booking</h1>
      <p className="text-sm text-gray-500 mb-6">Record a booking made outside the app — by phone, in person, or however a guest reached you.</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="flex flex-col gap-5">

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Listing</label>
          {!listingDetail ? (
            <>
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 h-10 mb-2">
                <Search size={14} color="#888" />
                <input value={listingSearch} onChange={(e) => setListingSearch(e.target.value)}
                  placeholder="Search your listings..."
                  className="flex-1 text-sm bg-transparent outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {filteredListings.map((l) => (
                  <button key={l.id} type="button" onClick={() => setSelectedListingId(l.id)}
                    className="flex items-center gap-3 p-2 rounded-xl border border-gray-200 hover:border-[#2c4a1e] transition-colors text-left">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {l.images[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.images[0].url} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1a1a1a] truncate">{l.title}</p>
                      <p className="text-xs text-gray-400">{l.category} · Ksh {Number(l.price).toLocaleString()}</p>
                    </div>
                  </button>
                ))}
                {filteredListings.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No listings match.</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-3 p-2 rounded-xl border border-[#2c4a1e] bg-[#eaf5e4]">
              <span className="text-sm font-semibold text-[#1a1a1a]">{listingDetail.title}</span>
              <button onClick={() => setSelectedListingId(null)} className="text-gray-500 hover:text-[#1a1a1a]">
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {listingDetail && (
          <>
            {listingDetail.group_pricing_tiers.length > 0 && (
              <div className={FIELD_CARD}>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Pricing</label>
                <div className="flex gap-2 mb-3">
                  {(['individual', 'group'] as const).map((m) => (
                    <button key={m} onClick={() => { setPricingMode(m); if (m === 'individual') setGroupTierId(null) }}
                      className={`flex-1 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                        ${pricingMode === m ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
                      {m === 'individual' ? 'Individual' : 'Group'}
                    </button>
                  ))}
                </div>
                {pricingMode === 'group' && (
                  <div className="flex flex-col gap-1.5">
                    {listingDetail.group_pricing_tiers.map((t) => (
                      <button key={t.id} onClick={() => { setGroupTierId(t.id); setGuests(String(t.people_count)) }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors
                          ${groupTierId === t.id ? 'border-[#2c4a1e] bg-[#eaf5e4]' : 'border-gray-200'}`}>
                        <span className="text-sm font-semibold text-[#1a1a1a]">{t.people_count} people</span>
                        <span className="text-sm text-[#1a1a1a]">Ksh {Number(t.total_price).toLocaleString()} total</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {pricingMode === 'individual' && (
              <div className={`${FIELD_CARD} grid grid-cols-2 gap-3`}>
                <div>
                  <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Guests</label>
                  <input value={guests} onChange={(e) => setGuests(e.target.value)} type="number" min="1"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
              </div>
            )}

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Dates</label>
              {usesDepartures ? (
                upcomingDepartures.length === 0 ? (
                  <p className="text-sm text-red-500">No upcoming departures on this listing.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {upcomingDepartures.map((dep) => {
                      const full = dep.booked >= dep.capacity
                      return (
                        <button key={dep.id} type="button" disabled={full}
                          onClick={() => setDepartureId(dep.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-colors
                            ${departureId === dep.id ? 'border-[#2c4a1e] bg-[#eaf5e4]' : 'border-gray-200'}
                            ${full ? 'opacity-40 cursor-not-allowed' : ''}`}>
                          <span className="text-sm text-[#1a1a1a]">{dep.date}</span>
                          <span className="text-xs text-gray-400">
                            {full ? 'Fully booked' : `${dep.capacity - dep.booked} spots left`}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Check-in</label>
                    <input value={checkIn} onChange={(e) => setCheckIn(e.target.value)} type="date"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                  </div>
                  {listingDetail.category === 'Stays' && (
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Check-out</label>
                      <input value={checkOut} onChange={(e) => setCheckOut(e.target.value)} type="date"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Total</label>
              <p className="text-2xl font-bold text-[#1a1a1a]">
                {quoting ? '…' : quotedTotal !== null ? `Ksh ${quotedTotal.toLocaleString()}` : '—'}
              </p>
              <p className="text-xs text-gray-400 mt-1">Computed the same way a traveller's own booking would be.</p>
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Traveller</label>
              <div className="flex gap-2 mb-3">
                {(['new', 'existing'] as const).map((m) => (
                  <button key={m} onClick={() => setTravellerMode(m)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
                      ${travellerMode === m ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'bg-white text-[#1a1a1a] border-gray-200'}`}>
                    {m === 'new' ? 'New guest' : 'Existing traveller'}
                  </button>
                ))}
              </div>
              {travellerMode === 'existing' ? (
                <>
                  {selectedTraveller ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-[#2c4a1e] bg-[#eaf5e4]">
                      <div>
                        <p className="text-sm font-semibold text-[#1a1a1a]">{selectedTraveller.name}</p>
                        <p className="text-xs text-gray-500">{selectedTraveller.email}</p>
                      </div>
                      <button onClick={() => setSelectedTraveller(null)} className="text-gray-500 hover:text-[#1a1a1a]">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <input value={travellerSearch} onChange={(e) => handleTravellerSearchChange(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors mb-2" />
                      {travellerHits.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          {travellerHits.map((u) => (
                            <button key={u.id} onClick={() => setSelectedTraveller(u)}
                              className="flex flex-col items-start p-2.5 rounded-xl border border-gray-200 hover:border-[#2c4a1e] transition-colors text-left">
                              <span className="text-sm font-semibold text-[#1a1a1a]">{u.name}</span>
                              <span className="text-xs text-gray-500">{u.email}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <input value={travellerName} onChange={(e) => setTravellerName(e.target.value)}
                    placeholder="Full name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                  <input value={travellerEmail} onChange={(e) => setTravellerEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                  <input value={travellerPhone} onChange={(e) => setTravellerPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
              )}
            </div>

            <div className={FIELD_CARD}>
              <label className="flex items-center gap-2.5 cursor-pointer mb-3">
                <input type="checkbox" checked={isCompany} onChange={(e) => setIsCompany(e.target.checked)}
                  className="w-4 h-4 accent-[#2c4a1e]" />
                <span className="text-sm font-semibold text-[#1a1a1a]">Booking on behalf of a company</span>
              </label>
              {isCompany && (
                <div className="flex flex-col gap-2">
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Company name"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                  <input value={companyTaxPin} onChange={(e) => setCompanyTaxPin(e.target.value)}
                    placeholder="Tax PIN (optional)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                  <input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)}
                    placeholder="Billing email (optional)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
              )}
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Special requests</label>
              <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3} placeholder="Optional"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Payment</label>
              <div className="flex flex-col gap-2">
                {([
                  { id: 'invoice', label: 'Send invoice link', desc: 'Emails the traveller a link to pay online.' },
                  { id: 'mark_paid', label: 'Mark as already paid', desc: 'For cash or payment already received outside the app.' },
                ] as const).map((p) => (
                  <button key={p.id} onClick={() => setPaymentMethod(p.id)}
                    className={`flex items-start gap-3 text-left p-3 rounded-xl border transition-all
                      ${paymentMethod === p.id ? 'border-[#2c4a1e] bg-[#eaf5e4]' : 'border-gray-200'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5
                      ${paymentMethod === p.id ? 'border-[#2c4a1e] bg-[#2c4a1e]' : 'border-gray-300'}`} />
                    <div>
                      <p className="text-sm font-semibold text-[#1a1a1a]">{p.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={!canSubmit || submitting}
              className="w-full bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {submitting ? 'Creating…' : 'Create booking'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
