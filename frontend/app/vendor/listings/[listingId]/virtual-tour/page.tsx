'use client'
import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Upload, ChevronUp, ChevronDown, MapPin, Eye, Globe } from 'lucide-react'
import VirtualTourViewer from '@/components/VirtualTourViewer'
import { apiFetch, apiErrorMessage, uploadWithProgress } from '@/lib/api'

type Props = { params: Promise<{ listingId: string }> }

type ApiLink = { id: number; target_scene_id: number; yaw: number; pitch: number }
type ApiScene = { id: number; name: string; panorama_url: string; position: number; links: ApiLink[] }

export default function VirtualTourManager({ params }: Props) {
  const { listingId } = use(params)
  const router = useRouter()

  const [scenes, setScenes] = useState<ApiScene[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const [newName, setNewName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [renamingId, setRenamingId] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<ApiScene | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showDeleteTourConfirm, setShowDeleteTourConfirm] = useState(false)
  const [deletingTour, setDeletingTour] = useState(false)

  function load() {
    setLoading(true)
    apiFetch<{ scenes: ApiScene[]; published_at: string | null }>(`/vendor/listings/${listingId}/virtual-tour`)
      .then(({ scenes, published_at }) => { setScenes(scenes); setPublishedAt(published_at) })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [listingId])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(t)
  }, [toast])

  function handlePickFile() {
    if (!newName.trim()) { setError('Give the room a name first.'); return }
    fileInputRef.current?.click()
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !newName.trim()) return

    setUploading(true)
    setUploadProgress(0)
    setError('')
    try {
      const formData = new FormData()
      formData.append('name', newName.trim())
      formData.append('panorama', file)
      const { scene } = await uploadWithProgress<{ scene: ApiScene }>(
        `/vendor/listings/${listingId}/virtual-tour/scenes`,
        formData,
        setUploadProgress,
      )
      setScenes(s => [...s, { ...scene, links: [] }])
      setNewName('')
      setToast('Room added')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  function startRename(scene: ApiScene) {
    setRenamingId(scene.id)
    setRenameValue(scene.name)
  }

  async function saveRename(scene: ApiScene) {
    const name = renameValue.trim()
    setRenamingId(null)
    if (!name || name === scene.name) return
    setScenes(s => s.map(x => x.id === scene.id ? { ...x, name } : x))
    try {
      await apiFetch(`/vendor/listings/${listingId}/virtual-tour/scenes/${scene.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      })
    } catch (err) {
      setError(apiErrorMessage(err))
      load()
    }
  }

  function handlePublishClick() {
      setShowPublishConfirm(true)
}

  async function doTogglePublish() {
    setPublishing(true)
    setError('')
    try {
      const { published_at } = await apiFetch<{ published_at: string | null }>(
        `/vendor/listings/${listingId}/virtual-tour/${publishedAt ? 'unpublish' : 'publish'}`,
        { method: 'POST' },
      )
      setPublishedAt(published_at)
      setToast(published_at ? 'Virtual tour is now live on your listing' : 'Virtual tour hidden from guests')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setPublishing(false)
      setShowPublishConfirm(false)
    }
  }

  async function deleteTour() {
    setDeletingTour(true)
    setError('')
    try {
      await apiFetch(`/vendor/listings/${listingId}/virtual-tour`, { method: 'DELETE' })
      setScenes([])
      setPublishedAt(null)
      setShowDeleteTourConfirm(false)
      setToast('Virtual tour deleted')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setDeletingTour(false)
    }
  }

  async function move(scene: ApiScene, direction: -1 | 1) {
    const sorted = [...scenes].sort((a, b) => a.position - b.position)
    const idx = sorted.findIndex(s => s.id === scene.id)
    const swapWith = sorted[idx + direction]
    if (!swapWith) return

    const a = { ...scene, position: swapWith.position }
    const b = { ...swapWith, position: scene.position }
    setScenes(s => s.map(x => x.id === a.id ? a : x.id === b.id ? b : x))

    try {
      await Promise.all([
        apiFetch(`/vendor/listings/${listingId}/virtual-tour/scenes/${a.id}`, { method: 'PATCH', body: JSON.stringify({ position: a.position }) }),
        apiFetch(`/vendor/listings/${listingId}/virtual-tour/scenes/${b.id}`, { method: 'PATCH', body: JSON.stringify({ position: b.position }) }),
      ])
    } catch (err) {
      setError(apiErrorMessage(err))
      load()
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiFetch(`/vendor/listings/${listingId}/virtual-tour/scenes/${deleteTarget.id}`, { method: 'DELETE' })
      setScenes(s => s.filter(x => x.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast('Room removed')
    } catch (err) {
      setError(apiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const sorted = [...scenes].sort((a, b) => a.position - b.position)

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.push(`/vendor/listings/${listingId}`)}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1a1a1a] transition-colors mb-4">
        <ArrowLeft size={16} /> Back to listing
      </button>

      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-2xl font-bold text-[#1a1a1a]">Virtual tour</h1>
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => setShowPreview(true)} disabled={sorted.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-[#1a1a1a] hover:bg-gray-50 transition-colors disabled:opacity-40">
            <Eye size={14} /> Preview
          </button>
          <button onClick={handlePublishClick} disabled={publishing || sorted.length === 0}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors disabled:opacity-40
              ${publishedAt ? 'bg-[#eaf5e4] text-[#2c4a1e]' : 'bg-[#2c4a1e] text-white hover:bg-[#3d6b28]'}`}>
            <Globe size={14} /> {publishing ? 'Working…' : publishedAt ? 'Hide' : 'Publish'}
          </button>
          {sorted.length > 0 && (
            <button onClick={() => setShowDeleteTourConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={14} /> Delete tour
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        {publishedAt ? 'Live on your listing.' : 'Not visible to guests yet — publish when ready.'}
      </p>


      <div className="bg-[#fbf6ec] border border-[#e8ddc4] rounded-xl px-4 py-3 mb-5">
        <p className="text-xs text-[#7a5c1e] leading-relaxed">
          Each photo needs to be a genuine 360° panorama (equirectangular, roughly twice as wide as it is tall) —
          captured with a 360 camera or an app like Google Street View / Cardboard Camera. A normal phone photo won't work here.
        </p>
      </div>

      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}

      {/* Add a room */}
      <div className="bg-white border border-[#e0d9cc] rounded-2xl p-4 sm:p-5 shadow-sm mb-5">
        <p className="text-sm font-semibold text-[#1a1a1a] mb-2">Add a room</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Master bedroom" disabled={uploading}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#2c4a1e] transition-colors disabled:opacity-50" />
          <button onClick={handlePickFile} disabled={uploading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2c4a1e] text-white text-sm font-semibold hover:bg-[#3d6b28] transition-colors disabled:opacity-50 whitespace-nowrap">
            <Upload size={15} /> {uploading ? `Uploading… ${uploadProgress}%` : 'Choose 360 photo'}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileSelected} />
        </div>
      </div>

      {/* Room list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-[#2c4a1e] border-t-transparent animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">No rooms yet — add your first 360° photo above.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((scene, i) => (
            <div key={scene.id} className="bg-white border border-[#e0d9cc] rounded-2xl p-3 shadow-sm flex flex-wrap items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={scene.panorama_url} alt="" className="w-20 h-14 rounded-lg object-cover flex-shrink-0 bg-[#f5f5f5]" />
              <div className="flex-1 min-w-[120px]">
                {renamingId === scene.id ? (
                  <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => saveRename(scene)}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                    className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-[#2c4a1e]" />
                ) : (
                  <button onClick={() => startRename(scene)} className="text-sm font-semibold text-[#1a1a1a] hover:underline text-left truncate block">
                    {scene.name}
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{scene.links.length} hotspot{scene.links.length === 1 ? '' : 's'}</p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-last sm:order-none">
                <div className="flex flex-col">
                  <button onClick={() => move(scene, -1)} disabled={i === 0} className="text-gray-300 hover:text-[#1a1a1a] disabled:opacity-30">
                    <ChevronUp size={16} />
                  </button>
                  <button onClick={() => move(scene, 1)} disabled={i === sorted.length - 1} className="text-gray-300 hover:text-[#1a1a1a] disabled:opacity-30">
                    <ChevronDown size={16} />
                  </button>
                </div>
                <button onClick={() => router.push(`/vendor/listings/${listingId}/virtual-tour/scenes/${scene.id}`)}
                  disabled={sorted.length < 2}
                  title={sorted.length < 2 ? 'Add another room first' : undefined}
                  className="flex items-center gap-1.5 flex-shrink-0 px-3 py-2 rounded-xl border border-gray-100 text-xs font-semibold
                              disabled:text-gray-300 disabled:cursor-not-allowed
                              enabled:text-[#2c4a1e] enabled:border-[#2c4a1e]/30 enabled:hover:bg-[#eaf5e4] transition-colors">
                  <MapPin size={13} /> Hotspots ({scene.links.length})
                </button>
                <button onClick={() => setDeleteTarget(scene)} className="flex-shrink-0 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

          ))}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !deleting) setDeleteTarget(null) }}>
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">Remove this room?</h2>
            <p className="text-sm text-gray-500 mb-5">
              <span className="font-semibold text-[#1a1a1a]">{deleteTarget.name}</span> and any hotspots pointing to or from it will be removed. This can't be undone.
            </p>
            <button onClick={confirmDelete} disabled={deleting}
              className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 mb-2">
              {deleting ? 'Removing…' : 'Remove room'}
            </button>
            <button onClick={() => setDeleteTarget(null)} disabled={deleting}
              className="w-full py-2 text-sm font-semibold text-gray-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Publish confirmation */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !publishing) setShowPublishConfirm(false) }}>
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
              {publishedAt ? 'Hide this virtual tour?' : 'Publish this virtual tour?'}
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              {publishedAt
                ? "Guests won't be able to see or open it on your listing anymore. You can publish it again anytime."
                : 'Guests will immediately be able to see and walk through it on your listing page. You can hide it again anytime.'}
            </p>
            <button onClick={doTogglePublish} disabled={publishing}
              className={`w-full py-3 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-40 mb-2
                ${publishedAt ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2c4a1e] hover:bg-[#3d6b28]'}`}>
              {publishing ? 'Working…' : publishedAt ? 'Yes, hide it' : 'Yes, publish'}
            </button>
            <button onClick={() => setShowPublishConfirm(false)} disabled={publishing}
              className="w-full py-2 text-sm font-semibold text-gray-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeleteTourConfirm && (
        <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={(e) => { if (e.target === e.currentTarget && !deletingTour) setShowDeleteTourConfirm(false) }}>
          <div className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6">
            <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">Delete the entire virtual tour?</h2>
            <p className="text-sm text-gray-500 mb-5">
              All {sorted.length} room{sorted.length === 1 ? '' : 's'} and every hotspot will be permanently removed. This can't be undone.
            </p>
            <button onClick={deleteTour} disabled={deletingTour}
              className="w-full py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-40 mb-2">
              {deletingTour ? 'Deleting…' : 'Delete everything'}
            </button>
            <button onClick={() => setShowDeleteTourConfirm(false)} disabled={deletingTour}
              className="w-full py-2 text-sm font-semibold text-gray-400">
              Cancel
            </button>
          </div>
        </div>
      )}

      {showPreview && (
        <VirtualTourViewer scenes={sorted} onClose={() => setShowPreview(false)} />
      )}

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[400] bg-[#1a1a1a] text-white text-sm px-4 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
