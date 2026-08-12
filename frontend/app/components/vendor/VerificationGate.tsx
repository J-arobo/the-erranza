'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, XCircle, LogOut, Upload } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { apiFetch, apiErrorMessage } from '@/lib/api'

type Submission = {
  id: number
  doc_type: 'Government ID' | 'Insurance certificate' | 'Business license'
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  created_at: string
}

function latestPerDocType(submissions: Submission[]) {
  const seen = new Set<string>()
  const result: Submission[] = []
  for (const s of [...submissions].sort((a, b) => b.created_at.localeCompare(a.created_at))) {
    if (!seen.has(s.doc_type)) {
      seen.add(s.doc_type)
      result.push(s)
    }
  }
  return result
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-[#eaf5e4] text-[#2c4a1e]',
  rejected: 'bg-red-50 text-red-600',
}

export default function VerificationGate() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reuploadingType, setReuploadingType] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingDocType = useRef<string | null>(null)

  useEffect(() => {
    apiFetch<{ submissions: Submission[] }>('/vendor/verification-submissions')
      .then(({ submissions }) => setSubmissions(submissions))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  function startReupload(docType: string) {
    pendingDocType.current = docType
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    const docType = pendingDocType.current
    e.target.value = ''
    if (!file || !docType) return
    setReuploadingType(docType)
    setError('')
    try {
      const formData = new FormData()
      formData.append('doc_type', docType)
      formData.append('document', file)
      const { submission } = await apiFetch<{ submission: Submission }>('/vendor/verification-submissions', {
        method: 'POST',
        body: formData,
      })
      setSubmissions(s => [submission, ...s])
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setReuploadingType(null)
    }
  }

  const latest = latestPerDocType(submissions)
  const overallStatus = user?.verificationStatus ?? 'pending'

  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-start justify-center px-5 py-10 sm:py-16">
      <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={handleFileSelected} />
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#e0d9cc] shadow-sm p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4
            ${overallStatus === 'rejected' ? 'bg-red-50' : 'bg-[#eaf5e4]'}`}>
            {overallStatus === 'rejected'
              ? <XCircle size={24} color="#dc2626" />
              : <Clock size={24} color="#2c4a1e" />}
          </div>
          <p className="text-lg font-bold text-[#1a1a1a] mb-1">
            {overallStatus === 'rejected' ? 'Action needed on your documents' : 'Your documents are under review'}
          </p>
          <p className="text-sm text-gray-500 max-w-sm">
            {overallStatus === 'rejected'
              ? "One or more of your documents couldn't be verified. Re-upload them below to continue."
              : "We're reviewing what you submitted. You'll get full dashboard access once everything is approved — usually within 1–2 business days."}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-6">
            {latest.map((s) => (
              <div key={s.doc_type} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#1a1a1a]">{s.doc_type}</p>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${STATUS_STYLES[s.status]}`}>
                    {s.status}
                  </span>
                </div>
                {s.status === 'rejected' && (
                  <>
                    {s.rejection_reason && (
                      <p className="text-xs text-red-500 mb-2">{s.rejection_reason}</p>
                    )}
                    <button onClick={() => startReupload(s.doc_type)} disabled={reuploadingType === s.doc_type}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2c4a1e] text-white
                                 text-xs font-semibold hover:bg-[#3d6b28] transition-colors disabled:opacity-50">
                      <Upload size={13} /> {reuploadingType === s.doc_type ? 'Uploading…' : 'Re-upload'}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">Signed in as {user?.email}</p>
          <button onClick={() => { logout(); router.push('/') }}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#1a1a1a] transition-colors">
            <LogOut size={13} /> Log out
          </button>
        </div>
      </div>
    </div>
  )
}
