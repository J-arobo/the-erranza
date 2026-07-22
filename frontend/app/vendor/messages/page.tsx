'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Send, Search } from 'lucide-react'
import { VENDOR_BOOKINGS, VENDOR_MESSAGE_THREADS } from '@/data/vendor'

function formatTimestamp(ts: string) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export default function VendorMessagesPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [, forceUpdate] = useState(0)

  const threadBookingIds = Array.from(new Set(VENDOR_MESSAGE_THREADS.map(m => m.bookingId)))
  const threads = threadBookingIds
    .map(id => VENDOR_BOOKINGS.find(b => b.id === id))
    .filter((b): b is NonNullable<typeof b> => !!b)

  const active = VENDOR_BOOKINGS.find(b => b.id === activeId)
  const activeMessages = VENDOR_MESSAGE_THREADS
    .filter(m => m.bookingId === activeId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  function isUnanswered(bookingId: string) {
    const msgs = VENDOR_MESSAGE_THREADS.filter(m => m.bookingId === bookingId)
    return !msgs.some(m => m.sender === 'vendor')
  }

  function lastMessage(bookingId: string) {
    const msgs = VENDOR_MESSAGE_THREADS
      .filter(m => m.bookingId === bookingId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    return msgs[0]?.text ?? ''
  }

  function sendReply() {
    if (!reply.trim() || !activeId) return
    VENDOR_MESSAGE_THREADS.push({
      id: `msg_${Date.now()}`,
      bookingId: activeId,
      sender: 'vendor',
      text: reply.trim(),
      timestamp: new Date().toISOString(),
    })
    setReply('')
    forceUpdate(n => n + 1)
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
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {threads.map((b) => (
            <button key={b.id} onClick={() => setActiveId(b.id)}
              className={`flex items-center gap-3 px-4 py-3 text-left w-full transition-colors
                ${activeId === b.id ? 'bg-[#eaf5e4]' : 'hover:bg-gray-50'}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0"
                style={{ background: b.guestColor }}>
                {b.guestInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{b.guestName}</p>
                  {isUnanswered(b.id) && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{lastMessage(b.id)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      {activeId && active ? (
        <div className="flex-1 flex flex-col bg-[#f3f4f6]">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
            <button onClick={() => setActiveId(null)} className="lg:hidden text-sm text-[#2c4a1e]">
              ← Back
            </button>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: active.guestColor }}>
              {active.guestInitial}
            </div>
            <div>
              <p className="text-sm font-bold text-[#1a1a1a]">{active.guestName}</p>
              <p className="text-xs text-gray-400">{active.listingTitle}</p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {activeMessages.map((m) => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'vendor' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[75%]
                  ${m.sender === 'vendor'
                    ? 'bg-[#2c4a1e] text-white rounded-br-sm'
                    : 'bg-white text-[#1a1a1a] border border-[#e0d9cc] shadow-sm rounded-bl-sm'}`}>
                  {m.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{formatTimestamp(m.timestamp)}</span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
            <input type="text" value={reply} onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendReply() }}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none" />
            <button onClick={sendReply}
              className="w-9 h-9 bg-[#2c4a1e] rounded-full flex items-center justify-center flex-shrink-0">
              <Send size={15} color="white" />
            </button>
          </div>
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
