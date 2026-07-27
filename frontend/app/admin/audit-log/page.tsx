'use client'
import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type AuditEntry = {
  id: number
  action: string
  target: string | null
  created_at: string
}

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function AdminAuditLogPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch<{ entries: AuditEntry[] }>('/admin/audit-log')
      .then(({ entries }) => setEntries(entries))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Audit log</h1>
      <p className="text-sm text-gray-500 mb-6">
        A record of actions you've taken. You can only see your own history here.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
          <History size={24} color="#ccc" className="mx-auto mb-2" />
          <p className="text-sm text-gray-400">No actions logged yet.</p>
          <p className="text-xs text-gray-400 mt-1">
            Approve a verification, suspend a listing, or resolve a dispute to see it appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 px-5">
          {entries.map((e) => (
            <div key={e.id} className="py-3.5">
              <p className="text-sm font-semibold text-[#1a1a1a] capitalize">{e.action}</p>
              {e.target && <p className="text-xs text-gray-500">{e.target}</p>}
              <p className="text-[10px] text-gray-400 mt-1">{formatTimestamp(e.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
