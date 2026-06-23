'use client'
import { useState } from 'react'
import Image from 'next/image'
import { Send, Search } from 'lucide-react'
import { VENDOR_BOOKINGS } from '@/data/vendor'

export default function VendorMessagesPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [reply, setReply]       = useState('')
  const active = VENDOR_BOOKINGS.find(b => b.id === activeId)

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
          {VENDOR_BOOKINGS.filter(b => b.message).map((b) => (
            <button key={b.id} onClick={() => setActiveId(b.id)}
              className={`flex items-center gap-3 px-4 py-3 text-left w-full transition-colors
                ${activeId === b.id ? 'bg-[#eaf5e4]' : 'hover:bg-gray-50'}`}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0"
                style={{ background: b.guestColor }}>
                {b.guestInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#1a1a1a]">{b.guestName}</p>
                <p className="text-xs text-gray-400 truncate">{b.message}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Thread */}
      {activeId && active ? (
        <div className="flex-1 flex flex-col bg-[#f5f0e8]">
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
            <div className="flex justify-start">
              <div className="bg-white px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm
                              text-[#1a1a1a] max-w-[75%] border border-[#e0d9cc]">
                {active.message}
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-[#2c4a1e] px-4 py-2.5 rounded-2xl rounded-br-sm text-sm
                              text-white max-w-[75%]">
                Thanks for reaching out! Happy to help. {active.status === 'confirmed'
                  ? 'Your booking is confirmed.' : 'Let me check availability for you.'}
              </div>
            </div>
          </div>
          <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2">
            <input type="text" value={reply} onChange={(e) => setReply(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none" />
            <button onClick={() => setReply('')}
              className="w-9 h-9 bg-[#2c4a1e] rounded-full flex items-center justify-center">
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