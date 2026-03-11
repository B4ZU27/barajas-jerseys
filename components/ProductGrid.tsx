'use client'

import { useState, useMemo } from 'react'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/products'

interface ProductGridProps {
  products: Product[]
}

const PAGE_SIZE = 12

function toLabel(str: string) {
  return str
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [page, setPage]             = useState(1)
  const [activeClub, setActiveClub] = useState<string | null>(null)
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [clubDropdown, setClubDropdown] = useState(false)

  // Opciones disponibles derivadas de los productos
  const clubs = useMemo(() => {
    const set = new Set(products.map((p) => p.club).filter(Boolean))
    return Array.from(set).sort()
  }, [products])

  const tags = useMemo(() => {
    const set = new Set(products.flatMap((p) => p.tags ?? []).filter(Boolean))
    return Array.from(set).sort()
  }, [products])

  const hasFilters = activeClub !== null || activeTags.length > 0
  const showFilters = clubs.length > 1 || tags.length > 0

  // Filtrado
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeClub && p.club !== activeClub) return false
      if (activeTags.length > 0 && !activeTags.every((t) => p.tags?.includes(t))) return false
      return true
    })
  }, [products, activeClub, activeTags])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const start   = (page - 1) * PAGE_SIZE
  const visible = filtered.slice(start, start + PAGE_SIZE)

  function goTo(n: number) {
    setPage(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
    setActiveClub(null)
    setActiveTags([])
    setPage(1)
    setClubDropdown(false)
  }

  return (
    <div>
      {/* ── Filtros ── */}
      {showFilters && (
        <div className="mb-8 space-y-3">

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 w-10 shrink-0">
                Tag
              </span>
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border transition-colors ${
                    activeTags.includes(tag)
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
                  }`}
                >
                  {toLabel(tag)}
                </button>
              ))}
            </div>
          )}

          {/* Clubs */}
          {clubs.length > 1 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 w-10 shrink-0">
                Club
              </span>
              <div className="relative">
                <button
                  onClick={() => setClubDropdown((v) => !v)}
                  className={`flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wide border transition-colors ${
                    activeClub
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
                  }`}
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
                    <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-gray-200 shadow-sm min-w-[180px] max-h-64 overflow-y-auto">
                      <button
                        onClick={() => { toggleClub(activeClub ?? ''); setClubDropdown(false) }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          !activeClub ? 'text-black' : 'text-gray-400'
                        }`}
                      >
                        Todos
                      </button>
                      {clubs.map((club) => (
                        <button
                          key={club}
                          onClick={() => { toggleClub(club); setClubDropdown(false) }}
                          className={`w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wide border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                            activeClub === club ? 'text-black' : 'text-gray-500'
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
              <span className="text-xs text-gray-500">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={clearAll}
                className="text-xs underline text-gray-400 hover:text-black transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <p className="text-gray-400 text-sm py-20 text-center">
          No hay productos con estos filtros.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-12">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="w-9 h-9 border border-gray-300 text-sm font-bold hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => goTo(n as number)}
                  className={`w-9 h-9 border text-sm font-bold transition-colors ${
                    n === page
                      ? 'bg-black text-white border-black'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  {n}
                </button>
              )
            )}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="w-9 h-9 border border-gray-300 text-sm font-bold hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
