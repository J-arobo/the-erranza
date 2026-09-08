'use client'
import { Check } from 'lucide-react'

export type TabSection = { id: string; label: string; complete: boolean; optional?: boolean }

export default function ListingTabs({
  sections, activeId, onSelect, showProgress = true,
}: {
  sections: TabSection[]
  activeId: string
  onSelect: (id: string) => void
  showProgress?: boolean
}) {
  const required = sections.filter(s => !s.optional)
  const completedCount = required.filter(s => s.complete).length
  const incomplete = required.filter(s => !s.complete).map(s => s.label)

  return (
    <div className="mb-6">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-gray-200">
        {sections.map((s) => {
          const active = s.id === activeId
          return (
            <button key={s.id} type="button" onClick={() => onSelect(s.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-semibold
                          border-b-2 -mb-px transition-colors whitespace-nowrap focus:outline-none
                          ${active ? 'border-[#2c4a1e] text-[#1a1a1a]' : 'border-transparent text-gray-500 hover:text-[#1a1a1a]'}`}>
              {s.complete ? (
                <span className="w-4 h-4 rounded-full bg-[#2c4a1e] flex items-center justify-center flex-shrink-0">
                  <Check size={10} color="white" />
                </span>
              ) : (
                <span className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
              )}
              {s.label}
            </button>
          )
        })}
      </div>
      {showProgress && (
        <p className="text-xs text-gray-500 pt-2">
          {completedCount} of {required.length} sections complete
          {incomplete.length > 0 && <> — {incomplete.join(', ')} still need{incomplete.length === 1 ? 's' : ''} attention.</>}
        </p>
      )}
    </div>
  )
}
