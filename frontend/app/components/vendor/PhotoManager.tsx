'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, Star, ChevronLeft, ChevronRight } from 'lucide-react'

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result)
      else reject(new Error('Failed to read file'))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PhotoManager({
  images, onChange,
}: { images: string[]; onChange: (images: string[]) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function readFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    if (files.length === 0) return
    Promise.all(files.map(fileToDataUrl)).then((dataUrls) => {
      onChange([...images, ...dataUrls])
    })
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx))
  }
  function makeCover(idx: number) {
    const next = [...images]
    const [item] = next.splice(idx, 1)
    next.unshift(item)
    onChange(next)
  }
  function moveImage(idx: number, dir: -1 | 1) {
    const target = idx + dir
    if (target < 0 || target >= images.length) return
    const next = [...images]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }

  return (
    <div>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (e.dataTransfer.files?.length) readFiles(e.dataTransfer.files)
        }}
        className={`flex flex-col items-center justify-center gap-1.5 border-2 border-dashed
                    rounded-xl py-8 cursor-pointer transition-colors mb-3
                    ${dragOver ? 'border-[#2c4a1e] bg-[#eaf5e4]' : 'border-gray-200 hover:border-gray-300'}`}
      >
        <Upload size={20} color="#2c4a1e" />
        <p className="text-sm font-semibold text-[#1a1a1a]">Click to upload or drag photos here</p>
        <p className="text-xs text-gray-400">PNG or JPG, multiple allowed</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) readFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((src, idx) => (
            <div key={`${idx}-${src.slice(-24)}`}
              className="relative rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-100">
              <Image src={src} alt={`Photo ${idx + 1}`} fill sizes="200px" className="object-cover" />

              {idx === 0 && (
                <span className="absolute top-2 left-2 flex items-center gap-1 bg-[#2c4a1e] text-white
                                 text-[10px] font-bold px-2 py-1 rounded-full">
                  <Star size={9} fill="white" /> Cover
                </span>
              )}

              <button onClick={() => removeImage(idx)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60
                           flex items-center justify-center hover:bg-black/80 transition-colors">
                <X size={12} color="white" />
              </button>

              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between
                              px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
                <button onClick={() => moveImage(idx, -1)} disabled={idx === 0}
                  className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center
                             disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft size={12} color="#1a1a1a" />
                </button>
                {idx !== 0 && (
                  <button onClick={() => makeCover(idx)}
                    className="text-[10px] font-semibold text-white hover:underline">
                    Make cover
                  </button>
                )}
                <button onClick={() => moveImage(idx, 1)} disabled={idx === images.length - 1}
                  className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center
                             disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight size={12} color="#1a1a1a" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-2">The first photo is used as the cover image across the site.</p>
    </div>
  )
}
