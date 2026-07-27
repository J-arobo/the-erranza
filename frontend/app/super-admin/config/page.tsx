'use client'
import { useEffect, useState } from 'react'
import { apiFetch, apiErrorMessage } from '@/lib/api'

const POLICIES: ('flexible' | 'moderate' | 'strict')[] = ['flexible', 'moderate', 'strict']

type Config = {
  commission_standard: number
  commission_plus: number
  plus_price_monthly: string
  default_cancellation_policy: 'flexible' | 'moderate' | 'strict'
  dispute_ceiling: number
  maintenance_mode: boolean
  maintenance_message: string | null
}

export default function SuperAdminConfigPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [commissionStandard, setCommissionStandard] = useState('')
  const [commissionPlus, setCommissionPlus] = useState('')
  const [plusPrice, setPlusPrice] = useState('')
  const [defaultPolicy, setDefaultPolicy] = useState<'flexible' | 'moderate' | 'strict'>('moderate')
  const [disputeCeiling, setDisputeCeiling] = useState('')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState('')

  useEffect(() => {
    apiFetch<{ config: Config }>('/super-admin/config')
      .then(({ config }) => {
        setCommissionStandard(String(config.commission_standard))
        setCommissionPlus(String(config.commission_plus))
        setPlusPrice(String(config.plus_price_monthly))
        setDefaultPolicy(config.default_cancellation_policy)
        setDisputeCeiling(String(config.dispute_ceiling))
        setMaintenanceMode(config.maintenance_mode)
        setMaintenanceMessage(config.maintenance_message ?? '')
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    setError('')
    try {
      await apiFetch('/super-admin/config', {
        method: 'PUT',
        body: JSON.stringify({
          commission_standard: Number(commissionStandard) || 0,
          commission_plus: Number(commissionPlus) || 0,
          plus_price_monthly: Number(plusPrice) || 0,
          default_cancellation_policy: defaultPolicy,
          dispute_ceiling: Number(disputeCeiling) || 0,
          maintenance_mode: maintenanceMode,
          maintenance_message: maintenanceMessage.trim() || null,
        }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#161616] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Platform config</h1>
        {saved && (
          <span className="text-xs font-semibold text-[#161616] bg-gray-100 px-3 py-1 rounded-full">
            Saved
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Commission — Standard (%)</label>
            <input value={commissionStandard} onChange={(e) => setCommissionStandard(e.target.value)}
              type="number"
              className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#161616] transition-colors" />
          </div>
          <div>
            <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Commission — Plus (%)</label>
            <input value={commissionPlus} onChange={(e) => setCommissionPlus(e.target.value)}
              type="number"
              className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#161616] transition-colors" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Plus subscription price (Ksh / month)</label>
          <input value={plusPrice} onChange={(e) => setPlusPrice(e.target.value)}
            type="number"
            className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#161616] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Default cancellation policy</label>
          <div className="flex gap-2">
            {POLICIES.map((p) => (
              <button key={p} onClick={() => setDefaultPolicy(p)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border capitalize transition-all
                  ${defaultPolicy === p
                    ? 'bg-[#161616] text-white border-[#161616]'
                    : 'bg-white text-[#1a1a1a] border-gray-200 shadow-sm hover:border-[#161616]'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
            Admin dispute approval ceiling (Ksh)
          </label>
          <input value={disputeCeiling} onChange={(e) => setDisputeCeiling(e.target.value)}
            type="number"
            className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#161616] transition-colors" />
          <p className="text-xs text-gray-400 mt-1.5">
            Disputes above this amount are escalated to Super Admin instead of Admin.
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mt-4 mb-1">
            <label className="text-sm font-semibold text-[#1a1a1a]">Maintenance mode</label>
            <button onClick={() => setMaintenanceMode(m => !m)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 overflow-hidden
                ${maintenanceMode ? 'bg-[#161616]' : 'bg-gray-200'}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all
                ${maintenanceMode ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          {maintenanceMode && (
            <textarea value={maintenanceMessage} onChange={(e) => setMaintenanceMessage(e.target.value)}
              rows={2} placeholder="Message shown to users while in maintenance mode..."
              className="w-full border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm mt-2
                         outline-none focus:border-[#161616] transition-colors resize-none" />
          )}
        </div>

        <button onClick={save} disabled={saving}
          className="bg-[#161616] text-white py-3 rounded-xl font-semibold text-sm
                     hover:bg-black transition-colors disabled:opacity-40">
          {saving ? 'Saving…' : 'Save configuration'}
        </button>
      </div>
    </div>
  )
}
