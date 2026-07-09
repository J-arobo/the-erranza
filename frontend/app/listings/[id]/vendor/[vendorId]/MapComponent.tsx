'use client'
import { useLayoutEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

type Props = {
  lat: number
  lng: number
  label: string
}

export default function MapComponent({ lat, lng, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const map = L.map(container, { scrollWheelZoom: false }).setView([lat, lng], 10)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)
    L.marker([lat, lng]).addTo(map).bindPopup(label)

    return () => {
      map.remove()
    }
  }, [lat, lng, label])

  return (
    <div className="w-full h-[220px] rounded-2xl overflow-hidden border border-[#e0d9cc]">
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
