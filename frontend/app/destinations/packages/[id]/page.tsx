'use client'
import { use, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, Share2, Heart, Star, X, Camera, Grid2X2,
  MapPin, Plane, Clock, ChevronRight, Calendar, Award, Shield, Globe,
} from 'lucide-react'
import { packages } from '@/data/packages'
import FooterSection from '@/components/FooterSection'

type Props = {
  params: Promise<{ id: string }>
}

const Divider = () => <div className="border-t border-[#e8e0d0] my-6" />

export default function PackageDetailPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()

  const pkg = packages.find(p => p.id === id)
  const otherPackages = packages.filter(p => p.id !== id).slice(0, 4)

  const [wishlisted, setWishlisted] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [showGallery, setShowGallery] = useState(false)
  const [showMobileGuestPanel, setShowMobileGuestPanel] = useState(false)
  const [showGuestPanel, setShowGuestPanel] = useState(false)
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [pets, setPets] = useState(0)
  const guests = adults + children

  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  if (!pkg) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-white">
        <span className="text-5xl">🔍</span>
        <p className="text-gray-500 text-sm">Package not found</p>
        <button onClick={() => router.back()}
          className="text-sm font-semibold underline text-[#2c4a1e]">
          Go back
        </button>
      </div>
    )
  }

  const images = pkg.images ?? [pkg.image]
  const basePrice = parseFloat(pkg.price.replace(/[^0-9.]/g, '')) || 100
  const total = basePrice * guests

  function handleBook() {
    const bookParams = new URLSearchParams({
      adults: String(adults), children: String(children),
      infants: String(infants), pets: String(pets),
    })
    router.push(`/destinations/packages/${id}/book?${bookParams.toString()}`)
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.changedTouches[0].clientX
  }
  function handleTouchEnd(e: React.TouchEvent) {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) setActiveImage(i => Math.min(images.length - 1, i + 1))
    if (diff < -50) setActiveImage(i => Math.max(0, i - 1))
  }

  function handleWishlist(e: React.MouseEvent) {
    e.stopPropagation()
    setWishlisted(w => !w)
  }

  // ── Full screen gallery modal ─────────────────────────────────────────
  if (showGallery) {
    return (
      <div className="fixed inset-0 bg-black z-[200] flex flex-col">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <button
            onClick={() => setShowGallery(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <X size={18} color="white" />
          </button>
          <span className="text-white text-sm font-semibold">
            {activeImage + 1} / {images.length}
          </span>
          <div className="w-9" />
        </div>
        <div
          className="flex-1 relative"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[activeImage]}
            alt={`${pkg.title} ${activeImage + 1}`}
            fill sizes="100vw" className="object-contain"
          />
        </div>
        <div className="flex gap-2 justify-center py-4 px-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className="relative flex-shrink-0 rounded-lg overflow-hidden"
              style={{
                width: 56, height: 56,
                border: `2px solid ${i === activeImage ? 'white' : 'transparent'}`,
                opacity: i === activeImage ? 1 : 0.5,
              }}
            >
              <Image src={img} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Mobile guest-editing modal ──────────────────────────────────────
  if (showMobileGuestPanel) {
    return (
      <div className="fixed inset-0 bg-white z-[200] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-12 pb-4">
          <button
            onClick={() => setShowMobileGuestPanel(false)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <X size={22} color="#304333" />
          </button>
          <h1 className="text-lg font-bold text-[#304333]">Guests</h1>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-32">
          {[
            { label: 'Adults', sub: 'Age 13+', count: adults, set: setAdults, min: 1, max: 16 },
            { label: 'Children', sub: 'Ages 2–12', count: children, set: setChildren, min: 0, max: Math.max(0, 16 - adults) },
            { label: 'Infants', sub: 'Under 2', count: infants, set: setInfants, min: 0, max: 5 },
            { label: 'Pets', sub: 'Bringing a service animal?', count: pets, set: setPets, min: 0, max: 5 },
          ].map(({ label, sub, count, set, min, max }, idx, arr) => (
            <div key={label} className="flex items-center justify-between py-5"
              style={{ borderBottom: idx < arr.length - 1 ? '1px solid #e8e0d0' : 'none' }}>
              <div>
                <p className="text-base font-semibold text-[#304333]">{label}</p>
                <p className="text-sm text-[#78716c]">{sub}</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => set((c: number) => Math.max(min, c - 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    border: '1px solid #b0a898', background: 'none', cursor: count <= min ? 'not-allowed' : 'pointer',
                    opacity: count <= min ? 0.4 : 1, color: '#304333', fontSize: 20,
                  }}>−</button>
                <span className="text-base font-semibold text-[#304333] w-5 text-center">{count}</span>
                <button onClick={() => set((c: number) => Math.min(max, c + 1))}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    border: '1px solid #b0a898', background: 'none', cursor: count >= max ? 'not-allowed' : 'pointer',
                    opacity: count >= max ? 0.4 : 1, color: '#304333', fontSize: 20,
                  }}>+</button>
              </div>
            </div>
          ))}
        </div>


        <div className="fixed bottom-0 left-0 right-0 bg-white px-5"
          style={{ borderTop: '1px solid #e8e0d0', paddingTop: 14, paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))' }}>
          <button
            onClick={() => setShowMobileGuestPanel(false)}
            className="w-full py-3.5 rounded-xl font-semibold text-sm text-white"
            style={{ background: '#304333', border: 'none', cursor: 'pointer' }}>
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#FEFDFC', fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', background: '#FEFDFC' }}>

        {/* ═══════════════════════════════════════
          MOBILE PHOTO — single active image
          ═══════════════════════════════════════ */}
        <div className="sm:hidden">
          <div
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ height: '72vw', maxHeight: '340px' }}
          >
            <Image
              src={images[activeImage]}
              alt={`${pkg.title} ${activeImage + 1}`}
              fill sizes="100vw" className="object-cover"
              onClick={() => setShowGallery(true)}
            />

            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 z-10"
              style={{ paddingTop: 'max(48px, env(safe-area-inset-top, 48px))', paddingBottom: 12 }}>
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
              >
                <ArrowLeft size={18} color="#304333" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                >
                  <Share2 size={16} color="#304333" />
                </button>
                <button
                  onClick={handleWishlist}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }}
                >
                  <Heart size={16} color={wishlisted ? '#e8612a' : '#304333'} fill={wishlisted ? '#e8612a' : 'none'} />
                </button>
              </div>
            </div>

            {pkg.duration && (
              <div className="absolute top-16 left-3 bg-[#304333] text-white text-xs font-semibold px-2.5 py-1 rounded-full z-10">
                {pkg.duration}
              </div>
            )}

            <div className="absolute bottom-3 right-3 bg-black/60 text-white
                          text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1.5 z-10">
              <Camera size={12} />
              {activeImage + 1} / {images.length}
            </div>

            <button
              className="absolute left-0 top-0 w-1/3 h-full"
              onClick={() => setActiveImage(i => Math.max(0, i - 1))}
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full"
              onClick={() => setActiveImage(i => Math.min(images.length - 1, i + 1))}
            />
          </div>

          <div className="flex justify-center gap-1.5 py-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: activeImage === i ? 16 : 6, height: 6,
                  background: activeImage === i ? '#2c4a1e' : '#d4d4d4',
                }}
              />
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
          DESKTOP PHOTO GRID
          ═══════════════════════════════════════ */}
        <div className="hidden sm:block pt-4">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">

            <div className="flex items-center justify-between pb-3">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#304333] hover:underline"
              >
                <ArrowLeft size={16} strokeWidth={2} /> Back
              </button>
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors underline">
                  <Share2 size={15} /> Share
                </button>
                <button
                  onClick={handleWishlist}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors underline"
                >
                  <Heart size={15} color={wishlisted ? '#e8612a' : '#304333'} fill={wishlisted ? '#e8612a' : 'none'} /> Save
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden" style={{ height: 420 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, height: '100%' }}>
                <div className="relative overflow-hidden group cursor-pointer"
                  onClick={() => { setActiveImage(0); setShowGallery(true) }}>
                  <Image
                    src={images[0]}
                    alt={pkg.title}
                    fill sizes="(min-width: 1280px) 500px, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 3 }}>
                  {[1, 2, 3, 4].map((imgIdx) => (
                    <div key={imgIdx} className="relative overflow-hidden group cursor-pointer"
                      onClick={() => { setActiveImage(imgIdx); setShowGallery(true) }}>
                      <Image
                        src={images[imgIdx] ?? images[0]}
                        alt={`${pkg.title} ${imgIdx + 1}`}
                        fill sizes="(min-width: 1280px) 250px, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowGallery(true)}
                className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 text-sm font-semibold text-[#304333] hover:bg-[#f5f0e6] transition-colors z-10"
                style={{ border: '1px solid #d4cfc8', boxShadow: '0 1px 6px rgba(0,0,0,0.1)' }}
              >
                <Grid2X2 size={14} />
                Show all photos
              </button>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div className="flex-1 pb-20 sm:pb-8 px-5 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full -mt-5 sm:mt-0 rounded-t-3xl sm:rounded-none bg-[#FEFDFC] sm:bg-transparent relative">
          <div className="md:grid md:grid-cols-[1fr_380px] md:gap-12">

            {/* ══ LEFT COLUMN ══ */}
            <div>

              {/* Title + location */}
              <div className="pt-5 pb-1 sm:pt-6 text-center sm:text-left">
                <h1 className="text-2xl sm:text-[28px] font-semibold text-[#304333] leading-tight mb-1">
                  {pkg.title}
                </h1>
                <p className="text-sm sm:text-base text-[#78716c] mb-2 flex items-center gap-1 justify-center sm:justify-start">
                  <MapPin size={13} /> {pkg.location.replace(/\s*\+\s*/g, ' → ')}
                  {pkg.duration && <><span className="mx-1">·</span><Clock size={13} /> {pkg.duration}</>}
                </p>
                {pkg.dates && (
                  <p className="text-sm sm:text-base text-[#78716c] mb-2 flex items-center gap-1 justify-center sm:justify-start">
                    <Calendar size={13} /> {pkg.dates}
                  </p>
                )}
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-3">
                  <Star size={14} fill="#F5D06E" color="#304333" />
                  <span className="text-sm font-semibold text-[#304333]">{pkg.rating}</span>
                </div>
                <p className="text-sm text-[#304333] leading-relaxed">
                  {pkg.description}
                </p>
              </div>

              {/* What's included */}
              {pkg.packageIncludes && pkg.packageIncludes.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <h2 className="text-xl font-semibold text-[#304333] mb-4">What&apos;s included</h2>
                    <div className="flex flex-col gap-3">
                      {pkg.packageIncludes.map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <span className="text-sm text-[#304333]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Trip details */}
              <Divider />
              <div>
                <h2 className="text-xl font-semibold text-[#304333] mb-4">Trip details</h2>
                <div className="flex flex-col gap-3">
                  {pkg.duration && (
                    <div className="flex items-center gap-3">
                      <Clock size={16} color="#2c4a1e" strokeWidth={2} />
                      <span className="text-sm text-[#304333]">{pkg.duration} itinerary</span>
                    </div>
                  )}
                  {pkg.flightFrom && (
                    <div className="flex items-center gap-3">
                      <Plane size={16} color="#2c4a1e" strokeWidth={2} />
                      <span className="text-sm text-[#304333]">Departs from {pkg.flightFrom}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin size={16} color="#2c4a1e" strokeWidth={2} />
                    <span className="text-sm text-[#304333]">{pkg.location}</span>
                  </div>
                </div>
                <p className="text-sm text-[#78716c] mt-4 leading-relaxed">
                  This is a fixed-itinerary package — dates and route are pre-planned by our team, so there&apos;s
                  no date picker here. Choose your group size and book directly.
                </p>
              </div>

            </div>

            {/* ══ DESKTOP BOOKING SIDEBAR ══ */}
            <div className="hidden md:block">
              <div className="sticky top-24 mt-6">
                <div className="rounded-2xl shadow-xl p-6 bg-white" style={{ border: '1px solid #e8e0d0' }}>

                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-2xl font-semibold text-[#304333]">
                      {pkg.price.replace(/[\d,]+/, String(Math.round(total)))}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <Star size={13} fill="#F5D06E" color="#304333" />
                      <span className="text-sm font-semibold text-[#304333]">{pkg.rating}</span>
                    </div>
                  </div>

                  <div className="relative mb-4">
                    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #b0a898' }}>
                      <div className="p-3" style={{ borderBottom: '1px solid #b0a898' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Destination</p>
                        <p className="text-sm font-semibold text-[#304333]">{pkg.location.replace(/\s*\+\s*/g, ' → ')}</p>
                      </div>
                      <div className="p-3" style={{ borderBottom: '1px solid #b0a898' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Dates</p>
                        <p className="text-sm font-semibold text-[#304333]">{pkg.dates ?? 'To be confirmed'}</p>
                      </div>
                      <div className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#f9f5ef] transition-colors"
                        onClick={() => setShowGuestPanel(s => !s)}>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#304333] mb-0.5">Guests</p>
                          <p className="text-sm font-semibold text-[#304333]">{guests} guest{guests > 1 ? 's' : ''}</p>
                        </div>
                        <ChevronRight size={16} color="#78716c"
                          style={{ transform: showGuestPanel ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
                      </div>
                    </div>
                    {showGuestPanel && (
                      <div className="absolute bg-white rounded-xl shadow-xl z-50 p-5"
                        style={{ top: '100%', marginTop: 4, border: '1px solid #e8e0d0', left: 0, right: 0 }}>
                        {[
                          { label: 'Adults', sub: 'Age 13+', count: adults, set: setAdults, min: 1, max: 16 },
                          { label: 'Children', sub: 'Ages 2–12', count: children, set: setChildren, min: 0, max: Math.max(0, 16 - adults) },
                          { label: 'Infants', sub: 'Under 2', count: infants, set: setInfants, min: 0, max: 5 },
                          { label: 'Pets', sub: 'Bringing a service animal?', count: pets, set: setPets, min: 0, max: 5 },
                        ].map(({ label, sub, count, set, min, max }) => (
                          <div key={label} className="flex items-center justify-between py-4"
                            style={{ borderBottom: label !== 'Pets' ? '1px solid #f0ede8' : 'none' }}>
                            <div>
                              <p className="text-sm font-semibold text-[#304333]">{label}</p>
                              <p className="text-sm text-[#78716c]">{sub}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => set((c: number) => Math.max(min, c - 1))}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                  border: '1px solid #b0a898', background: 'none', cursor: count <= min ? 'not-allowed' : 'pointer',
                                  opacity: count <= min ? 0.4 : 1, fontFamily: 'inherit', color: '#304333', fontSize: 18,
                                }}>−</button>
                              <span className="text-sm font-semibold text-[#304333] w-4 text-center">{count}</span>
                              <button onClick={() => set((c: number) => Math.min(max, c + 1))}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{
                                  border: '1px solid #b0a898', background: 'none', cursor: count >= max ? 'not-allowed' : 'pointer',
                                  opacity: count >= max ? 0.4 : 1, fontFamily: 'inherit', color: '#304333', fontSize: 18,
                                }}>+</button>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                          <button onClick={() => setShowGuestPanel(false)}
                            className="text-sm font-semibold text-[#304333]"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleBook}
                    className="w-full py-3.5 rounded-xl font-semibold text-sm text-white mb-3 transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                    Book
                  </button>
                  <p className="text-xs text-center text-[#78716c] mb-4">You won&apos;t be charged yet</p>

                  <div className="flex flex-col gap-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#304333]">{pkg.price} × {guests} guest{guests > 1 ? 's' : ''}</span>
                      <span className="text-[#304333]">{pkg.price.replace(/[\d,]+/, String(Math.round(total)))}</span>
                    </div>
                    <div className="flex justify-between pt-3" style={{ borderTop: '1px solid #e8e0d0' }}>
                      <span className="text-sm font-semibold text-[#304333]">Total</span>
                      <span className="text-sm font-semibold text-[#304333]">{pkg.price.replace(/[\d,]+/, String(Math.round(total)))}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
          {/* Tour operator */}
          <Divider />
          <div>
            <h2 className="text-xl font-semibold text-[#304333] mb-5">Meet your tour operator</h2>

            <div className="hidden sm:flex gap-10 items-start">
              <div className="flex-shrink-0" style={{ width: 400 }}>
                <div className="rounded-2xl p-5" style={{ border: '1px solid #e8e0d0', background: 'white' }}>
                  <div className="flex items-center">
                    <div className="w-1/2 flex flex-col items-center">
                      <div className="relative mb-3">
                        <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold" style={{ background: '#2c4a1e' }}>
                          {(pkg.operatorName ?? 'Erranza')[0]}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                          <Award size={14} color="white" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-[#304333] text-center">{pkg.operatorName ?? 'Erranza Travel'}</p>
                      <p className="text-sm text-[#78716c]">Tour operator</p>
                    </div>
                    <div className="w-1/2 pl-4">
                      <div className="py-2.5" style={{ borderBottom: '1px solid #e8e0d0' }}>
                        <p className="text-xl font-bold text-[#304333]">{pkg.operatorReviews ?? 0}</p>
                        <p className="text-xs text-[#78716c]">Reviews</p>
                      </div>
                      <div className="py-3" style={{ borderBottom: '1px solid #e8e0d0' }}>
                        <p className="text-xl font-bold text-[#304333]">{pkg.rating} <span className="text-base">★</span></p>
                        <p className="text-xs text-[#78716c]">Rating</p>
                      </div>
                      <div className="py-2.5">
                        <p className="text-xl font-bold text-[#304333]">{pkg.operatorYears ?? 3}</p>
                        <p className="text-xs text-[#78716c]">Yrs operating</p>
                      </div>
                    </div>
                  </div>
                </div>

                {pkg.operatorLanguages && (
                  <div className="flex items-center gap-2.5 mt-4">
                    <Globe size={18} strokeWidth={1.5} color="#304333" />
                    <p className="text-sm text-[#304333]">Speaks {pkg.operatorLanguages}</p>
                  </div>
                )}
                {pkg.operatorLoves && (
                  <div className="flex items-center gap-2.5 mt-3">
                    <Heart size={18} strokeWidth={1.5} color="#304333" />
                    <p className="text-sm text-[#304333]">Loves: {pkg.operatorLoves}</p>
                  </div>
                )}
              </div>

              {pkg.guideName && (
                <div className="flex-1">
                  <p className="text-base font-semibold text-[#304333] mb-3">Tour guide</p>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-sm font-bold">
                      {pkg.guideName[0]}
                    </div>
                    <p className="text-sm font-semibold text-[#304333]">{pkg.guideName}</p>
                  </div>

                  <p className="text-base font-semibold text-[#304333] mb-2">Host details</p>
                  <p className="text-sm text-[#304333] mb-6">
                    Response rate: {pkg.operatorResponseRate ?? 98}%<br />
                    Responds {pkg.operatorResponseTime ?? 'within a few hours'}
                  </p>

                  <button
                    className="px-8 py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df]"
                    style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Message tour operator
                  </button>

                  <div className="flex items-start gap-3 mt-6 pt-6" style={{ borderTop: '1px solid #e8e0d0' }}>
                    <Shield size={20} strokeWidth={1.5} color="#78716c" />
                    <p className="text-xs text-[#78716c]">To help protect your payment, always communicate and pay through Erranza.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sm:hidden">
              <div className="bg-white rounded-2xl p-4 mb-4" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.12)', maxWidth: 380 }}>
                <div className="flex items-center">
                  <div className="w-1/2 flex flex-col items-center">
                    <div className="relative mb-1.5">
                      <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold" style={{ background: '#2c4a1e' }}>
                        {(pkg.operatorName ?? 'Erranza')[0]}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center">
                        <Award size={12} color="white" />
                      </div>
                    </div>
                    <p className="text-base font-bold text-[#304333] text-center">{pkg.operatorName ?? 'Erranza Travel'}</p>
                    <p className="text-xs text-[#78716c]">Tour operator</p>
                  </div>
                  <div className="w-1/2 pl-3">
                    <div className="py-2" style={{ borderBottom: '1px solid #e8e0d0' }}>
                      <p className="text-base font-bold text-[#304333]">{pkg.operatorReviews ?? 0}</p>
                      <p className="text-xs text-[#78716c]">Reviews</p>
                    </div>
                    <div className="py-2" style={{ borderBottom: '1px solid #e8e0d0' }}>
                      <p className="text-base font-bold text-[#304333]">{pkg.rating} <span className="text-sm">★</span></p>
                      <p className="text-xs text-[#78716c]">Rating</p>
                    </div>
                    <div className="py-2">
                      <p className="text-base font-bold text-[#304333]">{pkg.operatorYears ?? 3}</p>
                      <p className="text-xs text-[#78716c]">Yrs operating</p>
                    </div>
                  </div>
                </div>
              </div>

              {pkg.operatorLanguages && (
                <div className="flex items-center gap-2.5 mb-3">
                  <Globe size={16} strokeWidth={1.5} color="#304333" />
                  <p className="text-sm text-[#304333]">Speaks {pkg.operatorLanguages}</p>
                </div>
              )}
              {pkg.operatorLoves && (
                <div className="flex items-center gap-2.5 mb-5">
                  <Heart size={16} strokeWidth={1.5} color="#304333" />
                  <p className="text-sm text-[#304333]">Loves: {pkg.operatorLoves}</p>
                </div>
              )}

              {pkg.guideName && (
                <>
                  <p className="text-base font-semibold text-[#304333] mb-3">Tour guide</p>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full bg-[#2c4a1e] flex items-center justify-center text-white text-sm font-bold">
                      {pkg.guideName[0]}
                    </div>
                    <p className="text-sm font-semibold text-[#304333]">{pkg.guideName}</p>
                  </div>

                  <p className="text-base font-semibold text-[#304333] mb-2">Host details</p>
                  <p className="text-sm text-[#304333] mb-5">
                    Response rate: {pkg.operatorResponseRate ?? 98}%<br />
                    Responds {pkg.operatorResponseTime ?? 'within a few hours'}
                  </p>

                  <button
                    className="w-full py-3.5 rounded-xl text-sm font-semibold text-[#304333] transition-colors hover:bg-[#ede8df] mb-5"
                    style={{ background: '#F1F5E4', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Message tour operator
                  </button>

                  <div className="flex items-start gap-3">
                    <Shield size={18} strokeWidth={1.5} color="#78716c" />

                    <p className="text-xs text-[#78716c]">To help protect your payment, always communicate and pay through Erranza.</p>
                  </div>
                </>
              )}
            </div>
          </div>




          {/* More packages */}
          {otherPackages.length > 0 && (
            <>
              <Divider />
              <div>
                <h2 className="text-xl font-semibold text-[#304333] mb-4">More packages</h2>

                <div className="sm:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
                  <div className="flex gap-3">
                    {otherPackages.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => router.push(`/destinations/packages/${p.id}`)}
                        className="relative flex-shrink-0 w-[45vw] h-[130px] rounded-2xl overflow-hidden active:scale-95 transition-transform"
                        style={{ background: '#e8e0d0' }}
                      >
                        <Image src={p.image} alt={p.title} fill className="object-cover" sizes="45vw" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                          <p className="text-white text-xs font-semibold truncate">{p.title}</p>
                          <p className="text-white/70 text-[10px]">{p.price}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {otherPackages.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => router.push(`/destinations/packages/${p.id}`)}
                      className="relative h-[130px] rounded-2xl overflow-hidden active:scale-95 transition-transform"
                      style={{ background: '#e8e0d0' }}
                    >
                      <Image src={p.image} alt={p.title} fill className="object-cover" sizes="50vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-left">
                        <p className="text-white text-xs font-semibold truncate">{p.title}</p>
                        <p className="text-white/70 text-[10px]">{p.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        <FooterSection />

      </div>

      {/* ── STICKY BOTTOM BAR (mobile) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white px-5"
        style={{ borderTop: '1px solid #e8e0d0', paddingTop: 14, paddingBottom: 'calc(14px + env(safe-area-inset-bottom, 0px))', zIndex: 50 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-semibold text-[#304333]">
                {pkg.price.replace(/[\d,]+/, String(Math.round(total)))}
              </span>
              <span className="text-sm text-[#78716c]">total</span>
            </div>
            <button
              onClick={() => setShowMobileGuestPanel(true)}
              className="text-sm font-semibold underline"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2c4a1e' }}>
              {guests} guest{guests > 1 ? 's' : ''}
            </button>
          </div>
          <button
            onClick={handleBook}
            className="px-7 py-3 rounded-xl font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(to right, #e8612a, #d44d1a)', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            Book
          </button>
        </div>
      </div>

    </div>
  )
}
