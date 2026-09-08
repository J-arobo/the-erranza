'use client'
import { useState } from 'react'
import { X, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react'

type PreviewData = {
  title: string
  images: string[]
  locationPlaces: string[]
  category: string
  durationLabel?: string
  description: string
  itinerary: { day: number; title: string; description: string }[]
  amenities: string[]
  houseRules: string[]
  houseRulesCatalog: { key: string; label: string }[]
  cancellationPolicy: string
  cancellationLabel: string
  cancellationDescription: string
  price: string
}

export default function ListingPreviewModal({
  data, onClose, onConfirm, confirmLabel,
}: {
  data: PreviewData
  onClose: () => void
  onConfirm?: () => void
  confirmLabel?: string
}) {

  const [tab, setTab] = useState<'detail' | 'card'>('detail')
  const locationStr = data.locationPlaces.length > 0 ? `${data.locationPlaces.join(' + ')}, Kenya` : ''
  const [activeImage, setActiveImage] = useState(0)

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 bg-[#2c4a1e] flex-shrink-0">
          <span className="text-xs font-bold text-white bg-white/15 px-3 py-1.5 rounded-full tracking-wide">
            PREVIEW — NOT LIVE
          </span>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-full transition-colors">
              <X size={14} /> Back to editing
            </button>
            {onConfirm && (
              <button onClick={onConfirm}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#2c4a1e] bg-white hover:bg-gray-100 px-3 py-1.5 rounded-full transition-colors">
                {confirmLabel ?? 'Confirm'}
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 px-5 pt-3 border-b border-gray-100 flex-shrink-0">
          {([
            { id: 'detail', label: 'Listing page' },
            { id: 'card', label: 'Search card' },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors
                ${tab === t.id ? 'border-[#2c4a1e] text-[#1a1a1a]' : 'border-transparent text-gray-400 hover:text-[#1a1a1a]'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto">
          {tab === 'detail' ? (
            <>
                            <div className="relative h-56 sm:h-72 bg-[#f5f5f5]">
                {data.images[activeImage] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={data.images[activeImage]} alt="" className="w-full h-full object-cover" />
                )}
                {data.images.length > 1 && (
                  <>
                    <button type="button"
                      onClick={() => setActiveImage(i => (i - 1 + data.images.length) % data.images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <button type="button"
                      onClick={() => setActiveImage(i => (i + 1) % data.images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors">
                      <ChevronRight size={16} />
                    </button>
                    <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {activeImage + 1} / {data.images.length}
                    </span>
                  </>
                )}
              </div>
              {data.images.length > 1 && (
                <div className="flex gap-2 px-5 sm:px-6 pt-3 overflow-x-auto">
                  {data.images.map((url, i) => (
                    <button key={i} type="button" onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors
                        ${i === activeImage ? 'border-[#2c4a1e]' : 'border-transparent'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-5 sm:p-6">
                <h1 className="text-2xl font-bold text-[#1a1a1a] leading-tight mb-1">{data.title || 'Untitled listing'}</h1>
                {locationStr && <p className="text-sm text-gray-500 mb-2">{locationStr}</p>}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  {data.durationLabel && <span className="font-semibold text-[#1a1a1a]">{data.durationLabel}</span>}
                  <span>{data.category}</span>
                </div>

                {data.description && (
                  <p className="text-sm text-gray-600 leading-relaxed mb-6">{data.description}</p>
                )}

                {data.itinerary.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-3">Your journey</h3>
                    <div className="flex flex-col gap-4 border-l-2 border-dashed border-gray-200 pl-4">
                      {data.itinerary.map((d) => (
                        <div key={d.day} className="relative">
                          <span className="absolute -left-[22px] w-4 h-4 rounded-full bg-[#2c4a1e] text-white text-[10px] font-bold flex items-center justify-center">
                            {d.day}
                          </span>
                          <p className="text-sm font-bold text-[#1a1a1a]">Day {d.day} — {d.title}</p>
                          {d.description && <p className="text-sm text-gray-500 mt-0.5">{d.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.amenities.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-3">What&apos;s included</h3>
                    <div className="flex flex-col gap-2">
                      {data.amenities.map((a) => (
                        <div key={a} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#eaf5e4] flex items-center justify-center flex-shrink-0">
                            <Star size={10} color="#2c4a1e" fill="#2c4a1e" />
                          </div>
                          <span className="text-sm text-[#1a1a1a]">{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.houseRules.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-[#1a1a1a] mb-3">
                      {data.category === 'Stays' ? 'House rules' : 'Tour rules'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {data.houseRules.map((key) => {
                        const rule = data.houseRulesCatalog.find(r => r.key === key)
                        return rule ? (
                          <span key={key} className="text-sm font-semibold text-[#1a1a1a] bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full">
                            {rule.label}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-[#1a1a1a] mb-3">Cancellation policy</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-[#1a1a1a]">{data.cancellationLabel}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{data.cancellationDescription}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-5 sm:px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-bold text-[#1a1a1a]">
                    Ksh {data.price ? Number(data.price).toLocaleString() : '—'} <span className="text-sm font-normal text-gray-500">/ adult</span>
                  </p>
                  <button disabled
                    className="px-6 py-2.5 rounded-full bg-[#2c4a1e] text-white text-sm font-bold cursor-not-allowed opacity-60">
                    Reserve
                  </button>
                </div>
                <p className="text-xs text-gray-400 text-center">
                  This is exactly what travellers will see once you publish — Reserve is disabled in preview mode.
                </p>
              </div>
            </>
          ) : (
            <div className="p-5 sm:p-6">
              <p className="text-xs text-gray-400 mb-3">This is how the listing appears in search results and curated rows:</p>
              <div className="bg-[#faf8f1] rounded-2xl overflow-hidden border border-[#eeebe4] max-w-xs mx-auto">
                <div className="relative aspect-[5/4] bg-[#f5f5f5] overflow-hidden">
                  {data.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#d4cdc0]" />
                  )}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <Heart size={15} color="#1a1a1a" />
                  </div>
                  {locationStr && (
                    <span className="absolute bottom-3 left-3 right-3 bg-white text-[#1a1a1a] text-xs font-semibold px-3 py-1.5 rounded-lg truncate">
                      {locationStr}
                    </span>
                  )}
                </div>
                <div className="p-3.5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="text-[15px] font-bold text-[#1a1a1a] leading-tight flex-1">{data.title || 'Untitled listing'}</h4>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[16px] font-bold text-[#1a1a1a]">
                      Ksh {data.price ? Number(data.price).toLocaleString() : '—'}
                    </span>
                    <span className="flex items-center gap-1.5 bg-[#2c4a1e] text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                      View
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
