'use client'
import { useState } from 'react'
import { Star, MessageCircle, Clock, TrendingUp } from 'lucide-react'
import { VENDOR_REVIEWS, VENDOR_LISTINGS, getResponseStats, formatDuration, getRankingEstimate } from '@/data/vendor'

export default function VendorReviewsPage() {
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [, forceUpdate] = useState(0)
  const avgRating = (VENDOR_REVIEWS.reduce((s, r) => s + r.rating, 0) / VENDOR_REVIEWS.length).toFixed(1)

  const { responseRate, avgResponseMinutes, answeredThreads, totalThreads } = getResponseStats()
  const activeListings = VENDOR_LISTINGS.filter(l => l.status === 'active')

  function postReply(id: string) {
    const review = VENDOR_REVIEWS.find(r => r.id === id)
    const text = replyText[id]?.trim()
    if (!review || !text) return
    review.replied = true
    review.replyText = text
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Reviews</h1>

      {/* Summary */}
      <div className="flex items-center gap-3 mb-5 bg-white rounded-2xl border
                      border-[#e0d9cc] p-5">
        <div className="text-center">
          <p className="text-4xl font-bold text-[#1a1a1a]">{avgRating}</p>
          <div className="flex justify-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14}
                color={i < Math.round(+avgRating) ? '#f5a623' : '#ddd'}
                fill={i < Math.round(+avgRating) ? '#f5a623' : '#ddd'} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{VENDOR_REVIEWS.length} reviews</p>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 ml-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count   = VENDOR_REVIEWS.filter(r => r.rating === star).length
            const percent = (count / VENDOR_REVIEWS.length) * 100
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-2">{star}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2c4a1e] rounded-full"
                    style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reputation & performance */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Reputation &amp; performance</h2>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-[#f5f0e8] rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <MessageCircle size={13} color="#2c4a1e" />
              <p className="text-xs text-gray-500">Response rate</p>
            </div>
            <p className="text-xl font-bold text-[#1a1a1a]">{responseRate}%</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{answeredThreads} of {totalThreads} conversations</p>
          </div>
          <div className="bg-[#f5f0e8] rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={13} color="#2c4a1e" />
              <p className="text-xs text-gray-500">Avg. response time</p>
            </div>
            <p className="text-xl font-bold text-[#1a1a1a]">
              {avgResponseMinutes !== null ? formatDuration(avgResponseMinutes) : '—'}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">across answered messages</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <TrendingUp size={13} color="#2c4a1e" />
          <p className="text-xs font-semibold text-[#1a1a1a]">Where you rank</p>
        </div>
        <p className="text-[11px] text-gray-400 mb-3">
          Estimated from your rating and booking conversion vs. your own listings by category —
          not live marketplace data.
        </p>
        <div className="flex flex-col gap-2">
          {activeListings.map((l) => {
            const { percentile, label } = getRankingEstimate(l)
            return (
              <div key={l.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100">
                <span className="text-sm text-[#1a1a1a] truncate">{l.title}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0
                  ${percentile <= 15 ? 'bg-[#eaf5e4] text-[#2c4a1e]' : 'bg-amber-50 text-amber-700'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Review cards */}
      <div className="flex flex-col gap-4">
        {VENDOR_REVIEWS.map((review) => (
          <div key={review.id}
            className="bg-white rounded-2xl border border-[#e0d9cc] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0"
                style={{ background: review.guestColor }}>
                {review.guestInitial}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{review.guestName}</p>
                <p className="text-xs text-gray-400">{review.listingTitle}</p>
              </div>
              <div className="text-right">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12}
                      color={i < review.rating ? '#f5a623' : '#ddd'}
                      fill={i < review.rating ? '#f5a623' : '#ddd'} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{review.date}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>

            {/* Reply */}
            {review.replied ? (
              <div className="bg-[#f5f0e8] rounded-xl p-3 border-l-2 border-[#2c4a1e]">
                <p className="text-xs font-semibold text-[#2c4a1e] mb-1">Your response</p>
                <p className="text-xs text-gray-500">
                  {review.replyText || 'Thank you for your wonderful review!'}
                </p>
              </div>
            ) : (
              <div>
                <textarea
                  value={replyText[review.id] ?? ''}
                  onChange={(e) => setReplyText(t => ({ ...t, [review.id]: e.target.value }))}
                  placeholder="Write a response to this review..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm
                             outline-none focus:border-[#2c4a1e] transition-colors resize-none mb-2"
                />
                <button
                  onClick={() => postReply(review.id)}
                  disabled={!replyText[review.id]?.trim()}
                  className="px-4 py-1.5 bg-[#2c4a1e] text-white rounded-xl text-xs
                             font-semibold hover:bg-[#3d6b28] transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Post response
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
