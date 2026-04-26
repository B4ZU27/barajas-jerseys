import Link from 'next/link'
import { CATEGORY_COLORS } from '@/lib/categoryColors'

interface CollectionCardProps {
  category: string
  label: string
  index?: number
}

export default function CollectionCard({ category, label, index = 0 }: CollectionCardProps) {
  const bg = CATEGORY_COLORS[category] ?? '#1433b8'

  return (
    <Link
      href={`/collections/${category}`}
      className="group relative flex flex-col justify-between p-4 overflow-hidden transition-opacity hover:opacity-90 active:opacity-75"
      style={{ backgroundColor: bg, color: '#ffffff', minHeight: '110px' }}
    >
      {/* Overlay hover */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Número decorativo — arriba izquierda */}
      <span
        className="relative z-10 text-[36px] leading-none [font-family:var(--font-bebas)] select-none"
        style={{ color: 'rgba(255,255,255,0.18)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Nombre — abajo izquierda */}
      <span className="relative z-10 text-sm font-black uppercase tracking-[0.1em] leading-tight">
        {label}
      </span>
    </Link>
  )
}
