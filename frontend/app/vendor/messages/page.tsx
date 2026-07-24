'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Send, Search } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const AVATAR_COLORS = ['#f0c4d4', '#c4d4f0', '#d4f0c4', '#f0e0c4', '#e0c4f0']
function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

type Thread = {
  booking_id: number
  listing_title: string
  guest_name: string
  last_message: string | null
  last_message_at: string | null
  unanswered: boolean
}

type ThreadMessage = {
  id: number
  sender_type: 'guest' | 'vendor'
  text: string
  created_at: string
}

type ThreadDetail = {
  booking_id: number
  listing_title: string
  guest_name: string
  messages: ThreadMessage[]
}

export default function VendorMessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [activeId, setActiveId] = useState<number | null>(null)
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)

  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    apiFetch<{ threads: Thread[] }>('/vendor/messages')
      .then(({ threads }) => setThreads(threads))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (activeId === null) { setActiveThread(null); return }

    setThreadLoading(true)
    apiFetch<ThreadDetail>(`/vendor/messages/${activeId}`)
      .then(setActiveThread)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setThreadLoading(false))
  }, [activeId])

  async function sendReply() {
    if (!reply.trim() || activeId === null) return

    setSending(true)
    setError('')
    try {
      const { message } = await apiFetch<{ message: ThreadMessage }>(`/vendor/messages/${activeId}`, {
        method: 'POST',
        body: JSON.stringify({ text: reply.trim() }),
      })
      setActiveThread(t => t ? { ...t, messages: [...t.messages, message] } : t)
      setThreads(ts => ts.map(t => t.booking_id === activeId
        ? { ...t, last_message: message.text, last_message_at: message.created_at, unanswered: false }
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

      {/* Conversation list */}
      <div className={`flex flex-col border-r border-gray-100 bg-white
                       ${activeId ? 'hidden lg:flex w-80' : 'flex-1 lg:w-80 lg:flex-none'}`}>
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-[#1a1a1a] mb-3">Messages</h1>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 h-9">
            <Search size={14} color="#888" />
            <input placeholder="Search..." className="flex-1 text-sm bg-transparent outline-none" />
          </div>
        </div>
        {error && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-xs">
            {error}
          </div>
        )}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {threads.length === 0 && (
            <div className="text-center py-16 text-sm text-gray-400 px-4">
              No conversations yet.
            </div>
          )}
          {threads.map((t) => (
            <button key={t.booking_id} onClick={() => setActiveId(t.booking_id)}
              className={`flex items-center gap-3 px-4 py-3 text-left w-full transition-colors
                ${activeId === t.booking_id ? 'bg-[#eaf5e4]' : 'hover:bg-gray-50'}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0"
                style={{ background: avatarColor(t.guest_name) }}>
                {t.guest_name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{t.guest_name}</p>
                  {t.unanswered && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{t.last_message ?? ''}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      {activeId !== null ? (
        <div className="flex-1 flex flex-col bg-[#f3f4f6]">
          {threadLoading || !activeThread ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
                <button onClick={() => setActiveId(null)} className="lg:hidden text-sm text-[#2c4a1e]">
                  ← Back
                </button>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: avatarColor(activeThread.guest_name) }}>
                  {activeThread.guest_name[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1a1a1a]">{activeThread.guest_name}</p>
                  <p className="text-xs text-gray-400">{activeThread.listing_title}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
                {activeThread.messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.sender_type === 'vendor' ? 'items-end' : 'items-start'}`}>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%]
                      ${m.sender_type === 'vendor'
                        ? 'bg-[#2c4a1e] text-white rounded-br-sm'
                        : 'bg-white text-[#1a1a1a] border border-[#e0d9cc] shadow-sm rounded-bl-sm'}`}>
                      {m.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTimestamp(m.created_at)}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
                <input type="text" value={reply} onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') sendReply() }}
                  placeholder="Type a message..."
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
