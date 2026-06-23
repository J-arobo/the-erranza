'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Settings, Send, ArrowLeft, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import AppShell from '@/components/AppShell'

const FILTER_TABS = ['All', 'Travelling', 'Support']

export default function MessagesPage() {
  const { isLoggedIn, messages } = useAuth()
  const router = useRouter()
  const [filter, setFilter]       = useState('All')
  const [activeMsg, setActiveMsg] = useState<string | null>(null)
  const [reply, setReply]         = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [search, setSearch]       = useState('')

  const filtered = messages.filter(m =>
    m.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    m.listingTitle.toLowerCase().includes(search.toLowerCase())
  )

  const THREAD = [
    { from: 'vendor', text: 'Hello! Thank you for your interest in our safari.', time: '9:00 AM' },
    { from: 'user',   text: 'Hi! I wanted to ask about the pickup location.', time: '9:15 AM' },
    { from: 'vendor', text: 'We pick you up directly from your hotel in Nairobi at 6am.', time: '9:20 AM' },
    { from: 'user',   text: 'Perfect, thank you!', time: '9:22 AM' },
    { from: 'vendor', text: 'Your booking is confirmed! We will pick you up at 6am.', time: '10:32 AM' },
  ]

  const activeThread = messages.find(m => m.id === activeMsg)

  if (!isLoggedIn) {
    return (
      <AppShell showCollapse={false}>
        <div className="px-5 pt-8 pb-32 bg-[#f5f0e8] min-h-full">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-4">Messages</h1>
          <p className="text-sm text-gray-500 mb-6">
            Log in to view messages from tour operators and hosts.
          </p>
          <button onClick={() => router.push('/login')}
            className="bg-[#2c4a1e] text-white px-6 py-3 rounded-xl font-semibold text-sm">
            Log in
          </button>
        </div>
      </AppShell>
    )
  }

  // Thread view
  if (activeMsg && activeThread) {
    return (
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3 border-b
                        border-gray-100 bg-white sticky top-0 z-40">
          <button onClick={() => setActiveMsg(null)}
            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft size={16} color="#1a1a1a" />
          </button>
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#e0d9cc]">
              <Image src={activeThread.vendorImage} alt={activeThread.vendorName}
                fill sizes="40px" className="object-cover" />
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#1a1a1a]">{activeThread.vendorName}</p>
            <p className="text-xs text-gray-400">{activeThread.listingTitle}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-[#f5f0e8]">
          {THREAD.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm
                ${msg.from === 'user'
                  ? 'bg-[#2c4a1e] text-white rounded-br-sm'
                  : 'bg-white text-[#1a1a1a] rounded-bl-sm border border-[#e0d9cc]'}`}>
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1
                  ${msg.from === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 pb-8">
          <input type="text" value={reply} onChange={(e) => setReply(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-200 rounded-full px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
          <button onClick={() => setReply('')}
            className="w-10 h-10 bg-[#2c4a1e] rounded-full flex items-center
                       justify-center flex-shrink-0">
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppShell showCollapse={false}>
      <div className="min-h-full bg-white">

        {/* Header */}
        <div className="px-5 pt-10 pb-4 flex items-start justify-between">
          {showSearch ? (
            <div className="flex-1 flex items-center gap-2">
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
              <h1 className="text-3xl font-bold text-[#1a1a1a]">Messages</h1>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowSearch(true)}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search size={18} color="#1a1a1a" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Settings size={18} color="#1a1a1a" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Filter tabs — All / Travelling / Support */}
        <div className="flex gap-2 px-5 pb-4 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map((tab) => (
            <button key={tab} onClick={() => setFilter(tab)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold
                          transition-all
                ${filter === tab
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-gray-100 text-[#1a1a1a] hover:bg-gray-200'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Message list */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-5">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center
                            justify-center text-2xl">💬</div>
            <h2 className="text-lg font-bold text-[#1a1a1a]">No messages yet</h2>
            <p className="text-sm text-gray-500 max-w-xs">
              When you contact a tour operator or host, your conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {filtered.map((msg) => (
              <button key={msg.id} onClick={() => setActiveMsg(msg.id)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50
                           transition-colors text-left w-full">

                {/* Stacked image + avatar */}
                <div className="relative flex-shrink-0 w-14 h-14">
                  <div className="absolute top-0 left-0 w-11 h-11 rounded-xl
                                  overflow-hidden bg-[#e0d9cc] border-2 border-white">
                    <Image src={msg.vendorImage} alt={msg.vendorName}
                      fill sizes="44px" className="object-cover" />
                  </div>
                  <div className={`absolute bottom-0 right-0 w-7 h-7 rounded-full
                                   border-2 border-white flex items-center justify-center
                                   text-xs font-bold text-white
                                   ${msg.unread ? 'bg-[#2c4a1e]' : 'bg-gray-400'}`}>
                    {msg.vendorName[0]}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm ${msg.unread ? 'font-bold' : 'font-semibold'}
                                   text-[#1a1a1a]`}>
                      {msg.vendorName}
                    </p>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {msg.time}
                    </span>
                  </div>
                  <p className={`text-xs truncate mb-0.5
                    ${msg.unread ? 'text-[#1a1a1a] font-medium' : 'text-gray-500'}`}>
                    {msg.lastMessage}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{msg.listingTitle}</p>
                </div>

                {/* Unread dot */}
                {msg.unread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2c4a1e] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}