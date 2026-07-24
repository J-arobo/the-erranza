'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Star, TrendingUp, List, Check, ShieldCheck, Users, UserPlus, X, FileClock } from 'lucide-react'
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
  payout_details: string | null
  reviews_count: number
  reviews_avg_rating: string | null
  owner: { id: number; name: string; email: string }
  team_members: TeamMember[]
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

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('Co-host')
  const [inviteBusy, setInviteBusy] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

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
        setSubmissions(subsRes.submissions)
        setListings(listingsRes.listings)
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

  async function uploadDoc(docType: 'Government ID' | 'Insurance certificate') {
    setUploading(docType)
    setError('')
    try {
      const { submission } = await apiFetch<{ submission: ApiSubmission }>('/vendor/verification-submissions', {
        method: 'POST',
        body: JSON.stringify({ doc_type: docType }),
      })
      setSubmissions(s => [...s, submission])
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setUploading(null)
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
    { key: 'email', label: 'Verify email address', done: true, actionLabel: null as string | null, action: () => {} },
    { key: 'phone', label: 'Verify phone number', done: !!vendor.phone, actionLabel: null as string | null, action: () => {} },
    {
      key: 'id', label: 'Upload government ID', done: !!govIdSubmission,
      actionLabel: uploading === 'Government ID' ? 'Uploading…' : 'Upload',
      action: () => uploadDoc('Government ID'),
    },
    {
      key: 'insurance', label: 'Upload insurance certificate', done: !!insuranceSubmission,
      actionLabel: uploading === 'Insurance certificate' ? 'Uploading…' : 'Upload',
      action: () => uploadDoc('Insurance certificate'),
    },
    { key: 'payout', label: 'Add payout details', done: !!vendor.payout_details, actionLabel: null as string | null, action: () => {} },
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

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-[#2c4a1e] flex items-center
                          justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'V'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-[#1a1a1a] truncate">{vendor.business_name}</p>
            <p className="text-sm text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => setEditing(e => !e)}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100
                       hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

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
                            text-white text-sm font-bold flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() ?? 'V'}
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
