'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Search, Settings, Send, ArrowLeft, Clock, X, ChevronRight,
  Star, Archive, BellOff, Languages, HelpCircle, MessageSquare,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import BottomNav from '@/components/BottomNav'



const FILTER_TABS = ['All', 'Travelling', 'Support']

const THREAD = [
  { from: 'vendor', text: 'Hello! Thank you for your interest in our safari.', time: '9:00 AM' },
  { from: 'user', text: 'Hi! I wanted to ask about the pickup location.', time: '9:15 AM' },
  { from: 'vendor', text: 'We pick you up directly from your hotel in Nairobi at 6am.', time: '9:20 AM' },
  { from: 'user', text: 'Perfect, thank you!', time: '9:22 AM' },
  { from: 'vendor', text: 'Your booking is confirmed! We will pick you up at 6am.', time: '10:32 AM' },
]

export default function MessagesPage() {
  const { isLoggedIn, messages, user } = useAuth()
  const router = useRouter()
  const [filter, setFilter] = useState('All')
  const [activeMsg, setActiveMsg] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch] = useState('')
  const [showDetailsSheet, setShowDetailsSheet] = useState(false)

  const filtered = messages.filter(m =>
    m.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    m.listingTitle.toLowerCase().includes(search.toLowerCase())
  )

  const activeThread = messages.find(m => m.id === activeMsg)

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

  // ── Conversation list — left column on desktop, full screen on mobile ──
  const ConversationList = () => (
    <div className="flex flex-col h-full">
      {showSearch ? (
        <div className="px-5 pt-10 md:pt-8 pb-4 flex items-center gap-2">
          <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 h-10 gap-2">
            <Search size={14} color="#888" />
            <input autoFocus type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="flex-1 text-sm bg-transparent outline-none" />
          </div>
          <button onClick={() => { setShowSearch(false); setSearch('') }}
            className="text-sm font-semibold text-[#1a1a1a]">Cancel</button>
        </div>
      ) : (
        <>
          <div className="px-5 pt-10 md:pt-8 pb-2 flex justify-end">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowSearch(true)}
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
          <button key={tab} onClick={() => setFilter(tab)}
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
            {filtered.map((msg) => (
              <button key={msg.id} onClick={() => setActiveMsg(msg.id)}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left w-full
                  ${activeMsg === msg.id ? 'bg-gray-50' : ''}`}>
                <div className="relative flex-shrink-0 w-14 h-14">
                  <div className="absolute top-0 left-0 w-11 h-11 rounded-xl overflow-hidden bg-[#e0d9cc] border-2 border-white">
                    <Image src={msg.vendorImage} alt={msg.vendorName} fill sizes="44px" className="object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white
                    ${msg.unread ? 'bg-[#2c4a1e]' : 'bg-gray-400'}`}>
                    {msg.vendorName[0]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${msg.unread ? 'font-bold' : 'font-semibold'} text-[#1a1a1a]`}>{msg.vendorName}</p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{msg.time}</span>
                  </div>
                  <p className={`text-xs truncate mb-0.5 ${msg.unread ? 'text-[#1a1a1a] font-medium' : 'text-gray-500'}`}>{msg.lastMessage}</p>
                  <p className="text-xs text-gray-400 truncate">{msg.listingTitle}</p>
                </div>
                {msg.unread && <div className="w-2.5 h-2.5 rounded-full bg-[#2c4a1e] flex-shrink-0" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  // ── Thread view — right column on desktop, full screen on mobile ──
  const ThreadView = ({ thread }: { thread: NonNullable<typeof activeThread> }) => (
    <div className="flex flex-col h-full bg-white">
      <div className="pt-3 md:pt-5 pb-3 border-b border-gray-100">
        <div className="relative flex items-center justify-between px-4" style={{ height: 40 }}>
          <button onClick={() => setActiveMsg(null)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center md:hidden relative z-10">
            <ArrowLeft size={16} color="#1a1a1a" />
          </button>
          <div className="hidden md:block w-9" />

          <div className="absolute left-1/2 top-1/2 w-10 h-10 rounded-full overflow-hidden bg-[#e0d9cc] border-2 border-white shadow-sm"
            style={{ transform: 'translate(-50%, -50%)' }}>
            <Image src={thread.vendorImage} alt={thread.vendorName} fill sizes="40px" className="object-cover" />
          </div>

          <button onClick={() => setShowDetailsSheet(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#304333] md:hidden relative z-10"
            style={{ background: '#F1F5E4' }}>
            Details
          </button>
          <button onClick={() => setShowDetailsSheet(true)}
            className="hidden md:block px-4 py-2 rounded-xl text-sm font-semibold text-[#304333] relative z-10"
            style={{ background: '#F1F5E4' }}>
            Show reservation
          </button>
        </div>

        <div className="text-center px-4 mt-1">
          <p className="text-sm font-bold text-[#1a1a1a]">
            {thread.vendorName}{thread.coGuestName ? `, ${thread.coGuestName}` : ''}
          </p>
          <p className="text-xs text-gray-400">
            {thread.dates ? `${thread.dates} · ` : ''}{thread.listingTitle}
          </p>
        </div>
      </div>


      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-white">
        {THREAD.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
              ${msg.from === 'user' ? 'bg-[#2c4a1e] text-white rounded-br-sm' : 'bg-gray-100 text-[#1a1a1a] rounded-bl-sm'}`}>
              <p>{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.from === 'user' ? 'text-white/60' : 'text-gray-400'}`}>{msg.time}</p>
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
          <input type="text" value={reply} onChange={(e) => setReply(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
          <button onClick={() => setReply('')}
            className="w-10 h-10 bg-[#2c4a1e] rounded-full flex items-center justify-center flex-shrink-0">
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  )

  // ── Details sheet — full-screen on mobile, centered modal on desktop ──
  const DetailsSheet = ({ thread }: { thread: NonNullable<typeof activeThread> }) => {
    const gallery: string[] = (thread as { gallery?: string[] }).gallery ?? []
    const participants = [
      { name: thread.vendorName, role: 'Host', image: thread.vendorImage },
      { name: 'You', role: 'Booker', initial: user?.name?.[0]?.toUpperCase() ?? 'Y' },
      ...(thread.coGuestName ? [{ name: thread.coGuestName, role: 'Guest', initial: thread.coGuestName[0] }] : []),
    ]

    return (
      <div className="fixed inset-0 z-[300] md:flex md:items-center md:justify-center"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowDetailsSheet(false) }}>
        <div className="bg-white h-full w-full md:h-auto md:max-h-[85vh] md:max-w-lg md:rounded-2xl overflow-y-auto">
          <div className="flex items-center justify-end px-5 pt-12 md:pt-5 pb-2 sticky top-0 bg-white z-10">
            <button onClick={() => setShowDetailsSheet(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100">
              <X size={18} color="#1a1a1a" />
            </button>
          </div>

          <div className="px-5 pb-12">
            <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Trip details</h2>
            <div className="rounded-2xl p-4 mb-8" style={{ border: '1px solid #e8e0d0' }}>
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#e0d9cc] flex-shrink-0">
                  <Image src={thread.vendorImage} alt={thread.vendorName} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#1a1a1a] truncate">{thread.listingTitle}</p>
                  <p className="text-sm text-gray-500">
                    {thread.dates ? `Trip completed · ${thread.dates}` : 'Trip details'}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">{thread.vendorName}</p>
                  <button className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Show reservation <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">In this conversation</h3>
            <div className="flex flex-col gap-4 mb-8">
              {participants.map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  {p.image ? (
                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-[#e0d9cc] flex-shrink-0">
                      <Image src={p.image} alt={p.name} fill sizes="44px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ background: '#2c4a1e' }}>
                      {p.initial}
                    </div>
                  )}
                  <div>
                    <p className="text-base font-semibold text-[#1a1a1a]">{p.name}</p>
                    <p className="text-sm text-gray-400">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>

            {gallery.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#1a1a1a]">Gallery</h3>
                  <button className="text-sm font-semibold text-[#1a1a1a] flex items-center gap-1"
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    Show all <ChevronRight size={14} />
                  </button>
                </div>
                <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
                  {gallery.map((src, i) => (
                    <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-[#e0d9cc] flex-shrink-0" style={{ border: '1px solid #e8e0d0' }}>
                      <Image src={src} alt="" fill sizes="96px" className="object-cover" />
                    </div>
                  ))}
                </div>
              </>
            )}

            <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Conversation actions</h3>
            <div className="flex flex-col gap-5 mb-8">
              {[
                { Icon: MessageSquare, label: 'Mark as unread' },
                { Icon: Star, label: 'Star' },
                { Icon: Archive, label: 'Archive' },
                { Icon: BellOff, label: 'Mute this conversation' },
              ].map(({ Icon, label }) => (
                <button key={label} className="flex items-center gap-3 text-left">
                  <Icon size={20} color="#1a1a1a" strokeWidth={1.5} />
                  <span className="text-base text-[#1a1a1a]">{label}</span>
                </button>
              ))}
              <div>
                <button className="flex items-center gap-3 text-left">
                  <Languages size={20} color="#1a1a1a" strokeWidth={1.5} />
                  <span className="text-base text-[#1a1a1a]">Disable translation</span>
                </button>
                <p className="text-sm text-gray-400 mt-1 ml-8">
                  Want all the messages translated?{' '}
                  <button className="underline text-[#1a1a1a]">Update translation settings</button>
                </p>
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Support</h3>
            <button className="flex items-center gap-3 mb-8 text-left">
              <HelpCircle size={20} color="#1a1a1a" strokeWidth={1.5} />
              <span className="text-base text-[#1a1a1a]">Visit the Help Centre</span>
            </button>

            <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Things to keep in mind</h3>
            <div className="flex flex-col gap-4 text-sm text-gray-500 leading-relaxed">
              <p>We may analyse messages for safety, support and to provide and improve our services.{' '}
                <button className="underline text-[#1a1a1a]">Learn more</button>
              </p>
              <p>Exercise your rights over how we process your message data, including for certain AI features.{' '}
                <button className="underline text-[#1a1a1a]">Learn more</button>
              </p>
              <p>Hosts can&apos;t see your profile photo until after your booking is confirmed.{' '}
                <button className="underline text-[#1a1a1a]">Learn more</button>
              </p>
              <p>To help protect your payment, always communicate and pay through Erranza.{' '}
                <button className="underline text-[#1a1a1a]">Learn more</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white">
      <div className={`w-full md:w-[380px] md:flex-shrink-0 md:border-r md:border-gray-100 h-full
        ${activeMsg ? 'hidden md:block' : 'block'}`}>
        <ConversationList />
      </div>

      <div className={`flex-1 h-full ${activeMsg ? 'block' : 'hidden md:flex'}`}>
        {activeThread ? (
          <ThreadView thread={activeThread} />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-center px-8">
            <div>
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl mx-auto mb-3">💬</div>
              <p className="text-sm text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showDetailsSheet && activeThread && <DetailsSheet thread={activeThread} />}
      {!activeMsg && (
        <BottomNav active="Messages" onSelect={() => { }} scrollingDown={false} scrolled={false} />
      )}
    </div>
  )
}
