import { ChevronRight } from 'lucide-react'

export default function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4 pt-5 pb-2">
      <h2 className="text-[15px] font-bold text-[#1a1a1a]">{title}</h2>
      <button className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center">
        <ChevronRight size={13} color="#555" />
      </button>
    </div>
  )
}