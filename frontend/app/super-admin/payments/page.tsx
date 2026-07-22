'use client'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PAYMENT_CONFIG, logAction } from '@/data/admin'

function MaskedField({
  label, value, onChange,
}: { label: string; value: string; onChange: (v: string) => void }) {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">{label}</label>
      <div className="relative">
        <input value={value} onChange={(e) => onChange(e.target.value)}
          type={visible ? 'text' : 'password'}
          className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 pr-10 text-sm font-mono
                     outline-none focus:border-[#161616] transition-colors" />
        <button onClick={() => setVisible(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a1a1a]">
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  )
}

export default function SuperAdminPaymentsPage() {
  const { user } = useAuth()
  const [paystackPublicKey, setPaystackPublicKey] = useState(PAYMENT_CONFIG.paystackPublicKey)
  const [paystackSecretKey, setPaystackSecretKey] = useState(PAYMENT_CONFIG.paystackSecretKey)
  const [flutterwaveKey, setFlutterwaveKey] = useState(PAYMENT_CONFIG.flutterwaveKey)
  const [mpesaShortcode, setMpesaShortcode] = useState(PAYMENT_CONFIG.mpesaShortcode)
  const [mpesaPasskey, setMpesaPasskey] = useState(PAYMENT_CONFIG.mpesaPasskey)
  const [saved, setSaved] = useState(false)

  function save() {
    PAYMENT_CONFIG.paystackPublicKey = paystackPublicKey
    PAYMENT_CONFIG.paystackSecretKey = paystackSecretKey
    PAYMENT_CONFIG.flutterwaveKey = flutterwaveKey
    PAYMENT_CONFIG.mpesaShortcode = mpesaShortcode
    PAYMENT_CONFIG.mpesaPasskey = mpesaPasskey
    logAction(user?.email ?? 'unknown-super-admin', 'Updated payment provider credentials', 'Payment config')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Payment providers</h1>
        {saved && (
          <span className="text-xs font-semibold text-[#161616] bg-gray-100 px-3 py-1 rounded-full">
            Saved
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Credentials used to process payouts and collect payments platform-wide.
      </p>

      <div className="flex flex-col gap-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Paystack</p>
        <MaskedField label="Public key" value={paystackPublicKey} onChange={setPaystackPublicKey} />
        <MaskedField label="Secret key" value={paystackSecretKey} onChange={setPaystackSecretKey} />

        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-2 border-t border-gray-100 mt-2">
          Flutterwave
        </p>
        <MaskedField label="API key" value={flutterwaveKey} onChange={setFlutterwaveKey} />

        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide pt-2 border-t border-gray-100 mt-2">
          M-Pesa
        </p>
        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Shortcode</label>
          <input value={mpesaShortcode} onChange={(e) => setMpesaShortcode(e.target.value)}
            className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm font-mono
                       outline-none focus:border-[#161616] transition-colors" />
        </div>
        <MaskedField label="Passkey" value={mpesaPasskey} onChange={setMpesaPasskey} />

        <button onClick={save}
          className="bg-[#161616] text-white py-3 rounded-xl font-semibold text-sm
                     hover:bg-black transition-colors">
          Save credentials
        </button>
      </div>
    </div>
  )
}
