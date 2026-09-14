'use client'
import { useEffect, useRef, useState } from 'react'

type Hotspot = { id: number | string; yaw: number; pitch: number; label: string }

type Props = {
  panoramaUrl: string
  hotspots?: Hotspot[]
  onHotspotClick?: (id: Hotspot['id']) => void
  editable?: boolean
  pendingMarker?: { yaw: number; pitch: number } | null
  onPlaceHotspot?: (yaw: number, pitch: number) => void
}

let pannellumLoadPromise: Promise<void> | null = null

function loadPannellum(): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if ((window as any).pannellum) return Promise.resolve()
  if (pannellumLoadPromise) return pannellumLoadPromise

  pannellumLoadPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('load failed'))
    document.body.appendChild(script)
  })

  return pannellumLoadPromise
}

export default function PanoramaViewer({
  panoramaUrl, hotspots = [], onHotspotClick, editable = false, pendingMarker = null, onPlaceHotspot,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState('')
  const containerId = useRef(`pano-${Math.random().toString(36).slice(2)}`).current

  // Kept current without forcing the click handler (and the viewer it's
  // attached to) to be rebuilt whenever these change between renders.
  const editableRef = useRef(editable)
  const onPlaceHotspotRef = useRef(onPlaceHotspot)
  const onHotspotClickRef = useRef(onHotspotClick)
  useEffect(() => { editableRef.current = editable }, [editable])
  useEffect(() => { onPlaceHotspotRef.current = onPlaceHotspot }, [onPlaceHotspot])
  useEffect(() => { onHotspotClickRef.current = onHotspotClick }, [onHotspotClick])

  useEffect(() => {
    let cancelled = false
    loadPannellum()
      .then(() => { if (!cancelled) setReady(true) })
      .catch(() => { if (!cancelled) setLoadError('Could not load the panorama viewer. Check your connection.') })
    return () => { cancelled = true }
  }, [])

  // Builds the viewer exactly once per panorama — NOT on every hotspot or
  // pending-marker change, so looking around never resets your view.
  useEffect(() => {
    if (!ready || !containerRef.current) return
    const pannellum = (window as any).pannellum
    const el = containerRef.current

    if (viewerRef.current) {
      viewerRef.current.destroy()
      viewerRef.current = null
    }

    viewerRef.current = pannellum.viewer(containerId, {
      type: 'equirectangular',
      panorama: panoramaUrl,
      autoLoad: true,
      compass: false,
      showZoomCtrl: true,
      hotSpots: [],
    })

    // A drag-to-look-around still fires a native click on mouse-up — only
    // treat it as an intentional placement if the pointer barely moved
    // across the whole gesture (tracked independently of Pannellum's own
    // drag handling, so it can't be affected by how that's implemented).
    let downX = 0, downY = 0, maxDist = 0
    const onMouseDown = (e: MouseEvent) => { downX = e.clientX; downY = e.clientY; maxDist = 0 }
    const onMouseMove = (e: MouseEvent) => {
      if (!e.buttons) return
      const d = Math.hypot(e.clientX - downX, e.clientY - downY)
      if (d > maxDist) maxDist = d
    }
    let touchStartX = 0, touchStartY = 0
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touchStartX = t?.clientX ?? 0; touchStartY = t?.clientY ?? 0; maxDist = 0
    }
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      const d = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY)
      if (d > maxDist) maxDist = d
    }
    const onClick = (e: MouseEvent) => {
      // Tolerate a few pixels of jitter (trackpad clicks are rarely
      // perfectly stationary) but still reject an actual look-around drag.
      if (maxDist > 10) return

      if (!editableRef.current || !onPlaceHotspotRef.current) return
      if ((e.target as HTMLElement)?.closest('.pnlm-hotspot, .pnlm-controls')) return
      const viewer = viewerRef.current
      if (!viewer) return

      let pitch: number, yaw: number
      if (typeof viewer.mouseEventToCoords === 'function') {
        const result = viewer.mouseEventToCoords(e)
        if (Array.isArray(result)) { [pitch, yaw] = result } else { ({ pitch, yaw } = result) }
      } else {
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2
        const hfov = viewer.getHfov()
        const vfov = 2 * Math.atan(Math.tan((hfov * Math.PI / 180) / 2) * (rect.height / rect.width)) * 180 / Math.PI
        yaw = viewer.getYaw() + (x / rect.width) * hfov
        pitch = viewer.getPitch() - (y / rect.height) * vfov
      }
      onPlaceHotspotRef.current(yaw, pitch)
    }

    el.addEventListener('mousedown', onMouseDown)
    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('touchstart', onTouchStart)
    el.addEventListener('touchmove', onTouchMove)
    el.addEventListener('click', onClick)

    return () => {
      el.removeEventListener('mousedown', onMouseDown)
      el.removeEventListener('mousemove', onMouseMove)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('click', onClick)
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, panoramaUrl])

  // Syncs hotspot markers onto the existing viewer without rebuilding it.
  const prevHotspotIdsRef = useRef<string[]>([])
  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    prevHotspotIdsRef.current.forEach(id => {
      try { viewer.removeHotSpot(id) } catch { /* already gone */ }
    })

    const all = [
      ...hotspots.map(h => ({
        id: `hs-${h.id}`, pitch: h.pitch, yaw: h.yaw, type: 'info', text: h.label,
        cssClass: 'erranza-hotspot',
        clickHandlerFunc: () => onHotspotClickRef.current?.(h.id),
      })),
      ...(pendingMarker ? [{
        id: 'hs-pending', pitch: pendingMarker.pitch, yaw: pendingMarker.yaw, type: 'info', text: 'New hotspot',
        cssClass: 'erranza-hotspot erranza-hotspot-pending',
      }] : []),
    ]

    all.forEach(hs => { try { viewer.addHotSpot(hs) } catch { /* viewer not loaded yet */ } })
    prevHotspotIdsRef.current = all.map(hs => hs.id)
  }, [ready, hotspots, pendingMarker])

  return (
    <div className="relative w-full h-full">
      {loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-sm text-red-500 rounded-xl z-10">
          {loadError}
        </div>
      )}
      <div id={containerId} ref={containerRef} className="w-full h-full rounded-xl overflow-hidden bg-black" />
      <style>{`
        .erranza-hotspot,
        .erranza-hotspot.pnlm-hotspot {
          width: 26px !important;
          height: 26px !important;
          background: #e8734a;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
          cursor: pointer;
        }
        .erranza-hotspot-pending { background: #2c4a1e; }
        .erranza-hotspot .pnlm-tooltip {
          pointer-events: none;
          background: #1a1a1a !important;
          color: white !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 4px 10px !important;
          border-radius: 999px !important;
          white-space: nowrap !important;
          border: none !important;
        }
      `}</style>

    </div>
  )
}
