'use client'
import { useState } from 'react'
import { X, Plus, MapPin } from 'lucide-react'

export function buildLocationString(places: string[]): string {
  if (places.length === 0) return ''
  return `${places.join(' + ')}, Kenya`
}

// Reverses buildLocationString so an existing listing's saved "A + B + C, Kenya"
// string can be re-split back into chips when the edit page loads.
export function parseLocationString(value: string): string[] {
  return value.replace(/,\s*Kenya\s*$/i, '').split('+').map(s => s.trim()).filter(Boolean)
}

export default function LocationChainInput({
  places, onChange,
}: {
  places: string[]
  onChange: (places: string[]) => void
}) {
  const [input, setInput] = useState('')

  function addPlace() {
    const val = input.trim()
    if (val && !places.includes(val)) onChange([...places, val])
    setInput('')
  }
  function removePlace(place: string) {
    onChange(places.filter(p => p !== place))
  }

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPlace() } }}
          placeholder="e.g. Nairobi — press Enter to add, in visit order"
          className="flex-1 min-w-0 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                     outline-none focus:border-[#2c4a1e] transition-colors" />
        <button type="button" onClick={addPlace}
          className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors flex-shrink-0">
          <Plus size={16} />
        </button>
      </div>
      {places.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {places.map((place, i) => (
            <div key={place} className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 bg-[#eaf5e4] text-[#2c4a1e]
                                text-xs font-semibold px-3 py-1.5 rounded-full">
                <MapPin size={11} />
                {place}
                <button type="button" onClick={() => removePlace(place)}>
                  <X size={12} />
                </button>
              </span>
              {i < places.length - 1 && <span className="text-gray-300 text-xs">→</span>}
            </div>
          ))}
        </div>
      )}
      {places.length > 0 && (
        <p className="text-xs text-gray-400 mt-2">
          Shown to guests as: <span className="font-semibold text-gray-500">{buildLocationString(places)}</span>
        </p>
      )}
    </div>
  )
}
