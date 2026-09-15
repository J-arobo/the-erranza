'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Briefcase, Heart, Compass } from 'lucide-react'

const VALUES = [
  {
    Icon: Compass,
    title: 'Small team, real ownership',
    description: 'Erranza is early-stage — everyone here works on things that ship and get used, not internal process.',
  },
  {
    Icon: Heart,
    title: 'Built for Kenya, by people who use it',
    description: "We're building the platform we'd want to book a trip on ourselves — that shapes how we work.",
  },
]

export default function CareersPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="border-b border-gray-100 px-4 sm:px-8 py-4 flex items-center gap-3
                      sticky top-0 bg-white z-40">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center sm:hidden"
        >
          <ArrowLeft size={16} color="#1a1a1a" />
        </button>
        <span
          onClick={() => router.push('/')}
          className="hidden sm:block text-[#304333] text-xl font-bold cursor-pointer"
        >
          Erranza
        </span>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center gap-3 mb-3">
          <Briefcase size={24} color="#2c4a1e" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">Careers at Erranza</h1>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          We don't have any open roles listed right now — but we're a small, growing team, and that changes.
          If you'd like to be on our radar for when it does, reach out and tell us what you're interested in.
        </p>

        <div className="flex flex-col gap-5 mb-10">
          {VALUES.map(({ Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#eaf5e4] flex items-center justify-center flex-shrink-0">
                <Icon size={18} color="#2c4a1e" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a1a1a] mb-1">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <a
          href="mailto:info@erranza.co.ke?subject=Interested%20in%20Erranza"
          className="inline-block w-full sm:w-auto text-center px-6 py-3 bg-[#2c4a1e] text-white rounded-xl text-sm font-semibold
                     hover:bg-[#3d6b28] transition-colors"
        >
          Get in touch
        </a>
      </div>
    </div>
  )
}
