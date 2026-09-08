'use client'

export default function MoneyInput({
  value, onChange, placeholder, className = '',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}) {
  return (
    <div className={`flex border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#2c4a1e] transition-colors ${className}`}>
      <span className="flex items-center px-4 bg-gray-50 text-sm font-semibold text-gray-500 border-r border-gray-200 flex-shrink-0">
        Ksh
      </span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 px-4 py-2.5 text-sm outline-none" />
    </div>
  )
}
