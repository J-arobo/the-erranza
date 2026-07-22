'use client'
import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

type Props = {
  lat: number
  lng: number
  label: string
}

export default function MapComponent({ lat, lng, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const initializing = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current) return
    if (initializing.current) return   // prevent double-init

    async function initMap() {
      const L = (await import('leaflet')).default

      if (!containerRef.current) return

      // Check if container already has a Leaflet map attached
      // @ts-ignore — Leaflet attaches _leaflet_id to initialized containers
      if (containerRef.current._leaflet_id) return

      initializing.current = true

      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current, {
        center:          [lat, lng],
        zoom:            12,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(label)
        .openPopup()

      mapRef.current = map
    }

    initMap().catch(console.error)

    return () => {
      initializing.current = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [lat, lng, label])

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden border border-[#e0d9cc] shadow-sm"
      style={{ height: '300px' }}
    />
  )
}