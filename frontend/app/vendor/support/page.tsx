'use client'
import { useState } from 'react'
import { AlertTriangle, FileText } from 'lucide-react'
import { VENDOR_BOOKINGS, VENDOR_REPORTS, REPORT_TYPES, CANCELLATION_POLICIES, type VendorReport } from '@/data/vendor'

const INSURANCE_REQUIREMENTS = [
  'Public liability insurance covering all guests on your tours.',
  'Valid for the specific activities and regions you operate in.',
  'Minimum coverage of Ksh 5,000,000 per incident.',
  'Certificate must be kept current in your Verification documents.',
]

const SAFETY_STANDARDS = [
  'All vehicles must pass an annual roadworthiness inspection.',
  'Guides must hold a valid first-aid certification.',
  'Safety briefings are required before every activity involving physical risk.',
  'Report any safety incident within 24 hours using the form below.',
]

const REPORT_STATUS_STYLES: Record<string, string> = {
  submitted: 'bg-amber-50 text-amber-700',
  under_review: 'bg-blue-50 text-blue-600',
  resolved: 'bg-[#eaf5e4] text-[#2c4a1e]',
}
const REPORT_STATUS_LABELS: Record<string, string> = {
  submitted: 'Submitted',
  under_review: 'Under review',
  resolved: 'Resolved',
}

export default function VendorSupportPage() {
  const [, forceUpdate] = useState(0)
  const [reporting, setReporting] = useState(false)
  const [reportBookingId, setReportBookingId] = useState('')
  const [reportType, setReportType] = useState<VendorReport['type']>('no_show')
  const [reportDescription, setReportDescription] = useState('')

  function submitReport() {
    if (!reportDescription.trim()) return
    VENDOR_REPORTS.unshift({
      id: `rep_${Date.now()}`,
      bookingId: reportBookingId || undefined,
      type: reportType,
      description: reportDescription.trim(),
      status: 'submitted',
      date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    })
    setReporting(false)
    setReportBookingId('')
    setReportType('no_show')
    setReportDescription('')
    forceUpdate(n => n + 1)
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-6">Support &amp; compliance</h1>

      {/* Report a problem */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} color="#dc2626" />
            <h2 className="text-base font-bold text-[#1a1a1a]">Report a problem</h2>
          </div>
          <button onClick={() => setReporting(v => !v)}
            className="text-xs font-semibold text-[#2c4a1e]">
            {reporting ? 'Cancel' : 'New report'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          Traveller no-shows, disputes, or safety incidents — our team reviews every report.
        </p>

        {reporting && (
          <div className="border border-gray-200 rounded-xl p-4 mb-3 flex flex-col gap-3">
            <div>
              <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">Related booking (optional)</label>
              <select value={reportBookingId} onChange={(e) => setReportBookingId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                           focus:border-[#2c4a1e] transition-colors bg-white">
                <option value="">None</option>
                {VENDOR_BOOKINGS.map((b) => (
                  <option key={b.id} value={b.id}>{b.guestName} — {b.listingTitle}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">Issue type</label>
              <div className="flex gap-2 flex-wrap">
                {REPORT_TYPES.map((t) => (
                  <button key={t.id} onClick={() => setReportType(t.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                      ${reportType === t.id
                        ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                        : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#1a1a1a] mb-1 block">What happened</label>
              <textarea value={reportDescription} onChange={(e) => setReportDescription(e.target.value)}
                rows={3} placeholder="Describe the issue..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none
                           focus:border-[#2c4a1e] transition-colors resize-none" />
            </div>
            <button onClick={submitReport} disabled={!reportDescription.trim()}
              className="bg-[#2c4a1e] text-white py-2.5 rounded-xl text-sm font-semibold
                         hover:bg-[#3d6b28] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Submit report
            </button>
          </div>
        )}

        {VENDOR_REPORTS.length > 0 ? (
          <div className="flex flex-col divide-y divide-gray-100">
            {VENDOR_REPORTS.map((r) => (
              <div key={r.id} className="py-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#1a1a1a]">
                    {REPORT_TYPES.find(t => t.id === r.type)?.label ?? r.type}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0
                    ${REPORT_STATUS_STYLES[r.status]}`}>
                    {REPORT_STATUS_LABELS[r.status]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{r.description}</p>
                <p className="text-[10px] text-gray-400 mt-1">{r.date}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-4">No reports filed.</p>
        )}
      </div>

      {/* Policies */}
      <div className="bg-white rounded-2xl border border-[#e0d9cc] p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={16} color="#2c4a1e" />
          <h2 className="text-base font-bold text-[#1a1a1a]">Platform policies</h2>
        </div>

        <p className="text-xs font-semibold text-[#1a1a1a] mb-2">Cancellation policy tiers</p>
        <div className="flex flex-col gap-2 mb-4">
          {CANCELLATION_POLICIES.filter(p => p.id !== 'custom').map((p) => (
            <div key={p.id} className="p-3 rounded-xl bg-gray-50">
              <p className="text-sm font-semibold text-[#1a1a1a]">{p.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{p.description}</p>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold text-[#1a1a1a] mb-2">Insurance requirements</p>
        <ul className="flex flex-col gap-1.5 mb-4">
          {INSURANCE_REQUIREMENTS.map((item) => (
            <li key={item} className="text-xs text-gray-500 flex gap-2">
              <span className="text-[#2c4a1e]">•</span> {item}
            </li>
          ))}
        </ul>

        <p className="text-xs font-semibold text-[#1a1a1a] mb-2">Safety standards</p>
        <ul className="flex flex-col gap-1.5">
          {SAFETY_STANDARDS.map((item) => (
            <li key={item} className="text-xs text-gray-500 flex gap-2">
              <span className="text-[#2c4a1e]">•</span> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
