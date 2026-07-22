'use client'
import { History } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { AUDIT_LOG } from '@/data/admin'

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
  })
}

export default function AdminAuditLogPage() {
  const { user } = useAuth()
  const myEntries = AUDIT_LOG.filter(e => e.adminId === user?.email)

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Audit log</h1>
      <p className="text-sm text-gray-500 mb-6">
        A record of actions you've taken. You can only see your own history here.
      </p>

      {myEntries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <History size={24} color="#ccc" className="mx-auto mb-2" />
          <p className="text-sm text-gray-400">No actions logged yet under {user?.email}.</p>
          <p className="text-xs text-gray-400 mt-1">
            Approve a verification, suspend a listing, or resolve a dispute to see it appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 px-5">
          {myEntries.map((e) => (
            <div key={e.id} className="py-3.5">
              <p className="text-sm font-semibold text-[#1a1a1a]">{e.action}</p>
              <p className="text-xs text-gray-500">{e.target}</p>
              <p className="text-[10px] text-gray-400 mt-1">{formatTimestamp(e.timestamp)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
