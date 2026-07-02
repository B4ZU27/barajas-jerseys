'use client'

import { useState, useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import type { Product } from '@/lib/products'
import { CATEGORY_LABELS } from '@/lib/constants'

interface ProductGridProps {
  products: Product[]
  storecode: string
}

const PAGE_SIZE = 20

function toLabel(str: string) {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function ProductGrid({ products, storecode }: ProductGridProps) {
  const [page, setPage]                   = useState(1)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeClub, setActiveClub]         = useState<string | null>(null)
  const [activeTags, setActiveTags]         = useState<string[]>([])
  const [clubDropdown, setClubDropdown]     = useState(false)

  // Opciones disponibles derivadas de los productos
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return Array.from(set).sort()
  }, [products])

  const clubs = useMemo(() => {
    const base = activeCategory
      ? products.filter(p => p.category === activeCategory)
      : products
    const set = new Set(base.map((p) => p.club).filter(Boolean))
    return Array.from(set).sort()
  }, [products, activeCategory])

  const tags = useMemo(() => {
    const set = new Set(products.flatMap((p) => p.tags ?? []).filter(Boolean))
    return Array.from(set).sort()
  }, [products])

  const hasFilters = activeCategory !== null || activeClub !== null || activeTags.length > 0
  const showCategories = categories.length > 1
  const showFilters = clubs.length > 1 || tags.length > 0

  // Filtrado
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false
      if (activeClub && p.club !== activeClub) return false
      if (activeTags.length > 0 && !activeTags.every((t) => p.tags?.includes(t))) return false
      return true
    })
  }, [products, activeCategory, activeClub, activeTags])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const start   = (page - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  function goTo(n: number) {
    setPage(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function toggleCategory(cat: string) {
    setActiveCategory((prev) => (prev === cat ? null : cat))
    setActiveClub(null)  // reset club al cambiar de liga
    setPage(1)
  }

  function toggleClub(club: string) {
    setActiveClub((prev) => (prev === club ? null : club))
    setPage(1)
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
    setPage(1)
  }

  function clearAll() {
    setActiveCategory(null)
    setActiveClub(null)
    setActiveTags([])
    setPage(1)
    setClubDropdown(false)
  }

  return (
    <div>
      {/* ── Filtros ── */}
      {(showCategories || showFilters) && (
        <div className="mb-8 space-y-3">

          {/* Ligas / Categorías */}
          {showCategories && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 w-10 shrink-0">
                Liga
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`pill-retro ${activeCategory === cat ? 'active' : ''}`}
                >
                  {CATEGORY_LABELS[cat] ?? toLabel(cat)}
                </button>
              ))}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 w-10 shrink-0">
                Tag
              </span>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`pill-retro ${activeTags.includes(tag) ? 'active' : ''}`}
                >
                  {toLabel(tag)}
                </button>
              ))}
            </div>
          )}

          {/* Clubs */}
          {clubs.length > 1 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 w-10 shrink-0">
                Club
              </span>
              <div className="relative">
                <button
                  onClick={() => setClubDropdown((v) => !v)}
                  className={`pill-retro flex items-center gap-2 ${activeClub ? 'active' : ''}`}
                >
                  {activeClub ? toLabel(activeClub) : 'Todos los clubes'}
                  <svg
                    width="10" height="10" viewBox="0 0 12 12" fill="none"
                    className={`transition-transform duration-200 ${clubDropdown ? 'rotate-180' : ''}`}
                  >
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {clubDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setClubDropdown(false)} />
                    <div className="absolute top-full left-0 mt-0 z-20 bg-white border-retro min-w-[180px] max-h-64 overflow-y-auto">
                      <button
                        onClick={() => { toggleClub(activeClub ?? ''); setClubDropdown(false) }}
                        className={`w-full text-left px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wide border-retro-b hover:bg-black hover:text-white transition-colors ${
                          !activeClub ? 'text-black' : 'text-black/40'
                        }`}
                      >
                        Todos
                      </button>
                      {clubs.map((club) => (
                        <button
                          key={club}
                          onClick={() => { toggleClub(club); setClubDropdown(false) }}
                          className={`w-full text-left px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wide border-retro-b last:border-0 hover:bg-black hover:text-white transition-colors ${
                            activeClub === club ? 'bg-black text-white' : 'text-black'
                          }`}
                        >
                          {toLabel(club)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Limpiar */}
          {hasFilters && (
            <div className="flex items-center gap-3 pt-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={clearAll}
                className="font-mono text-[10px] uppercase tracking-widest underline underline-offset-2 text-black/40 hover:text-black transition-colors"
              >
                Limpiar
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <p className="font-mono text-[11px] uppercase tracking-widest text-black/30 py-20 text-center">
          Sin resultados con estos filtros.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-black/10">
          {visible.map((product) => (
            <div key={product.id} className="bg-white">
              <ProductCard product={product} storecode={storecode} />
            </div>
          ))}
        </div>
      )}

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-0 mt-8 border-retro">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="w-10 h-10 border-r border-black font-bold text-sm hover:bg-black hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((n) => n === 1 || n === totalPages || (n >= page - 2 && n <= page + 2))
            .reduce<(number | '...')[]>((acc, n, i, arr) => {
              if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push('...')
              acc.push(n)
              return acc
            }, [])
            .map((n, i) =>
              n === '...' ? (
                <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-black/30 font-mono text-xs border-r border-black">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => goTo(n as number)}
                  className={`w-10 h-10 border-r border-black font-mono text-xs font-bold transition-colors ${
                    n === page
                      ? 'bg-black text-white'
                      : 'hover:bg-black hover:text-white'
                  }`}
                >
                  {n}
                </button>
              )
            )}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="w-10 h-10 font-bold text-sm hover:bg-black hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
