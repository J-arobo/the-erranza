'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { PLATFORM_CONFIG, logAction } from '@/data/admin'

const POLICIES: ('flexible' | 'moderate' | 'strict')[] = ['flexible', 'moderate', 'strict']

export default function SuperAdminConfigPage() {
  const { user } = useAuth()
  const [commissionStandard, setCommissionStandard] = useState(PLATFORM_CONFIG.commissionStandard.toString())
  const [commissionPlus, setCommissionPlus] = useState(PLATFORM_CONFIG.commissionPlus.toString())
  const [plusPrice, setPlusPrice] = useState(PLATFORM_CONFIG.plusPriceMonthly.toString())
  const [categories, setCategories] = useState<string[]>(PLATFORM_CONFIG.categories)
  const [categoryInput, setCategoryInput] = useState('')
  const [defaultPolicy, setDefaultPolicy] = useState(PLATFORM_CONFIG.defaultCancellationPolicy)
  const [disputeCeiling, setDisputeCeiling] = useState(PLATFORM_CONFIG.disputeCeiling.toString())
  const [maintenanceMode, setMaintenanceMode] = useState(PLATFORM_CONFIG.maintenanceMode)
  const [maintenanceMessage, setMaintenanceMessage] = useState(PLATFORM_CONFIG.maintenanceMessage)
  const [saved, setSaved] = useState(false)

  function addCategory() {
    const val = categoryInput.trim()
    if (val && !categories.includes(val)) setCategories(c => [...c, val])
    setCategoryInput('')
  }
  function removeCategory(cat: string) {
    setCategories(c => c.filter(x => x !== cat))
  }

  function save() {
    PLATFORM_CONFIG.commissionStandard = Number(commissionStandard) || 0
    PLATFORM_CONFIG.commissionPlus = Number(commissionPlus) || 0
    PLATFORM_CONFIG.plusPriceMonthly = Number(plusPrice) || 0
    PLATFORM_CONFIG.categories = categories
    PLATFORM_CONFIG.defaultCancellationPolicy = defaultPolicy
    PLATFORM_CONFIG.disputeCeiling = Number(disputeCeiling) || 0
    PLATFORM_CONFIG.maintenanceMode = maintenanceMode
    PLATFORM_CONFIG.maintenanceMessage = maintenanceMessage.trim()
    logAction(user?.email ?? 'unknown-super-admin', 'Updated platform configuration', 'Platform config')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Categories</label>
          <div className="flex gap-2 mb-2">
            <input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory() } }}
              placeholder="e.g. Road Trips"
              className="flex-1 border border-gray-200 shadow-sm rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#161616] transition-colors" />
            <button onClick={addCategory}
              className="px-4 rounded-xl bg-[#161616] text-white hover:bg-black transition-colors">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c} className="flex items-center gap-1.5 bg-gray-100 text-[#1a1a1a]
                                       text-xs font-semibold px-3 py-1.5 rounded-full">
                {c}
                <button onClick={() => removeCategory(c)}><X size={12} /></button>
              </span>
            ))}
          </div>
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
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0
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

        <button onClick={save}
          className="bg-[#161616] text-white py-3 rounded-xl font-semibold text-sm
                     hover:bg-black transition-colors">
          Save configuration
        </button>
      </div>
    </div>
  )
}
