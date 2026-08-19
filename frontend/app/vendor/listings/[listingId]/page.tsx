'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, X, Check, Trash2,
  PawPrint, VolumeX, Camera, Cigarette, Moon, DoorOpen,
  ShieldAlert, Shield, Ban, AlertTriangle, Volume2, Wifi,
} from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import PhotoManager from '@/components/vendor/PhotoManager'
import Toast from '@/components/Toast'

type Props = {
  params: Promise<{ listingId: string }>
}

const CATEGORIES = ['Safari', 'Stays', 'Experiences', 'Packages']
const STATUSES: Array<'active' | 'paused' | 'draft'> = ['active', 'paused', 'draft']
const BLOCK_REASONS = ['Maintenance', 'Fully booked', 'Guide unavailable', 'Other']

const AMENITY_CATALOG = [
  'Professional guide', 'Hotel pickup & drop-off', 'Airport transfers', 'Park/entry fees',
  'Breakfast', 'Lunch', 'Dinner', 'Bottled water', 'WiFi', 'Accommodation',
  'All game drives', 'Equipment & gear', 'Travel insurance', 'Laundry service',
  'Flying doctors cover', 'Parking',
]

const FIELD_CARD = 'bg-white border border-[#e0d9cc] rounded-2xl p-4 sm:p-5 shadow-sm'

// Fixed catalogs — travellers see these exact keys rendered with matching
// icons on the listing page, so vendors pick from a list instead of typing
// free text (keeps the icons meaningful and keeps the two sides in sync).
const HOUSE_RULES_CATALOG: { key: string; label: string; icon: React.ReactNode }[] = [
  { key: 'no_pets', label: 'No pets', icon: <PawPrint size={14} /> },
  { key: 'no_parties', label: 'No parties or events', icon: <VolumeX size={14} /> },
  { key: 'no_commercial_photography', label: 'No commercial photography', icon: <Camera size={14} /> },
  { key: 'smoking_allowed', label: 'Smoking is allowed', icon: <Cigarette size={14} /> },
  { key: 'quiet_hours', label: 'Quiet hours (10:00 PM \u2013 7:00 AM)', icon: <Moon size={14} /> },
  { key: 'self_check_in', label: 'Self check-in with keypad', icon: <DoorOpen size={14} /> },
]

// needsNote items show an extra text field once selected, e.g. "Pet(s) live
// on property" + a note like "Two friendly dogs" — mirrors Airbnb's format.
const SAFETY_CATALOG: { key: string; label: string; icon: React.ReactNode; needsNote: boolean }[] = [
  { key: 'no_carbon_monoxide_alarm', label: 'No carbon monoxide alarm', icon: <ShieldAlert size={14} />, needsNote: false },
  { key: 'no_smoke_alarm', label: 'No smoke alarm', icon: <ShieldAlert size={14} />, needsNote: false },
  { key: 'exterior_cameras', label: 'Exterior security cameras on property', icon: <Shield size={14} />, needsNote: false },
  { key: 'not_suitable_children', label: 'Not suitable for children (2\u201312 years)', icon: <Ban size={14} />, needsNote: false },
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

type LocalId = number | string

type ItineraryDay = { day: number; title: string; description: string }
type DurationOption = { id: LocalId; label: string; price: string }
type SeasonalRate = { id: LocalId; label: string; start_date: string; end_date: string; price: string }
type GroupDiscount = { id: LocalId; min_guests: number; discount_percent: number }
type Departure = { id: LocalId; date: string; capacity: number; booked: number }
type BlockedDate = { id: LocalId; start_date: string; end_date: string; reason: string }
type Extra = { id: LocalId; label: string; price: number; default_selected: boolean }

type ApiListingDetail = {
  id: number
  title: string
  category: string
  location: string
  description: string | null
  price: string
  child_price: string | null
  extra_guest_price: string | null
  status: 'active' | 'paused' | 'draft' | 'suspended'
  min_guests: number | null
  max_guests: number | null
  min_nights: number | null
  min_lead_time_days: number | null
  cancellation_policy: PolicyId
  custom_cancellation_text: string | null
  amenities: string[] | null
  excluded: string[] | null
  house_rules: { selected: string[]; additional_rules: string | null; additional_requests: string | null } | null
  safety_info: { key: string; note: string | null }[] | null
  bookings_count?: number
  earnings?: string | null
  images: { id: number; url: string }[]
  itinerary: { day: number; title: string; description: string | null }[]
  duration_options: { id: number; label: string; price: string | null }[]
  seasonal_rates: { id: number; label: string; start_date: string; end_date: string; price: string }[]
  group_discounts: { id: number; min_guests: number; discount_percent: number }[]
  departures: { id: number; date: string; capacity: number; booked: number }[]
  blocked_dates: { id: number; start_date: string; end_date: string; reason: string | null }[]
  extras: { id: number; label: string; price: string; default_selected: boolean }[]
}

function toDateInput(v: string | null | undefined): string {
  return v ? v.slice(0, 10) : ''
}
function numToStr(v: string | number | null | undefined): string {
  return v === null || v === undefined || v === '' ? '' : String(Number(v))
}
function parseMoney(v: string): number | null {
  const cleaned = v.replace(/[^0-9.]/g, '')
  if (!cleaned) return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

export default function EditListingPage({ params }: Props) {
  const { listingId } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [bookingsCount, setBookingsCount] = useState(0)
  const [earnings, setEarnings] = useState('0')

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'paused' | 'draft'>('draft')

  // ── Itinerary ──
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [itineraryTitle, setItineraryTitle] = useState('')
  const [itineraryDesc, setItineraryDesc] = useState('')

  // ── Included / excluded (single selection — excluded is derived) ──
  const [amenityOptions, setAmenityOptions] = useState<string[]>(AMENITY_CATALOG)
  const [amenities, setAmenities] = useState<string[]>([])
  const [amenityInput, setAmenityInput] = useState('')
  const excludedComputed = amenityOptions.filter(o => !amenities.includes(o))

  // ── Group size & duration ──
  const [minGuests, setMinGuests] = useState('')
  const [maxGuests, setMaxGuests] = useState('')
  const [minNights, setMinNights] = useState('')
  const [durationOptions, setDurationOptions] = useState<DurationOption[]>([])
  const [durationLabel, setDurationLabel] = useState('')
  const [durationPrice, setDurationPrice] = useState('')

  // ── Pricing rules ──
  const [extras, setExtras] = useState<Extra[]>([])
  const [extraLabel, setExtraLabel] = useState('')
  const [extraPrice, setExtraPrice] = useState('')
  const [extraGuestPrice, setExtraGuestPrice] = useState('')
  const [childPrice, setChildPrice] = useState('')
  const [groupDiscounts, setGroupDiscounts] = useState<GroupDiscount[]>([])
  const [discountMinGuests, setDiscountMinGuests] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>([])
  const [seasonLabel, setSeasonLabel] = useState('')
  const [seasonStart, setSeasonStart] = useState('')
  const [seasonEnd, setSeasonEnd] = useState('')
  const [seasonPrice, setSeasonPrice] = useState('')

  // ── Availability ──
  const [minLeadTimeDays, setMinLeadTimeDays] = useState('')
  const [departures, setDepartures] = useState<Departure[]>([])
  const [departureDate, setDepartureDate] = useState('')
  const [departureCapacity, setDepartureCapacity] = useState('')
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState(BLOCK_REASONS[0])

  // ── Cancellation policy ──
  const [cancellationPolicy, setCancellationPolicy] = useState<PolicyId>('moderate')
  const [customCancellationPolicy, setCustomCancellationPolicy] = useState('')

  // ── House rules & safety ──
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

  useEffect(() => {
    apiFetch<{ listing: ApiListingDetail }>(`/vendor/listings/${listingId}`)
      .then(({ listing }) => {
        setTitle(listing.title)
        setCategory(listing.category)
        setLocation(listing.location)
        setPrice(numToStr(listing.price))
        setImages(listing.images.map(img => img.url))
        setDescription(listing.description ?? '')
        setStatus(listing.status === 'suspended' ? 'draft' : listing.status)
        setBookingsCount(listing.bookings_count ?? 0)
        setEarnings(listing.earnings ?? '0')

        setItinerary(listing.itinerary.map(d => ({
          day: d.day, title: d.title, description: d.description ?? '',
        })))

        const savedAmenities = listing.amenities ?? []
        const savedExcluded = listing.excluded ?? []
        setAmenityOptions(Array.from(new Set([...AMENITY_CATALOG, ...savedAmenities, ...savedExcluded])))
        setAmenities(savedAmenities)

        setMinGuests(numToStr(listing.min_guests))
        setMaxGuests(numToStr(listing.max_guests))
        setMinNights(numToStr(listing.min_nights))
        setDurationOptions(listing.duration_options.map(d => ({
          id: d.id, label: d.label, price: numToStr(d.price),
        })))

        setExtras(listing.extras.map(e => ({
          id: e.id, label: e.label, price: Number(e.price), default_selected: e.default_selected,
        })))
        setExtraGuestPrice(numToStr(listing.extra_guest_price))
        setChildPrice(numToStr(listing.child_price))
        setGroupDiscounts(listing.group_discounts.map(g => ({
          id: g.id, min_guests: g.min_guests, discount_percent: g.discount_percent,
        })))
        setSeasonalRates(listing.seasonal_rates.map(r => ({
          id: r.id, label: r.label, start_date: toDateInput(r.start_date),
          end_date: toDateInput(r.end_date), price: numToStr(r.price),
        })))

        setMinLeadTimeDays(numToStr(listing.min_lead_time_days))
        setDepartures(listing.departures.map(d => ({
          id: d.id, date: toDateInput(d.date), capacity: d.capacity, booked: d.booked,
        })))
        setBlockedDates(listing.blocked_dates.map(b => ({
          id: b.id, start_date: toDateInput(b.start_date), end_date: toDateInput(b.end_date),
          reason: b.reason ?? '',
        })))

        setCancellationPolicy(listing.cancellation_policy)
        setCustomCancellationPolicy(listing.custom_cancellation_text ?? '')
        setHouseRules(listing.house_rules?.selected ?? [])
        setSafetyInfo((listing.safety_info ?? []).map(i => ({ key: i.key, note: i.note ?? '' })))
        setAdditionalRules(listing.house_rules?.additional_rules ?? '')
        setAdditionalRequests(listing.house_rules?.additional_requests ?? '')
      })
      .catch((err) => {
        setNotFound(true)
        setLoadError(apiErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [listingId])

  useEffect(() => {
    const msg = sessionStorage.getItem('vendorToast')
    if (msg) {
      setToast(msg)
      sessionStorage.removeItem('vendorToast')
    }
  }, [])

  const canSave = title.trim() && location.trim() && price.trim()

  function toggleAmenity(item: string) {
    setAmenities(a => a.includes(item) ? a.filter(x => x !== item) : [...a, item])
  }
  function addAmenityOption() {
    const val = amenityInput.trim()
    if (!val) return
    setAmenityOptions(opts => opts.includes(val) ? opts : [...opts, val])
    setAmenities(a => a.includes(val) ? a : [...a, val])
    setAmenityInput('')
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
  function removeDurationOption(id: LocalId) {
    setDurationOptions(d => d.filter(x => x.id !== id))
  }

  function addGroupDiscount() {
    if (!discountMinGuests.trim() || !discountPercent.trim()) return
    setGroupDiscounts(g => [...g, {
      id: `gd_${Date.now()}`, min_guests: Number(discountMinGuests), discount_percent: Number(discountPercent),
    }])
    setDiscountMinGuests(''); setDiscountPercent('')
  }
  function removeGroupDiscount(id: LocalId) {
    setGroupDiscounts(g => g.filter(x => x.id !== id))
  }

  function addExtra() {
    if (!extraLabel.trim() || !extraPrice.trim()) return
    setExtras(e => [...e, {
      id: `ex_${Date.now()}`, label: extraLabel.trim(),
      price: Number(extraPrice) || 0, default_selected: false,
    }])
    setExtraLabel(''); setExtraPrice('')
  }
  function removeExtra(id: LocalId) {
    setExtras(e => e.filter(x => x.id !== id))
  }
  function toggleExtraDefault(id: LocalId) {
    setExtras(e => e.map(x => x.id === id ? { ...x, default_selected: !x.default_selected } : x))
  }

  function addSeasonalRate() {
    if (!seasonLabel.trim() || !seasonStart || !seasonEnd || !seasonPrice.trim()) return
    setSeasonalRates(s => [...s, {
      id: `sr_${Date.now()}`, label: seasonLabel.trim(),
      start_date: seasonStart, end_date: seasonEnd, price: seasonPrice.trim(),
    }])
    setSeasonLabel(''); setSeasonStart(''); setSeasonEnd(''); setSeasonPrice('')
  }
  function removeSeasonalRate(id: LocalId) {
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
  function removeDeparture(id: LocalId) {
    setDepartures(d => d.filter(x => x.id !== id))
  }

  function addBlockedDates() {
    if (!blockStart || !blockEnd) return
    setBlockedDates(b => [...b, { id: `bd_${Date.now()}`, start_date: blockStart, end_date: blockEnd, reason: blockReason }])
    setBlockStart(''); setBlockEnd('')
  }
  function removeBlockedDates(id: LocalId) {
    setBlockedDates(b => b.filter(x => x.id !== id))
  }

  async function handleSave() {
    if (!canSave) return

    setSaving(true)
    setSaveError('')
    try {
      const { listing } = await apiFetch<{ listing: ApiListingDetail }>(`/vendor/listings/${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          category,
          location: location.trim(),
          price: parseMoney(price),
          description: description.trim() || null,
          amenities,
          excluded: excludedComputed,
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
          group_discounts: groupDiscounts.map(({ min_guests, discount_percent }) => ({ min_guests, discount_percent })),
          seasonal_rates: seasonalRates.map(r => ({
            label: r.label, start_date: r.start_date, end_date: r.end_date, price: parseMoney(r.price),
          })),
          departures: departures.map(({ date, capacity, booked }) => ({ date, capacity, booked })),
          blocked_dates: blockedDates.map(({ start_date, end_date, reason }) => ({ start_date, end_date, reason: reason || null })),
          extras: extras.map(({ label, price: p, default_selected }) => ({ label, price: p, default_selected })),
        }),
      })

      // Re-sync local IDs with the freshly recreated rows from the backend.
      setDurationOptions(listing.duration_options.map(d => ({ id: d.id, label: d.label, price: numToStr(d.price) })))
      setGroupDiscounts(listing.group_discounts.map(g => ({ id: g.id, min_guests: g.min_guests, discount_percent: g.discount_percent })))
      setSeasonalRates(listing.seasonal_rates.map(r => ({
        id: r.id, label: r.label, start_date: toDateInput(r.start_date), end_date: toDateInput(r.end_date), price: numToStr(r.price),
      })))
      setDepartures(listing.departures.map(d => ({ id: d.id, date: toDateInput(d.date), capacity: d.capacity, booked: d.booked })))
      setBlockedDates(listing.blocked_dates.map(b => ({
        id: b.id, start_date: toDateInput(b.start_date), end_date: toDateInput(b.end_date), reason: b.reason ?? '',
      })))
      setExtras(listing.extras.map(e => ({ id: e.id, label: e.label, price: Number(e.price), default_selected: e.default_selected })))

      sessionStorage.setItem('vendorToast', 'Listing updated')
      router.push('/vendor/listings')
    } catch (err) {
      setSaveError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setSaveError('')
    try {
      await apiFetch(`/vendor/listings/${listingId}`, { method: 'DELETE' })
      router.push('/vendor/listings')
    } catch (err) {
      setSaveError(apiErrorMessage(err))
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-5 lg:p-8 max-w-2xl mx-auto text-center pt-20">
        <p className="text-sm text-gray-500 mb-4">{loadError || 'Listing not found.'}</p>
        <button onClick={() => router.push('/vendor/listings')}
          className="text-sm font-semibold text-[#2c4a1e] underline">
          Back to listings
        </button>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto overflow-x-hidden">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <button onClick={() => router.push('/vendor/listings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to listings
      </button>

      <p className="text-sm text-gray-500 mb-6">
        {bookingsCount} bookings · Earned Ksh {Math.round(Number(earnings)).toLocaleString()}
      </p>

      {saveError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {saveError}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className={FIELD_CARD}>
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

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div className={FIELD_CARD}>
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

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Photos</label>
          <PhotoManager images={images} onChange={setImages} />
        </div>

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
        </div>

        {/* ══ ITINERARY ══ */}
        <div>
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">Itinerary</h2>
          <p className="text-sm text-gray-500 mb-4">Day-by-day breakdown for guests.</p>
        </div>

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
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
            What&apos;s included
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Select everything included in this listing. Anything left unchecked will automatically
            show to guests as excluded.
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {amenityOptions.map((item) => {
              const checked = amenities.includes(item)
              return (
                <button key={item} type="button" onClick={() => toggleAmenity(item)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors
                    ${checked
                      ? 'bg-[#eaf5e4] text-[#2c4a1e] border-[#2c4a1e]'
                      : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                  {checked ? <Check size={12} /> : <X size={12} />}
                  {item}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenityOption() } }}
              placeholder="Add another item..."
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addAmenityOption}
              className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors">
              <Plus size={16} />
            </button>
          </div>
          {excludedComputed.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Showing as excluded to guests</p>
              <div className="flex flex-wrap gap-2">
                {excludedComputed.map((item) => (
                  <span key={item}
                    className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1.5 rounded-full">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══ GROUP SIZE & DURATION ══ */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 mt-4">Group size &amp; duration</h2>
          <p className="text-sm text-gray-500 mb-4">Set booking limits and available durations.</p>
        </div>

        <div className={`${FIELD_CARD} grid grid-cols-2 gap-3`}>
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Min guests</label>
            <input value={minGuests} onChange={(e) => setMinGuests(e.target.value)}
              type="number" placeholder="e.g. 2"
              className="w-full min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)}
              type="number" placeholder="e.g. 12"
              className="w-full min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />

          </div>
        </div>

        {category === 'Stays' && (
          <div className={FIELD_CARD}>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Minimum nights</label>
            <div className="flex items-center gap-2">
              <input value={minNights} onChange={(e) => setMinNights(e.target.value)}
                type="number" placeholder="e.g. 2"
                className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
              <span className="text-sm text-gray-500">nights minimum stay</span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              Optional. Leave blank to allow guests to book any length of stay.
            </p>
          </div>
        )}

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Duration options</label>
          <div className="flex gap-2 mb-2">
            <input value={durationLabel} onChange={(e) => setDurationLabel(e.target.value)}
              placeholder="e.g. 3 Days / 2 Nights"
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
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

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Base price (per adult)</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)}
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

        {(category === 'Safari' || category === 'Packages') && (
          <div className={FIELD_CARD}>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Group discounts</label>
            <div className="flex gap-2 mb-2">
              <input value={discountMinGuests} onChange={(e) => setDiscountMinGuests(e.target.value)}
                type="number" placeholder="Min guests"
                className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
              <input value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)}
                type="number" placeholder="Discount %"
                className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
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
        )}

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Extras &amp; add-ons</label>
          <div className="flex gap-2 mb-2">
            <input value={extraLabel} onChange={(e) => setExtraLabel(e.target.value)}
              placeholder="e.g. Hot air balloon safari"
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
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
                    <input type="checkbox" checked={item.default_selected}
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

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
            Price per additional guest
          </label>
          <input value={extraGuestPrice} onChange={(e) => setExtraGuestPrice(e.target.value)}
            placeholder="e.g. 10000 (optional)"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
          <p className="text-xs text-gray-400 mt-1.5">Leave blank if your price already covers all guests.</p>
        </div>

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
            Seasonal rate overrides
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
            <input value={seasonLabel} onChange={(e) => setSeasonLabel(e.target.value)}
              placeholder="Season name"
              className="col-span-2 sm:col-span-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={seasonStart} onChange={(e) => setSeasonStart(e.target.value)}
              type="date"
              className="min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={seasonEnd} onChange={(e) => setSeasonEnd(e.target.value)}
              type="date"
              className="min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <div className="flex gap-2 min-w-0">
              <input value={seasonPrice} onChange={(e) => setSeasonPrice(e.target.value)}
                placeholder="Price"
                className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
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
                    <p className="text-xs text-gray-400">{rate.start_date} → {rate.end_date}</p>
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

        <div className={FIELD_CARD}>
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

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Departures &amp; capacity</label>
          <p className="text-xs text-gray-400 mb-2">
            Set specific bookable dates and how many travellers each can take.
          </p>
          <div className="flex gap-2 mb-2">
            <input value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
              type="date"
              className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
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

        <div className={FIELD_CARD}>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Blocked dates</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
            <input value={blockStart} onChange={(e) => setBlockStart(e.target.value)}
              type="date"
              className="min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)}
              type="date"
              className="min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <div className="flex gap-2 col-span-2 sm:col-span-1 min-w-0">
              <select value={blockReason} onChange={(e) => setBlockReason(e.target.value)}
                className="flex-1 min-w-0 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
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
                  {b.start_date} → {b.end_date}{b.reason ? ` · ${b.reason}` : ''}
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

        <div className={`${FIELD_CARD} flex flex-col gap-2`}>
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

        {/* ══ HOUSE RULES ══ */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 mt-4">
            {category === 'Stays' ? 'House rules' : 'Tour rules'}
          </h2>
          <p className="text-sm text-gray-500 mb-4">Select what applies \u2014 travellers see these on your listing page.</p>
        </div>
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
            rows={3} placeholder="Additional rules (optional) \u2014 e.g. arrival directions, extra guest policy..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-4
                       outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
          <textarea value={additionalRequests} onChange={(e) => setAdditionalRequests(e.target.value)}
            rows={3} placeholder="Additional requests before guests leave (optional) \u2014 e.g. return keys, turn things off..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-3
                       outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
        </div>

        {/* ══ SAFETY & PROPERTY ══ */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-lg font-bold text-[#1a1a1a] mb-1 mt-4">
            {category === 'Stays' ? 'Safety & property' : 'Safety information'}
          </h2>
          <p className="text-sm text-gray-500 mb-4">Select anything travellers should know before booking.</p>
        </div>
        <div className={`${FIELD_CARD} flex flex-col gap-2`}>
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

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center justify-center gap-1.5 border border-red-200
                       text-red-500 px-5 py-3 rounded-xl font-semibold text-sm
                       hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} /> Delete listing
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className="flex-1 bg-[#2c4a1e] text-white py-3 rounded-xl
                       font-semibold text-sm hover:bg-[#3d6b28] transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setConfirmingDelete(false) }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">Delete this listing?</h2>
            <p className="text-sm text-gray-500 mb-5">
              This permanently deletes the listing and cannot be undone.
            </p>
            {saveError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {saveError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setConfirmingDelete(false)} disabled={deleting}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                     text-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold
                     hover:bg-red-700 transition-colors disabled:opacity-50">
                {deleting ? 'Deleting…' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

