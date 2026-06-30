'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, SlidersHorizontal, X, Navigation, ChevronLeft, ChevronRight } from 'lucide-react'
import CategoryBar from './CategoryBar'

type Props = {
  collapsed: boolean
  activeCat: string
  activeTab: string
  onTabSelect: (name: string) => void
  scrollY: number
}

const SUGGESTIONS = ['Nairobi', 'Diani Beach', 'Mombasa', 'Maasai Mara', 'Zanzibar']

// ── Calendar helpers ──────────────────────────────────────────────────────  #f5f0e8
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDay(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

interface CalendarMonthProps {
  year: number
  month: number
  startDate: Date | null
  endDate: Date | null
  onSelect: (d: Date) => void
}

function CalendarMonth({ year, month, startDate, endDate, onSelect }: CalendarMonthProps) {
  const days = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]

  function isSelected(d: number) {
    if (!d) return false
    const date = new Date(year, month, d)
    if (startDate && date.toDateString() === startDate.toDateString()) return true
    if (endDate && date.toDateString() === endDate.toDateString()) return true
    return false
  }

  function isInRange(d: number) {
    if (!d || !startDate || !endDate) return false
    const date = new Date(year, month, d)
    return date > startDate && date < endDate
  }

  function isPast(d: number) {
    if (!d) return false
    return new Date(year, month, d) < new Date(new Date().setHours(0, 0, 0, 0))
  }

  return (
    <div className="flex-1 min-w-0">
      <p className="text-center text-sm font-semibold text-[#304333] mb-3">
        {MONTHS[month]} {year}
      </p>
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div key={i} className="text-center text-xs text-gray-400 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => (
          <button
            key={i}
            disabled={!d || isPast(d)}
            onClick={() => d && onSelect(new Date(year, month, d))}
            className={`h-9 w-full flex items-center justify-center text-sm rounded-full
                        transition-colors
                        ${!d ? 'invisible' : ''}
                        ${isPast(d!) ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                        ${isSelected(d!) ? 'bg-[#1a1a1a] text-white hover:bg-[#1a1a1a]' : ''}
                        ${isInRange(d!) ? 'bg-gray-100 rounded-none' : ''}`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Guest Counter ─────────────────────────────────────────────────────────
function GuestCounter({ compact = false }: { compact?: boolean }) {
  const [adults, setAdults] = useState(0)
  const [children, setChildren] = useState(0)
  const [infants, setInfants] = useState(0)
  const [pets, setPets] = useState(0)

  const rows = [
    { label: 'Adults', sub: 'Ages 13 or above', count: adults, set: setAdults },
    { label: 'Children', sub: 'Ages 2–12', count: children, set: setChildren },
    { label: 'Infants', sub: 'Under 2', count: infants, set: setInfants },
    { label: 'Pets', sub: '', count: pets, set: setPets },
  ]

  return (
    <div className={`flex flex-col ${compact ? 'gap-3' : 'gap-4'}`}>
      {rows.map(({ label, sub, count, set }) => (
        <div key={label} className="flex items-center justify-between">
          <div>
            <p className={`font-semibold text-[#304333] ${compact ? 'text-sm' : 'text-sm'}`}>
              {label}
            </p>
            {sub && <p className="text-xs text-gray-400">{sub}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => set(Math.max(0, count - 1))}
              disabled={count === 0}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center
                         justify-center text-lg text-gray-500 hover:border-[#1a1a1a]
                         transition-colors disabled:opacity-30"
            >−</button>
            <span className="text-sm font-semibold text-[#304333] w-4 text-center">
              {count}
            </span>
            <button
              onClick={() => set(count + 1)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center
                         justify-center text-lg text-gray-500 hover:border-[#1a1a1a]
                         transition-colors"
            >+</button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main SearchBar ────────────────────────────────────────────────────────
export default function SearchBar({
  collapsed,
  activeCat,
  activeTab,
  onTabSelect,
  scrollY,
}: Props) {
  const [where, setWhere] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [activeCard, setActiveCard] = useState<'where' | 'when' | 'who' | null>(null)
  const [modalTab, setModalTab] = useState(activeTab)

  // Calendar state
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [dateMode, setDateMode] = useState<'Dates' | 'Flexible'>('Dates')
  const [flexOpt, setFlexOpt] = useState<string | null>(null)

  const desktopRef = useRef<HTMLDivElement>(null)

  // Close desktop dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (desktopRef.current && !desktopRef.current.contains(e.target as Node)) {
        setActiveCard(null)
      }
    }
    if (activeCard) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [activeCard])

  function handleCalendarSelect(date: Date) {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date)
      setEndDate(null)
    } else {
      if (date < startDate) {
        setEndDate(startDate)
        setStartDate(date)
      } else {
        setEndDate(date)
      }
      setActiveCard('who')
    }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
    else setCalMonth(m => m + 1)
  }

  const nextMonth2 = calMonth === 11 ? 0 : calMonth + 1
  const nextYear2 = calMonth === 11 ? calYear + 1 : calYear

  function formatDate(d: Date | null) {
    if (!d) return null
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const whenLabel = startDate
    ? `${formatDate(startDate)}${endDate ? ` – ${formatDate(endDate)}` : ''}`
    : 'Add dates'

  // Mobile modal handlers
  const handleMobileOpen = () => {
    setModalTab(activeTab)
    setOpen(true)
    setActiveCard('where')
  }
  const handleClose = () => {
    setOpen(false)
    setFocused(false)
    setActiveCard(null)
  }
  const handleSearch = () => {
    onTabSelect(modalTab)
    handleClose()
  }
  const handleSelect = (place: string) => {
    setWhere(place)
    setFocused(false)
    setActiveCard('when')
  }

  // ── Shared calendar panel ─────────────────────────────────────────────
  const CalendarPanel = ({ compact = false }: { compact?: boolean }) => (
    <div className={compact ? '' : ''}>
      {/* Dates / Flexible toggle */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-gray-100 rounded-full p-1 gap-1">
          {(['Dates', 'Flexible'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setDateMode(m)}
              className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all
                ${dateMode === m ? 'bg-white shadow text-[#304333]' : 'text-gray-500'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {dateMode === 'Dates' ? (
        <>
          {/* Two-month calendar */}
          <div className={`flex ${compact ? 'flex-col gap-4' : 'gap-8'} mb-4`}>
            <div className="flex items-center justify-between mb-2 w-full">
              {!compact && (
                <button onClick={prevMonth}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <ChevronLeft size={16} />
                </button>
              )}
              <CalendarMonth
                year={calYear} month={calMonth}
                startDate={startDate} endDate={endDate}
                onSelect={handleCalendarSelect}
              />
              {!compact && (
                <div className="w-8" /> // spacer
              )}
            </div>
            {!compact && (
              <div className="flex items-center justify-between mb-2 w-full">
                <div className="w-8" />
                <CalendarMonth
                  year={nextYear2} month={nextMonth2}
                  startDate={startDate} endDate={endDate}
                  onSelect={handleCalendarSelect}
                />
                <button onClick={nextMonth}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Flex options */}
          <div className="flex gap-2 flex-wrap justify-center">
            {['Exact dates', '± 1 day', '± 2 days', '± 3 days', '± 7 days', '± 14 days'].map((opt) => (
              <button
                key={opt}
                onClick={() => setFlexOpt(opt)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all
                  ${flexOpt === opt
                    ? 'border-[#1a1a1a] bg-white text-[#304333]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8">
          Flexible dates — coming soon
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* ════════════════════════════════════════
          MOBILE — full-screen modal (sm and below)
          ════════════════════════════════════════ */}
      {/* ════════════════════════════════════════
    MOBILE — full-screen modal
    ════════════════════════════════════════ */}
      <div className="sm:hidden">
        <div className="px-4 py-2 bg-[#f5f6f4] flex-shrink-0">

          {/* ✅ div → button, closing tag matches */}
          <button
            type="button"
            onClick={handleMobileOpen}
            className="flex items-center bg-white rounded-full border border-[#d4cdc0]
                 px-4 gap-3 w-full text-left"
            style={{
              height: collapsed ? '44px' : '52px',
              boxShadow: '0 1px 5px rgba(0,0,0,0.07)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Search size={15} color="#1a1a1a" className="flex-shrink-0" />

            {!collapsed ? (
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[10px] font-semibold text-[#2c4a1e] uppercase
                           tracking-wide leading-none mb-0.5">Where</span>
                <span className="text-sm text-gray-400">Search destinations</span>
              </div>
            ) : (
              <div className="flex flex-1 items-center overflow-hidden">
                <span className="text-xs font-bold text-[#304333] pr-2 border-r
                           border-[#e0d9cc] mr-2 whitespace-nowrap">{activeCat}</span>
                <span className="text-xs text-gray-400 pr-2 border-r border-[#e0d9cc]
                           mr-2 whitespace-nowrap">Anywhere</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">Any week</span>
              </div>
            )}

            <span
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full border border-[#d4cdc0] flex items-center
                   justify-center flex-shrink-0"
            >
              <SlidersHorizontal size={13} color="#555" />
            </span>
          </button>
          {/* ✅ button closes here */}

        </div>

        {/* Mobile full-screen modal */}
        {open && (
          <div className="fixed inset-0 z-[100] bg-[#f5f6f4] flex flex-col">
            <div className="flex-shrink-0 pt-4 pb-0">

              {/* Category bar */}
              <div className="flex-1">
                <CategoryBar
                  active={modalTab}
                  onSelect={(name) => setModalTab(name)}
                  scrollY={0}
                  collapsed={false}
                />
              </div>

              {/* X Close button */}
              <div className="flex justify-end px-4 pb-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full border border-gray-300 bg-white
                       flex items-center justify-center flex-shrink-0 ml-3 mb-1"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <X size={16} color="#1a1a1a" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-3">

              {/* ✅ WHERE — button with matching closing tag */}
              <div
                onClick={() => setActiveCard('where')}
                className={`bg-[#FEFDFC] rounded-2xl shadow-sm transition-all duration-200
                      text-left w-full
                      ${activeCard === 'where' ? 'p-5' : 'px-5 py-4'}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {activeCard === 'where' ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-[#304333] mb-3">Where?</h2>
                    <div className={`flex items-center border rounded-xl px-3 gap-2 h-12
                              transition-colors
                ${focused ? 'border-[#1a1a1a]' : 'border-gray-300'}`}>
                      <Search size={16} color="#888" />
                      <input
                        autoFocus
                        type="text"
                        value={where}
                        onChange={(e) => setWhere(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        placeholder="Search by city or landmark"
                        className="flex-1 text-sm bg-transparent border-none outline-none
                             placeholder:text-gray-400 text-[#304333]"
                      />
                      {where.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setWhere('')}
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                        >
                          <X size={14} color="#888" />
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-3 mt-3 w-full py-2 text-left"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center
                                justify-center">
                        <Navigation size={18} color="#3b82f6" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#304333]">Nearby</p>
                        <p className="text-xs text-gray-500">Find what's around you</p>
                      </div>
                    </button>

                    {where.length === 0 && (
                      <div className="mt-1 border-t border-gray-100 pt-2">
                        {SUGGESTIONS.map((place) => (
                          <button
                            key={place}
                            type="button"
                            onMouseDown={() => handleSelect(place)}
                            onClick={() => handleSelect(place)}
                            className="w-full flex items-center gap-3 py-2.5
                                 rounded-xl px-1 text-left"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center
                                      justify-center flex-shrink-0">
                              <Search size={13} color="#555" />
                            </div>
                            <span className="text-sm text-[#304333]">{place}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-400">Where</span>
                    <span className="text-sm font-semibold text-[#304333]">
                      {where || 'Anywhere'}
                    </span>
                  </div>
                )}
              </div>
              {/* ✅ WHERE button closes here */}

              {/* ✅ WHEN — button with matching closing tag */}
              <div
                onClick={() => setActiveCard('when')}
                className={`bg-white rounded-2xl shadow-sm transition-all duration-200
                      text-left w-full
                      ${activeCard === 'when' ? 'p-5' : 'px-5 py-4'}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {activeCard === 'when' ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-[#304333] mb-4">When?</h2>
                    <CalendarPanel compact={true} />
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-400">When</span>
                    <span className="text-sm font-semibold text-[#304333]">{whenLabel}</span>
                  </div>
                )}
              </div>
              {/* ✅ WHEN button closes here */}

              {/* ✅ WHO — button with matching closing tag */}
              <div
                onClick={() => setActiveCard('who')}
                className={`bg-white rounded-2xl shadow-sm transition-all duration-200
                      text-left w-full
                      ${activeCard === 'who' ? 'p-5' : 'px-5 py-4'}`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {activeCard === 'who' ? (
                  <div onClick={(e) => e.stopPropagation()}>
                    <h2 className="text-xl font-bold text-[#304333] mb-3">Who?</h2>
                    <GuestCounter />
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-400">Who</span>
                    <span className="text-sm font-semibold text-[#304333]">Add guests</span>
                  </div>
                )}
              </div>
              {/* ✅ WHO button closes here */}

              <div className="h-4" />
            </div>

            {/* Bottom bar */}
            <div className="px-4 py-4 bg-[#f2f2f2] flex items-center justify-between
                      border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setWhere('')
                  setStartDate(null)
                  setEndDate(null)
                  setActiveCard('where')
                }}
                className="text-sm font-semibold text-[#304333]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="flex items-center gap-2 bg-[#F36336] text-white px-6 py-3
                     rounded-xl font-semibold text-sm"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Search size={16} color="white" />
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════
          DESKTOP — inline expanded bar (sm and above)
          ════════════════════════════════════════ */}
      <div className="hidden sm:block bg-[#f5f6f4] px-6 py-3 flex-shrink-0">
        <div ref={desktopRef} className="relative max-w-3xl mx-auto">

          {/* The three-section pill bar */}
          <div className={`flex items-stretch rounded-full border
                           shadow-md transition-all
                           ${activeCard ? 'bg-gray-100 border-gray-300' : 'bg-white border-gray-200'}`}>

            {/* WHERE section */}
            <button
              onClick={() => setActiveCard(activeCard === 'where' ? null : 'where')}
              className={`flex flex-col flex-1 text-left px-6 py-3 rounded-full
                          transition-colors hover:bg-gray-50
                          ${activeCard === 'where' ? 'bg-white shadow-md' : ''}`}
            >
              <span className="text-xs font-bold text-[#1a1a1a]">Where</span>
              {activeCard === 'where' ? (
                <input
                  autoFocus
                  type="text"
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="Search destinations"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-[#1a1a1a] bg-transparent border-none outline-none
                             placeholder:text-gray-400 mt-0.5 w-full"
                />
              ) : (
                <span className="text-sm text-gray-400 mt-0.5 truncate">
                  {where || 'Search destinations'}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="w-px bg-gray-200 my-3" />

            {/* WHEN section */}
            <button
              onClick={() => setActiveCard(activeCard === 'when' ? null : 'when')}
              className={`flex flex-col flex-1 text-left px-6 py-3 rounded-full
                          transition-colors hover:bg-gray-50
                          ${activeCard === 'when' ? 'bg-white shadow-md' : ''}`}
            >
              <span className="text-xs font-bold text-[#1a1a1a]">When</span>
              <span className="text-sm text-gray-400 mt-0.5">{whenLabel}</span>
            </button>

            {/* Divider */}
            <div className="w-px bg-gray-200 my-3" />

            {/* WHO section */}
            <button
              onClick={() => setActiveCard(activeCard === 'who' ? null : 'who')}
              className={`flex items-center gap-3 pr-3 pl-6 py-3 rounded-full
                          transition-colors hover:bg-gray-50
                          ${activeCard === 'who' ? 'bg-white shadow-md' : ''}`}
            >
              <div className="flex flex-col text-left flex-1">
                <span className="text-xs font-bold text-[#1a1a1a]">Who</span>
                <span className="text-sm text-gray-400 mt-0.5">Add guests</span>
              </div>
              <div className={`flex items-center justify-center flex-shrink-0 transition-all duration-200
                ${activeCard
                  ? 'bg-[#2c4a1e] rounded-full px-5 py-3 gap-2'
                  : 'w-12 h-12 bg-[#2c4a1e] rounded-full'}`}
              >
                <Search size={18} color="white" />
                {activeCard && <span className="text-white font-semibold text-sm whitespace-nowrap">Search</span>}
              </div>
            </button>
          </div>

          {/* WHERE dropdown */}
          {activeCard === 'where' && (
            <div className="absolute top-full left-0 mt-3 w-96 bg-white rounded-2xl
                            shadow-xl border border-gray-100 p-4 z-50">
              <button className="flex items-center gap-3 w-full py-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Navigation size={18} color="#3b82f6" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#1a1a1a]">Nearby</p>
                  <p className="text-xs text-gray-400">Find what's around you</p>
                </div>
              </button>
              <div className="border-t border-gray-100 pt-2">
                {SUGGESTIONS.map((place) => (
                  <button
                    key={place}
                    onClick={() => { setWhere(place); setActiveCard('when') }}
                    className="w-full flex items-center gap-3 py-2.5 hover:bg-gray-50
                               rounded-xl px-2 text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center
                                    justify-center flex-shrink-0">
                      <Search size={13} color="#555" />
                    </div>
                    <span className="text-sm text-[#1a1a1a]">{place}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* WHEN dropdown — two-month calendar */}
          {activeCard === 'when' && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white
                            rounded-2xl shadow-xl border border-gray-100 p-6 z-50
                            w-[680px]">
              <CalendarPanel compact={false} />
            </div>
          )}

          {/* WHO dropdown */}
          {activeCard === 'who' && (
            <div className="absolute top-full right-0 mt-3 w-96 bg-white rounded-2xl
                            shadow-xl border border-gray-100 p-6 z-50">
              <GuestCounter compact={false} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}