'use client'
import { useState } from 'react'
import { X } from 'lucide-react'
import PanoramaViewer from './PanoramaViewer'

type Link = { id: number; target_scene_id: number; yaw: number; pitch: number }
type Scene = { id: number; name: string; panorama_url: string; position: number; links: Link[] }

type Props = {
  scenes: Scene[]
  onClose: () => void
  fullscreen?: boolean
}

export default function VirtualTourViewer({ scenes, onClose, fullscreen = false }: Props) {
  const sorted = [...scenes].sort((a, b) => a.position - b.position)
  const [currentId, setCurrentId] = useState<number | undefined>(sorted[0]?.id)
  const current = scenes.find(s => s.id === currentId) ?? sorted[0]
  const nameOf = (id: number) => scenes.find(s => s.id === id)?.name ?? ''

  if (!current) return null

  const inner = (
    <>
      <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0">
        <p className="text-white text-sm font-semibold truncate">{current.name}</p>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors flex-shrink-0">
          <X size={16} color="white" />
        </button>
      </div>

      <div className="flex-1 relative min-h-0">
        <PanoramaViewer
          panoramaUrl={current.panorama_url}
          hotspots={current.links.map(l => ({ id: l.id, yaw: l.yaw, pitch: l.pitch, label: nameOf(l.target_scene_id) }))}
          onHotspotClick={(id) => {
            const link = current.links.find(l => l.id === id)
            if (link) setCurrentId(link.target_scene_id)
          }}
        />
      </div>

      {sorted.length > 1 && (
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto scrollbar-hide flex-shrink-0">
          {sorted.map(s => (
            <button key={s.id} onClick={() => setCurrentId(s.id)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${s.id === current.id ? 'bg-white text-[#1a1a1a]' : 'bg-white/15 text-white hover:bg-white/25'}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </>
  )

  if (fullscreen) {
    return <div className="fixed inset-0 z-[600] bg-black flex flex-col">{inner}</div>
  }

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-0 sm:p-6"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-black w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
        style={{ height: 'min(75vh, 520px)' }}>
        {inner}
      </div>
    </div>
  )
}
