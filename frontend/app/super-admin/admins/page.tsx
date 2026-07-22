'use client'
import { useState } from 'react'
import { Shield, UserPlus, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PLATFORM_ADMINS, logAction } from '@/data/admin'

export default function SuperAdminAdminsPage() {
  const { user } = useAuth()
  const [, forceUpdate] = useState(0)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'super_admin'>('admin')

  function adminId() { return user?.email ?? 'unknown-super-admin' }

  function addAdmin() {
    if (!name.trim() || !email.trim()) return
    PLATFORM_ADMINS.push({
      id: `pa_${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      addedDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
      revoked: false,
    })
    logAction(adminId(), `Created ${role === 'admin' ? 'Admin' : 'Super Admin'} account`, email.trim())
    setName(''); setEmail(''); setRole('admin'); setAdding(false)
    forceUpdate(n => n + 1)
  }

  function promote(id: string) {
    const admin = PLATFORM_ADMINS.find(a => a.id === id)
    if (!admin) return
    admin.role = 'super_admin'
    logAction(adminId(), 'Promoted to Super Admin', admin.email)
    forceUpdate(n => n + 1)
  }

  function revoke(id: string) {
    const admin = PLATFORM_ADMINS.find(a => a.id === id)
    if (!admin) return
    admin.revoked = true
    logAction(adminId(), 'Revoked admin access', admin.email)
    forceUpdate(n => n + 1)
  }

  function reinstate(id: string) {
    const admin = PLATFORM_ADMINS.find(a => a.id === id)
    if (!admin) return
    admin.revoked = false
    logAction(adminId(), 'Reinstated admin access', admin.email)
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Admin accounts</h1>
        <button onClick={() => setAdding(v => !v)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#161616]">
          <UserPlus size={15} />
          {adding ? 'Cancel' : 'Add admin'}
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5 flex flex-col gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                       outline-none focus:border-[#161616] transition-colors" />
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address" type="email"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm
                       outline-none focus:border-[#161616] transition-colors" />
          <div className="flex gap-2">
            {(['admin', 'super_admin'] as const).map((r) => (
              <button key={r} onClick={() => setRole(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${role === r
                    ? 'bg-[#161616] text-white border-[#161616]'
                    : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#161616]'}`}>
                {r === 'admin' ? 'Admin' : 'Super Admin'}
              </button>
            ))}
          </div>
          <button onClick={addAdmin} disabled={!name.trim() || !email.trim()}
            className="bg-[#161616] text-white py-2.5 rounded-xl font-semibold text-sm
                       hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Create account
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {PLATFORM_ADMINS.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <Shield size={14} color="#161616" />
                <p className="text-sm font-bold text-[#1a1a1a]">{a.name}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {a.revoked && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500">
                    Revoked
                  </span>
                )}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {a.role === 'admin' ? 'Admin' : 'Super Admin'}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">{a.email} · added {a.addedDate}</p>
            <div className="flex gap-2">
              {a.role === 'admin' && !a.revoked && (
                <button onClick={() => promote(a.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200
                             text-[#1a1a1a] hover:bg-gray-50 transition-colors">
                  Promote to Super Admin
                </button>
              )}
              {a.revoked ? (
                <button onClick={() => reinstate(a.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                             bg-[#161616] text-white hover:bg-black transition-colors">
                  Reinstate
                </button>
              ) : (
                <button onClick={() => revoke(a.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                             border border-red-200 text-red-500 hover:bg-red-50 transition-colors">
                  <X size={13} /> Revoke access
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
