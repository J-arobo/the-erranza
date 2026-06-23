'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Plus, X } from 'lucide-react'

const DESTINATIONS = ['Maasai Mara', 'Amboseli', 'Diani Beach', 'Lamu', 'Zanzibar', 'Serengeti']
const ACTIVITIES   = ['Game drive', 'Balloon safari', 'Snorkelling', 'Cultural tour', 'Cooking class', 'Boat ride']
const ACCOMMODATIONS = ['Budget camping', 'Mid-range lodge', 'Luxury tented camp', 'Beach resort', '5-star hotel']
const DURATIONS    = ['2 days', '3 days', '5 days', '7 days', '10 days', '14 days']

export default function CreatePackagePage() {
  const router = useRouter()

  const [step, setStep]                       = useState(1)
  const [selectedDestinations, setDests]      = useState<string[]>([])
  const [selectedActivities, setActivities]   = useState<string[]>([])
  const [selectedAccommodation, setAccom]     = useState('')
  const [duration, setDuration]               = useState('')
  const [guests, setGuests]                   = useState(2)
  const [includeFlight, setIncludeFlight]     = useState(true)

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
    <div className="min-h-screen bg-[#faf8f1] flex flex-col max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4 bg-[#faf8f1]
                      sticky top-0 z-40 border-b border-[#e0d9cc]">
        <button onClick={() => step > 1 ? setStep(s => s - 1) : router.back()}
          className="w-9 h-9 rounded-full bg-white border border-gray-200
                     flex items-center justify-center">
          <ArrowLeft size={16} color="#1a1a1a" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-[#1a1a1a]">Build your package</h1>
          <p className="text-xs text-gray-400">Step {step} of {STEPS.length}</p>
        </div>
        <span className="text-xs font-semibold text-[#2c4a1e]">{STEPS[step - 1]}</span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 px-4 py-3">
        {STEPS.map((_, i) => (
          <div key={i}
            className={`flex-1 h-1 rounded-full transition-all
              ${i < step ? 'bg-[#2c4a1e]' : 'bg-gray-200'}`} />
        ))}
      </div>

      <div className="flex-1 px-4 py-4 overflow-y-auto">

        {/* Step 1: Destinations */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">Where do you want to go?</h2>
            <p className="text-sm text-gray-400 mb-4">Select one or more destinations</p>
            <div className="grid grid-cols-2 gap-3">
              {DESTINATIONS.map((dest) => (
                <button key={dest}
                  onClick={() => toggleItem(dest, selectedDestinations, setDests)}
                  className={`p-4 rounded-2xl border-2 text-sm font-semibold
                              text-left transition-all
                    ${selectedDestinations.includes(dest)
                      ? 'border-[#2c4a1e] bg-[#eaf5e4] text-[#2c4a1e]'
                      : 'border-gray-200 bg-white text-[#1a1a1a]'}`}>
                  {selectedDestinations.includes(dest) && (
                    <Check size={14} className="mb-1" color="#2c4a1e" />
                  )}
                  {dest}
                </button>
              ))}
            </div>

            {/* Flight toggle */}
            <div className="mt-5 bg-white rounded-2xl border border-gray-200 p-4
                            flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1a1a1a]">Include flights</p>
                <p className="text-xs text-gray-400">From Nairobi to destination</p>
              </div>
              <button
                onClick={() => setIncludeFlight(f => !f)}
                className={`w-12 h-6 rounded-full transition-colors relative
                  ${includeFlight ? 'bg-[#2c4a1e]' : 'bg-gray-200'}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white
                                  transition-transform shadow
                  ${includeFlight ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Activities */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-1">What do you want to do?</h2>
            <p className="text-sm text-gray-400 mb-4">Pick your activities</p>
            <div className="grid grid-cols-2 gap-3">
              {ACTIVITIES.map((act) => (
                <button key={act}
                  onClick={() => toggleItem(act, selectedActivities, setActivities)}
                  className={`p-4 rounded-2xl border-2 text-sm font-semibold
                              text-left transition-all
                    ${selectedActivities.includes(act)
                      ? 'border-[#2c4a1e] bg-[#eaf5e4] text-[#2c4a1e]'
                      : 'border-gray-200 bg-white text-[#1a1a1a]'}`}>
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
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">How long & where to stay?</h2>

            <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Duration</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-all
                    ${duration === d
                      ? 'border-[#2c4a1e] bg-[#eaf5e4] text-[#2c4a1e]'
                      : 'border-gray-200 bg-white text-[#1a1a1a]'}`}>
                  {d}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Accommodation style</p>
            <div className="flex flex-col gap-2 mb-5">
              {ACCOMMODATIONS.map((a) => (
                <button key={a} onClick={() => setAccom(a)}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold
                              text-left transition-all
                    ${selectedAccommodation === a
                      ? 'border-[#2c4a1e] bg-[#eaf5e4] text-[#2c4a1e]'
                      : 'border-gray-200 bg-white text-[#1a1a1a]'}`}>
                  {a}
                </button>
              ))}
            </div>

            <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Guests</p>
            <div className="flex items-center gap-4 bg-white border border-gray-200
                            rounded-xl px-4 py-3 w-fit">
              <button onClick={() => setGuests(g => Math.max(1, g - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 text-lg
                           flex items-center justify-center">−</button>
              <span className="text-base font-bold w-6 text-center">{guests}</span>
              <button onClick={() => setGuests(g => g + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 text-lg
                           flex items-center justify-center">+</button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-4">Review your package</h2>
            <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-4">
              {[
                { label: 'Destinations', value: selectedDestinations.join(', ') || '—' },
                { label: 'Duration',     value: duration || '—' },
                { label: 'Activities',   value: selectedActivities.join(', ') || '—' },
                { label: 'Accommodation',value: selectedAccommodation || '—' },
                { label: 'Guests',       value: `${guests} people` },
                { label: 'Flights',      value: includeFlight ? 'Included' : 'Not included' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-2.5 border-b
                                            border-gray-100 last:border-none">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="text-sm font-semibold text-[#1a1a1a] max-w-[60%]
                                   text-right">{value}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-1">
                <span className="text-base font-bold text-[#1a1a1a]">Estimated total</span>
                <span className="text-base font-bold text-[#2c4a1e]">
                  Ksh {totalEstimate.toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Final price confirmed after vendor matching
            </p>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="px-4 py-4 bg-[#faf8f1] border-t border-[#e0d9cc]">
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
  )
}
