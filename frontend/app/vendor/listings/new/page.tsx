'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, X, ArrowLeft, Check, Eye,
  PawPrint, VolumeX, Camera, Cigarette, Moon, DoorOpen,
  ShieldAlert, Shield, Ban, AlertTriangle, Volume2, Wifi,
} from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import PhotoManager from '@/components/vendor/PhotoManager'
import LocationChainInput from '@/components/vendor/LocationChainInput'
import ListingTabs, { TabSection } from '@/components/vendor/ListingTabs'
import ListingPreviewModal from '@/components/vendor/ListingPreviewModal'

const CATEGORIES = ['Safari', 'Stays', 'Experiences', 'Packages']
const BLOCK_REASONS = ['Maintenance', 'Fully booked', 'Guide unavailable', 'Other']
const FIELD_CARD = 'bg-white border border-[#e0d9cc] rounded-2xl p-4 sm:p-5 shadow-sm'

const HOUSE_RULES_CATALOG: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'no_pets', label: 'No pets', icon: <PawPrint size={14} /> },
  { key: 'no_parties', label: 'No parties or events', icon: <VolumeX size={14} /> },
  { key: 'no_commercial_photography', label: 'No commercial photography', icon: <Camera size={14} /> },
  { key: 'smoking_allowed', label: 'Smoking is allowed', icon: <Cigarette size={14} /> },
  { key: 'quiet_hours', label: 'Quiet hours (10:00 PM – 7:00 AM)', icon: <Moon size={14} /> },
  { key: 'self_check_in', label: 'Self check-in with keypad', icon: <DoorOpen size={14} /> },
]

const SAFETY_CATALOG: { key: string; label: string; icon: React.ReactNode; needsNote: boolean }[] = [
  { key: 'no_carbon_monoxide_alarm', label: 'No carbon monoxide alarm', icon: <ShieldAlert size={14} />, needsNote: false },
  { key: 'no_smoke_alarm', label: 'No smoke alarm', icon: <ShieldAlert size={14} />, needsNote: false },
  { key: 'exterior_cameras', label: 'Exterior security cameras on property', icon: <Shield size={14} />, needsNote: false },
  { key: 'not_suitable_children', label: 'Not suitable for children (2–12 years)', icon: <Ban size={14} />, needsNote: false },
  { key: 'must_climb_stairs', label: 'Must climb stairs', icon: <AlertTriangle size={14} />, needsNote: false },
  { key: 'no_parking', label: 'No parking on property', icon: <Ban size={14} />, needsNote: false },
  { key: 'dangerous_animals', label: 'May encounter potentially dangerous animal', icon: <AlertTriangle size={14} />, needsNote: true },
  { key: 'pets_on_property', label: 'Pet(s) live on property', icon: <PawPrint size={14} />, needsNote: true },
  { key: 'noise_potential', label: 'Potential for noise', icon: <Volume2 size={14} />, needsNote: true },
  { key: 'amenity_limitations', label: 'Amenity limitations', icon: <Wifi size={14} />, needsNote: true },
]

type PolicyId = 'flexible' | 'moderate' | 'strict' | 'custom'
const POLICIES: { id: PolicyId; label: string; description: string }[] = [
  { id: 'flexible', label: 'Flexible', description: 'Full refund up to 24 hours before the start date.' },
  { id: 'moderate', label: 'Moderate', description: 'Full refund up to 5 days before the start date, 50% refund after that.' },
  { id: 'strict', label: 'Strict', description: 'Full refund up to 14 days before the start date. No refund after that.' },
  { id: 'custom', label: 'Custom', description: 'Write your own cancellation terms.' },
]

function parseMoney(v: string): number | null {
  const cleaned = v.replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

export default function NewListingPage() {
  const router = useRouter()

  const [tab, setTab] = useState('basics')
  const [showPreview, setShowPreview] = useState(false)

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [locationPlaces, setLocationPlaces] = useState<string[]>([])
  const [price, setPrice] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [amenityInput, setAmenityInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [itinerary, setItinerary] = useState<{ day: number; title: string; description: string }[]>([])
  const [itineraryTitle, setItineraryTitle] = useState('')
  const [itineraryDesc, setItineraryDesc] = useState('')

  const [excluded, setExcluded] = useState<string[]>([])
  const [excludedInput, setExcludedInput] = useState('')

  const [minGuests, setMinGuests] = useState('')
  const [maxGuests, setMaxGuests] = useState('')
  const [minNights, setMinNights] = useState('')
  const [durationOptions, setDurationOptions] = useState<{ id: string; label: string; price: string }[]>([])
  const [durationLabel, setDurationLabel] = useState('')
  const [durationPrice, setDurationPrice] = useState('')

  const [vendorCategories, setVendorCategories] = useState<string[]>(CATEGORIES)
  useEffect(() => {
    apiFetch<{ vendor: { categories: string[] | null } }>('/vendor/me')
      .then(({ vendor }) => {
        if (vendor.categories && vendor.categories.length > 0) {
          setVendorCategories(vendor.categories)
          setCategory(vendor.categories[0])
        }
      })
      .catch(() => { })
  }, [])

  const [childPrice, setChildPrice] = useState('')
  const [extraGuestPrice, setExtraGuestPrice] = useState('')
  const [extras, setExtras] = useState<{ id: string; label: string; price: number; default_selected: boolean }[]>([])
  const [extraLabel, setExtraLabel] = useState('')
  const [extraPrice, setExtraPrice] = useState('')
  const [seasonalRates, setSeasonalRates] = useState<{ id: string; label: string; start_date: string; end_date: string; price: string }[]>([])
  const [seasonLabel, setSeasonLabel] = useState('')
  const [seasonStart, setSeasonStart] = useState('')
  const [seasonEnd, setSeasonEnd] = useState('')
  const [seasonPrice, setSeasonPrice] = useState('')
  const [groupPricingTiers, setGroupPricingTiers] = useState<{ id: string; people_count: number; total_price: number }[]>([])
  const [tierPeopleCount, setTierPeopleCount] = useState('')
  const [tierTotalPrice, setTierTotalPrice] = useState('')

  const [minLeadTimeDays, setMinLeadTimeDays] = useState('')
  const [departures, setDepartures] = useState<{ id: string; date: string; capacity: number; booked: number }[]>([])
  const [departureDate, setDepartureDate] = useState('')
  const [departureCapacity, setDepartureCapacity] = useState('')
  const [blockedDates, setBlockedDates] = useState<{ id: string; start_date: string; end_date: string; reason: string }[]>([])
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState(BLOCK_REASONS[0])

  const [repeatEnabled, setRepeatEnabled] = useState(false)
  const [repeatStart, setRepeatStart] = useState('')
  const [repeatUnit, setRepeatUnit] = useState<'week' | 'month'>('week')
  const [repeatEvery, setRepeatEvery] = useState('1')
  const [repeatCount, setRepeatCount] = useState('8')
  const [repeatCapacity, setRepeatCapacity] = useState('')

  function computeRepeatDates(): string[] {
    const n = Number(repeatCount)
    const every = Number(repeatEvery) || 1
    if (!repeatStart || !Number.isFinite(n) || n <= 0) return []
    const base = new Date(repeatStart + 'T00:00:00')
    const dates: string[] = []
    for (let i = 0; i < n; i++) {
      const d = new Date(base)
      if (repeatUnit === 'week') d.setDate(d.getDate() + i * every * 7)
      else d.setMonth(d.getMonth() + i * every)
      dates.push(d.toISOString().slice(0, 10))
    }
    return dates
  }
  const repeatDates = computeRepeatDates()

  function applyRepeatDeparture() {
    if (!repeatCapacity.trim() || repeatDates.length === 0) return
    const capacity = Number(repeatCapacity)
    setDepartures(d => {
      const existing = new Set(d.map(x => x.date))
      const additions = repeatDates
        .filter(date => !existing.has(date))
        .map(date => ({ id: `dep_${Date.now()}_${date}`, date, capacity, booked: 0 }))
      return [...d, ...additions].sort((a, b) => a.date.localeCompare(b.date))
    })
    setRepeatEnabled(false); setRepeatStart(''); setRepeatCapacity('')
  }

  const [cancellationPolicy, setCancellationPolicy] = useState<PolicyId>('moderate')
  const [customCancellationPolicy, setCustomCancellationPolicy] = useState('')

  const [houseRules, setHouseRules] = useState<string[]>([])
  const [safetyInfo, setSafetyInfo] = useState<{ key: string; note: string }[]>([])
  const [additionalRules, setAdditionalRules] = useState('')
  const [additionalRequests, setAdditionalRequests] = useState('')

  function toggleHouseRule(key: string) {
    setHouseRules(r => r.includes(key) ? r.filter(x => x !== key) : [...r, key])
  }
  function toggleSafetyItem(key: string) {
    setSafetyInfo(items => items.some(i => i.key === key)
      ? items.filter(i => i.key !== key)
      : [...items, { key, note: '' }])
  }
  function setSafetyNote(key: string, note: string) {
    setSafetyInfo(items => items.map(i => i.key === key ? { ...i, note } : i))
  }

  const location = locationPlaces.length > 0 ? `${locationPlaces.join(' + ')}, Kenya` : ''
  const basicsComplete = !!title.trim() && locationPlaces.length > 0 && images.length >= 3
  const pricingComplete = !!price.trim()
  const itineraryComplete = itinerary.length > 0
  const groupComplete = !!minGuests.trim() || !!maxGuests.trim() || durationOptions.length > 0
  const availabilityComplete = departures.length > 0
  const cancellationComplete = cancellationPolicy !== 'custom' || !!customCancellationPolicy.trim()
  const safetyComplete = safetyInfo.length > 0
  const canSubmit = basicsComplete && pricingComplete

  const SECTIONS: TabSection[] = [
    { id: 'basics', label: 'Basics', complete: basicsComplete },
    { id: 'itinerary', label: 'Itinerary', complete: itineraryComplete, optional: true },
    { id: 'group-size', label: 'Group & duration', complete: groupComplete, optional: true },
    { id: 'pricing', label: 'Pricing', complete: pricingComplete },
    { id: 'availability', label: 'Availability', complete: availabilityComplete, optional: true },
    { id: 'cancellation', label: 'Cancellation', complete: cancellationComplete, optional: true },
    { id: 'house-rules', label: category === 'Stays' ? 'House rules' : 'Tour rules', complete: true, optional: true },
    { id: 'safety', label: category === 'Stays' ? 'Safety & property' : 'Safety info', complete: safetyComplete, optional: true },
  ]

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

  function addExtra() {
    if (!extraLabel.trim() || !extraPrice.trim()) return
    setExtras(e => [...e, {
      id: `ex_${Date.now()}`, label: extraLabel.trim(), price: Number(extraPrice) || 0, default_selected: false,
    }])
    setExtraLabel(''); setExtraPrice('')
  }
  function removeExtra(id: string) {
    setExtras(e => e.filter(x => x.id !== id))
  }
  function toggleExtraDefault(id: string) {
    setExtras(e => e.map(x => x.id === id ? { ...x, default_selected: !x.default_selected } : x))
  }

  function addSeasonalRate() {
    if (!seasonLabel.trim() || !seasonStart || !seasonEnd || !seasonPrice.trim()) return
    setSeasonalRates(s => [...s, {
      id: `sr_${Date.now()}`, label: seasonLabel.trim(), start_date: seasonStart, end_date: seasonEnd, price: seasonPrice.trim(),
    }])
    setSeasonLabel(''); setSeasonStart(''); setSeasonEnd(''); setSeasonPrice('')
  }
  function removeSeasonalRate(id: string) {
    setSeasonalRates(s => s.filter(x => x.id !== id))
  }

  function addGroupPricingTier() {
    if (!tierPeopleCount.trim() || !tierTotalPrice.trim()) return
    setGroupPricingTiers(t => [...t, {
      id: `gpt_${Date.now()}`, people_count: Number(tierPeopleCount), total_price: Number(tierTotalPrice),
    }].sort((a, b) => a.people_count - b.people_count))
    setTierPeopleCount(''); setTierTotalPrice('')
  }
  function removeGroupPricingTier(id: string) {
    setGroupPricingTiers(t => t.filter(x => x.id !== id))
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
    setBlockedDates(b => [...b, { id: `bd_${Date.now()}`, start_date: blockStart, end_date: blockEnd, reason: blockReason }])
    setBlockStart(''); setBlockEnd('')
  }
  function removeBlockedDates(id: string) {
    setBlockedDates(b => b.filter(x => x.id !== id))
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
          location,
          price: parseMoney(price),
          description: description.trim() || null,
          amenities,
          excluded,
          status,
          min_guests: minGuests ? Number(minGuests) : null,
          max_guests: maxGuests ? Number(maxGuests) : null,
          min_nights: minNights ? Number(minNights) : null,
          child_price: childPrice.trim() ? parseMoney(childPrice) : null,
          extra_guest_price: extraGuestPrice.trim() ? parseMoney(extraGuestPrice) : null,
          min_lead_time_days: minLeadTimeDays ? Number(minLeadTimeDays) : null,
          cancellation_policy: cancellationPolicy,
          custom_cancellation_text: cancellationPolicy === 'custom' ? customCancellationPolicy.trim() || null : null,
          house_rules: {
            selected: houseRules,
            additional_rules: additionalRules.trim() || null,
            additional_requests: additionalRequests.trim() || null,
          },
          safety_info: safetyInfo.map(({ key, note }) => ({ key, note: note.trim() || null })),
          images: images.map(url => ({ url })),
          itinerary,
          duration_options: durationOptions.map(d => ({
            label: d.label, price: d.price.trim() ? parseMoney(d.price) : null,
          })),
          group_pricing_tiers: groupPricingTiers.map(({ people_count, total_price }) => ({ people_count, total_price })),
          extras: extras.map(({ label, price: p, default_selected }) => ({ label, price: p, default_selected })),
          seasonal_rates: seasonalRates.map(r => ({
            label: r.label, start_date: r.start_date, end_date: r.end_date, price: parseMoney(r.price),
          })),
          departures: departures.map(({ date, capacity, booked }) => ({ date, capacity, booked })),
          blocked_dates: blockedDates.map(({ start_date, end_date, reason }) => ({ start_date, end_date, reason: reason || null })),
        }),
      })

      sessionStorage.setItem('vendorToast', 'Listing created')
      router.push(`/vendor/listings/${listing.id}`)
    } catch (err) {
      setError(apiErrorMessage(err))
      setSaving(false)
    }
  }

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto overflow-x-hidden">
      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <button onClick={() => router.push('/vendor/listings')}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] hover:underline">
          <ArrowLeft size={16} /> Back to listings
        </button>
        <button onClick={() => setShowPreview(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200
                     text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
          <Eye size={14} /> Preview listing
        </button>
      </div>

      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1 mt-4">New listing</h1>
      <p className="text-sm text-gray-500 mb-6">Fill in the details below to create a new listing.</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <ListingTabs sections={SECTIONS} activeId={tab} onSelect={setTab} showProgress={false} />

      <div className="flex flex-col gap-5">

        {tab === 'basics' && (
          <>
            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
                Title {!title.trim() && <span className="text-orange-500 font-normal text-xs align-top">Required</span>}
              </label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Maasai Mara Premium Safari"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
                Category {!category && <span className="text-orange-500 font-normal text-xs align-top">Required</span>}
              </label>
              <div className="flex gap-2 flex-wrap">
                {vendorCategories.map((c) => (
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

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
                Location {locationPlaces.length === 0 && <span className="text-orange-500 font-normal text-xs align-top">Required</span>}
              </label>
              <LocationChainInput places={locationPlaces} onChange={setLocationPlaces} />
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
                Photos {images.length < 3 && <span className="text-orange-500 font-normal text-xs align-top">Required — at least 3</span>}
              </label>
              <PhotoManager images={images} onChange={setImages} />
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={4} placeholder="Describe what guests can expect..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
            </div>
          </>
        )}

        {tab === 'itinerary' && (
          <>
            <div className={FIELD_CARD}>
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

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">What&apos;s included</label>
              <div className="flex flex-col gap-1 mb-3">
                {amenities.map((item) => (
                  <div key={item} className="flex items-center gap-2.5 py-1">
                    <div className="w-5 h-5 rounded-full bg-[#eaf5e4] flex items-center justify-center flex-shrink-0">
                      <Check size={12} color="#2c4a1e" />
                    </div>
                    <span className="text-sm text-[#1a1a1a] flex-1">{item}</span>
                    <button onClick={() => removeAmenity(item)}><X size={13} color="#888" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
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
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">What&apos;s excluded</label>
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
                      <button onClick={() => removeExcluded(item)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'group-size' && (
          <>
            <div className={`${FIELD_CARD} grid grid-cols-2 gap-3`}>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Min guests</label>
                <input value={minGuests} onChange={(e) => setMinGuests(e.target.value)}
                  type="number" min="0" placeholder="e.g. 2"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Max guests</label>
                <input value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)}
                  type="number" min="0" placeholder="e.g. 2"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
              </div>
            </div>

            {category === 'Stays' && (
              <div className={FIELD_CARD}>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Minimum nights</label>
                <input value={minNights} onChange={(e) => setMinNights(e.target.value)}
                  type="number" placeholder="e.g. 2"
                  className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
              </div>
            )}

            <div className={FIELD_CARD}>
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
                        <button onClick={() => removeDurationOption(d.id)}><X size={14} color="#888" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1.5">Leave price blank to use the base price for that duration.</p>
            </div>
          </>
        )}

        {tab === 'pricing' && (
          <>
            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
                Base price (per adult) {!price.trim() && <span className="text-orange-500 font-normal text-xs align-top">Required</span>}
              </label>
              <input value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 45000"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Child price</label>
              <input value={childPrice} onChange={(e) => setChildPrice(e.target.value)}
                placeholder="e.g. 22500 (optional)"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
              <p className="text-xs text-gray-400 mt-1.5">Leave blank to charge the adult price for children too.</p>
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Group pricing</label>
              <p className="text-xs text-gray-400 mb-3">
                Offer a flat total price for a specific group size — e.g. "a group of 5 pays Ksh 5,000
                total" — as an alternative to per-person pricing.
              </p>
              <div className="flex gap-2 mb-2">
                <input value={tierPeopleCount} onChange={(e) => setTierPeopleCount(e.target.value)}
                  type="number" min="1" placeholder="e.g. 5 people"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
                <input value={tierTotalPrice} onChange={(e) => setTierTotalPrice(e.target.value)}
                  type="number" min="0" placeholder="Total price, e.g. 5000"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
                <button onClick={addGroupPricingTier}
                  className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
                  <Plus size={16} />
                </button>
              </div>
              {groupPricingTiers.length > 0 && (
                <div className="flex flex-col gap-2">
                  {groupPricingTiers.map((t) => (
                    <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                      <span className="text-sm text-[#1a1a1a]">{t.people_count} people</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-sm font-semibold text-[#1a1a1a]">Ksh {t.total_price.toLocaleString()} total</span>
                        <button onClick={() => removeGroupPricingTier(t.id)}><X size={14} color="#888" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={FIELD_CARD}>
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
                    <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                      <label className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer">
                        <input type="checkbox" checked={item.default_selected}
                          onChange={() => toggleExtraDefault(item.id)} className="w-4 h-4 accent-[#2c4a1e]" />
                        <span className="text-sm text-[#1a1a1a] truncate">{item.label}</span>
                      </label>
                      <span className="text-sm font-semibold text-[#1a1a1a] flex-shrink-0">Ksh {item.price.toLocaleString()}</span>
                      <button onClick={() => removeExtra(item.id)} className="flex-shrink-0"><X size={14} color="#888" /></button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1.5">Checked items are pre-selected by default for guests.</p>
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Price per additional guest</label>
              <input value={extraGuestPrice} onChange={(e) => setExtraGuestPrice(e.target.value)}
                placeholder="e.g. 10000 (optional)"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
              <p className="text-xs text-gray-400 mt-1.5">Leave blank if your price already covers all guests.</p>
              {price.trim() && extraGuestPrice.trim() && (() => {
                const base = Number(minGuests) || 2
                const basePrice = Number(price) || 0
                const extra = Number(extraGuestPrice) || 0
                return (
                  <p className="text-xs font-medium text-[#2c4a1e] bg-[#eaf5e4] rounded-lg px-3 py-2 mt-2">
                    e.g. Ksh {basePrice.toLocaleString()} for {base} → Ksh {(basePrice + extra).toLocaleString()} for {base + 1}
                  </p>
                )
              })()}
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Seasonal rate overrides</label>
              <p className="text-xs text-gray-400 mb-3">
                Automatically charge a different price during a specific date range — e.g. a higher
                price over Christmas — instead of the base price.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                <input value={seasonLabel} onChange={(e) => setSeasonLabel(e.target.value)}
                  placeholder="Season name"
                  className="col-span-2 sm:col-span-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
                <input value={seasonStart} onChange={(e) => setSeasonStart(e.target.value)} type="date"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                <input value={seasonEnd} onChange={(e) => setSeasonEnd(e.target.value)} type="date"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                <div className="flex gap-2">
                  <input value={seasonPrice} onChange={(e) => setSeasonPrice(e.target.value)}
                    placeholder="Price"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                  <button onClick={addSeasonalRate}
                    className="px-3 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              {seasonalRates.length > 0 && (
                <div className="flex flex-col gap-2">
                  {seasonalRates.map((rate) => (
                    <div key={rate.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1a1a1a] truncate">{rate.label}</p>
                        <p className="text-xs text-gray-400">{rate.start_date} → {rate.end_date}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#1a1a1a] flex-shrink-0">{rate.price}</span>
                      <button onClick={() => removeSeasonalRate(rate.id)} className="flex-shrink-0"><X size={14} color="#888" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'availability' && (
          <>
            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Minimum lead time</label>
              <div className="flex items-center gap-2">
                <input value={minLeadTimeDays} onChange={(e) => setMinLeadTimeDays(e.target.value)}
                  type="number" placeholder="e.g. 3"
                  className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
                <span className="text-sm text-gray-500">days before departure</span>
              </div>
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Departures &amp; capacity</label>
              <p className="text-xs text-gray-400 mb-2">Set specific bookable dates and how many travellers each can take.</p>
              <div className="flex gap-2 mb-2">
                <input value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} type="date"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                <input value={departureCapacity} onChange={(e) => setDepartureCapacity(e.target.value)}
                  type="number" placeholder="Capacity"
                  className="w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                <button onClick={addDeparture}
                  className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
                  <Plus size={16} />
                </button>
              </div>
              {departures.length > 0 && (
                <div className="flex flex-col gap-2">
                  {departures.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                      <span className="text-sm text-[#1a1a1a]">{d.date}</span>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#eaf5e4] text-[#2c4a1e]">
                          Capacity {d.capacity}
                        </span>
                        <button onClick={() => removeDeparture(d.id)}><X size={14} color="#888" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Repeat departures */}
            <div className={FIELD_CARD}>
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[#1a1a1a]">Repeat this departure</label>
                <button type="button" onClick={() => setRepeatEnabled(e => !e)}
                  className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${repeatEnabled ? 'bg-[#e8734a]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${repeatEnabled ? 'translate-x-4' : ''}`} />
                </button>
              </div>
              {repeatEnabled && (
                <>
                  <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-[#1a1a1a]">
                    <span>Starting</span>
                    <input value={repeatStart} onChange={(e) => setRepeatStart(e.target.value)} type="date"
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2c4a1e]" />
                    <span>repeat every</span>
                    <input value={repeatEvery} onChange={(e) => setRepeatEvery(e.target.value)} type="number" min="1"
                      className="w-16 border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-[#2c4a1e]" />
                    <select value={repeatUnit} onChange={(e) => setRepeatUnit(e.target.value as 'week' | 'month')}
                      className="border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-[#2c4a1e] bg-white">
                      <option value="week">week(s)</option>
                      <option value="month">month(s)</option>
                    </select>
                    <span>for</span>
                    <input value={repeatCount} onChange={(e) => setRepeatCount(e.target.value)} type="number" min="1"
                      className="w-16 border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-[#2c4a1e]" />
                    <span>occurrences, capacity</span>
                    <input value={repeatCapacity} onChange={(e) => setRepeatCapacity(e.target.value)} type="number" min="1" placeholder="e.g. 10"
                      className="w-20 border border-gray-200 rounded-xl px-2 py-2 text-sm outline-none focus:border-[#2c4a1e]" />
                  </div>
                  {repeatDates.length > 0 && (
                    <div className="flex items-center justify-between gap-3 mt-3 p-3 rounded-xl border border-gray-200 bg-gray-50">
                      <span className="text-sm text-[#1a1a1a]">
                        {repeatDates[0]} → {repeatDates[repeatDates.length - 1]}, every {repeatEvery} {repeatUnit}{Number(repeatEvery) > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs font-semibold text-[#2c4a1e] bg-[#eaf5e4] px-2.5 py-1 rounded-full flex-shrink-0">
                        {repeatDates.length} dates
                      </span>
                    </div>
                  )}
                  <button type="button" onClick={applyRepeatDeparture}
                    disabled={!repeatCapacity.trim() || repeatDates.length === 0}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold
                               hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
                    Add {repeatDates.length || ''} departures
                  </button>
                </>
              )}
            </div>

            <div className={FIELD_CARD}>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Blocked dates</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                <input value={blockStart} onChange={(e) => setBlockStart(e.target.value)} type="date"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                <input value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} type="date"
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
                <div className="flex gap-2 col-span-2 sm:col-span-1">
                  <select value={blockReason} onChange={(e) => setBlockReason(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors bg-white">
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
                    <span key={b.id} className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                      {b.start_date} → {b.end_date}{b.reason ? ` · ${b.reason}` : ''}
                      <button onClick={() => removeBlockedDates(b.id)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === 'cancellation' && (
          <div className={`${FIELD_CARD} flex flex-col gap-2`}>
            {POLICIES.map((p) => (
              <button key={p.id} onClick={() => setCancellationPolicy(p.id)}
                className={`flex items-start gap-3 text-left p-3.5 rounded-xl border transition-all
                  ${cancellationPolicy === p.id ? 'border-[#2c4a1e] bg-[#eaf5e4]' : 'border-gray-200 hover:border-gray-300'}`}>
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
        )}

        {tab === 'house-rules' && (
          <div className={FIELD_CARD}>
            <div className="flex flex-wrap gap-2">
              {HOUSE_RULES_CATALOG.map(({ key, label, icon }) => {
                const checked = houseRules.includes(key)
                return (
                  <button key={key} type="button" onClick={() => toggleHouseRule(key)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors
                      ${checked ? 'bg-[#eaf5e4] text-[#2c4a1e] border-[#2c4a1e]' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                    {icon}
                    {label}
                  </button>
                )
              })}
            </div>
            <textarea value={additionalRules} onChange={(e) => setAdditionalRules(e.target.value)}
              rows={3} placeholder="Additional rules (optional)..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-4
                         outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
            <textarea value={additionalRequests} onChange={(e) => setAdditionalRequests(e.target.value)}
              rows={3} placeholder="Additional requests before guests leave (optional)..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-3
                         outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
          </div>
        )}

        {tab === 'safety' && (
          <div className={FIELD_CARD}>
            <div className="flex flex-col gap-2">
              {SAFETY_CATALOG.map(({ key, label, icon, needsNote }) => {
                const selected = safetyInfo.find(i => i.key === key)
                return (
                  <div key={key}>
                    <button type="button" onClick={() => toggleSafetyItem(key)}
                      className={`w-full flex items-center gap-2 text-left text-xs font-semibold px-3 py-2 rounded-xl border transition-colors
                        ${selected ? 'bg-[#eaf5e4] text-[#2c4a1e] border-[#2c4a1e]' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                      {icon}
                      {label}
                    </button>
                    {selected && needsNote && (
                      <input value={selected.note} onChange={(e) => setSafetyNote(key, e.target.value)}
                        placeholder="Add a note travellers will see (optional)"
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm mt-1.5
                                   outline-none focus:border-[#2c4a1e] transition-colors" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={!canSubmit || saving}
            className="px-5 py-3 rounded-xl border border-[#1a1a1a] text-[#1a1a1a]
                       font-semibold text-sm hover:bg-gray-50 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save as draft'}
          </button>
          <button
            onClick={() => setShowPreview(true)}
            disabled={!canSubmit || saving}
            className="px-5 py-3 rounded-xl bg-[#2c4a1e] text-white
                       font-semibold text-sm hover:bg-[#3d6b28] transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Publish listing
          </button>
        </div>
      </div>

      {showPreview && (
        <ListingPreviewModal
          onClose={() => setShowPreview(false)}
          onConfirm={canSubmit ? () => { setShowPreview(false); handleSubmit('active') } : undefined}
          confirmLabel="Looks good, publish"
          data={{
            title, images, locationPlaces, category,
            durationLabel: durationOptions[0]?.label,
            description, itinerary, amenities, houseRules,
            houseRulesCatalog: HOUSE_RULES_CATALOG,
            cancellationPolicy,
            cancellationLabel: POLICIES.find(p => p.id === cancellationPolicy)?.label ?? '',
            cancellationDescription: cancellationPolicy === 'custom'
              ? (customCancellationPolicy || 'Custom cancellation terms.')
              : (POLICIES.find(p => p.id === cancellationPolicy)?.description ?? ''),
            price,
          }}
        />
      )}
    </div>
  )
}
