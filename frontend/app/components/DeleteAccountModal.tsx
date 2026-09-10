'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiErrorMessage } from '@/lib/api'

export default function DeleteAccountModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const { deleteAccount } = useAuth()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    if (confirmText !== 'DELETE' || !password) return
    setDeleting(true)
    setError('')
    try {
      await deleteAccount(password)
      router.push('/')
    } catch (err) {
      setError(apiErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle size={22} color="#dc2626" />
        </div>
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">Delete your account</h2>
        <p className="text-sm text-gray-500 mb-4">
          This permanently deletes your account, your bookings, reviews and saved trips
          {' '}— and, if you run a business on Erranza, your listings and team. This can't be undone.
        </p>

        <div className="relative mb-3">
          <input type={showPassword ? 'text' : 'password'} value={password}
            onChange={(e) => setPassword(e.target.value)} placeholder="Your password"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-red-400 transition-colors" />
          <button type="button" onClick={() => setShowPassword(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
          placeholder='Type DELETE to confirm'
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition-colors mb-3" />

        {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

        <button onClick={handleDelete} disabled={deleting || confirmText !== 'DELETE' || !password}
          className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 mb-2">
          {deleting ? 'Deleting…' : 'Delete my account'}
        </button>
        <button onClick={onClose} className="w-full py-2 text-sm font-semibold text-gray-400">Cancel</button>
      </div>
    </div>
  )
}
