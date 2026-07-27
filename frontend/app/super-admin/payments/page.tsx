'use client'
import { useEffect, useState } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type Provider = { name: string; configured: boolean }

export default function SuperAdminPaymentsPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<{ providers: Provider[]; note: string }>('/super-admin/payments')
      .then(({ providers, note }) => {
        setProviders(providers)
        setNote(note)
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#161616] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Payment providers</h1>
      <p className="text-sm text-gray-500 mb-6">{note}</p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="flex flex-col gap-3">
        {providers.map((p) => (
          <div key={p.name} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4
                                       flex items-center justify-between">
            <p className="text-sm font-semibold text-[#1a1a1a]">{p.name}</p>
            {p.configured ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#2c4a1e] bg-[#eaf5e4] px-3 py-1 rounded-full">
                <CheckCircle2 size={13} /> Configured
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <XCircle size={13} /> Not configured
              </span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        To change provider credentials, update the server's environment variables directly — they are never stored in or editable through this dashboard.
      </p>
    </div>
  )
}
