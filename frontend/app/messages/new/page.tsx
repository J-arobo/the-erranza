'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

type ApiListingSummary = {
  id: number
  title: string
  price: string
  images: { url: string }[]
  vendor: { business_name: string }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

function NewMessagePageContent() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const listingId = searchParams.get('listing')
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const guests = Number(searchParams.get('guests') ?? '1')

  const [listing, setListing] = useState<ApiListingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn) { router.push('/login'); return }
    if (!listingId) { router.push('/messages'); return }

    // This compose screen is only for the very first message about a
    // listing — if a conversation already exists, skip straight to it.
    apiFetch<{ messages: unknown[] }>(`/listings/${listingId}/messages`)
      .then(({ messages }) => {
        if (messages.length > 0) router.replace(`/messages?listing=${listingId}`)
        else setChecking(false)
      })
      .catch(() => setChecking(false))
  }, [isLoggedIn, listingId, router])

  useEffect(() => {
    if (!listingId) return
    apiFetch<{ listing: ApiListingSummary }>(`/listings/${listingId}`)
      .then(({ listing }) => setListing(listing))
      .finally(() => setLoading(false))
  }, [listingId])

  const nights = checkIn && checkOut
    ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 1
  const total = listing ? Math.round(Number(listing.price)) * guests * nights : 0

  async function handleSend() {
    if (!text.trim() || !listingId) return
    setSending(true)
    setError('')
    try {
      await apiFetch(`/listings/${listingId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
      })
      router.push(`/messages?listing=${listingId}`)
    } catch (err) {
      setError(apiErrorMessage(err))
      setSending(false)
    }
  }

  if (loading || checking) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white gap-4">
        <p className="text-sm text-gray-500">This listing could not be found.</p>
        <button onClick={() => router.back()} className="text-sm font-semibold underline text-[#2c4a1e]">Go back</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white max-w-lg mx-auto">
      <div className="px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center">
          <ArrowLeft size={16} color="#1a1a1a" />
        </button>
      </div>

      <div className="flex-1 px-5 pb-40">
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
        )}

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-2xl font-bold text-[#1a1a1a]">Ksh {total.toLocaleString()} total</p>
            <p className="text-sm text-gray-600 mt-2">{listing.title}</p>
          </div>
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#e0d9cc] flex-shrink-0">
            <Image src={listing.images[0]?.url ?? FALLBACK_IMAGE} alt={listing.title} fill sizes="80px" className="object-cover" />
          </div>
        </div>

        {(checkIn || checkOut) && (
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <span className="text-base font-semibold text-[#1a1a1a]">Dates</span>
            <span className="text-sm font-semibold text-[#1a1a1a] underline">
              {checkIn ? formatDate(checkIn) : ''}{checkOut ? ` – ${formatDate(checkOut)}` : ''}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between py-4 border-b border-gray-100 mb-6">
          <span className="text-base font-semibold text-[#1a1a1a]">Guests</span>
          <span className="text-sm font-semibold text-[#1a1a1a] underline">{guests} guest{guests !== 1 ? 's' : ''}</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Hi ${listing.vendor.business_name}! I'll be visiting…`}
          rows={6}
          className="w-full border border-gray-300 rounded-2xl p-4 text-sm text-[#1a1a1a] placeholder:text-gray-400 outline-none focus:border-[#2c4a1e] transition-colors resize-none"
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-100 px-5 py-4 pb-8">
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          className="w-full bg-[#2c4a1e] text-white py-4 rounded-2xl font-bold text-sm hover:bg-[#3d6b28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </div>
  )
}

export default function NewMessagePage() {
  return (
    <Suspense fallback={null}>
      <NewMessagePageContent />
    </Suspense>
  )
}
