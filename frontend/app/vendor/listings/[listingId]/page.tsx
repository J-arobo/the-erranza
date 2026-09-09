'use client'
import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, X, Check, Trash2, ChevronDown, Eye,
  PawPrint, VolumeX, Camera, Cigarette, Moon, DoorOpen,
  ShieldAlert, Shield, Ban, AlertTriangle, Pencil, Volume2, Wifi,
} from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import PhotoManager from '@/components/vendor/PhotoManager'
import Toast from '@/components/Toast'
import LocationChainInput, { buildLocationString, parseLocationString } from '@/components/vendor/LocationChainInput'
import ListingTabs, { TabSection } from '@/components/vendor/ListingTabs'
import EditableCard from '@/components/vendor/EditableCard'
import ListingPreviewModal from '@/components/vendor/ListingPreviewModal'
import MoneyInput from '@/components/vendor/MoneyInput'

type Props = {
  params: Promise<{ listingId: string }>
}

const ALL_CATEGORIES = ['Safari', 'Stays', 'Experiences', 'Packages']
const STATUSES: Array<'active' | 'paused' | 'draft'> = ['active', 'paused', 'draft']
const BLOCK_REASONS = ['Maintenance', 'Fully booked', 'Guide unavailable', 'Other']

const AMENITY_CATALOG = [
  'Professional guide', 'Hotel pickup & drop-off', 'Airport transfers', 'Park/entry fees',
  'Breakfast', 'Lunch', 'Dinner', 'Bottled water', 'WiFi', 'Accommodation',
  'All game drives', 'Equipment & gear', 'Travel insurance', 'Laundry service',
  'Flying doctors cover', 'Parking',
]

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
  allow_custom_dates: boolean
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
  group_pricing_tiers: { id: number; people_count: number; total_price: string }[]
  departures: { id: number; date: string; capacity: number; booked: number }[]
  blocked_dates: { id: number; start_date: string; end_date: string; reason: string | null }[]
  extras: { id: number; label: string; price: string; default_selected: boolean }[]
  included_guests: number
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

type SnapshotInput = {
  title: string; category: string; locationPlaces: string[]; images: string[]; description: string; status: string
  itinerary: ItineraryDay[]; amenities: string[]
  minGuests: string; maxGuests: string; minNights: string; durationOptions: DurationOption[]
  price: string; childPrice: string; extraGuestPrice: string
  groupDiscounts: GroupDiscount[]; groupPricingTiers: { people_count: number; total_price: number }[]
  extras: Extra[]; seasonalRates: SeasonalRate[]
  minLeadTimeDays: string; departures: Departure[]; blockedDates: BlockedDate[]
  cancellationPolicy: PolicyId; customCancellationPolicy: string
  houseRules: string[]; safetyInfo: { key: string; note: string }[]
  additionalRules: string; additionalRequests: string
  allowCustomDates: boolean
  includedGuests: string
}

function formatSnapshot(f: SnapshotInput): Record<string, string> {
  const houseRuleLabel = (key: string) => HOUSE_RULES_CATALOG.find(r => r.key === key)?.label ?? key
  const safetyLabel = (key: string) => SAFETY_CATALOG.find(c => c.key === key)?.label ?? key
  const policyLabel = (id: string) => POLICIES.find(p => p.id === id)?.label ?? id

  return {
    'Title': f.title || 'None',
    'Category': f.category || 'None',
    'Location': f.locationPlaces.length > 0 ? f.locationPlaces.join(' → ') : 'None set',
    'Photos': `${f.images.length} photo${f.images.length === 1 ? '' : 's'}`,
    'Description': f.description || 'None',
    'Status': f.status,
    'Itinerary': f.itinerary.length > 0
      ? f.itinerary.map(d => `Day ${d.day}: ${d.title}`).join('; ')
      : 'No days added',
    "What's included": f.amenities.length > 0 ? f.amenities.slice().sort().join(', ') : 'None selected',
    'Group size': `Min ${f.minGuests || '—'}, Max ${f.maxGuests || '—'}`,
    'Minimum nights': f.minNights ? `${f.minNights} nights` : 'No minimum',
    'Duration options': f.durationOptions.length > 0
      ? f.durationOptions.map(d => d.price ? `${d.label} (Ksh ${d.price})` : d.label).join('; ')
      : 'None added',
    'Base price': f.price ? `Ksh ${f.price}` : 'Not set',
    'Included guests': f.includedGuests ? `${f.includedGuests} guest${f.includedGuests === '1' ? '' : 's'}` : '1 guest',
    'Child price': f.childPrice ? `Ksh ${f.childPrice}` : 'Same as adult price',
    'Price per additional guest': f.extraGuestPrice ? `Ksh ${f.extraGuestPrice}` : 'Not set',
    'Group discounts': f.groupDiscounts.length > 0
      ? f.groupDiscounts.map(g => `${g.min_guests}+ guests: ${g.discount_percent}% off`).join('; ')
      : 'None',
    'Group pricing': f.groupPricingTiers.length > 0
      ? f.groupPricingTiers.map(t => `${t.people_count} people: Ksh ${t.total_price}`).join('; ')
      : 'None',
    'Extras & add-ons': f.extras.length > 0
      ? f.extras.map(e => `${e.label} (Ksh ${e.price}${e.default_selected ? ', default' : ''})`).join('; ')
      : 'None',
    'Seasonal rates': f.seasonalRates.length > 0
      ? f.seasonalRates.map(r => `${r.label}: ${r.start_date} to ${r.end_date} at Ksh ${r.price}`).join('; ')
      : 'None',
    'Minimum lead time': f.minLeadTimeDays ? `${f.minLeadTimeDays} days before departure` : 'None',
    'Departures': f.departures.length > 0
      ? f.departures.map(d => `${d.date} (capacity ${d.capacity})`).join('; ')
      : 'None added',
    'Blocked dates': f.blockedDates.length > 0
      ? f.blockedDates.map(b => `${b.start_date} to ${b.end_date}${b.reason ? ` (${b.reason})` : ''}`).join('; ')
      : 'None',
    'Cancellation policy': policyLabel(f.cancellationPolicy),
    'Custom cancellation text': f.customCancellationPolicy || 'None',
    'House/tour rules': f.houseRules.length > 0
      ? f.houseRules.slice().sort().map(houseRuleLabel).join(', ')
      : 'None selected',
    'Safety info': f.safetyInfo.length > 0
      ? f.safetyInfo.slice().sort((a, b) => a.key.localeCompare(b.key))
        .map(s => s.note ? `${safetyLabel(s.key)} (${s.note})` : safetyLabel(s.key)).join('; ')
      : 'None selected',
    'Additional rules': f.additionalRules || 'None',
    'Additional requests': f.additionalRequests || 'None',
    'Allow custom dates': f.allowCustomDates ? 'Yes' : 'No',
  }
}


export default function EditListingPage({ params }: Props) {
  const { listingId } = use(params)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<'active' | 'paused' | 'draft' | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const [bookingsCount, setBookingsCount] = useState(0)
  const [earnings, setEarnings] = useState('0')

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(ALL_CATEGORIES[0])
  const [locationPlaces, setLocationPlaces] = useState<string[]>([])
  const [price, setPrice] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'active' | 'paused' | 'draft'>('draft')

  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [editDayTitle, setEditDayTitle] = useState('')
  const [editDayDesc, setEditDayDesc] = useState('')
  // Pause labels
  const STATUS_LABELS: Record<'active' | 'paused' | 'draft', string> = { active: 'Active', paused: 'Pause', draft: 'Draft' }


  function startEditDay(d: ItineraryDay) {
    setEditingDay(d.day)
    setEditDayTitle(d.title)
    setEditDayDesc(d.description)
  }
  function saveEditDay() {
    setItinerary(it => it.map(d => d.day === editingDay ? { ...d, title: editDayTitle.trim(), description: editDayDesc.trim() } : d))
    setEditingDay(null)
  }

  const [vendorCategories, setVendorCategories] = useState<string[]>(ALL_CATEGORIES)
  useEffect(() => {
    apiFetch<{ vendor: { categories: string[] | null } }>('/vendor/me')
      .then(({ vendor }) => {
        if (vendor.categories && vendor.categories.length > 0) setVendorCategories(vendor.categories)
      })
      .catch(() => { })
  }, [])
  const categoryOptions = vendorCategories.includes(category) ? vendorCategories : [category, ...vendorCategories]

  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [itineraryTitle, setItineraryTitle] = useState('')
  const [itineraryDesc, setItineraryDesc] = useState('')

  const [amenityOptions, setAmenityOptions] = useState<string[]>(AMENITY_CATALOG)
  const [amenities, setAmenities] = useState<string[]>([])
  const [amenityInput, setAmenityInput] = useState('')
  const excludedComputed = amenityOptions.filter(o => !amenities.includes(o))

  const [minGuests, setMinGuests] = useState('')
  const [maxGuests, setMaxGuests] = useState('')
  const [minNights, setMinNights] = useState('')
  const [durationOptions, setDurationOptions] = useState<DurationOption[]>([])
  const [durationLabel, setDurationLabel] = useState('')
  const [durationPrice, setDurationPrice] = useState('')

  const [extras, setExtras] = useState<Extra[]>([])
  const [extraLabel, setExtraLabel] = useState('')
  const [extraPrice, setExtraPrice] = useState('')
  const [extraGuestPrice, setExtraGuestPrice] = useState('')
  const [includedGuests, setIncludedGuests] = useState('1')
  const [childPrice, setChildPrice] = useState('')
  const [groupDiscounts, setGroupDiscounts] = useState<GroupDiscount[]>([])
  const [discountMinGuests, setDiscountMinGuests] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [seasonalRates, setSeasonalRates] = useState<SeasonalRate[]>([])
  const [seasonLabel, setSeasonLabel] = useState('')
  const [seasonStart, setSeasonStart] = useState('')
  const [seasonEnd, setSeasonEnd] = useState('')
  const [seasonPrice, setSeasonPrice] = useState('')

  const [minLeadTimeDays, setMinLeadTimeDays] = useState('')
  const [departures, setDepartures] = useState<Departure[]>([])
  const [departureDate, setDepartureDate] = useState('')
  const [departureCapacity, setDepartureCapacity] = useState('')
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [blockStart, setBlockStart] = useState('')
  const [blockEnd, setBlockEnd] = useState('')
  const [blockReason, setBlockReason] = useState(BLOCK_REASONS[0])

  const [repeatEnabled, setRepeatEnabled] = useState(false)
  const [repeatStart, setRepeatStart] = useState('')
  const [repeatUnit, setRepeatUnit] = useState<'week' | 'month'>('week')
  const [repeatEvery, setRepeatEvery] = useState('1')
  const [repeatCount, setRepeatCount] = useState('8')
  const [repeatCapacity, setRepeatCapacity] = useState('')
  const [groupPricingTiers, setGroupPricingTiers] = useState<{ id: LocalId; people_count: number; total_price: number }[]>([])
  const [tierPeopleCount, setTierPeopleCount] = useState('')
  const [tierTotalPrice, setTierTotalPrice] = useState('')
  // confirm save
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showRevertConfirm, setShowRevertConfirm] = useState(false)
  const [allowCustomDates, setAllowCustomDates] = useState(false)

  function getFieldDiff() {
    const current = buildSnapshotFields()
    const saved = savedSnapshotRef.current
    return Object.keys(current)
      .filter(k => current[k] !== saved[k])
      .map(k => ({ label: k, from: saved[k] ?? '', to: current[k] ?? '' }))
  }

  function requestSave() {
    const diff = getFieldDiff()
    if (diff.length === 0) { handleSave(); return }
    setChangedFields(diff)
    setShowSaveConfirm(true)
  }

  function requestRevert() {
    if (!isDirty) return
    setShowRevertConfirm(true)
  }

  function confirmRevert() {
    loadListing()
    setShowRevertConfirm(false)
  }

  async function confirmSave() {
    setShowSaveConfirm(false)
    await handleSave()
  }

  function addGroupPricingTier() {
    if (!tierPeopleCount.trim() || !tierTotalPrice.trim()) return
    setGroupPricingTiers(t => [...t, {
      id: `gpt_${Date.now()}`, people_count: Number(tierPeopleCount), total_price: Number(tierTotalPrice),
    }].sort((a, b) => a.people_count - b.people_count))
    setTierPeopleCount(''); setTierTotalPrice('')
  }
  function removeGroupPricingTier(id: LocalId) {
    setGroupPricingTiers(t => t.filter(x => x.id !== id))
  }


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

  const [tab, setTab] = useState('basics')
  const [pendingTab, setPendingTab] = useState<string | null>(null)
  const [changedFields, setChangedFields] = useState<{ label: string; from: string; to: string }[]>([])
  const savedSnapshotRef = useRef<Record<string, string>>({})

  function buildSnapshotFields(): Record<string, string> {
    return formatSnapshot({
      title, category, locationPlaces, images, description, status,
      itinerary, amenities, minGuests, maxGuests, minNights, durationOptions,
      price, childPrice, extraGuestPrice, groupDiscounts, groupPricingTiers, extras, seasonalRates,
      minLeadTimeDays, departures, blockedDates, cancellationPolicy, customCancellationPolicy,
      houseRules, safetyInfo, additionalRules, additionalRequests, allowCustomDates, includedGuests,
    })
  }

  const isDirty = getFieldDiff().length > 0

  function requestTabChange(id: string) {
    if (id === tab) return
    const current = buildSnapshotFields()
    const saved = savedSnapshotRef.current
    const diff = Object.keys(current)
      .filter(k => current[k] !== saved[k])
      .map(k => ({ label: k, from: saved[k] ?? '', to: current[k] ?? '' }))
    if (diff.length > 0) {
      setChangedFields(diff)
      setPendingTab(id)
    } else {
      setTab(id)
    }
  }

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

  function loadListing() {
    setLoading(true)
    apiFetch<{ listing: ApiListingDetail }>(`/vendor/listings/${listingId}`)
      .then(({ listing }) => {
        const places = parseLocationString(listing.location)
        const mappedItinerary = listing.itinerary.map(d => ({
          day: d.day, title: d.title, description: d.description ?? '',
        }))
        const savedAmenities = listing.amenities ?? []
        const savedExcluded = listing.excluded ?? []
        const mergedAmenityOptions = Array.from(new Set([...AMENITY_CATALOG, ...savedAmenities, ...savedExcluded]))
        const mappedDurationOptions = listing.duration_options.map(d => ({
          id: d.id, label: d.label, price: numToStr(d.price),
        }))
        const mappedExtras = listing.extras.map(e => ({
          id: e.id, label: e.label, price: Number(e.price), default_selected: e.default_selected,
        }))
        const mappedGroupDiscounts = listing.group_discounts.map(g => ({
          id: g.id, min_guests: g.min_guests, discount_percent: g.discount_percent,
        }))
        const mappedGroupPricingTiers = listing.group_pricing_tiers.map(t => ({
          id: t.id, people_count: t.people_count, total_price: Number(t.total_price),
        }))
        const mappedSeasonalRates = listing.seasonal_rates.map(r => ({
          id: r.id, label: r.label, start_date: toDateInput(r.start_date),
          end_date: toDateInput(r.end_date), price: numToStr(r.price),
        }))
        const mappedDepartures = listing.departures.map(d => ({
          id: d.id, date: toDateInput(d.date), capacity: d.capacity, booked: d.booked,
        }))
        const mappedBlockedDates = listing.blocked_dates.map(b => ({
          id: b.id, start_date: toDateInput(b.start_date), end_date: toDateInput(b.end_date),
          reason: b.reason ?? '',
        }))
        const mappedSafetyInfo = (listing.safety_info ?? []).map(i => ({ key: i.key, note: i.note ?? '' }))
        const mappedHouseRules = listing.house_rules?.selected ?? []
        const mappedAdditionalRules = listing.house_rules?.additional_rules ?? ''
        const mappedAdditionalRequests = listing.house_rules?.additional_requests ?? ''

        setTitle(listing.title)
        setCategory(listing.category)
        setLocationPlaces(places)
        setPrice(numToStr(listing.price))
        setImages(listing.images.map(img => img.url))
        setDescription(listing.description ?? '')
        setStatus(listing.status === 'suspended' ? 'draft' : listing.status)
        setBookingsCount(listing.bookings_count ?? 0)
        setEarnings(listing.earnings ?? '0')
        setItinerary(mappedItinerary)
        setAmenityOptions(mergedAmenityOptions)
        setAmenities(savedAmenities)
        setMinGuests(numToStr(listing.min_guests))
        setMaxGuests(numToStr(listing.max_guests))
        setMinNights(numToStr(listing.min_nights))
        setDurationOptions(mappedDurationOptions)
        setExtras(mappedExtras)
        setExtraGuestPrice(numToStr(listing.extra_guest_price))
        setChildPrice(numToStr(listing.child_price))
        setGroupDiscounts(mappedGroupDiscounts)
        setGroupPricingTiers(mappedGroupPricingTiers)
        setSeasonalRates(mappedSeasonalRates)
        setMinLeadTimeDays(numToStr(listing.min_lead_time_days))
        setDepartures(mappedDepartures)
        setBlockedDates(mappedBlockedDates)
        setCancellationPolicy(listing.cancellation_policy)
        setCustomCancellationPolicy(listing.custom_cancellation_text ?? '')
        setHouseRules(mappedHouseRules)
        setSafetyInfo(mappedSafetyInfo)
        setAdditionalRules(mappedAdditionalRules)
        setAdditionalRequests(mappedAdditionalRequests)
        setAllowCustomDates(listing.allow_custom_dates)
        setIncludedGuests(numToStr(listing.included_guests) || '1')

        savedSnapshotRef.current = formatSnapshot({
          title: listing.title, category: listing.category, locationPlaces: places,
          images: listing.images.map(img => img.url), description: listing.description ?? '',
          status: listing.status === 'suspended' ? 'draft' : listing.status,
          itinerary: mappedItinerary, amenities: savedAmenities,
          minGuests: numToStr(listing.min_guests), maxGuests: numToStr(listing.max_guests),
          minNights: numToStr(listing.min_nights), durationOptions: mappedDurationOptions,
          price: numToStr(listing.price), childPrice: numToStr(listing.child_price),
          extraGuestPrice: numToStr(listing.extra_guest_price), groupDiscounts: mappedGroupDiscounts,
          groupPricingTiers: mappedGroupPricingTiers,
          extras: mappedExtras, seasonalRates: mappedSeasonalRates,
          minLeadTimeDays: numToStr(listing.min_lead_time_days), departures: mappedDepartures,
          blockedDates: mappedBlockedDates, cancellationPolicy: listing.cancellation_policy,
          customCancellationPolicy: listing.custom_cancellation_text ?? '',
          houseRules: mappedHouseRules, safetyInfo: mappedSafetyInfo,
          additionalRules: mappedAdditionalRules, additionalRequests: mappedAdditionalRequests,
          allowCustomDates: listing.allow_custom_dates,
          includedGuests: numToStr(listing.included_guests) || '1'
        })
      })
      .catch((err) => {
        setNotFound(true)
        setLoadError(apiErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadListing()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId])

  useEffect(() => {
    const msg = sessionStorage.getItem('vendorToast')
    if (msg) {
      setToast(msg)
      sessionStorage.removeItem('vendorToast')
    }
  }, [])

  // Refreshing without saving warns the vendor to save
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      const current = buildSnapshotFields()
      const saved = savedSnapshotRef.current
      const dirty = Object.keys(current).some(k => current[k] !== saved[k])
      if (dirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])


  const canSave = title.trim() && locationPlaces.length > 0 && price.trim()

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

  const [editingDeparture, setEditingDeparture] = useState<LocalId | null>(null)
  const [editDepDate, setEditDepDate] = useState('')
  const [editDepCapacity, setEditDepCapacity] = useState('')
  const [departureBlockedNotice, setDepartureBlockedNotice] = useState<LocalId | null>(null)
  const todayStr = new Date().toISOString().slice(0, 10)

  function startEditDeparture(d: Departure) {
    if (d.booked > 0) {
      setDepartureBlockedNotice(d.id)
      return
    }
    setDepartureBlockedNotice(null)
    setEditingDeparture(d.id)
    setEditDepDate(d.date)
    setEditDepCapacity(String(d.capacity))
  }
  function saveEditDeparture() {
    setDepartures(ds => ds.map(d => d.id === editingDeparture
      ? { ...d, date: editDepDate, capacity: Number(editDepCapacity) }
      : d).sort((a, b) => a.date.localeCompare(b.date)))
    setEditingDeparture(null)
  }

  function addBlockedDates() {
    if (!blockStart || !blockEnd) return
    setBlockedDates(b => [...b, { id: `bd_${Date.now()}`, start_date: blockStart, end_date: blockEnd, reason: blockReason }])
    setBlockStart(''); setBlockEnd('')
  }
  function removeBlockedDates(id: LocalId) {
    setBlockedDates(b => b.filter(x => x.id !== id))
  }

  async function handleSave(): Promise<boolean> {
    if (!canSave) return false

    setSaving(true)
    setSaveError('')
    const location = buildLocationString(locationPlaces)
    try {
      const { listing } = await apiFetch<{ listing: ApiListingDetail }>(`/vendor/listings/${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          category,
          location,
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
          group_pricing_tiers: groupPricingTiers.map(({ people_count, total_price }) => ({ people_count, total_price })),
          seasonal_rates: seasonalRates.map(r => ({
            label: r.label, start_date: r.start_date, end_date: r.end_date, price: parseMoney(r.price),
          })),
          departures: departures.map(({ id, date, capacity, booked }) => ({
            ...(typeof id === 'number' ? { id } : {}),
            date, capacity, booked,
          })),
          blocked_dates: blockedDates.map(({ start_date, end_date, reason }) => ({ start_date, end_date, reason: reason || null })),
          extras: extras.map(({ label, price: p, default_selected }) => ({ label, price: p, default_selected })),
          allow_custom_dates: allowCustomDates,
          included_guests: includedGuests ? Number(includedGuests) : null,
        }),
      })

      const mappedDurationOptions = listing.duration_options.map(d => ({ id: d.id, label: d.label, price: numToStr(d.price) }))
      const mappedGroupDiscounts = listing.group_discounts.map(g => ({ id: g.id, min_guests: g.min_guests, discount_percent: g.discount_percent }))
      const mappedSeasonalRates = listing.seasonal_rates.map(r => ({
        id: r.id, label: r.label, start_date: toDateInput(r.start_date), end_date: toDateInput(r.end_date), price: numToStr(r.price),
      }))
      const mappedDepartures = listing.departures.map(d => ({ id: d.id, date: toDateInput(d.date), capacity: d.capacity, booked: d.booked }))
      const mappedBlockedDates = listing.blocked_dates.map(b => ({
        id: b.id, start_date: toDateInput(b.start_date), end_date: toDateInput(b.end_date), reason: b.reason ?? '',
      }))
      const mappedExtras = listing.extras.map(e => ({ id: e.id, label: e.label, price: Number(e.price), default_selected: e.default_selected }))
      const mappedGroupPricingTiers = listing.group_pricing_tiers.map(t => ({ id: t.id, people_count: t.people_count, total_price: Number(t.total_price) }))
      setGroupPricingTiers(mappedGroupPricingTiers)

      setDurationOptions(mappedDurationOptions)
      setGroupDiscounts(mappedGroupDiscounts)
      setSeasonalRates(mappedSeasonalRates)
      setDepartures(mappedDepartures)
      setBlockedDates(mappedBlockedDates)
      setExtras(mappedExtras)

      savedSnapshotRef.current = formatSnapshot({
        title: title.trim(), category, locationPlaces, images, description: description.trim(), status,
        itinerary, amenities, minGuests, maxGuests, minNights, durationOptions: mappedDurationOptions,
        price, childPrice, extraGuestPrice, groupDiscounts: mappedGroupDiscounts,
        groupPricingTiers: mappedGroupPricingTiers, extras: mappedExtras,
        seasonalRates: mappedSeasonalRates, minLeadTimeDays, departures: mappedDepartures,
        blockedDates: mappedBlockedDates, cancellationPolicy, customCancellationPolicy,
        houseRules, safetyInfo, additionalRules, additionalRequests, allowCustomDates, includedGuests,
      })

      setToast('Listing updated')
      return true
    } catch (err) {
      setSaveError(apiErrorMessage(err))
      return false
    } finally {
      setSaving(false)
    }
  }

  async function confirmSaveAndSwitch() {
    const ok = await handleSave()
    if (ok && pendingTab) {
      setTab(pendingTab)
      setPendingTab(null)
    }
  }

  function discardAndSwitch() {
    if (pendingTab) {
      const target = pendingTab
      loadListing()
      setTab(target)
      setPendingTab(null)
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
      <div className="p-5 lg:p-8 max-w-5xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-5 lg:p-8 max-w-5xl mx-auto text-center pt-20">
        <p className="text-sm text-gray-500 mb-4">{loadError || 'Listing not found.'}</p>
        <button onClick={() => router.push('/vendor/listings')}
          className="text-sm font-semibold text-[#2c4a1e] underline">
          Back to listings
        </button>
      </div>
    )
  }

  const SECTIONS: TabSection[] = [
    { id: 'basics', label: 'Basics', complete: !!title.trim() && locationPlaces.length > 0 && images.length >= 3 },
    { id: 'itinerary', label: 'Itinerary', complete: itinerary.length > 0 },
    { id: 'group-size', label: 'Group & duration', complete: !!maxGuests.trim() },
    { id: 'pricing', label: 'Pricing', complete: !!price.trim() },
    { id: 'availability', label: 'Availability', complete: departures.length > 0 },
    { id: 'cancellation', label: 'Cancellation', complete: cancellationPolicy !== 'custom' || !!customCancellationPolicy.trim() },
    { id: 'house-rules', label: category === 'Stays' ? 'House rules' : 'Tour rules', complete: true, optional: true },
    { id: 'safety', label: category === 'Stays' ? 'Safety & property' : 'Safety info', complete: safetyInfo.length > 0 },
  ]

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto overflow-x-hidden">
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      <button onClick={() => router.push('/vendor/listings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to listings
      </button>

      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">{title || 'Untitled listing'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {bookingsCount} bookings · Earned Ksh {Math.round(Number(earnings)).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative inline-flex items-center">
            <span className={`absolute left-3 w-2 h-2 rounded-full pointer-events-none
              ${status === 'active' ? 'bg-green-500' : status === 'paused' ? 'bg-yellow-500' : 'bg-gray-400'}`} />
            <select value={status} onChange={(e) => {
              const next = e.target.value as 'active' | 'paused' | 'draft'
              if (next !== status) setPendingStatus(next)
            }}
              className="pl-7 pr-7 py-2 rounded-full border border-gray-200 text-sm font-semibold
                         text-[#1a1a1a] bg-white appearance-none outline-none focus:border-[#2c4a1e] capitalize cursor-pointer">
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <ChevronDown size={14} color="#888" className="absolute right-2 pointer-events-none" />
          </div>
          <button onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200
                       text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
            <Eye size={14} /> Preview listing
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mt-4 mb-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {saveError}
        </div>
      )}

      <ListingTabs sections={SECTIONS} activeId={tab} onSelect={requestTabChange} />

      <div className="flex flex-col gap-5">

        {tab === 'basics' && (
          <>
            <EditableCard label="Title" required summary={title}>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
            </EditableCard>

            <EditableCard label="Category" required summary={category}>
              <div className="flex gap-2 flex-wrap">
                {categoryOptions.map((c) => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
                      ${category === c
                        ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                        : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </EditableCard>

            <EditableCard label="Location" required summary={locationPlaces.length > 0 ? buildLocationString(locationPlaces) : ''}>
              <LocationChainInput places={locationPlaces} onChange={setLocationPlaces} />
            </EditableCard>

            <EditableCard label="Photos" required
              summary={images.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {images.slice(0, 4).map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                    ))}
                  </div>
                  <span>{images.length} photo{images.length === 1 ? '' : 's'}</span>
                </div>
              ) : ''}>
              <p className="text-xs text-gray-400 mb-2">At least 3 photos required.</p>
              <PhotoManager images={images} onChange={setImages} />
            </EditableCard>

            <EditableCard label="Description" summary={description}>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
            </EditableCard>
          </>
        )}

        {tab === 'itinerary' && (
          <>
            <div className="bg-white border border-[#e0d9cc] rounded-2xl p-4 sm:p-5 shadow-sm">
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Itinerary (day-by-day)</label>
              <div className="flex flex-col gap-2 mb-3">
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
                    <div key={d.day} className="p-3 rounded-xl border border-gray-200">
                      {editingDay === d.day ? (
                        <div className="flex flex-col gap-2">
                          <input value={editDayTitle} onChange={(e) => setEditDayTitle(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2c4a1e]" />
                          <textarea value={editDayDesc} onChange={(e) => setEditDayDesc(e.target.value)} rows={2}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2c4a1e] resize-none" />
                          <div className="flex items-center gap-3">
                            <button onClick={saveEditDay} className="flex items-center gap-1 text-xs font-semibold text-[#2c4a1e] hover:underline">
                              <Check size={12} /> Done
                            </button>
                            <button onClick={() => { removeItineraryDay(d.day); setEditingDay(null) }}
                              className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline">
                              <Trash2 size={12} /> Remove day
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1a1a1a]">Day {d.day} — {d.title}</p>
                            {d.description && <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>}
                          </div>
                          <button onClick={() => startEditDay(d)} className="flex-shrink-0 text-gray-400 hover:text-[#2c4a1e]">
                            <Pencil size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <EditableCard label="What's included"
              summary={amenities.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {amenities.map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-[#eaf5e4] flex items-center justify-center flex-shrink-0">
                        <Check size={10} color="#2c4a1e" />
                      </div>
                      <span className="text-[#1a1a1a]">{item}</span>
                    </div>
                  ))}
                </div>
              ) : ''}>
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
            </EditableCard>

          </>
        )}


        {tab === 'group-size' && (
          <>
            <EditableCard label="Group size" required summary={`${minGuests || '—'}–${maxGuests || '—'} guests`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Min guests</label>
                  <input value={minGuests} onChange={(e) => setMinGuests(e.target.value)}
                    type="number" placeholder="e.g. 2"
                    className="w-full min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Max guests</label>
                  <input value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)}
                    type="number" placeholder="e.g. 12"
                    className="w-full min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
              </div>
            </EditableCard>

            {category === 'Stays' && (
              <EditableCard label="Minimum nights" summary={minNights ? `${minNights} nights minimum` : ''}>
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
              </EditableCard>
            )}

            <EditableCard label="Duration options"
              summary={durationOptions.length > 0 ? durationOptions.map(d => d.label).join(', ') : ''}>
              <div className="flex gap-2 mb-2">
                <input value={durationLabel} onChange={(e) => setDurationLabel(e.target.value)}
                  placeholder="e.g. 3 Days / 2 Nights"
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
                <MoneyInput value={durationPrice} onChange={setDurationPrice} placeholder="Optional" className="w-44" />

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
            </EditableCard>
          </>
        )}

        {tab === 'pricing' && (
          <>
            <EditableCard label="Base price (per adult)" required
              summary={price ? `Ksh ${Number(price).toLocaleString()}` : ''}>
              <MoneyInput value={price} onChange={setPrice} />
            </EditableCard>

            <EditableCard label="Child price" summary={childPrice ? `Ksh ${Number(childPrice).toLocaleString()}` : ''}>
              <MoneyInput value={childPrice} onChange={setChildPrice} placeholder="e.g. 22500 (optional)" />

              <p className="text-xs text-gray-400 mt-1.5">Leave blank to charge the adult price for children too.</p>
            </EditableCard>

            <EditableCard label="Group pricing"
              summary={groupPricingTiers.length > 0
                ? groupPricingTiers.map(t => `${t.people_count} people → Ksh ${t.total_price.toLocaleString()}`).join(', ')
                : ''}>
              <p className="text-xs text-gray-400 mb-3">
                Offer a flat total price for a specific group size — e.g. "a group of 5 pays Ksh 5,000
                total" — as an alternative to per-person pricing. Guests choose Individual pricing or
                one of these group prices when booking.
              </p>
              <div className="flex gap-2 mb-2">
                <input value={tierPeopleCount} onChange={(e) => setTierPeopleCount(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGroupPricingTier() } }}
                  type="number" min="1" placeholder="e.g. 5 people"
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
                <MoneyInput value={tierTotalPrice} onChange={setTierTotalPrice} placeholder="e.g. 5000" className="flex-1" />

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
                        <button onClick={() => removeGroupPricingTier(t.id)}>
                          <X size={14} color="#888" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </EditableCard>

            <EditableCard label="Extras & add-ons" summary={extras.length > 0 ? extras.map(e => e.label).join(', ') : ''}>
              <div className="flex gap-2 mb-2">
                <input value={extraLabel} onChange={(e) => setExtraLabel(e.target.value)}
                  placeholder="e.g. Hot air balloon safari"
                  className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
                <MoneyInput value={extraPrice} onChange={setExtraPrice} placeholder="Price" className="w-40" />

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
            </EditableCard>

            <EditableCard label="Guests included in base price" summary={`${includedGuests || '1'} guest${Number(includedGuests) === 1 ? '' : 's'}`}>
              <input value={includedGuests} onChange={(e) => setIncludedGuests(e.target.value)}
                type="number" min="1" placeholder="e.g. 2"
                className="w-32 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
              <p className="text-xs text-gray-400 mt-1.5">
                E.g. set this to 2 for a couple's rate — the base price covers up to this many guests
                before "Price per additional guest" kicks in.
              </p>
            </EditableCard>

            <EditableCard label="Price per additional guest" summary={extraGuestPrice ? `Ksh ${Number(extraGuestPrice).toLocaleString()}` : ''}>
              <MoneyInput value={extraGuestPrice} onChange={setExtraGuestPrice} placeholder="e.g. 10000 (optional)" />
              <p className="text-xs text-gray-400 mt-1.5">Leave blank if your price already covers all guests.</p>
              {price.trim() && extraGuestPrice.trim() && (() => {
                const base = Number(includedGuests) || 1
                const basePrice = Number(price) || 0
                const extra = Number(extraGuestPrice) || 0
                return (
                  <p className="text-xs font-medium text-[#2c4a1e] bg-[#eaf5e4] rounded-lg px-3 py-2 mt-2">
                    e.g. Ksh {basePrice.toLocaleString()} for {base} → Ksh {(basePrice + extra).toLocaleString()} for {base + 1}
                  </p>
                )
              })()}
            </EditableCard>

            <EditableCard label="Seasonal rate overrides"
              summary={seasonalRates.length > 0 ? seasonalRates.map(r => r.label).join(', ') : ''}>
              <p className="text-xs text-gray-400 mb-3">
                Automatically charge a different price during a specific date range — e.g. a higher
                price over Christmas — instead of the base price. Guests booking outside these ranges
                still pay your normal price.
              </p>
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
                  <MoneyInput value={seasonPrice} onChange={setSeasonPrice} placeholder="Price" className="flex-1 min-w-0" />

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
            </EditableCard>
          </>
        )}

        {tab === 'availability' && (
          <>
            <EditableCard label="Minimum lead time" summary={minLeadTimeDays ? `${minLeadTimeDays} days before departure` : ''}>
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
            </EditableCard>

            <EditableCard label="Departures & capacity" required
              summary={departures.length > 0 ? `${departures.length} departure date${departures.length === 1 ? '' : 's'} set` : ''}>
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
                    const expired = d.date < todayStr
                    const hasBookings = d.booked > 0
                    const editing = editingDeparture === d.id
                    return (
                      <div key={d.id} className="p-3 rounded-xl border border-gray-200">
                        {editing ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <input value={editDepDate} onChange={(e) => setEditDepDate(e.target.value)} type="date"
                                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2c4a1e]" />
                              <input value={editDepCapacity} onChange={(e) => setEditDepCapacity(e.target.value)} type="number" min="1"
                                className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2c4a1e]" />
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={saveEditDeparture} className="flex items-center gap-1 text-xs font-semibold text-[#2c4a1e] hover:underline">
                                <Check size={12} /> Done
                              </button>
                              <button onClick={() => setEditingDeparture(null)} className="text-xs font-semibold text-gray-400 hover:underline">
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#1a1a1a]">{d.date}</span>
                                {expired && (
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Expired</span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                  ${full ? 'bg-red-50 text-red-600' : 'bg-[#eaf5e4] text-[#2c4a1e]'}`}>
                                  {full ? 'Fully booked' : `${d.capacity - d.booked} of ${d.capacity} spots left`}
                                </span>
                                <button onClick={() => startEditDeparture(d)} className="text-gray-400 hover:text-[#2c4a1e]">
                                  <Pencil size={13} />
                                </button>
                                <button onClick={() => removeDeparture(d.id)} disabled={hasBookings}
                                  className={hasBookings ? 'opacity-30 cursor-not-allowed' : ''}>
                                  <X size={14} color="#888" />
                                </button>
                              </div>
                            </div>
                            {departureBlockedNotice === d.id && (
                              <p className="text-xs text-red-500 mt-2">
                                This departure already has {d.booked} booking{d.booked === 1 ? '' : 's'} and can&apos;t
                                be edited here. Contact Erranza support if you need to change its date or capacity.
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </EditableCard>

            <EditableCard label="Allow custom dates"
              summary={allowCustomDates ? 'Travellers may also request a custom date' : 'Fixed departures only'}>
              <p className="text-xs text-gray-400 mb-3">
                By default, travellers must pick one of your fixed departure dates above. Turn this on
                to also let them request a custom date outside those departures.
              </p>
              <button type="button" onClick={() => setAllowCustomDates(v => !v)}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${allowCustomDates ? 'bg-[#2c4a1e]' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${allowCustomDates ? 'translate-x-4' : ''}`} />
              </button>
            </EditableCard>

            {/* Repeat departures */}
            <div className="bg-white border border-[#e0d9cc] rounded-2xl p-4 sm:p-5 shadow-sm">
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

            <EditableCard label="Blocked dates"
              summary={blockedDates.length > 0 ? `${blockedDates.length} blocked range${blockedDates.length === 1 ? '' : 's'}` : ''}>
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
            </EditableCard>
          </>
        )}

        {tab === 'cancellation' && (
          <EditableCard label="Cancellation policy" summary={POLICIES.find(p => p.id === cancellationPolicy)?.label ?? ''}>
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
          </EditableCard>
        )}

        {tab === 'house-rules' && (
          <EditableCard label={category === 'Stays' ? 'House rules' : 'Tour rules'}
            summary={houseRules.length > 0
              ? houseRules.map(k => HOUSE_RULES_CATALOG.find(r => r.key === k)?.label).filter(Boolean).join(', ')
              : ''}>
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
              rows={3} placeholder="Additional rules (optional) — e.g. arrival directions, extra guest policy..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-4
                         outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
            <textarea value={additionalRequests} onChange={(e) => setAdditionalRequests(e.target.value)}
              rows={3} placeholder="Additional requests before guests leave (optional) — e.g. return keys, turn things off..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mt-3
                         outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
          </EditableCard>
        )}

        {tab === 'safety' && (
          <div className="bg-white border border-[#e0d9cc] rounded-2xl p-4 sm:p-5 shadow-sm">
            <label className="text-sm font-semibold text-[#1a1a1a] mb-3 block">
              {category === 'Stays' ? 'Safety & property' : 'Safety information'}
              {safetyInfo.length === 0 && <span className="text-orange-500 font-normal text-xs align-top ml-1.5">Required</span>}
            </label>
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


        <div className="flex gap-3 justify-center pt-4 border-t border-gray-100 mt-2">
          <button
            onClick={() => setConfirmingDelete(true)}
            className="flex items-center justify-center gap-1.5 border border-red-200
                       text-red-500 px-5 py-3 rounded-xl font-semibold text-sm
                       hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} /> Delete listing
          </button>
          <button
            onClick={requestRevert}
            disabled={!isDirty}
            className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                       text-[#1a1a1a] hover:bg-gray-50 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Revert changes
          </button>
          <button
            onClick={requestSave}
            disabled={!canSave || saving}
            className="bg-[#2c4a1e] text-white px-5 py-3 rounded-xl
                       font-semibold text-sm hover:bg-[#3d6b28] transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {pendingStatus && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setPendingStatus(null) }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">{pendingStatus && STATUS_LABELS[pendingStatus]} this listing?</h2>
            <p className="text-sm text-gray-500 mb-5">
              {pendingStatus === 'active' && 'Guests will be able to find and book this listing again.'}
              {pendingStatus === 'paused' && "Guests won't be able to book this listing until you set it back to active."}
              {pendingStatus === 'draft' && 'This listing will be hidden from guests entirely.'}
              {' '}Remember to save changes for this to take effect.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPendingStatus(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                     text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => { setStatus(pendingStatus); setPendingStatus(null) }}
                className="flex-1 py-3 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold
                     hover:bg-[#3d6b28] transition-colors">
                Yes, {pendingStatus && STATUS_LABELS[pendingStatus].toLowerCase()}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreview && (
        <ListingPreviewModal
          onClose={() => setShowPreview(false)}
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

      {/* Confirm and save */}
      {showSaveConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !saving) setShowSaveConfirm(false) }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">Save these changes?</h2>
            <p className="text-sm text-gray-500 mb-3">You&apos;re about to update:</p>
            <ul className="flex flex-col gap-2.5 mb-5 max-h-72 overflow-y-auto">
              {changedFields.map((f) => (
                <li key={f.label} className="text-sm">
                  <p className="font-semibold text-[#1a1a1a]">{f.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 break-words">
                    <span className="line-through text-gray-400">{f.from || '—'}</span>
                    {' → '}
                    <span className="text-[#2c4a1e] font-medium">{f.to || '—'}</span>
                  </p>
                </li>
              ))}
            </ul>

            {saveError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {saveError}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShowSaveConfirm(false)} disabled={saving}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                     text-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button onClick={confirmSave} disabled={saving}
                className="flex-1 py-3 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold
                     hover:bg-[#3d6b28] transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Yes, save changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm and revert */}
      {showRevertConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRevertConfirm(false) }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">Discard your changes?</h2>
            <p className="text-sm text-gray-500 mb-3">This reloads the listing as it was last saved. You'll lose:</p>
            <ul className="flex flex-col gap-2.5 mb-5 max-h-64 overflow-y-auto">
              {getFieldDiff().map((f) => (
                <li key={f.label} className="text-sm">
                  <p className="font-semibold text-[#1a1a1a]">{f.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 break-words">
                    <span className="text-red-500 font-medium">{f.to || '—'}</span>
                    {' → back to '}
                    <span className="text-gray-400">{f.from || '—'}</span>
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button onClick={() => setShowRevertConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                     text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                Keep editing
              </button>
              <button onClick={confirmRevert}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold
                     hover:bg-red-700 transition-colors">
                Discard changes
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingTab && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setPendingTab(null) }}
        >
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">You have unsaved changes</h2>
            <p className="text-sm text-gray-500 mb-3">The following have changed and haven&apos;t been saved yet:</p>
            <ul className="flex flex-col gap-2.5 mb-5 max-h-72 overflow-y-auto">
              {changedFields.map((f) => (
                <li key={f.label} className="text-sm">
                  <p className="font-semibold text-[#1a1a1a]">{f.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 break-words">
                    <span className="line-through text-gray-400">{f.from || '—'}</span>
                    {' → '}
                    <span className="text-[#2c4a1e] font-medium">{f.to || '—'}</span>
                  </p>
                </li>
              ))}
            </ul>

            {saveError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
                {saveError}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button onClick={confirmSaveAndSwitch} disabled={saving || !canSave}
                className="py-3 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold
                     hover:bg-[#3d6b28] transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save and continue'}
              </button>
              <div className="flex gap-2">
                <button onClick={() => setPendingTab(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold
                       text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                  Stay here
                </button>
                <button onClick={discardAndSwitch}
                  className="flex-1 py-3 rounded-xl border border-red-200 text-sm font-semibold
                       text-red-500 hover:bg-red-50 transition-colors">
                  Discard changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
