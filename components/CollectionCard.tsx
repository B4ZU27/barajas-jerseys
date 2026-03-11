import Link from 'next/link'

interface CollectionCardProps {
  category: string
  label: string
  index?: number
}

export default function CollectionCard({ category, label, index = 0 }: CollectionCardProps) {
  return (
    <Link
      href={`/collections/${category}`}
      className="group flex items-center justify-between border-b border-gray-200 py-4 hover:border-black transition-colors duration-200"
    >
      <div className="flex items-center gap-4">
        <span className="text-[11px] text-gray-300 font-mono w-5 select-none">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="text-sm font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform duration-200">
          {label}
        </span>
      </div>
      <span className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-200 text-lg leading-none">
        →
      </span>
    </Link>
  )
}
