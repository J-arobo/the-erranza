'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { VENDOR_LISTINGS, VendorListing } from '@/data/vendor'

const CATEGORIES = ['Safari', 'Stays', 'Experiences', 'Packages']
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400&q=80'

export default function NewListingPage() {
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [location, setLocation] = useState('')
  const [price, setPrice] = useState('')
  const [image, setImage] = useState('')
  const [description, setDescription] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [amenityInput, setAmenityInput] = useState('')

  const canSubmit = title.trim() && location.trim() && price.trim()

  function addAmenity() {
    const val = amenityInput.trim()
    if (val && !amenities.includes(val)) setAmenities(a => [...a, val])
    setAmenityInput('')
  }

  function removeAmenity(item: string) {
    setAmenities(a => a.filter(x => x !== item))
  }

  function handleSubmit(status: 'draft' | 'active') {
    if (!canSubmit) return
    const newListing: VendorListing = {
      id: `vl${VENDOR_LISTINGS.length + 1}_${Date.now()}`,
      title: title.trim(),
      location: location.trim(),
      price: price.trim(),
      image: image.trim() || FALLBACK_IMAGE,
      status,
      bookings: 0,
      rating: 0,
      earnings: 'Ksh 0',
      category,
      description: description.trim(),
      amenities,
    }
    // No backend yet — mutate the shared in-memory list so it shows up immediately.
    VENDOR_LISTINGS.push(newListing)
    router.push('/vendor/listings')
  }

  return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => router.push('/vendor/listings')}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#1a1a1a] mb-5 hover:underline">
        <ArrowLeft size={16} /> Back to listings
      </button>

      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">New listing</h1>
      <p className="text-sm text-gray-500 mb-6">Fill in the details below to create a new listing.</p>

      <div className="flex flex-col gap-5">
        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Maasai Mara Premium Safari"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Category</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-all
                  ${category === c
                    ? 'bg-[#2c4a1e] text-white border-[#2c4a1e]'
                    : 'bg-white text-[#1a1a1a] border-gray-200 hover:border-[#2c4a1e]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Narok County, Kenya"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Price</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. Ksh 45,000"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Cover image URL</label>
          <input value={image} onChange={(e) => setImage(e.target.value)}
            placeholder="https://..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors" />
          <p className="text-xs text-gray-400 mt-1">Leave blank to use a placeholder image for now.</p>
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4} placeholder="Describe what guests can expect..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       outline-none focus:border-[#2c4a1e] transition-colors resize-none" />
        </div>

        <div>
          <label className="text-sm font-semibold text-[#1a1a1a] mb-1.5 block">
            What&apos;s included
          </label>
          <div className="flex gap-2 mb-2">
            <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAmenity() } }}
              placeholder="e.g. Hotel pickup"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                         outline-none focus:border-[#2c4a1e] transition-colors" />
            <button onClick={addAmenity}
              className="px-4 rounded-xl bg-[#2c4a1e] text-white hover:bg-[#3d6b28] transition-colors">
              <Plus size={16} />
            </button>
          </div>
          {amenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenities.map((item) => (
                <span key={item}
                  className="flex items-center gap-1.5 bg-[#eaf5e4] text-[#2c4a1e]
                             text-xs font-semibold px-3 py-1.5 rounded-full">
                  {item}
                  <button onClick={() => removeAmenity(item)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => handleSubmit('draft')}
            disabled={!canSubmit}
            className="flex-1 border border-[#1a1a1a] text-[#1a1a1a] py-3 rounded-xl
                       font-semibold text-sm hover:bg-gray-50 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save as draft
          </button>
          <button
            onClick={() => handleSubmit('active')}
            disabled={!canSubmit}
            className="flex-1 bg-[#2c4a1e] text-white py-3 rounded-xl
                       font-semibold text-sm hover:bg-[#3d6b28] transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Publish listing
          </button>
        </div>
      </div>
    </div>
  )
}
