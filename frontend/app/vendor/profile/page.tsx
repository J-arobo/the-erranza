'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Star, TrendingUp, List, Check, ShieldCheck, Users, UserPlus, X, FileClock, Camera } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type Role = 'Manager' | 'Co-host' | 'Support'
const ROLES: Role[] = ['Manager', 'Co-host', 'Support']
const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Manager: 'Can manage listings, pricing and bookings.',
  'Co-host': 'Can respond to bookings and guest messages.',
  Support: 'Can respond to guest messages only.',
}
const TEAM_COLORS = ['#c4f0d4', '#f0e4c4', '#d4c4f0', '#c4e8f0']
const CATEGORY_OPTIONS = ['Safari', 'Stays', 'Experiences', 'Packages']
const REGION_OPTIONS = [

  'Nairobi', 'Maasai Mara', 'Amboseli', 'Tsavo East', 'Tsavo West', 'Lake Nakuru',
  'Diani Beach', 'Mombasa', 'Malindi', 'Watamu', 'Lamu', 'Nanyuki', 'Naivasha',
  'Samburu', 'Meru', 'Kisumu', 'Nyeri', 'Laikipia', "Hell's Gate", 'Ol Pejeta',
]

type DocStatus = 'unset' | 'valid' | 'expiring' | 'expired'

function getDocStatus(expiry: string | null): DocStatus {
  if (!expiry) return 'unset'
  const days = (new Date(expiry).getTime() - Date.now()) / 86400000
  if (days < 0) return 'expired'
  if (days <= 30) return 'expiring'
  return 'valid'
}

const DOC_STATUS_STYLES: Record<DocStatus, string> = {
  valid: 'bg-[#eaf5e4] text-[#2c4a1e]',
  expiring: 'bg-amber-50 text-amber-700',
  expired: 'bg-red-50 text-red-500',
  unset: 'bg-gray-100 text-gray-500',
}
const DOC_STATUS_LABELS: Record<DocStatus, string> = {
  valid: 'Valid',
  expiring: 'Expiring soon',
  expired: 'Expired',
  unset: 'No expiry set',
}

type TeamMember = {
  id: number
  name: string
  email: string
  role: Role
  status: 'active' | 'pending'
}

type ApiVendor = {
  id: number
  business_name: string
  phone: string | null
  bio: string | null
  logo_url: string | null
  tax_pin: string | null
  payout_method: string | null
  payout_bank_name: string | null
  payout_details: string | null
  reviews_count: number
  reviews_avg_rating: string | null
  owner: { id: number; name: string; email: string }
  team_members: TeamMember[]
  license_number: string | null
  categories: string[] | null
  regions: string[] | null

}

type ApiSubmission = {
  id: number
  doc_type: 'Government ID' | 'Insurance certificate' | 'Business license'
  expiry_date: string | null
}

type ApiListing = { id: number; status: string; earnings: string | null }

export default function VendorProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [vendor, setVendor] = useState<ApiVendor | null>(null)
  const [submissions, setSubmissions] = useState<ApiSubmission[]>([])
  const [listings, setListings] = useState<ApiListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)

  const [uploading, setUploading] = useState<string | null>(null)

  const govIdInputRef = useRef<HTMLInputElement>(null)
  const insuranceInputRef = useRef<HTMLInputElement>(null)

  const [editingPayout, setEditingPayout] = useState(false)
  const [taxPin, setTaxPin] = useState('')
  const [payoutMethod, setPayoutMethod] = useState<'mobile' | 'bank'>('mobile')
  const [payoutBankName, setPayoutBankName] = useState('')
  const [payoutDetails, setPayoutDetails] = useState('')
  const [prevMpesaNumber, setPrevMpesaNumber] = useState('')
  const [newMpesaNumber, setNewMpesaNumber] = useState('')
  const [payoutMismatchError, setPayoutMismatchError] = useState('')
  const [savingPayout, setSavingPayout] = useState(false)

  const [editingListing, setEditingListing] = useState(false)
  const [licenseNumber, setLicenseNumber] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [vendorRegions, setVendorRegions] = useState<string[]>([])
  const [regionQuery, setRegionQuery] = useState('')
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)
  const [savingListing, setSavingListing] = useState(false)

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('Co-host')
  const [inviteBusy, setInviteBusy] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  // Logo
  const [pendingLogo, setPendingLogo] = useState<string | null>(null)
  const [savingLogo, setSavingLogo] = useState(false)


  useEffect(() => {
    Promise.all([
      apiFetch<{ vendor: ApiVendor }>('/vendor/me'),
      apiFetch<{ submissions: ApiSubmission[] }>('/vendor/verification-submissions'),
      apiFetch<{ listings: ApiListing[] }>('/vendor/listings'),
    ])
      .then(([vendorRes, subsRes, listingsRes]) => {
        setVendor(vendorRes.vendor)
        setBusinessName(vendorRes.vendor.business_name)
        setPhone(vendorRes.vendor.phone ?? '')
        setBio(vendorRes.vendor.bio ?? '')
        setTaxPin(vendorRes.vendor.tax_pin ?? '')
        setPayoutMethod((vendorRes.vendor.payout_method as 'mobile' | 'bank') ?? 'mobile')
        setPayoutBankName(vendorRes.vendor.payout_bank_name ?? '')
        setPayoutDetails(vendorRes.vendor.payout_details ?? '')
        setSubmissions(subsRes.submissions)
        setListings(listingsRes.listings)
        setLicenseNumber(vendorRes.vendor.license_number ?? '')
        setSelectedCategories(vendorRes.vendor.categories ?? [])
        setVendorRegions(vendorRes.vendor.regions ?? [])
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  async function saveBusinessDetails() {
    setSaving(true)
    setError('')
    try {
      const { vendor: updated } = await apiFetch<{ vendor: ApiVendor }>('/vendor/me', {
        method: 'PUT',
        body: JSON.stringify({ business_name: businessName.trim(), phone: phone.trim(), bio: bio.trim() }),
      })
      setVendor(v => v ? { ...v, business_name: updated.business_name, phone: updated.phone, bio: updated.bio } : v)
      setEditing(false)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function handleLogoFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setPendingLogo(reader.result)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  async function saveLogo() {
    if (!pendingLogo) return
    setSavingLogo(true)
    setError('')
    try {
      const { vendor: updated } = await apiFetch<{ vendor: ApiVendor }>('/vendor/me', {
        method: 'PUT',
        body: JSON.stringify({ logo_url: pendingLogo }),
      })
      setVendor(v => v ? { ...v, logo_url: updated.logo_url } : v)
      setPendingLogo(null)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSavingLogo(false)
    }
  }


  async function uploadDoc(docType: 'Government ID' | 'Insurance certificate', file: File) {
    setUploading(docType)
    setError('')
    try {
      const formData = new FormData()
      formData.append('doc_type', docType)
      formData.append('document', file)
      const { submission } = await apiFetch<{ submission: ApiSubmission }>('/vendor/verification-submissions', {
        method: 'POST',
        body: formData,
      })
      setSubmissions(s => [...s, submission])
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setUploading(null)
    }
  }

  function handleDocFileChange(docType: 'Government ID' | 'Insurance certificate', e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    uploadDoc(docType, file)
  }

  async function savePayoutDetails() {
    const isChangingMpesa = payoutMethod === 'mobile' && vendor?.payout_method === 'mobile' && !!vendor?.payout_details
    if (isChangingMpesa && prevMpesaNumber.trim() !== vendor!.payout_details) {
      setPayoutMismatchError("That doesn't match your current M-Pesa number.")
      return
    }

    setSavingPayout(true)
    setError('')
    try {
      const { vendor: updated } = await apiFetch<{ vendor: ApiVendor }>('/vendor/me', {
        method: 'PUT',
        body: JSON.stringify({
          tax_pin: taxPin.trim() || null,
          payout_method: payoutMethod,
          payout_bank_name: payoutMethod === 'bank' ? payoutBankName.trim() : null,
          payout_details: isChangingMpesa ? newMpesaNumber.trim() : payoutDetails.trim(),
        }),
      })
      setVendor(v => v ? {
        ...v,
        tax_pin: updated.tax_pin,
        payout_method: updated.payout_method,
        payout_bank_name: updated.payout_bank_name,
        payout_details: updated.payout_details,
      } : v)
      setPayoutDetails(updated.payout_details ?? '')
      setPrevMpesaNumber('')
      setNewMpesaNumber('')
      setPayoutMismatchError('')
      setEditingPayout(false)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSavingPayout(false)
    }
  }

  //Vendor details modification
  function toggleCategory(cat: string) {
    setSelectedCategories(c => c.includes(cat) ? c.filter(x => x !== cat) : [...c, cat])
  }
  function addRegion(region: string) {
    if (!vendorRegions.includes(region)) setVendorRegions(r => [...r, region])
    setRegionQuery('')
    setShowRegionDropdown(false)
  }
  function removeRegion(region: string) {
    setVendorRegions(r => r.filter(x => x !== region))
  }
  const filteredRegionOptions = REGION_OPTIONS.filter(
    r => r.toLowerCase().includes(regionQuery.toLowerCase()) && !vendorRegions.includes(r)
  )

  async function saveListingDetails() {
    setSavingListing(true)
    setError('')
    try {
      const { vendor: updated } = await apiFetch<{ vendor: ApiVendor }>('/vendor/me', {
        method: 'PUT',
        body: JSON.stringify({
          license_number: licenseNumber.trim() || null,
          categories: selectedCategories,
          regions: vendorRegions,
        }),
      })
      setVendor(v => v ? { ...v, license_number: updated.license_number, categories: updated.categories, regions: updated.regions } : v)
      setEditingListing(false)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSavingListing(false)
    }
  }

  async function updateExpiry(id: number, expiryDate: string) {
    setSubmissions(s => s.map(sub => sub.id === id ? { ...sub, expiry_date: expiryDate } : sub))
    try {
      await apiFetch(`/vendor/verification-submissions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ expiry_date: expiryDate }),
      })
    } catch (err) {
      setError(apiErrorMessage(err))
    }
  }

  async function sendInvite() {
    if (!inviteName.trim() || !inviteEmail.trim()) return
    setInviteBusy(true)
    setError('')
    try {
      const { member } = await apiFetch<{ member: TeamMember }>('/vendor/team-members', {
        method: 'POST',
        body: JSON.stringify({ name: inviteName.trim(), email: inviteEmail.trim(), role: inviteRole }),
      })
      setVendor(v => v ? { ...v, team_members: [...v.team_members, member] } : v)
      setInviteName(''); setInviteEmail(''); setInviteRole('Co-host')
      setShowInviteForm(false)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setInviteBusy(false)
    }
  }

  async function removeTeamMember(id: number) {
    setRemovingId(id)
    setError('')
    try {
      await apiFetch(`/vendor/team-members/${id}`, { method: 'DELETE' })
      setVendor(v => v ? { ...v, team_members: v.team_members.filter(m => m.id !== id) } : v)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setRemovingId(null)
    }
  }

  if (loading || !vendor) {
    return (
      <div className="p-5 lg:p-8 max-w-2xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  const totalEarnings = listings.reduce((s, l) => s + Number(l.earnings ?? 0), 0)
  const avgRating = vendor.reviews_avg_rating ? Number(vendor.reviews_avg_rating).toFixed(1) : '—'
  const hasActiveListing = listings.some(l => l.status === 'active')
  const govIdSubmission = submissions.find(s => s.doc_type === 'Government ID')
  const insuranceSubmission = submissions.find(s => s.doc_type === 'Insurance certificate')

  const STATS = [
    { label: 'Listings', value: listings.length, Icon: List },
    { label: 'Total earnings', value: `Ksh ${totalEarnings.toLocaleString()}`, Icon: TrendingUp },
    { label: 'Avg rating', value: avgRating, Icon: Star },
  ]

  const STEPS = [
    { key: 'email', label: 'Verify email address', done: true, actionLabel: null as string | null, action: () => { } },
    { key: 'phone', label: 'Verify phone number', done: !!vendor.phone, actionLabel: null as string | null, action: () => { } },
    {
      key: 'id', label: 'Upload government ID', done: !!govIdSubmission,
      actionLabel: uploading === 'Government ID' ? 'Uploading…' : 'Upload',
      action: () => govIdInputRef.current?.click(),
    },
    {
      key: 'insurance', label: 'Upload insurance certificate', done: !!insuranceSubmission,
      actionLabel: uploading === 'Insurance certificate' ? 'Uploading…' : 'Upload',
      action: () => insuranceInputRef.current?.click(),
    },
    { key: 'payout', label: 'Add payout details', done: !!vendor.payout_details, actionLabel: vendor.payout_details ? null : 'Add', action: () => setEditingPayout(true) },
    {
      key: 'listing', label: 'Publish your first listing', done: hasActiveListing, actionLabel: 'Add listing',
      action: () => router.push('/vendor/listings/new'),
    },
  ]

  const completedCount = STEPS.filter(s => s.done).length
  const percent = (completedCount / STEPS.length) * 100

  const statusLabel = completedCount === STEPS.length
    ? 'Verified'
    : completedCount > 0
      ? 'In progress'
      : 'Get started'
  const statusColor = completedCount === STEPS.length
    ? 'bg-[#eaf5e4] text-[#2c4a1e]'
    : completedCount > 0
      ? 'bg-amber-50 text-amber-700'
      : 'bg-gray-100 text-gray-500'

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Profile</h1>

      <input ref={govIdInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
        onChange={(e) => handleDocFileChange('Government ID', e)} />
      <input ref={insuranceInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
        onChange={(e) => handleDocFileChange('Insurance certificate', e)} />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Business</p>
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex-shrink-0">
            {(pendingLogo ?? vendor.logo_url) ? (
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <img src={pendingLogo ?? vendor.logo_url!} alt={vendor.business_name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#2c4a1e] flex items-center
                        justify-center text-white text-2xl font-bold">
                {vendor.business_name?.[0]?.toUpperCase() ?? 'V'}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white border border-gray-200
                        flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition-colors">
              <Camera size={12} color="#1a1a1a" />
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoFileChange} />
            </label>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-[#1a1a1a] truncate">{vendor.business_name}</p>
            <p className="text-xs text-gray-400 truncate">{vendor.bio || 'No description yet'}</p>
          </div>
          <button
            onClick={() => setEditing(e => !e)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100
                 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {pendingLogo && (
          <div className="flex gap-2 mb-4">
            <button onClick={saveLogo} disabled={savingLogo}
              className="text-xs font-semibold text-white bg-[#2c4a1e] px-3 py-1.5 rounded-full disabled:opacity-50">
              {savingLogo ? 'Saving…' : 'Save logo'}
            </button>
            <button onClick={() => setPendingLogo(null)} disabled={savingLogo}
              className="text-xs font-semibold text-[#1a1a1a] bg-gray-100 px-3 py-1.5 rounded-full">
              Cancel
            </button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ label, value, Icon }) => (
            <div key={label} className="text-center bg-[#f3f4f6] rounded-xl py-3">
              <Icon size={16} color="#2c4a1e" className="mx-auto mb-1" />
              <p className="text-sm font-bold text-[#1a1a1a]">{value}</p>
              <p className="text-[10px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Managed by</p>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-[#2c4a1e] flex-shrink-0
                    flex items-center justify-center text-white text-xl font-bold"
            style={user?.avatar ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
            {!user?.avatar && (user?.name?.[0]?.toUpperCase() ?? 'V')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-[#1a1a1a] truncate">{user?.name ?? 'You'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            {vendor.phone && <p className="text-xs text-gray-400 truncate">{vendor.phone}</p>}
          </div>
          <button onClick={() => router.push('/profile')}
            className="text-xs font-semibold text-[#2c4a1e] flex-shrink-0">
            Edit photo
          </button>
        </div>
      </div>


      {/* Verification / onboarding */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} color="#2c4a1e" />
            <h2 className="text-base font-bold text-[#1a1a1a]">Verification</h2>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
            {statusLabel}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Complete these steps to unlock full visibility for your listings.
        </p>

        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-[#2c4a1e] rounded-full transition-all"
            style={{ width: `${percent}%` }} />
        </div>
        <p className="text-[11px] text-gray-400 mb-3">
          {completedCount} of {STEPS.length} complete
        </p>

        <div className="flex flex-col divide-y divide-gray-100">
          {STEPS.map((step) => (
            <div key={step.key} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center
                                 flex-shrink-0 ${step.done ? 'bg-[#2c4a1e]' : 'border-2 border-gray-200'}`}>
                  {step.done && <Check size={12} color="white" />}
                </div>
                <span className={`text-sm truncate ${step.done ? 'text-[#1a1a1a]' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
              {!step.done && step.actionLabel && (
                <button onClick={step.action}
                  className="text-xs font-semibold text-[#2c4a1e] flex-shrink-0 ml-3">
                  {step.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Document renewals */}
      {(govIdSubmission || insuranceSubmission) && (
        <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <FileClock size={16} color="#2c4a1e" />
            <h2 className="text-base font-bold text-[#1a1a1a]">Document renewals</h2>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Licenses and certificates expire — set the expiry date and update it after renewing.
          </p>

          <div className="flex flex-col gap-2">
            {govIdSubmission && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Government ID</p>
                  <input type="date" value={govIdSubmission.expiry_date ?? ''}
                    onChange={(e) => updateExpiry(govIdSubmission.id, e.target.value)}
                    className="mt-1 text-xs border border-gray-200 rounded-lg px-2 py-1
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0
                  ${DOC_STATUS_STYLES[getDocStatus(govIdSubmission.expiry_date)]}`}>
                  {DOC_STATUS_LABELS[getDocStatus(govIdSubmission.expiry_date)]}
                </span>
              </div>
            )}
            {insuranceSubmission && (
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Insurance certificate</p>
                  <input type="date" value={insuranceSubmission.expiry_date ?? ''}
                    onChange={(e) => updateExpiry(insuranceSubmission.id, e.target.value)}
                    className="mt-1 text-xs border border-gray-200 rounded-lg px-2 py-1
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0
                  ${DOC_STATUS_STYLES[getDocStatus(insuranceSubmission.expiry_date)]}`}>
                  {DOC_STATUS_LABELS[getDocStatus(insuranceSubmission.expiry_date)]}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Business details</h2>

        {editing ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Business name</label>
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Phone number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+254 7XX XXX XXX"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">About</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
            </div>
            <button
              onClick={saveBusinessDetails}
              disabled={saving}
              className="bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-gray-400">Business name</p>
              <p className="text-sm text-[#1a1a1a] font-medium">{vendor.business_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone number</p>
              <p className="text-sm text-[#1a1a1a] font-medium">{vendor.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">About</p>
              <p className="text-sm text-[#1a1a1a] leading-relaxed">{vendor.bio || '—'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[#1a1a1a]">Payout & tax details</h2>
          <button onClick={() => { setEditingPayout(e => !e); setPrevMpesaNumber(''); setNewMpesaNumber(''); setPayoutMismatchError('') }}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition-colors">
            {editingPayout ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {/* Editing details */}
        <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#1a1a1a]">Listing categories & regions</h2>
            <button onClick={() => setEditingListing(e => !e)}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition-colors">
              {editingListing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingListing ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Business license no.</label>
                <input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Categories</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const selected = selectedCategories.includes(cat)
                    return (
                      <button key={cat} onClick={() => toggleCategory(cat)}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all
                        ${selected
                            ? 'border-[#2c4a1e] bg-[#eaf5e4]'
                            : 'border-gray-200 hover:border-gray-300'}`}>
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2
                        ${selected ? 'border-[#2c4a1e] bg-[#2c4a1e]' : 'border-gray-300'}`}>
                          {selected && <Check size={11} color="white" />}
                        </div>
                        <span className="text-sm font-semibold text-[#1a1a1a]">{cat}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Operating regions</label>
                <div className="relative">
                  <input value={regionQuery}
                    onChange={(e) => { setRegionQuery(e.target.value); setShowRegionDropdown(true) }}
                    onFocus={() => setShowRegionDropdown(true)}
                    onBlur={() => setTimeout(() => setShowRegionDropdown(false), 150)}
                    placeholder="Search regions — e.g. Maasai Mara"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
                  {showRegionDropdown && filteredRegionOptions.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200
                                  rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {filteredRegionOptions.map((region) => (
                        <button key={region} type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => addRegion(region)}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#1a1a1a] hover:bg-[#eaf5e4] transition-colors">
                          {region}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {vendorRegions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {vendorRegions.map((region) => (
                      <span key={region}
                        className="flex items-center gap-1.5 bg-[#eaf5e4] text-[#2c4a1e]
                                 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {region}
                        <button onClick={() => removeRegion(region)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={saveListingDetails} disabled={savingListing}
                className="bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-50">
                {savingListing ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-gray-400">Business license no.</p>
                <p className="text-sm text-[#1a1a1a] font-medium">{vendor.license_number || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Categories</p>
                <p className="text-sm text-[#1a1a1a] font-medium">{vendor.categories?.join(', ') || 'None selected'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Operating regions</p>
                <p className="text-sm text-[#1a1a1a] font-medium">{vendor.regions?.join(', ') || 'None selected'}</p>
              </div>
            </div>
          )}
        </div>


        {editingPayout ? (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">KRA PIN</label>
              <input value={taxPin} onChange={(e) => setTaxPin(e.target.value.toUpperCase())}
                placeholder="e.g. P051234567X"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Payout method</label>
              <div className="flex gap-2 mb-2">
                {(['mobile', 'bank'] as const).map((m) => (
                  <button key={m} onClick={() => setPayoutMethod(m)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
                      ${payoutMethod === m
                        ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                        : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
                    {m === 'mobile' ? 'Mobile money' : 'Bank transfer'}
                  </button>
                ))}
              </div>
              {payoutMethod === 'bank' && (
                <input value={payoutBankName} onChange={(e) => setPayoutBankName(e.target.value)}
                  placeholder="Bank name (e.g. Equity Bank)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm mb-2
                             outline-none focus:border-[#2c4a1e] transition-colors" />
              )}
              {payoutMethod === 'mobile' && vendor.payout_method === 'mobile' && vendor.payout_details ? (
                <div className="flex flex-col gap-2">
                  <input value={prevMpesaNumber} onChange={(e) => { setPrevMpesaNumber(e.target.value); setPayoutMismatchError('') }}
                    placeholder="Previous M-Pesa number"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors
                      ${payoutMismatchError ? 'border-red-400' : 'border-gray-200 focus:border-[#2c4a1e]'}`} />
                  {payoutMismatchError && <p className="text-xs text-red-500">{payoutMismatchError}</p>}
                  <input value={newMpesaNumber} onChange={(e) => setNewMpesaNumber(e.target.value)}
                    placeholder="New M-Pesa number, e.g. 0712345678"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                               outline-none focus:border-[#2c4a1e] transition-colors" />
                </div>
              ) : (
                <input value={payoutDetails} onChange={(e) => setPayoutDetails(e.target.value)}
                  placeholder={payoutMethod === 'mobile' ? 'M-Pesa number, e.g. 0712345678' : 'Bank account number'}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors" />
              )}
              <input value={payoutDetails} onChange={(e) => setPayoutDetails(e.target.value)}
                placeholder={payoutMethod === 'mobile' ? 'M-Pesa number, e.g. 0712345678' : 'Bank account number'}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           outline-none focus:border-[#2c4a1e] transition-colors" />
            </div>
            <button onClick={savePayoutDetails} disabled={savingPayout}
              className="bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-50">
              {savingPayout ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-gray-400">KRA PIN</p>
              <p className="text-sm text-[#1a1a1a] font-medium">{vendor.tax_pin || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payout method</p>
              <p className="text-sm text-[#1a1a1a] font-medium capitalize">
                {vendor.payout_method ?? 'Not set'}
                {vendor.payout_method === 'bank' && vendor.payout_bank_name ? ` — ${vendor.payout_bank_name}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Payout details</p>
              <p className="text-sm text-[#1a1a1a] font-medium">{vendor.payout_details || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>


      {/* Team / co-hosts */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users size={16} color="#2c4a1e" />
            <h2 className="text-base font-bold text-[#1a1a1a]">Team</h2>
          </div>
          <button
            onClick={() => setShowInviteForm(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#2c4a1e]"
          >
            <UserPlus size={14} />
            {showInviteForm ? 'Cancel' : 'Invite'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Give trusted people access to help manage your listings and bookings.
        </p>

        {showInviteForm && (
          <div className="border border-gray-200 rounded-xl p-3.5 mb-3 flex flex-col gap-3">
            <input value={inviteName} onChange={(e) => setInviteName(e.target.value)}
              placeholder="Full name"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address" type="email"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <div className="flex gap-2">
              {ROLES.map((r) => (
                <button key={r} onClick={() => setInviteRole(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                    ${inviteRole === r
                      ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                      : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
                  {r}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 -mt-1">{ROLE_DESCRIPTIONS[inviteRole]}</p>
            <button onClick={sendInvite}
              disabled={!inviteName.trim() || !inviteEmail.trim() || inviteBusy}
              className="bg-[#2c4a1e] text-white py-2.5 rounded-xl font-semibold text-sm
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-40
                         disabled:cursor-not-allowed">
              {inviteBusy ? 'Sending…' : 'Send invite'}
            </button>
          </div>
        )}

        <div className="flex flex-col divide-y divide-gray-100">
          <div className="flex items-center gap-3 py-3">
            <div className="w-9 h-9 rounded-full bg-[#2c4a1e] flex items-center justify-center
                            text-white text-sm font-bold flex-shrink-0"
              style={user?.avatar ? { backgroundImage: `url(${user.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              {!user?.avatar && (user?.name?.[0]?.toUpperCase() ?? 'V')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1a1a1a] truncate">{user?.name ?? 'You'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                             bg-[#eaf5e4] text-[#2c4a1e] flex-shrink-0">Owner</span>
          </div>

          {vendor.team_members.map((member, i) => (
            <div key={member.id} className="flex items-center gap-3 py-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0"
                style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }}>
                {member.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a] truncate">{member.name}</p>
                <p className="text-xs text-gray-400 truncate">{member.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {member.role}
                </span>
                {member.status === 'pending' && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    Pending
                  </span>
                )}
                <button onClick={() => removeTeamMember(member.id)} disabled={removingId === member.id}>
                  <X size={14} color="#888" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => { logout(); router.push('/') }}
        className="w-full flex items-center justify-center gap-2 border border-gray-200
                   text-[#1a1a1a] py-3 rounded-xl font-semibold text-sm
                   hover:bg-gray-50 transition-colors"
      >
        <LogOut size={16} />
        Log out
      </button>
    </div>
  )
}
