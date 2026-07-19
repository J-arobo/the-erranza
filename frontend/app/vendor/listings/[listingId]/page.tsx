'use client'
import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Trash2 } from 'lucide-react'
import { VENDOR_LISTINGS } from '@/data/vendor'

type Props = {
  params: Promise<{ listingId: string }>
}

const CATEGORIES = ['Safari', 'Stays', 'Experiences', 'Packages']
const STATUSES: Array<'active' | 'paused' | 'draft'> = ['active', 'paused', 'draft']

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
  const [image, setImage] = useState(listing?.image ?? '')
  const [description, setDescription] = useState(listing?.description ?? '')
  const [amenities, setAmenities] = useState<string[]>(listing?.amenities ?? [])
  const [amenityInput, setAmenityInput] = useState('')
  const [status, setStatus] = useState<'active' | 'paused' | 'draft'>(listing?.status ?? 'draft')
  const [saved, setSaved] = useState(false)

  // ── Pricing rules ──
  const [extras, setExtras] = useState(listing?.extras ?? [])
  const [extraLabel, setExtraLabel] = useState('')
  const [extraPrice, setExtraPrice] = useState('')
  const [extraGuestPrice, setExtraGuestPrice] = useState(listing?.extraGuestPrice ?? '')
  const [seasonalRates, setSeasonalRates] = useState(listing?.seasonalRates ?? [])
  const [seasonLabel, setSeasonLabel] = useState('')
  const [seasonStart, setSeasonStart] = useState('')
  const [seasonEnd, setSeasonEnd] = useState('')
  const [seasonPrice, setSeasonPrice] = useState('')

  // ── Availability ──
  const [blockedDates, setBlockedDates] = useState(listing?.blockedDates ?? [])
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [fixedDates, setFixedDates] = useState<string[]>(listing?.fixedDates ?? [])
  const [newFixedDate, setNewFixedDate] = useState('')

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

  function addBlockedDates() {
    if (!blockStart || !blockEnd) return
    setBlockedDates(b => [...b, { id: `bd_${Date.now()}`, start: blockStart, end: blockEnd }])
    setBlockStart(''); setBlockEnd('')
  }
  function removeBlockedDates(id: string) {
    setBlockedDates(b => b.filter(x => x.id !== id))
  }

  function addFixedDate() {
    if (!newFixedDate || fixedDates.includes(newFixedDate)) return
    setFixedDates(d => [...d, newFixedDate].sort())
    setNewFixedDate('')
  }
  function removeFixedDate(date: string) {
    setFixedDates(d => d.filter(x => x !== date))
  }

  function handleSave() {
    if (!canSave || !listing) return
    Object.assign(listing, {
      title: title.trim(),
      category,
      location: location.trim(),
      price: price.trim(),
      image: image.trim() || listing.image,
      description: description.trim(),
      amenities,
      status,
      extras,
      extraGuestPrice: extraGuestPrice.trim() || undefined,
      seasonalRates,
      blockedDates,
      fixedDates,
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
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Cover image URL</label>
          <input value={image} onChange={(e) => setImage(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
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

        {/* ══ PRICING RULES ══ */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 mt-4">Pricing rules</h2>
          <p className="text-sm text-gray-500 mb-4">Extras, per-guest pricing and seasonal rate overrides.</p>
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
            Block off dates you&apos;re unavailable, or set fixed departure dates for a package.
          </p>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Blocked dates</label>
          <div className="flex gap-2 mb-2">
            <input value={blockStart} onChange={(e) => setBlockStart(e.target.value)}
              type="date"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)}
              type="date"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addBlockedDates}
              className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
          {blockedDates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {blockedDates.map((b) => (
                <span key={b.id}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {b.start} → {b.end}
                  <button onClick={() => removeBlockedDates(b.id)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Fixed departure dates</label>
          <p className="text-xs text-gray-400 mb-2">
            Used for packages with pre-set dates guests can&apos;t change.
          </p>
          <div className="flex gap-2 mb-2">
            <input value={newFixedDate} onChange={(e) => setNewFixedDate(e.target.value)}
              type="date"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addFixedDate}
              className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
              <Plus size={16} />
            </button>
          </div>
          {fixedDates.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {fixedDates.map((d) => (
                <span key={d}
                  className="flex items-center gap-1.5 bg-[#eaf5e4] text-[#2c4a1e] text-xs font-semibold px-3 py-1.5 rounded-full">
                  {d}
                  <button onClick={() => removeFixedDate(d)}>
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
