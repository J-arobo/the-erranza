'use client'
import { useEffect, useState } from 'react'
import { Star, MessageCircle, Clock, TrendingUp } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const AVATAR_COLORS = ['#f0c4d4', '#c4d4f0', '#d4f0c4', '#f0e0c4', '#e0c4f0']
function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

type ApiReview = {
  id: number
  rating: number
  comment: string
  reply_text: string | null
  replied: boolean
  created_at: string
  listing: { id: number; title: string }
  traveller: { id: number; name: string }
}

type Stats = {
  total_threads: number
  answered_threads: number
  response_rate: number
  avg_response_minutes: number | null
  listings: { id: number; title: string; percentile: number; label: string }[]
}

export default function VendorReviewsPage() {
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyText, setReplyText] = useState<Record<number, string>>({})
  const [posting, setPosting] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      apiFetch<{ reviews: ApiReview[] }>('/vendor/reviews'),
      apiFetch<Stats>('/vendor/stats'),
    ])
      .then(([reviewsRes, statsRes]) => {
        setReviews(reviewsRes.reviews)
        setStats(statsRes)
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  async function postReply(id: number) {
    const text = replyText[id]?.trim()
    if (!text) return

    setPosting(id)
    setError('')
    try {
      await apiFetch(`/vendor/reviews/${id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply_text: text }),
      })
      setReviews(rs => rs.map(r => r.id === id ? { ...r, replied: true, reply_text: text } : r))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setPosting(null)
    }
  }

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Reviews</h1>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center gap-3 mb-5 bg-white rounded-2xl border
                      border-[#e0d9cc] shadow-sm p-5">
        <div className="text-center">
          <p className="text-4xl font-bold text-[#1a1a1a]">{avgRating}</p>
          <div className="flex justify-center mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={14}
                color={i < Math.round(+avgRating) ? '#f5a623' : '#ddd'}
                fill={i < Math.round(+avgRating) ? '#f5a623' : '#ddd'} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">{reviews.length} reviews</p>
        </div>
        <div className="flex-1 flex flex-col gap-1.5 ml-4">
          {[5, 4, 3, 2, 1].map((star) => {
            const count   = reviews.filter(r => r.rating === star).length
            const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0
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
      {stats && (
        <div className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5 mb-5">
          <h2 className="text-base font-bold text-[#1a1a1a] mb-4">Reputation &amp; performance</h2>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#f3f4f6] rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageCircle size={13} color="#2c4a1e" />
                <p className="text-xs text-gray-500">Response rate</p>
              </div>
              <p className="text-xl font-bold text-[#1a1a1a]">{stats.response_rate}%</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{stats.answered_threads} of {stats.total_threads} conversations</p>
            </div>
            <div className="bg-[#f3f4f6] rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={13} color="#2c4a1e" />
                <p className="text-xs text-gray-500">Avg. response time</p>
              </div>
              <p className="text-xl font-bold text-[#1a1a1a]">
                {stats.avg_response_minutes !== null ? formatDuration(stats.avg_response_minutes) : '—'}
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
            {stats.listings.map((l) => (
              <div key={l.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100">
                <span className="text-sm text-[#1a1a1a] truncate">{l.title}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0
                  ${l.percentile <= 15 ? 'bg-[#eaf5e4] text-[#2c4a1e]' : 'bg-amber-50 text-amber-700'}`}>
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review cards */}
      <div className="flex flex-col gap-4">
        {reviews.length === 0 && (
          <div className="text-center py-16 text-sm text-gray-400">
            No reviews yet.
          </div>
        )}
        {reviews.map((review) => (
          <div key={review.id}
            className="bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center
                              text-sm font-bold flex-shrink-0"
                style={{ background: avatarColor(review.traveller.name) }}>
                {review.traveller.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#1a1a1a]">{review.traveller.name}</p>
                <p className="text-xs text-gray-400">{review.listing.title}</p>
              </div>
              <div className="text-right">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12}
                      color={i < review.rating ? '#f5a623' : '#ddd'}
                      fill={i < review.rating ? '#f5a623' : '#ddd'} />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(review.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-3">{review.comment}</p>

            {/* Reply */}
            {review.replied ? (
              <div className="bg-[#f5f0e8] rounded-xl p-3 border-l-2 border-[#2c4a1e]">
                <p className="text-xs font-semibold text-[#2c4a1e] mb-1">Your response</p>
                <p className="text-xs text-gray-500">
                  {review.reply_text || 'Thank you for your wonderful review!'}
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
                  disabled={!replyText[review.id]?.trim() || posting === review.id}
                  className="px-4 py-1.5 bg-[#2c4a1e] text-white rounded-xl text-xs
                             font-semibold hover:bg-[#3d6b28] transition-colors
                             disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {posting === review.id ? 'Posting…' : 'Post response'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
