'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Search, Settings, Send, ArrowLeft, Clock, X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import BottomNav from '@/components/BottomNav'

const FILTER_TABS = ['All', 'Travelling', 'Support']
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

type Thread = {
  booking_id: number
  listing_title: string
  listing_image: string | null
  vendor_name: string
  last_message: string | null
  last_message_at: string | null
  unread: boolean
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
  listing_image: string | null
  vendor_name: string
  messages: ThreadMessage[]
}

// All three views below are hoisted to module scope so their identity stays
// stable across MessagesPage re-renders — defining them inside the page
// component would redefine (and remount) them on every keystroke, killing
// input focus after each character typed.

type ConversationListProps = {
  showSearch: boolean
  onShowSearch: (v: boolean) => void
  search: string
  onSearchChange: (v: string) => void
  filter: string
  onFilterChange: (v: string) => void
  filtered: Thread[]
  activeId: number | null
  onSelectThread: (id: number) => void
}

function ConversationList({
  showSearch, onShowSearch, search, onSearchChange,
  filter, onFilterChange, filtered, activeId, onSelectThread,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      {showSearch ? (
        <div className="px-5 pt-10 md:pt-8 pb-4 flex items-center gap-2">
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 h-10 gap-2">
            <Search size={14} color="#888" />
            <input autoFocus type="text" value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 text-sm bg-transparent outline-none" />
          </div>
          <button onClick={() => { onShowSearch(false); onSearchChange('') }}
            className="text-sm font-semibold text-[#1a1a1a]">Cancel</button>
        </div>
      ) : (
        <>
          <div className="px-5 pt-10 md:pt-8 pb-2 flex justify-end">
            <div className="flex items-center gap-2">
              <button onClick={() => onShowSearch(true)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Search size={18} color="#1a1a1a" />
              </button>
              <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Settings size={18} color="#1a1a1a" />
              </button>
            </div>
          </div>
          <div className="px-5 pb-4">
            <h1 className="text-3xl font-bold text-[#1a1a1a]">Messages</h1>
          </div>
        </>
      )}

      <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button key={tab} onClick={() => onFilterChange(tab)}
            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all
              ${filter === tab ? 'bg-[#1a1a1a] text-white' : 'bg-gray-100 text-[#1a1a1a] hover:bg-gray-200'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-5">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl">💬</div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">No messages yet</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              When you contact a tour operator or host, your conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((t) => (
              <button key={t.booking_id} onClick={() => onSelectThread(t.booking_id)}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left w-full
                  ${activeId === t.booking_id ? 'bg-gray-50' : ''}`}>
                <div className="relative flex-shrink-0 w-14 h-14">
                  <div className="absolute top-0 left-0 w-11 h-11 rounded-xl overflow-hidden bg-[#e0d9cc] border-2 border-white">
                    <Image src={t.listing_image ?? FALLBACK_IMAGE} alt={t.vendor_name} fill sizes="44px" className="object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white
                    ${t.unread ? 'bg-[#2c4a1e]' : 'bg-gray-400'}`}>
                    {t.vendor_name[0]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${t.unread ? 'font-bold' : 'font-semibold'} text-[#1a1a1a]`}>{t.vendor_name}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {t.last_message_at ? new Date(t.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <p className={`text-xs truncate mb-0.5 ${t.unread ? 'text-[#1a1a1a] font-medium' : 'text-gray-500'}`}>{t.last_message}</p>
                  <p className="text-xs text-gray-400 truncate">{t.listing_title}</p>
                </div>
                {t.unread && <div className="w-2.5 h-2.5 rounded-full bg-[#2c4a1e] flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

type ThreadViewProps = {
  thread: ThreadDetail
  onBack: () => void
  onShowDetails: () => void
  reply: string
  onReplyChange: (v: string) => void
  onSend: () => void
  sending: boolean
}

function ThreadView({ thread, onBack, onShowDetails, reply, onReplyChange, onSend, sending }: ThreadViewProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="pt-3 md:pt-5 pb-3 border-b border-gray-100">
        <div className="relative flex items-center justify-between px-4" style={{ height: 40 }}>
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center md:hidden relative z-10">
            <ArrowLeft size={16} color="#1a1a1a" />
          </button>
          <div className="hidden md:block w-9" />

          <div className="absolute left-1/2 top-1/2 w-10 h-10 rounded-full overflow-hidden bg-[#e0d9cc] border-2 border-white shadow-sm"
            style={{ transform: 'translate(-50%, -50%)' }}>
            <Image src={thread.listing_image ?? FALLBACK_IMAGE} alt={thread.vendor_name} fill sizes="40px" className="object-cover" />
          </div>

          <button onClick={onShowDetails}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#304333] md:hidden relative z-10"
            style={{ background: '#F1F5E4' }}>
            Details
          </button>
          <button onClick={onShowDetails}
            className="hidden md:block px-4 py-2 rounded-xl text-sm font-semibold text-[#304333] relative z-10"
            style={{ background: '#F1F5E4' }}>
            Show reservation
          </button>
        </div>

        <div className="text-center px-4 mt-1">
          <p className="text-sm font-bold text-[#1a1a1a]">{thread.vendor_name}</p>
          <p className="text-xs text-gray-400">{thread.listing_title}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {thread.messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No messages yet — say hello!</p>
        )}
        {thread.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_type === 'guest' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
              ${msg.sender_type === 'guest' ? 'bg-[#2c4a1e] text-white rounded-br-sm' : 'bg-gray-100 text-[#1a1a1a] rounded-bl-sm'}`}>
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.sender_type === 'guest' ? 'text-white/60' : 'text-gray-400'}`}>{formatTimestamp(msg.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-t border-gray-100 pb-8">
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 justify-center bg-gray-50 rounded-xl py-2.5 text-sm text-gray-500 mb-3">
            <Clock size={14} />
            Typical response time: 40 minutes
          </div>
        </div>
        <div className="px-4 flex gap-2">
          <input type="text" value={reply} onChange={(e) => onReplyChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSend() }}
            placeholder="Write a message..." disabled={sending}
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors disabled:opacity-50" />
          <button onClick={onSend} disabled={sending}
            className="w-10 h-10 bg-[#2c4a1e] rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50">
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  )
}

type DetailsSheetProps = {
  thread: ThreadDetail
  onClose: () => void
}

function DetailsSheet({ thread, onClose }: DetailsSheetProps) {
  return (
    <div className="fixed inset-0 z-[300] md:flex md:items-center md:justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white h-full w-full md:h-auto md:max-h-[85vh] md:max-w-lg md:rounded-2xl overflow-y-auto">
        <div className="flex items-center justify-end px-5 pt-12 md:pt-5 pb-2 sticky top-0 bg-white z-10">
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100">
            <X size={18} color="#1a1a1a" />
          </button>
        </div>

        <div className="px-5 pb-12">
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Trip details</h2>
          <div className="rounded-2xl p-4 mb-8" style={{ border: '1px solid #e8e0d0' }}>
            <div className="flex gap-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#e0d9cc] flex-shrink-0">
                <Image src={thread.listing_image ?? FALLBACK_IMAGE} alt={thread.vendor_name} fill sizes="80px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-[#1a1a1a] truncate">{thread.listing_title}</p>
                <p className="text-sm text-gray-500 mb-2">{thread.vendor_name}</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">In this conversation</h3>
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#e0d9cc] flex-shrink-0">
                <Image src={thread.listing_image ?? FALLBACK_IMAGE} alt={thread.vendor_name} width={44} height={44} className="object-cover" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#1a1a1a]">{thread.vendor_name}</p>
                <p className="text-sm text-gray-400">Host</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Things to keep in mind</h3>
          <div className="flex flex-col gap-4 text-sm text-gray-500 leading-relaxed">
            <p>We may analyse messages for safety, support and to provide and improve our services.</p>
            <p>Hosts can&apos;t see your profile photo until after your booking is confirmed.</p>
            <p>To help protect your payment, always communicate and pay through Erranza.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('All')
  const [activeId, setActiveId] = useState<number | null>(null)
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)

  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState('')
  const [showDetailsSheet, setShowDetailsSheet] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return }

    apiFetch<{ threads: Thread[] }>('/messages')
      .then(({ threads }) => setThreads(threads))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  useEffect(() => {
    if (activeId === null) { setActiveThread(null); return }

    setThreadLoading(true)
    apiFetch<ThreadDetail>(`/bookings/${activeId}/messages`)
      .then(setActiveThread)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setThreadLoading(false))
  }, [activeId])

  const filtered = threads.filter(t =>
    t.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
    t.listing_title.toLowerCase().includes(search.toLowerCase())
  )

  async function sendReply() {
    if (!reply.trim() || activeId === null) return

    setSending(true)
    setError('')
    try {
      const { message } = await apiFetch<{ message: ThreadMessage }>(`/bookings/${activeId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: reply.trim() }),
      })
      setActiveThread(t => t ? { ...t, messages: [...t.messages, message] } : t)
      setThreads(ts => ts.map(t => t.booking_id === activeId
        ? { ...t, last_message: message.text, last_message_at: message.created_at, unread: false }
        : t))
      setReply('')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="px-5 pt-8 pb-32 bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-4">Messages</h1>
        <p className="text-sm text-gray-500 mb-6">
          Log in to view messages from tour operators and hosts.
        </p>
        <button onClick={() => router.push('/login')}
          className="bg-[#2c4a1e] text-white px-6 py-3 rounded-xl font-semibold text-sm">
          Log in
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <div className={`w-full md:w-[380px] md:flex-shrink-0 md:border-r md:border-gray-100 h-full
        ${activeId ? 'hidden md:block' : 'block'}`}>
        <ConversationList
          showSearch={showSearch} onShowSearch={setShowSearch}
          search={search} onSearchChange={setSearch}
          filter={filter} onFilterChange={setFilter}
          filtered={filtered} activeId={activeId} onSelectThread={setActiveId}
        />
      </div>

      <div className={`flex-1 h-full ${activeId ? 'block' : 'hidden md:flex'}`}>
        {activeId !== null && activeThread && !threadLoading ? (
          <ThreadView
            thread={activeThread}
            onBack={() => setActiveId(null)}
            onShowDetails={() => setShowDetailsSheet(true)}
            reply={reply} onReplyChange={setReply}
            onSend={sendReply} sending={sending}
          />
        ) : activeId !== null && threadLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-center px-8">
            <div>
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">💬</div>
              <p className="text-sm text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showDetailsSheet && activeThread && (
        <DetailsSheet thread={activeThread} onClose={() => setShowDetailsSheet(false)} />
      )}
      {!activeId && (
        <BottomNav active="Messages" onSelect={() => { }} scrollingDown={false} scrolled={false} />
      )}
    </div>
  )
}
