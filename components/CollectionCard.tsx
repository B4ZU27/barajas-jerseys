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
      className="group relative flex items-center border-b border-gray-200 hover:border-[var(--blue-primary)] transition-colors duration-300"
    >
      {/* Fondo azul que se expande en hover */}
      <div className="absolute inset-0 bg-[var(--blue-primary)] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />

      {/* Número grande decorativo */}
      <span className="relative z-10 text-[52px] md:text-[64px] leading-none [font-family:var(--font-bebas)] select-none w-20 md:w-24 shrink-0 text-right pr-4 text-gray-100 group-hover:text-white/20 transition-colors duration-300">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Separador vertical */}
      <div className="relative z-10 w-px h-6 bg-gray-200 group-hover:bg-white/30 transition-colors duration-300 shrink-0" />

      {/* Nombre de la colección */}
      <span className="relative z-10 flex-1 px-5 py-5 text-xs md:text-sm font-black uppercase tracking-[0.25em] group-hover:text-white transition-colors duration-300">
        {label}
      </span>

      {/* Flecha */}
      <span className="relative z-10 pr-5 text-gray-300 group-hover:text-white transition-all duration-300 text-base font-bold group-hover:translate-x-0.5 -translate-y-px">
        ↗
      </span>
    </Link>
  )
}
