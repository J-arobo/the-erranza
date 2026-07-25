'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'

const DESTINATIONS = ['Maasai Mara', 'Amboseli', 'Diani Beach', 'Lamu', 'Zanzibar', 'Serengeti']
const ACTIVITIES = ['Game drive', 'Balloon safari', 'Snorkelling', 'Cultural tour', 'Cooking class', 'Boat ride']
const ACCOMMODATIONS = ['Budget camping', 'Mid-range lodge', 'Luxury tented camp', 'Beach resort', '5-star hotel']
const DURATIONS = ['2 days', '3 days', '5 days', '7 days', '10 days', '14 days']

export default function CreatePackagePage() {
  const router = useRouter()

  const [step, setStep] = useState(1)
  const [selectedDestinations, setDests] = useState<string[]>([])
  const [selectedActivities, setActivities] = useState<string[]>([])
  const [selectedAccommodation, setAccom] = useState('')
  const [duration, setDuration] = useState('')
  const [guests, setGuests] = useState(2)
  const [includeFlight, setIncludeFlight] = useState(true)

  function toggleItem(item: string, list: string[], setter: (l: string[]) => void) {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item])
  }

  const totalEstimate = (() => {
    const base = selectedDestinations.length * 15000
    const actCost = selectedActivities.length * 5000
    const accomCost = selectedAccommodation.includes('Luxury') ? 25000
      : selectedAccommodation.includes('Mid') ? 12000 : 6000
    const durationDays = parseInt(duration) || 3
    const flightCost = includeFlight ? 8000 : 0
    return (base + actCost + (accomCost * durationDays) + flightCost) * guests
  })()

  const STEPS = ['Destination', 'Activities', 'Stay & Duration', 'Review']

  return (
    <div className="min-h-screen flex flex-col w-full"
      style={{ background: '#FEFDFC', fontFamily: "Georgia, 'Times New Roman', serif" }}>

      {/* Header — full-width bar, content centered inside */}
      <div className="w-full sticky top-0 z-40 shadow-sm"
        style={{ background: '#f5f6f4', borderBottom: '1px solid #e8e0d0' }}>
        <div className="flex items-center gap-3 px-4 pt-12 pb-4 max-w-2xl mx-auto">
          <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0"
            style={{ border: '1px solid #e8e0d0' }}>
            <ArrowLeft size={16} color="#304333" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold text-[#304333]">Build your package</h1>
            <p className="text-xs" style={{ color: '#78716c' }}>Step {step} of {STEPS.length}</p>
          </div>
          <span className="text-xs font-semibold text-[#2c4a1e]">{STEPS[step - 1]}</span>
        </div>
      </div>

      {/* Progress bar — full-width bar, content centered inside */}
      <div className="w-full">
        <div className="flex gap-1 px-4 py-3 max-w-2xl mx-auto">
          {STEPS.map((_, i) => (
            <div key={i}
              className="flex-1 h-1 rounded-full transition-all"
              style={{ background: i < step ? '#2c4a1e' : '#e8e0d0' }} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto w-full max-w-2xl mx-auto">

        {/* Step 1: Destinations */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-[#304333] mb-1">Where do you want to go?</h2>
            <p className="text-sm mb-4" style={{ color: '#78716c' }}>Select one or more destinations</p>
            <div className="grid grid-cols-2 gap-3">
              {DESTINATIONS.map((dest) => (
                <button key={dest}
                  onClick={() => toggleItem(dest, selectedDestinations, setDests)}
                  className="p-4 rounded-2xl border-2 text-sm font-semibold text-left transition-all shadow-sm"
                  style={selectedDestinations.includes(dest)
                    ? { borderColor: '#2c4a1e', background: '#F1F5E4', color: '#304333' }
                    : { borderColor: '#e8e0d0', background: 'white', color: '#304333' }}>
                  {selectedDestinations.includes(dest) && (
                    <Check size={14} className="mb-1" color="#2c4a1e" />
                  )}
                  {dest}
                </button>
              ))}
            </div>

            {/* Flight toggle */}
            <div className="mt-5 rounded-2xl p-4 flex items-center justify-between shadow-sm"
              style={{ background: 'white', border: '1px solid #e8e0d0' }}>
              <div>
                <p className="text-sm font-semibold text-[#304333]">Include flights</p>
                <p className="text-xs" style={{ color: '#78716c' }}>From Nairobi to destination</p>
              </div>
              <button
                onClick={() => setIncludeFlight(f => !f)}
                className="w-12 h-6 rounded-full transition-colors relative flex-shrink-0 overflow-hidden"
                style={{ background: includeFlight ? '#2c4a1e' : '#e8e0d0', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span className={`absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white
                                  transition-transform shadow
                  ${includeFlight ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Activities */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-[#304333] mb-1">What do you want to do?</h2>
            <p className="text-sm mb-4" style={{ color: '#78716c' }}>Pick your activities</p>
            <div className="grid grid-cols-2 gap-3">
              {ACTIVITIES.map((act) => (
                <button key={act}
                  onClick={() => toggleItem(act, selectedActivities, setActivities)}
                  className="p-4 rounded-2xl border-2 text-sm font-semibold text-left transition-all shadow-sm"
                  style={selectedActivities.includes(act)
                    ? { borderColor: '#2c4a1e', background: '#F1F5E4', color: '#304333' }
                    : { borderColor: '#e8e0d0', background: 'white', color: '#304333' }}>
                  {selectedActivities.includes(act) && (
                    <Check size={14} className="mb-1" color="#2c4a1e" />
                  )}
                  {act}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Stay & Duration */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-[#304333] mb-4">How long &amp; where to stay?</h2>

            <p className="text-sm font-semibold text-[#304333] mb-2">Duration</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className="py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm"
                  style={duration === d
                    ? { borderColor: '#2c4a1e', background: '#F1F5E4', color: '#304333' }
                    : { borderColor: '#e8e0d0', background: 'white', color: '#304333' }}>
                  {d}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-[#304333] mb-2">Accommodation style</p>
            <div className="flex flex-col gap-2 mb-5">
              {ACCOMMODATIONS.map((a) => (
                <button key={a} onClick={() => setAccom(a)}
                  className="px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-all shadow-sm"
                  style={selectedAccommodation === a
                    ? { borderColor: '#2c4a1e', background: '#F1F5E4', color: '#304333' }
                    : { borderColor: '#e8e0d0', background: 'white', color: '#304333' }}>
                  {a}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-[#304333] mb-2">Guests</p>
            <div className="flex items-center gap-4 rounded-xl px-4 py-3 w-fit shadow-sm"
              style={{ background: 'white', border: '1px solid #e8e0d0' }}>
              <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                className="w-8 h-8 rounded-full text-lg flex items-center justify-center"
                style={{ border: '1px solid #e8e0d0', color: '#304333' }}>−</button>
              <span className="text-base font-bold w-6 text-center text-[#304333]">{guests}</span>
              <button onClick={() => setGuests(g => g + 1)}
                className="w-8 h-8 rounded-full text-lg flex items-center justify-center"
                style={{ border: '1px solid #e8e0d0', color: '#304333' }}>+</button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-[#304333] mb-4">Review your package</h2>
            <div className="rounded-2xl shadow-sm p-5 mb-4"
              style={{ background: 'white', border: '1px solid #e8e0d0' }}>
              {[
                { label: 'Destinations', value: selectedDestinations.join(', ') || '—' },
                { label: 'Duration', value: duration || '—' },
                { label: 'Activities', value: selectedActivities.join(', ') || '—' },
                { label: 'Accommodation', value: selectedAccommodation || '—' },
                { label: 'Guests', value: `${guests} people` },
                { label: 'Flights', value: includeFlight ? 'Included' : 'Not included' },
              ].map(({ label, value }, i, arr) => (
                <div key={label} className="flex justify-between py-2.5"
                  style={{ borderBottom: i < arr.length - 1 ? '1px solid #e8e0d0' : 'none' }}>
                  <span className="text-sm" style={{ color: '#78716c' }}>{label}</span>
                  <span className="text-sm font-semibold text-[#304333] max-w-[60%] text-right">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-1">
                <span className="text-base font-bold text-[#304333]">Estimated total</span>
                <span className="text-base font-bold text-[#2c4a1e]">
                  Ksh {totalEstimate.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-center" style={{ color: '#78716c' }}>
              Final price confirmed after vendor matching
            </p>
          </div>
        )}
      </div>

      {/* Bottom navigation — full-width bar, content centered inside */}
      <div className="w-full shadow-sm" style={{ background: '#FEFDFC', borderTop: '1px solid #e8e0d0' }}>
        <div className="px-4 py-4 max-w-2xl mx-auto">
          {step < 4 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={
                (step === 1 && selectedDestinations.length === 0) ||
                (step === 2 && selectedActivities.length === 0) ||
                (step === 3 && (!duration || !selectedAccommodation))
              }
              className="w-full bg-[#2c4a1e] text-white py-4 rounded-2xl font-bold
                         text-sm hover:bg-[#3d6b28] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={() => router.push('/listings/pkg-custom/vendor/v1/book')}
              className="w-full bg-[#2c4a1e] text-white py-4 rounded-2xl font-bold
                         text-sm hover:bg-[#3d6b28] transition-colors"
            >
              Proceed to booking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
