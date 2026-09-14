'use client'
import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { apiFetch, apiErrorMessage } from '@/lib/api'
import PanoramaViewer from '@/components/PanoramaViewer'

type Props = { params: Promise<{ listingId: string; sceneId: string }> }

type ApiLink = { id: number; target_scene_id: number; yaw: number; pitch: number }
type ApiScene = { id: number; name: string; panorama_url: string; position: number; links: ApiLink[] }

export default function HotspotEditor({ params }: Props) {
  const { listingId, sceneId } = use(params)
  const router = useRouter()

  const [scenes, setScenes] = useState<ApiScene[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [pendingMarker, setPendingMarker] = useState<{ yaw: number; pitch: number } | null>(null)
  const [pendingTarget, setPendingTarget] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  function load() {
    setLoading(true)
    apiFetch<{ scenes: ApiScene[] }>(`/vendor/listings/${listingId}/virtual-tour`)
      .then(({ scenes }) => setScenes(scenes))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [listingId])

  const scene = scenes.find(s => s.id === Number(sceneId))
  const otherScenes = scenes.filter(s => s.id !== Number(sceneId))
  const nameOf = (id: number) => scenes.find(s => s.id === id)?.name ?? `Scene #${id}`

  function handlePlace(yaw: number, pitch: number) {
    if (otherScenes.length === 0) return
    setPendingMarker({ yaw, pitch })
    setPendingTarget(pendingTarget ?? otherScenes[0].id)
  }

  async function saveHotspot() {
    if (!scene || !pendingMarker || !pendingTarget) return
    setSaving(true)
    setError('')
    try {
      const { link } = await apiFetch<{ link: ApiLink }>(
        `/vendor/listings/${listingId}/virtual-tour/scenes/${scene.id}/links`,
        { method: 'POST', body: JSON.stringify({ target_scene_id: pendingTarget, yaw: pendingMarker.yaw, pitch: pendingMarker.pitch }) },
      )
      setScenes(s => s.map(x => x.id === scene.id ? { ...x, links: [...x.links, link] } : x))
      setPendingMarker(null)
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function deleteHotspot(linkId: number) {
    if (!scene) return
    setDeletingId(linkId)
    try {
      await apiFetch(`/vendor/listings/${listingId}/virtual-tour/scenes/${scene.id}/links/${linkId}`, { method: 'DELETE' })
      setScenes(s => s.map(x => x.id === scene.id ? { ...x, links: x.links.filter(l => l.id !== linkId) } : x))
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-5 lg:p-8 max-w-3xl mx-auto flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!scene) {
    return (
      <div className="p-5 lg:p-8 max-w-3xl mx-auto">
        <p className="text-sm text-red-500">Room not found.</p>
      </div>
    )
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <button onClick={() => router.push(`/vendor/listings/${listingId}/virtual-tour`)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1a1a1a] transition-colors mb-4">
        <ArrowLeft size={16} /> Back to rooms
      </button>

      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">{scene.name} — hotspots</h1>
      <p className="text-sm text-gray-500 mb-4">
        {otherScenes.length === 0
          ? 'Add another room first — there\'s nothing to link to yet.'
          : 'Click anywhere on the panorama (e.g. a doorway) to drop a hotspot, then pick which room it leads to.'}
      </p>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="h-[420px] mb-4">
        <PanoramaViewer
          panoramaUrl={scene.panorama_url}
          hotspots={scene.links.map(l => ({ id: l.id, yaw: l.yaw, pitch: l.pitch, label: nameOf(l.target_scene_id) }))}
          onHotspotClick={(id) => deleteHotspot(Number(id))}
          editable={otherScenes.length > 0}
          pendingMarker={pendingMarker}
          onPlaceHotspot={handlePlace}
        />
      </div>

      {pendingMarker && (
        <div className="bg-white border border-[#e0d9cc] rounded-2xl p-4 shadow-sm mb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <p className="text-sm text-[#1a1a1a] font-semibold flex-shrink-0">Link this spot to:</p>
          <select value={pendingTarget ?? ''} onChange={(e) => setPendingTarget(Number(e.target.value))}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2c4a1e]">
            {otherScenes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={saveHotspot} disabled={saving}
              className="px-4 py-2 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold hover:bg-[#3d6b28] transition-colors disabled:opacity-40">
              {saving ? 'Saving…' : 'Save hotspot'}
            </button>
            <button onClick={() => setPendingMarker(null)} disabled={saving}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {scene.links.length > 0 && (
        <div className="bg-white border border-[#e0d9cc] rounded-2xl p-4 shadow-sm">
          <p className="text-sm font-semibold text-[#1a1a1a] mb-3">Existing hotspots</p>
          <div className="flex flex-col divide-y divide-gray-100">
            {scene.links.map(l => (
              <div key={l.id} className="flex items-center justify-between py-2.5">
                <p className="text-sm text-[#1a1a1a]">→ {nameOf(l.target_scene_id)}</p>
                <button onClick={() => deleteHotspot(l.id)} disabled={deletingId === l.id}
                  className="text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
