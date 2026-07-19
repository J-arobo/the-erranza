'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Star, TrendingUp, List, Check, ShieldCheck, Users, UserPlus, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { VENDOR_LISTINGS, VENDOR_EARNINGS, VENDOR_REVIEWS, VENDOR_TEAM, type VendorTeamMember } from '@/data/vendor'

const ROLES: VendorTeamMember['role'][] = ['Manager', 'Co-host', 'Support']
const ROLE_DESCRIPTIONS: Record<VendorTeamMember['role'], string> = {
  Manager: 'Can manage listings, pricing and bookings.',
  'Co-host': 'Can respond to bookings and guest messages.',
  Support: 'Can respond to guest messages only.',
}
const TEAM_COLORS = ['#c4f0d4', '#f0e4c4', '#d4c4f0', '#c4e8f0']

export default function VendorProfilePage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  const [editing, setEditing] = useState(false)
  const [businessName, setBusinessName] = useState(user?.name ?? '')
  const [bio, setBio] = useState('Local tour operator sharing the best of Kenya with every guest.')
  const [phone, setPhone] = useState('')

  const [checklist, setChecklist] = useState({
    phone: false,
    id: false,
    payout: false,
  })

  const [, forceUpdate] = useState(0)
  const [inviting, setInviting] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<VendorTeamMember['role']>('Co-host')

  const totalEarnings = VENDOR_EARNINGS.reduce((s, e) => s + e.amount, 0)
  const avgRating = VENDOR_REVIEWS.length > 0
    ? (VENDOR_REVIEWS.reduce((s, r) => s + r.rating, 0) / VENDOR_REVIEWS.length).toFixed(1)
    : '—'

  const STATS = [
    { label: 'Listings', value: VENDOR_LISTINGS.length, Icon: List },
    { label: 'Total earnings', value: `Ksh ${totalEarnings.toLocaleString()}`, Icon: TrendingUp },
    { label: 'Avg rating', value: avgRating, Icon: Star },
  ]

  const hasActiveListing = VENDOR_LISTINGS.some(l => l.status === 'active')

  const STEPS = [
    { key: 'email', label: 'Verify email address', done: true, actionLabel: null as string | null, action: () => {} },
    { key: 'phone', label: 'Verify phone number', done: checklist.phone, actionLabel: 'Verify',
      action: () => setChecklist(c => ({ ...c, phone: true })) },
    { key: 'id', label: 'Upload government ID', done: checklist.id, actionLabel: 'Upload',
      action: () => setChecklist(c => ({ ...c, id: true })) },
    { key: 'payout', label: 'Add payout details', done: checklist.payout, actionLabel: 'Add',
      action: () => setChecklist(c => ({ ...c, payout: true })) },
    { key: 'listing', label: 'Publish your first listing', done: hasActiveListing, actionLabel: 'Add listing',
      action: () => router.push('/vendor/listings/new') },
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

  function sendInvite() {
    if (!inviteName.trim() || !inviteEmail.trim()) return
    VENDOR_TEAM.push({
      id: `tm_${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      avatarColor: TEAM_COLORS[VENDOR_TEAM.length % TEAM_COLORS.length],
      status: 'pending',
    })
    setInviteName(''); setInviteEmail(''); setInviteRole('Co-host')
    setInviting(false)
    forceUpdate(n => n + 1)
  }

  function removeTeamMember(id: string) {
    const idx = VENDOR_TEAM.findIndex(m => m.id === id)
    if (idx > -1) VENDOR_TEAM.splice(idx, 1)
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Profile</h1>

      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-[#2c4a1e] flex items-center
                          justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'V'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-[#1a1a1a] truncate">{user?.name ?? 'Vendor'}</p>
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
            <div key={label} className="text-center bg-[#f5f0e8] rounded-xl py-3">
              <Icon size={16} color="#2c4a1e" className="mx-auto mb-1" />
              <p className="text-sm font-bold text-[#1a1a1a]">{value}</p>
              <p className="text-[10px] text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification / onboarding */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
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

      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
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
              onClick={() => setEditing(false)}
              className="bg-[#2c4a1e] text-white py-3 rounded-xl font-semibold text-sm
                         hover:bg-[#3d6b28] transition-colors"
            >
              Save changes
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-gray-400">Business name</p>
              <p className="text-sm text-[#1a1a1a] font-medium">{businessName || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Phone number</p>
              <p className="text-sm text-[#1a1a1a] font-medium">{phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">About</p>
              <p className="text-sm text-[#1a1a1a] leading-relaxed">{bio}</p>
            </div>
          </div>
        )}
      </div>

      {/* Team / co-hosts */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users size={16} color="#2c4a1e" />
            <h2 className="text-base font-bold text-[#1a1a1a]">Team</h2>
          </div>
          <button
            onClick={() => setInviting(v => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#2c4a1e]"
          >
            <UserPlus size={14} />
            {inviting ? 'Cancel' : 'Invite'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Give trusted people access to help manage your listings and bookings.
        </p>

        {inviting && (
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
              disabled={!inviteName.trim() || !inviteEmail.trim()}
              className="bg-[#2c4a1e] text-white py-2.5 rounded-xl font-semibold text-sm
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-40
                         disabled:cursor-not-allowed">
              Send invite
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

          {VENDOR_TEAM.map((member) => (
            <div key={member.id} className="flex items-center gap-3 py-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0"
                style={{ background: member.avatarColor }}>
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
                <button onClick={() => removeTeamMember(member.id)}>
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
