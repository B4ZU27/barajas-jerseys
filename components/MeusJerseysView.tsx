'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import ProductGrid from '@/components/ProductGrid'
import ScrollFeed from '@/components/ScrollFeed'
import type { Product } from '@/lib/products'

interface MeusJerseysViewProps {
  products: Product[]
  storecode: string
}

export default function MeusJerseysView({ products, storecode }: MeusJerseysViewProps) {
  const searchParams    = useSearchParams()
  const router          = useRouter()
  const mode = searchParams.get('modo') ?? 'grid'

  function setMode(newMode: string) {
    router.push(`?modo=${newMode}`, { scroll: false })
  }

  return (
    <div>

      {/* ── Toggle de vista ───────────────────────────────────── */}
      <div className="flex items-stretch border-retro-b">
        <button
          onClick={() => setMode('grid')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5
            font-mono text-[11px] font-bold uppercase tracking-widest
            transition-colors border-r border-black
            ${mode === 'grid' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="0" y="0" width="6" height="6"/>
            <rect x="8" y="0" width="6" height="6"/>
            <rect x="0" y="8" width="6" height="6"/>
            <rect x="8" y="8" width="6" height="6"/>
          </svg>
          Cuadrícula
        </button>

        <button
          onClick={() => setMode('scroll')}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5
            font-mono text-[11px] font-bold uppercase tracking-widest
            transition-colors
            ${mode === 'scroll' ? 'bg-black text-white' : 'bg-white text-black hover:bg-black/5'}`}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="7" y1="1" x2="7" y2="13"/>
            <polyline points="3,9 7,13 11,9"/>
          </svg>
          Scrollear este pedo
        </button>
      </div>

      {/* ── Vista activa ──────────────────────────────────────── */}
      {mode === 'scroll' ? (
        <ScrollFeed products={products} storecode={storecode} />
      ) : (
        <div className="px-4 py-8">
          <ProductGrid products={products} storecode={storecode} />
        </div>
      )}

    </div>
  )
}
