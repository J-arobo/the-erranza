'use client'

export default function CompanyDetailsFields({
  bookingFor, onBookingForChange, companyName, onCompanyNameChange,
  companyTaxPin, onCompanyTaxPinChange, billingEmail, onBillingEmailChange,
}: {
  bookingFor: 'individual' | 'company'
  onBookingForChange: (v: 'individual' | 'company') => void
  companyName: string
  onCompanyNameChange: (v: string) => void
  companyTaxPin: string
  onCompanyTaxPinChange: (v: string) => void
  billingEmail: string
  onBillingEmailChange: (v: string) => void
}) {
  return (
    <div className="mb-4">
      <p className="text-xs text-gray-500 mb-1.5">Booking for</p>
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => onBookingForChange('individual')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
            ${bookingFor === 'individual' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'bg-white text-[#1a1a1a] border-gray-300'}`}>
          Myself
        </button>
        <button type="button" onClick={() => onBookingForChange('company')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
            ${bookingFor === 'company' ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]' : 'bg-white text-[#1a1a1a] border-gray-300'}`}>
          Company / organization
        </button>
      </div>
      {bookingFor === 'company' && (
        <div className="flex flex-col gap-2 mt-2">
          <input value={companyName} onChange={(e) => onCompanyNameChange(e.target.value)} placeholder="Company name"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
          <input value={companyTaxPin} onChange={(e) => onCompanyTaxPinChange(e.target.value.toUpperCase())} placeholder="KRA PIN (optional, for invoicing)"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
          <input value={billingEmail} onChange={(e) => onBillingEmailChange(e.target.value)} placeholder="Billing email (optional)"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>
      )}
    </div>
  )
}
