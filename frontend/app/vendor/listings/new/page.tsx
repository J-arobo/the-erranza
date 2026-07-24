'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, ArrowLeft } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import PhotoManager from '@/components/vendor/PhotoManager'

const CATEGORIES = ['Safari', 'Stays', 'Experiences', 'Packages']

function parseMoney(v: string): number | null {
  const cleaned = v.replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

export default function NewListingPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [amenityInput, setAmenityInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // ── Itinerary ──
  const [itinerary, setItinerary] = useState<{ day: number; title: string; description: string }[]>([])
  const [itineraryTitle, setItineraryTitle] = useState('')
  const [itineraryDesc, setItineraryDesc] = useState('')

  // ── Excluded ──
  const [excluded, setExcluded] = useState<string[]>([])
  const [excludedInput, setExcludedInput] = useState('')

  // ── Group size & duration ──
  const [minGuests, setMinGuests] = useState('')
  const [maxGuests, setMaxGuests] = useState('')
  const [durationOptions, setDurationOptions] = useState<{ id: string; label: string; price: string }[]>([])
  const [durationLabel, setDurationLabel] = useState('')
  const [durationPrice, setDurationPrice] = useState('')

  // ── Tiered pricing ──
  const [childPrice, setChildPrice] = useState('')
  const [groupDiscounts, setGroupDiscounts] = useState<{ id: string; min_guests: number; discount_percent: number }[]>([])
  const [discountMinGuests, setDiscountMinGuests] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')

  const canSubmit = title.trim() && location.trim() && price.trim()

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
      id: `do_${Date.now()}`, label: durationLabel.trim(), price: durationPrice.trim(),
    }])
    setDurationLabel(''); setDurationPrice('')
  }
  function removeDurationOption(id: string) {
    setDurationOptions(d => d.filter(x => x.id !== id))
  }

  function addGroupDiscount() {
    if (!discountMinGuests.trim() || !discountPercent.trim()) return
    setGroupDiscounts(g => [...g, {
      id: `gd_${Date.now()}`, min_guests: Number(discountMinGuests), discount_percent: Number(discountPercent),
    }])
    setDiscountMinGuests(''); setDiscountPercent('')
  }
  function removeGroupDiscount(id: string) {
    setGroupDiscounts(g => g.filter(x => x.id !== id))
  }

  async function handleSubmit(status: 'draft' | 'active') {
    if (!canSubmit) return

    setSaving(true)
    setError('')
    try {
      const { listing } = await apiFetch<{ listing: { id: number } }>('/vendor/listings', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          category,
          location: location.trim(),
          price: parseMoney(price),
          description: description.trim() || null,
          amenities,
          excluded,
          status,
          min_guests: minGuests ? Number(minGuests) : null,
          max_guests: maxGuests ? Number(maxGuests) : null,
          child_price: childPrice.trim() ? parseMoney(childPrice) : null,
          images: images.map(url => ({ url })),
          itinerary,
          duration_options: durationOptions.map(d => ({
            label: d.label, price: d.price.trim() ? parseMoney(d.price) : null,
          })),
          group_discounts: groupDiscounts.map(({ min_guests, discount_percent }) => ({ min_guests, discount_percent })),
        }),
      })

      router.push(`/vendor/listings/${listing.id}`)
    } catch (err) {
      setError(apiErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.push('/vendor/listings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to listings
      </button>

      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">New listing</h1>
      <p className="text-sm text-gray-500 mb-6">Fill in the details below to create a new listing.</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Maasai Mara Premium Safari"
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
            placeholder="e.g. Narok County, Kenya"
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
            rows={4} placeholder="Describe what guests can expect..."
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

        {/* ══ PRICING ══ */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 mt-4">Pricing</h2>
          <p className="text-sm text-gray-500 mb-4">Base price, per-child pricing and group discounts.</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Base price (per adult)</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 45000"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Child price</label>
          <input value={childPrice} onChange={(e) => setChildPrice(e.target.value)}
            placeholder="e.g. 22500 (optional)"
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
                  <span className="text-sm text-[#1a1a1a]">{g.min_guests}+ guests</span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-semibold text-[#1a1a1a]">{g.discount_percent}% off</span>
                    <button onClick={() => removeGroupDiscount(g.id)}>
                      <X size={14} color="#888" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={!canSubmit || saving}
            className="flex-1 border border-[#1a1a1a] text-[#1a1a1a] py-3 rounded-xl
                       font-semibold text-sm hover:bg-gray-50 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save as draft'}
          </button>
          <button
            onClick={() => handleSubmit('active')}
            disabled={!canSubmit || saving}
            className="flex-1 bg-[#2c4a1e] text-white py-3 rounded-xl
                       font-semibold text-sm hover:bg-[#3d6b28] transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Publish listing'}
          </button>
        </div>
      </div>
    </div>
  )
}
