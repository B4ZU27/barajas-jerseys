import Link from 'next/link'

// Color por categoría
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'selecciones':    { bg: '#0c1f6e', text: '#ffffff' },
  'premier-league': { bg: '#3d0c6e', text: '#ffffff' },
  'la-liga':        { bg: '#6e0c0c', text: '#ffffff' },
  'serie-a':        { bg: '#0c4a6e', text: '#ffffff' },
  'bundesliga':     { bg: '#6e3d0c', text: '#ffffff' },
  'ligue-1':        { bg: '#0c6e3d', text: '#ffffff' },
  'liga-mx':        { bg: '#1c6e0c', text: '#ffffff' },
  'mls':            { bg: '#2d2d2d', text: '#ffffff' },
  'otros':          { bg: '#4a4a4a', text: '#ffffff' },
}

interface CollectionCardProps {
  category: string
  label: string
  index?: number
}

export default function CollectionCard({ category, label, index = 0 }: CollectionCardProps) {
  const color = CATEGORY_COLORS[category] ?? { bg: '#1433b8', text: '#ffffff' }

  return (
    <Link
      href={`/collections/${category}`}
      className="group relative flex items-center justify-between px-4 py-4 md:py-0 overflow-hidden md:border-b md:border-gray-200 md:hover:border-[var(--blue-primary)] transition-colors duration-300"
      style={{ backgroundColor: color.bg, color: color.text, minHeight: 'clamp(64px, 14vw, 80px)' }}
    >
      {/* Overlay hover */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Número decorativo */}
      <span
        className="relative z-10 text-[52px] md:text-[64px] leading-none [font-family:var(--font-bebas)] select-none w-16 shrink-0 text-right pr-3"
        style={{ color: 'rgba(255,255,255,0.15)' }}
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Separador */}
      <div className="relative z-10 w-px h-6 bg-white/20 shrink-0" />

      {/* Nombre */}
      <span className="relative z-10 flex-1 px-4 text-xs md:text-sm font-black uppercase tracking-[0.2em]">
        {label}
      </span>

    </Link>
  )
}
