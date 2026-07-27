export default function ComingSoonPage({ title, description }: { title: string; description: string }) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-6" style={{ minHeight: '70vh' }}>
        <span className="text-6xl mb-4">🚧</span>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">{title}</h1>
        <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      </div>
    )
  }
  