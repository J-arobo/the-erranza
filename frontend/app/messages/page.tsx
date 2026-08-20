'use client'
import { Suspense, useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  Search, Settings, Send, ArrowLeft, Clock, X, Home,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import BottomNav from '@/components/BottomNav'

const FILTER_TABS = ['All', 'Travelling', 'Support']

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// One thread per vendor — every listing/booking you've ever messaged that
// vendor about lives in the same conversation, so it doesn't fragment when
// you message about a second property from the same host.
type Thread = {
  vendor_id: number
  vendor_name: string
  vendor_avatar: string | null
  is_support: boolean
  listing_title: string | null
  last_message: string | null
  last_message_at: string | null
  last_sender_name: string | null
  last_sender_avatar: string | null
  unread: boolean
}

type ThreadMessage = {
  id: number
  sender_type: 'guest' | 'vendor'
  text: string
  created_at: string
  listing: { id: number; title: string } | null
  sender: { name: string; avatar_url: string | null } | null
}

type ThreadDetail = {
  vendor_id: number
  vendor_name: string
  vendor_avatar: string | null
  is_support: boolean
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
  activeVendorId: number | null
  onSelectThread: (t: Thread) => void
}

function ConversationList({
  showSearch, onShowSearch, search, onSearchChange,
  filter, onFilterChange, filtered, activeVendorId, onSelectThread,
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
              <button key={t.vendor_id} onClick={() => onSelectThread(t)}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left w-full focus:outline-none
                              ${activeVendorId === t.vendor_id ? 'bg-gray-50' : ''}`}>
                <div className="relative flex-shrink-0 w-14 h-14">
                  <div className="absolute top-0 left-0 w-14 h-14 rounded-full overflow-hidden bg-[#2c4a1e] border-2 border-white flex items-center justify-center text-white text-lg font-bold"
                    style={t.vendor_avatar ? { backgroundImage: `url(${t.vendor_avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                    {!t.vendor_avatar && t.vendor_name[0]}
                  </div>
                  {/* Only shown once an actual staff member has replied — before that it's just the vendor. */}
                  {t.last_sender_name && (
                    <div className="absolute -bottom-1 -right-1 w-[34px] h-[34px] rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white bg-gray-400"
                      style={t.last_sender_avatar ? { backgroundImage: `url(${t.last_sender_avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                      {!t.last_sender_avatar && t.last_sender_name[0]}
                    </div>
                  )}

                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${t.unread ? 'font-bold' : 'font-semibold'} text-[#1a1a1a]`}>{t.vendor_name}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {t.last_message_at ? new Date(t.last_message_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                  <p className={`text-xs truncate mb-0.5 ${t.unread ? 'text-[#1a1a1a] font-medium' : 'text-gray-500'}`}>{t.last_message ?? 'Say hello!'}</p>
                  {t.listing_title && <p className="text-xs text-gray-400 truncate">{t.listing_title}</p>}
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
  const lastListingTitle = thread.messages.length > 0 ? thread.messages[thread.messages.length - 1].listing?.title ?? null : null
  const lastVendorSender = [...thread.messages].reverse().find(m => m.sender_type === 'vendor')?.sender ?? null
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [thread.messages.length])

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="pt-3 md:pt-5 pb-3 border-b border-gray-100">
        <div className="relative flex items-center justify-between px-4" style={{ height: 40 }}>
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center md:hidden relative z-10">
            <ArrowLeft size={16} color="#1a1a1a" />
          </button>
          <div className="hidden md:block w-9" />

          <div className="absolute left-1/2 top-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
            <div className="relative w-10 h-10">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#2c4a1e] border-2 border-white shadow-sm flex items-center justify-center text-white text-sm font-bold"
                style={thread.vendor_avatar ? { backgroundImage: `url(${thread.vendor_avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                {!thread.vendor_avatar && thread.vendor_name[0]}
              </div>
              {lastVendorSender && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white bg-gray-400"
                  style={lastVendorSender.avatar_url ? { backgroundImage: `url(${lastVendorSender.avatar_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                  {!lastVendorSender.avatar_url && lastVendorSender.name[0]}
                </div>
              )}
            </div>
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
          {lastListingTitle && <p className="text-xs text-gray-400">{lastListingTitle}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {thread.messages.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">No messages yet — say hello!</p>
        )}
        {thread.messages.map((msg, i) => {
          const prevListingId = i > 0 ? thread.messages[i - 1].listing?.id ?? null : null
          const showListingTag = msg.listing && msg.listing.id !== prevListingId
          return (
            <div key={msg.id}>
              {showListingTag && (
                <div className="flex justify-center my-2">
                  <div className="bg-gray-100 text-gray-500 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Home size={11} /> Regarding: {msg.listing!.title}
                  </div>
                </div>
              )}
              <div className={`flex ${msg.sender_type === 'guest' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
                  ${msg.sender_type === 'guest' ? 'bg-[#2c4a1e] text-white rounded-br-sm' : 'bg-gray-100 text-[#1a1a1a] rounded-bl-sm'}`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender_type === 'guest' ? 'text-white/60' : 'text-gray-400'}`}>{formatTimestamp(msg.created_at)}</p>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="bg-white border-t border-gray-100 pb-8">
        <div className="px-4 pt-3">
          <div className="rounded-2xl overflow-hidden border border-gray-200">
            <div className="flex items-center gap-2 justify-center bg-gray-50 py-2.5 text-sm text-gray-500">
              <Clock size={14} />
              Typical response time: 40 minutes
            </div>
            <div className="flex gap-2 bg-white p-2.5">
              <input type="text" value={reply} onChange={(e) => onReplyChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onSend() }}
                placeholder="Write a message..." disabled={sending}
                className="flex-1 border-none outline-none text-sm px-2 disabled:opacity-50" />
              <button onClick={onSend} disabled={sending}
                className="w-10 h-10 bg-[#2c4a1e] rounded-full flex items-center justify-center flex-shrink-0 disabled:opacity-50">
                <Send size={16} color="white" />
              </button>
            </div>
          </div>
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
  const listingTitles = Array.from(new Set(thread.messages.map(m => m.listing?.title).filter((t): t is string => !!t)))

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
          <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Conversation details</h2>

          {listingTitles.length > 0 && (
            <div className="rounded-2xl p-4 mb-8" style={{ border: '1px solid #e8e0d0' }}>
              <p className="text-xs text-gray-400 mb-2">Listings discussed in this conversation</p>
              <div className="flex flex-col gap-1.5">
                {listingTitles.map(title => (
                  <p key={title} className="text-sm font-semibold text-[#1a1a1a]">{title}</p>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">In this conversation</h3>
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden bg-[#2c4a1e] flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                style={thread.vendor_avatar ? { backgroundImage: `url(${thread.vendor_avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
                {!thread.vendor_avatar && thread.vendor_name[0]}
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

function MessagesPageContent() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [threads, setThreads] = useState<Thread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('All')

  const [activeVendorId, setActiveVendorId] = useState<number | null>(() => {
    const v = searchParams.get('vendor')
    return v ? Number(v) : null
  })
  // The listing a NEW message should be tagged with — set from the URL when
  // arriving via "Message host", otherwise falls back to whatever the
  // thread's last message was about.
  const [contextListingId, setContextListingId] = useState<number | null>(() => {
    const l = searchParams.get('listing')
    return l ? Number(l) : null
  })

  useEffect(() => {
    const v = searchParams.get('vendor')
    const l = searchParams.get('listing')
    const t = searchParams.get('text')
    if (v) setActiveVendorId(Number(v))
    if (l) setContextListingId(Number(l))
    if (t) setReply(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null)
  const [threadLoading, setThreadLoading] = useState(false)

  const [reply, setReply] = useState(() => searchParams.get('text') ?? '')

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
    if (activeVendorId === null) { setActiveThread(null); return }

    setThreadLoading(true)
    apiFetch<ThreadDetail>(`/vendors/${activeVendorId}/messages`)
      .then(setActiveThread)
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setThreadLoading(false))
  }, [activeVendorId])

  const filtered = threads.filter(t =>
    t.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
    (t.listing_title ?? '').toLowerCase().includes(search.toLowerCase())
  )

  async function sendReply() {
    if (!reply.trim() || activeVendorId === null) return

    const listingId = contextListingId ?? activeThread?.messages[activeThread.messages.length - 1]?.listing?.id
    if (!listingId && !activeThread?.is_support) { setError('Could not tell which listing this is about — try messaging from that listing\'s page.'); return }

    setSending(true)
    setError('')
    try {
      const { message } = await apiFetch<{ message: ThreadMessage }>(`/vendors/${activeVendorId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: reply.trim(), listing_id: listingId ?? null }),
      })
      setActiveThread(t => t ? { ...t, messages: [...t.messages, message] } : t)
      setThreads(ts => {
        const exists = ts.some(t => t.vendor_id === activeVendorId)
        if (exists) {
          return ts.map(t => t.vendor_id === activeVendorId
            ? { ...t, last_message: message.text, last_message_at: message.created_at, listing_title: message.listing?.title ?? t.listing_title, unread: false }
            : t)
        }
        if (!activeThread) return ts
        return [{
          vendor_id: activeVendorId,
          vendor_name: activeThread.vendor_name,
          vendor_avatar: activeThread.vendor_avatar,
          is_support: activeThread.is_support,
          listing_title: message.listing?.title ?? null,
          last_message: message.text,
          last_message_at: message.created_at,
          last_sender_name: null,
          last_sender_avatar: null,
          unread: false,
        }, ...ts]
      })
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
        ${activeVendorId !== null ? 'hidden md:block' : 'block'}`}>
        <ConversationList
          showSearch={showSearch} onShowSearch={setShowSearch}
          search={search} onSearchChange={setSearch}
          filter={filter} onFilterChange={setFilter}
          filtered={filtered} activeVendorId={activeVendorId}
          onSelectThread={(t) => { setActiveVendorId(t.vendor_id); setContextListingId(null) }}
        />
      </div>

      <div className={`flex-1 h-full ${activeVendorId !== null ? 'block' : 'hidden md:flex'}`}>
        {activeVendorId !== null && activeThread && !threadLoading ? (
          <ThreadView
            thread={activeThread}
            onBack={() => setActiveVendorId(null)}
            onShowDetails={() => setShowDetailsSheet(true)}
            reply={reply} onReplyChange={setReply}
            onSend={sendReply} sending={sending}
          />
        ) : activeVendorId !== null && threadLoading ? (
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
      {activeVendorId === null && (
        <BottomNav active="Messages" onSelect={() => { }} scrollingDown={false} scrolled={false} />
      )}
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesPageContent />
    </Suspense>
  )
}
