'use client'
import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

type Thread = {
  type: 'vendor' | 'traveller'
  id: number
  name: string
  last_message: string | null
  last_message_at: string | null
  awaiting_reply: boolean
}

type ThreadMessage = {
  id: number
  sender_id: number
  text: string
  created_at: string
  sender: { id: number; name: string } | null
}

type ThreadDetail = {
  type: 'vendor' | 'traveller'
  id: number
  name: string
  messages: ThreadMessage[]
}

export default function AdminSupportPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [active, setActive] = useState<{ type: 'vendor' | 'traveller'; id: number } | null>(null)
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)

  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    apiFetch<{ threads: Thread[] }>('/admin/support')
      .then(({ threads }) => setThreads(threads))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!active) { setActiveThread(null); return }

    setThreadLoading(true)
    apiFetch<ThreadDetail>(`/admin/support/${active.type}/${active.id}`)
      .then(setActiveThread)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setThreadLoading(false))
  }, [active])

  async function sendReply() {
    if (!reply.trim() || !active) return

    setSending(true)
    setError('')
    try {
      const { message } = await apiFetch<{ message: ThreadMessage }>(`/admin/support/${active.type}/${active.id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ text: reply.trim() }),
      })
      setActiveThread(t => t ? { ...t, messages: [...t.messages, message] } : t)
      setThreads(ts => ts.map(t => t.type === active.type && t.id === active.id
        ? { ...t, last_message: message.text, last_message_at: message.created_at, awaiting_reply: false }
        : t))
      setReply('')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-full">

      {/* Thread list */}
      <div className={`flex flex-col border-r border-gray-100 bg-white
                       ${active !== null ? 'hidden lg:flex w-80' : 'flex-1 lg:w-80 lg:flex-none'}`}>
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#1a1a1a]">Support</h1>
          <p className="text-xs text-gray-400 mt-0.5">Messages sent to Erranza Support, from vendors and travellers.</p>
        </div>
        {error && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs">
            {error}
          </div>
        )}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {threads.length === 0 && (
            <div className="text-center py-16 text-sm text-gray-400 px-4">
              No support conversations yet.
            </div>
          )}
          {threads.map((t) => (
            <button key={`${t.type}-${t.id}`} onClick={() => setActive({ type: t.type, id: t.id })}
              className={`flex items-center gap-3 px-4 py-3 text-left w-full transition-colors
                ${active?.type === t.type && active?.id === t.id ? 'bg-[#eaf5e4]' : 'hover:bg-gray-50'}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 bg-gray-100 text-[#1a1a1a]">
                {t.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{t.name}</p>
                  {t.awaiting_reply && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{t.last_message ?? ''}</p>
                <p className="text-[11px] text-gray-400 capitalize">{t.type}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      {active !== null ? (
        <div className="flex-1 flex flex-col bg-[#f3f4f6]">
          {threadLoading || !activeThread ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
                <button onClick={() => setActive(null)} className="lg:hidden text-sm text-[#2c4a1e]">
                  ← Back
                </button>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-gray-100 text-[#1a1a1a]">
                  {activeThread.name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{activeThread.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{activeThread.type}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {activeThread.messages.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">No messages yet.</p>
                )}
                {activeThread.messages.map((m) => {
                  const isUs = m.sender?.name === 'Erranza Support'
                  return (
                    <div key={m.id} className={`flex flex-col ${isUs ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%]
                        ${isUs
                          ? 'bg-[#2c4a1e] text-white rounded-br-sm'
                          : 'bg-white text-[#1a1a1a] border border-[#e0d9cc] shadow-sm rounded-bl-sm'}`}>
                        {m.text}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTimestamp(m.created_at)}</span>
                    </div>
                  )
                })}
              </div>
              <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
                <input type="text" value={reply} onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendReply() }}
                  placeholder="Reply as Erranza Support..."
                  disabled={sending}
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none disabled:opacity-50" />
                <button onClick={sendReply} disabled={sending}
                  className="w-9 h-9 bg-[#2c4a1e] rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50">
                  <Send size={15} color="white" />
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-gray-400">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  )
}