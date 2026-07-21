'use client'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react'
import { VENDOR_LISTINGS } from '@/data/vendor'
import PhotoManager from '@/components/vendor/PhotoManager'

type Props = {
  params: Promise<{ listingId: string }>
}

const CATEGORIES = ['Safari', 'Stays', 'Experiences', 'Packages']
const STATUSES: Array<'active' | 'paused' | 'draft'> = ['active', 'paused', 'draft']
const BLOCK_REASONS = ['Maintenance', 'Fully booked', 'Guide unavailable', 'Other']

type PolicyId = 'flexible' | 'moderate' | 'strict' | 'custom'
const POLICIES: { id: PolicyId; label: string; description: string }[] = [
  { id: 'flexible', label: 'Flexible', description: 'Full refund up to 24 hours before the start date.' },
  { id: 'moderate', label: 'Moderate', description: 'Full refund up to 5 days before the start date, 50% refund after that.' },
  { id: 'strict', label: 'Strict', description: 'Full refund up to 14 days before the start date. No refund after that.' },
  { id: 'custom', label: 'Custom', description: 'Write your own cancellation terms.' },
]

export default function EditListingPage({ params }: Props) {
  const { listingId } = use(params)
  const router = useRouter()

  const listing = VENDOR_LISTINGS.find(l => l.id === listingId)

  const [title, setTitle] = useState(listing?.title ?? '')
  const [category, setCategory] = useState(listing?.category ?? CATEGORIES[0])
  const [location, setLocation] = useState(listing?.location ?? '')
  const [price, setPrice] = useState(listing?.price ?? '')
  const [images, setImages] = useState<string[]>(listing?.images ?? (listing?.image ? [listing.image] : []))
  const [description, setDescription] = useState(listing?.description ?? '')
  const [amenities, setAmenities] = useState<string[]>(listing?.amenities ?? [])
  const [amenityInput, setAmenityInput] = useState('')
  const [status, setStatus] = useState<'active' | 'paused' | 'draft'>(listing?.status ?? 'draft')
  const [saved, setSaved] = useState(false)

  // ── Itinerary ──
  const [itinerary, setItinerary] = useState(listing?.itinerary ?? [])
  const [itineraryTitle, setItineraryTitle] = useState('')
  const [itineraryDesc, setItineraryDesc] = useState('')

  // ── Excluded ──
  const [excluded, setExcluded] = useState<string[]>(listing?.excluded ?? [])
  const [excludedInput, setExcludedInput] = useState('')

  // ── Group size & duration ──
  const [minGuests, setMinGuests] = useState(listing?.minGuests?.toString() ?? '')
  const [maxGuests, setMaxGuests] = useState(listing?.maxGuests?.toString() ?? '')
  const [durationOptions, setDurationOptions] = useState(listing?.durationOptions ?? [])
  const [durationLabel, setDurationLabel] = useState('')
  const [durationPrice, setDurationPrice] = useState('')

  // ── Pricing rules ──
  const [extras, setExtras] = useState(listing?.extras ?? [])
  const [extraLabel, setExtraLabel] = useState('')
  const [extraPrice, setExtraPrice] = useState('')
  const [extraGuestPrice, setExtraGuestPrice] = useState(listing?.extraGuestPrice ?? '')
  const [childPrice, setChildPrice] = useState(listing?.childPrice ?? '')
  const [groupDiscounts, setGroupDiscounts] = useState(listing?.groupDiscounts ?? [])
  const [discountMinGuests, setDiscountMinGuests] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [seasonalRates, setSeasonalRates] = useState(listing?.seasonalRates ?? [])
  const [seasonLabel, setSeasonLabel] = useState('')
  const [seasonStart, setSeasonStart] = useState('')
  const [seasonEnd, setSeasonEnd] = useState('')
  const [seasonPrice, setSeasonPrice] = useState('')

  // ── Availability ──
  const [minLeadTimeDays, setMinLeadTimeDays] = useState(listing?.minLeadTimeDays?.toString() ?? '')
  const [departures, setDepartures] = useState(listing?.departures ?? [])
  const [departureDate, setDepartureDate] = useState('')
  const [departureCapacity, setDepartureCapacity] = useState('')
  const [blockedDates, setBlockedDates] = useState(listing?.blockedDates ?? [])
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState(BLOCK_REASONS[0])

  // ── Cancellation policy ──
  const [cancellationPolicy, setCancellationPolicy] = useState<PolicyId>(listing?.cancellationPolicy ?? 'moderate')
  const [customCancellationPolicy, setCustomCancellationPolicy] = useState(listing?.customCancellationPolicy ?? '')

  if (!listing) {
    return (
      <div className="p-5 lg:p-8 max-w-2xl mx-auto text-center pt-20">
        <p className="text-sm text-gray-500 mb-4">Listing not found.</p>
        <button onClick={() => router.push('/vendor/listings')}
          className="text-sm font-semibold text-[#2c4a1e] underline">
          Back to listings
        </button>
      </div>
    )
  }

  const canSave = title.trim() && location.trim() && price.trim()

  function addAmenity() {
    const val = amenityInput.trim()
    if (val && !amenities.includes(val)) setAmenities(a => [...a, val])
    setAmenityInput('')
  }
  function removeAmenity(item: string) {
    setAmenities(a => a.filter(x => x !== item))
  }

  function addExcluded() {
    const val = excludedInput.trim()
    if (val && !excluded.includes(val)) setExcluded(e => [...e, val])
    setExcludedInput('')
  }
  function removeExcluded(item: string) {
    setExcluded(e => e.filter(x => x !== item))
  }

  function addItineraryDay() {
    if (!itineraryTitle.trim()) return
    setItinerary(it => [...it, { day: it.length + 1, title: itineraryTitle.trim(), description: itineraryDesc.trim() }])
    setItineraryTitle(''); setItineraryDesc('')
  }
  function removeItineraryDay(day: number) {
    setItinerary(it => it.filter(d => d.day !== day).map((d, i) => ({ ...d, day: i + 1 })))
  }

  function addDurationOption() {
    if (!durationLabel.trim()) return
    setDurationOptions(d => [...d, {
      id: `do_${Date.now()}`, label: durationLabel.trim(), price: durationPrice.trim() || undefined,
    }])
    setDurationLabel(''); setDurationPrice('')
  }
  function removeDurationOption(id: string) {
    setDurationOptions(d => d.filter(x => x.id !== id))
  }

  function addGroupDiscount() {
    if (!discountMinGuests.trim() || !discountPercent.trim()) return
    setGroupDiscounts(g => [...g, {
      id: `gd_${Date.now()}`, minGuests: Number(discountMinGuests), discountPercent: Number(discountPercent),
    }])
    setDiscountMinGuests(''); setDiscountPercent('')
  }
  function removeGroupDiscount(id: string) {
    setGroupDiscounts(g => g.filter(x => x.id !== id))
  }

  function addExtra() {
    if (!extraLabel.trim() || !extraPrice.trim()) return
    setExtras(e => [...e, {
      id: `ex_${Date.now()}`, label: extraLabel.trim(),
      price: Number(extraPrice) || 0, defaultSelected: false,
    }])
    setExtraLabel(''); setExtraPrice('')
  }
  function removeExtra(id: string) {
    setExtras(e => e.filter(x => x.id !== id))
  }
  function toggleExtraDefault(id: string) {
    setExtras(e => e.map(x => x.id === id ? { ...x, defaultSelected: !x.defaultSelected } : x))
  }

  function addSeasonalRate() {
    if (!seasonLabel.trim() || !seasonStart || !seasonEnd || !seasonPrice.trim()) return
    setSeasonalRates(s => [...s, {
      id: `sr_${Date.now()}`, label: seasonLabel.trim(),
      start: seasonStart, end: seasonEnd, price: seasonPrice.trim(),
    }])
    setSeasonLabel(''); setSeasonStart(''); setSeasonEnd(''); setSeasonPrice('')
  }
  function removeSeasonalRate(id: string) {
    setSeasonalRates(s => s.filter(x => x.id !== id))
  }

  function addDeparture() {
    if (!departureDate || !departureCapacity.trim()) return
    if (departures.some(d => d.date === departureDate)) return
    setDepartures(d => [...d, {
      id: `dep_${Date.now()}`, date: departureDate, capacity: Number(departureCapacity), booked: 0,
    }].sort((a, b) => a.date.localeCompare(b.date)))
    setDepartureDate(''); setDepartureCapacity('')
  }
  function removeDeparture(id: string) {
    setDepartures(d => d.filter(x => x.id !== id))
  }

  function addBlockedDates() {
    if (!blockStart || !blockEnd) return
    setBlockedDates(b => [...b, { id: `bd_${Date.now()}`, start: blockStart, end: blockEnd, reason: blockReason }])
    setBlockStart(''); setBlockEnd('')
  }
  function removeBlockedDates(id: string) {
    setBlockedDates(b => b.filter(x => x.id !== id))
  }

  function handleSave() {
    if (!canSave || !listing) return
    const finalImages = images.length ? images : [listing.image]
    Object.assign(listing, {
      title: title.trim(),
      category,
      location: location.trim(),
      price: price.trim(),
      image: finalImages[0],
      images: finalImages,
      description: description.trim(),
      amenities,
      excluded,
      itinerary,
      status,
      minGuests: minGuests ? Number(minGuests) : undefined,
      maxGuests: maxGuests ? Number(maxGuests) : undefined,
      durationOptions,
      childPrice: childPrice.trim() || undefined,
      groupDiscounts,
      extras,
      extraGuestPrice: extraGuestPrice.trim() || undefined,
      seasonalRates,
      minLeadTimeDays: minLeadTimeDays ? Number(minLeadTimeDays) : undefined,
      departures,
      blockedDates,
      cancellationPolicy,
      customCancellationPolicy: cancellationPolicy === 'custom' ? customCancellationPolicy.trim() || undefined : undefined,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete() {
    const idx = VENDOR_LISTINGS.findIndex(l => l.id === listingId)
    if (idx > -1) VENDOR_LISTINGS.splice(idx, 1)
    router.push('/vendor/listings')
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.push('/vendor/listings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to listings
      </button>

      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Edit listing</h1>
        {saved && (
          <span className="text-xs font-semibold text-[#2c4a1e] bg-[#eaf5e4] px-3 py-1 rounded-full">
            Saved
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">{listing.bookings} bookings · Earned {listing.earnings}</p>

      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Status</label>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border capitalize transition-all
                  ${status === s
                    ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                    : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Category</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
                  ${category === c
                    ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                    : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Photos</label>
          <PhotoManager images={images} onChange={setImages} />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
        </div>

        {/* ══ ITINERARY ══ */}
        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Itinerary (day-by-day)</label>
          <div className="flex flex-col gap-2 mb-2">
            <input value={itineraryTitle} onChange={(e) => setItineraryTitle(e.target.value)}
              placeholder={`e.g. Day ${itinerary.length + 1}: Arrival & sundowner game drive`}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <textarea value={itineraryDesc} onChange={(e) => setItineraryDesc(e.target.value)}
              rows={2} placeholder="What happens this day..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
            <button onClick={addItineraryDay}
              className="self-start flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2c4a1e]
                         text-white text-sm font-semibold hover:bg-[#3d6b28] transition-colors">
              <Plus size={15} /> Add day
            </button>
          </div>
          {itinerary.length > 0 && (
            <div className="flex flex-col gap-2">
              {itinerary.map((d) => (
                <div key={d.day} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-gray-200">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a]">Day {d.day} — {d.title}</p>
                    {d.description && <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>}
                  </div>
                  <button onClick={() => removeItineraryDay(d.day)} className="flex-shrink-0">
                    <X size={14} color="#888" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
            What&apos;s included
          </label>
          <div className="flex gap-2 mb-2">
            <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity() } }}
              placeholder="e.g. Hotel pickup"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addAmenity}
              className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors">
              <Plus size={16} />
            </button>
          </div>
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenities.map((item) => (
                <span key={item}
                  className="flex items-center gap-1.5 bg-[#eaf5e4] text-[#2c4a1e]
                             text-xs font-semibold px-3 py-1.5 rounded-full">
                  {item}
                  <button onClick={() => removeAmenity(item)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
            What&apos;s excluded
          </label>
          <div className="flex gap-2 mb-2">
            <input value={excludedInput} onChange={(e) => setExcludedInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addExcluded() } }}
              placeholder="e.g. International flights"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addExcluded}
              className="px-4 rounded-xl bg-gray-100 text-[#1a1a1a] hover:bg-gray-200 transition-colors">
              <Plus size={16} />
            </button>
          </div>
          {excluded.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {excluded.map((item) => (
                <span key={item}
                  className="flex items-center gap-1.5 bg-gray-100 text-gray-600
                             text-xs font-semibold px-3 py-1.5 rounded-full">
                  {item}
                  <button onClick={() => removeExcluded(item)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ══ GROUP SIZE & DURATION ══ */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 mt-4">Group size &amp; duration</h2>
          <p className="text-sm text-gray-500 mb-4">Set booking limits and available durations.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Min guests</label>
            <input value={minGuests} onChange={(e) => setMinGuests(e.target.value)}
              type="number" placeholder="e.g. 2"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Max guests</label>
            <input value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)}
              type="number" placeholder="e.g. 12"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Duration options</label>
          <div className="flex gap-2 mb-2">
            <input value={durationLabel} onChange={(e) => setDurationLabel(e.target.value)}
              placeholder="e.g. 3 Days / 2 Nights"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={durationPrice} onChange={(e) => setDurationPrice(e.target.value)}
              placeholder="Price (optional)"
              className="w-40 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addDurationOption}
              className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
          {durationOptions.length > 0 && (
            <div className="flex flex-col gap-2">
              {durationOptions.map((d) => (
                <div key={d.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                  <span className="text-sm text-[#1a1a1a]">{d.label}</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {d.price && <span className="text-sm font-semibold text-[#1a1a1a]">{d.price}</span>}
                    <button onClick={() => removeDurationOption(d.id)}>
                      <X size={14} color="#888" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1.5">Leave price blank to use the base price for that duration.</p>
        </div>

        {/* ══ PRICING RULES ══ */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 mt-4">Pricing rules</h2>
          <p className="text-sm text-gray-500 mb-4">Base price, tiered pricing, extras and seasonal overrides.</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Base price (per adult)</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Child price</label>
          <input value={childPrice} onChange={(e) => setChildPrice(e.target.value)}
            placeholder="e.g. Ksh 22,500 (optional)"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
          <p className="text-xs text-gray-400 mt-1.5">Leave blank to charge the adult price for children too.</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Group discounts</label>
          <div className="flex gap-2 mb-2">
            <input value={discountMinGuests} onChange={(e) => setDiscountMinGuests(e.target.value)}
              type="number" placeholder="Min guests"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)}
              type="number" placeholder="Discount %"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addGroupDiscount}
              className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
          {groupDiscounts.length > 0 && (
            <div className="flex flex-col gap-2">
              {groupDiscounts.map((g) => (
                <div key={g.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                  <span className="text-sm text-[#1a1a1a]">{g.minGuests}+ guests</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-[#1a1a1a]">{g.discountPercent}% off</span>
                    <button onClick={() => removeGroupDiscount(g.id)}>
                      <X size={14} color="#888" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Extras &amp; add-ons</label>
          <div className="flex gap-2 mb-2">
            <input value={extraLabel} onChange={(e) => setExtraLabel(e.target.value)}
              placeholder="e.g. Hot air balloon safari"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={extraPrice} onChange={(e) => setExtraPrice(e.target.value)}
              placeholder="Price (Ksh)" type="number"
              className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addExtra}
              className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
          {extras.length > 0 && (
            <div className="flex flex-col gap-2">
              {extras.map((item) => (
                <div key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                  <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                    <input type="checkbox" checked={!!item.defaultSelected}
                      onChange={() => toggleExtraDefault(item.id)}
                      className="w-4 h-4 accent-[#2c4a1e]" />
                    <span className="text-sm text-[#1a1a1a] truncate">{item.label}</span>
                  </label>
                  <span className="text-sm font-semibold text-[#1a1a1a] flex-shrink-0">
                    Ksh {item.price.toLocaleString()}
                  </span>
                  <button onClick={() => removeExtra(item.id)} className="flex-shrink-0">
                    <X size={14} color="#888" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1.5">Checked items are pre-selected by default for guests.</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
            Price per additional guest
          </label>
          <input value={extraGuestPrice} onChange={(e) => setExtraGuestPrice(e.target.value)}
            placeholder="e.g. Ksh 10,000 (optional)"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
          <p className="text-xs text-gray-400 mt-1.5">Leave blank if your price already covers all guests.</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
            Seasonal rate overrides
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
            <input value={seasonLabel} onChange={(e) => setSeasonLabel(e.target.value)}
              placeholder="Season name"
              className="col-span-2 sm:col-span-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={seasonStart} onChange={(e) => setSeasonStart(e.target.value)}
              type="date"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={seasonEnd} onChange={(e) => setSeasonEnd(e.target.value)}
              type="date"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <div className="flex gap-2">
              <input value={seasonPrice} onChange={(e) => setSeasonPrice(e.target.value)}
                placeholder="Price"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
              <button onClick={addSeasonalRate}
                className="px-3 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
                <Plus size={16} />
              </button>
            </div>
          </div>
          {seasonalRates.length > 0 && (
            <div className="flex flex-col gap-2">
              {seasonalRates.map((rate) => (
                <div key={rate.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1a1a1a] truncate">{rate.label}</p>
                    <p className="text-xs text-gray-400">{rate.start} → {rate.end}</p>
                  </div>
                  <span className="text-sm font-semibold text-[#1a1a1a] flex-shrink-0">{rate.price}</span>
                  <button onClick={() => removeSeasonalRate(rate.id)} className="flex-shrink-0">
                    <X size={14} color="#888" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══ AVAILABILITY ══ */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 mt-4">Availability</h2>
          <p className="text-sm text-gray-500 mb-4">
            Set departures with capacity, block off unavailable dates, and set a minimum booking lead time.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Minimum lead time</label>
          <div className="flex items-center gap-2">
            <input value={minLeadTimeDays} onChange={(e) => setMinLeadTimeDays(e.target.value)}
              type="number" placeholder="e.g. 3"
              className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <span className="text-sm text-gray-500">days before departure</span>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Guests won&apos;t be able to book within this many days of a departure.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Departures &amp; capacity</label>
          <p className="text-xs text-gray-400 mb-2">
            Set specific bookable dates and how many travellers each can take.
          </p>
          <div className="flex gap-2 mb-2">
            <input value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
              type="date"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={departureCapacity} onChange={(e) => setDepartureCapacity(e.target.value)}
              type="number" placeholder="Capacity"
              className="w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addDeparture}
              className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
          {departures.length > 0 && (
            <div className="flex flex-col gap-2">
              {departures.map((d) => {
                const full = d.booked >= d.capacity
                return (
                  <div key={d.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                    <span className="text-sm text-[#1a1a1a]">{d.date}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                        ${full ? 'bg-red-50 text-red-600' : 'bg-[#eaf5e4] text-[#2c4a1e]'}`}>
                        {d.booked} / {d.capacity} booked
                      </span>
                      <button onClick={() => removeDeparture(d.id)}>
                        <X size={14} color="#888" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Blocked dates</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
            <input value={blockStart} onChange={(e) => setBlockStart(e.target.value)}
              type="date"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)}
              type="date"
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <div className="flex gap-2 col-span-2 sm:col-span-1">
              <select value={blockReason} onChange={(e) => setBlockReason(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors bg-white">
                {BLOCK_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button onClick={addBlockedDates}
                className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
                <Plus size={16} />
              </button>
            </div>
          </div>
          {blockedDates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blockedDates.map((b) => (
                <span key={b.id}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {b.start} → {b.end}{b.reason ? ` · ${b.reason}` : ''}
                  <button onClick={() => removeBlockedDates(b.id)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ══ CANCELLATION POLICY ══ */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 mt-4">Cancellation policy</h2>
          <p className="text-sm text-gray-500 mb-4">Choose the refund terms guests see before booking.</p>
        </div>

        <div className="flex flex-col gap-2">
          {POLICIES.map((p) => (
            <button key={p.id} onClick={() => setCancellationPolicy(p.id)}
              className={`flex items-start gap-3 text-left p-3.5 rounded-xl border transition-all
                ${cancellationPolicy === p.id
                  ? 'border-[#2c4a1e] bg-[#eaf5e4]'
                  : 'border-gray-200 hover:border-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5
                ${cancellationPolicy === p.id ? 'border-[#2c4a1e] bg-[#2c4a1e]' : 'border-gray-300'}`} />
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">{p.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
              </div>
            </button>
          ))}
          {cancellationPolicy === 'custom' && (
            <textarea value={customCancellationPolicy} onChange={(e) => setCustomCancellationPolicy(e.target.value)}
              rows={3} placeholder="e.g. Full refund up to 48 hours before departure..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-1
                         outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 border border-red-200
                       text-red-500 px-5 py-3 rounded-xl font-semibold text-sm
                       hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} /> Delete listing
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 bg-[#2c4a1e] text-white py-3 rounded-xl
                       font-semibold text-sm hover:bg-[#3d6b28] transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  )
}
