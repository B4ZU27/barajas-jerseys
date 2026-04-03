'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import productsData from '@/data/products.json'

interface Product {
  id: string; slug: string; name: string; price: number
  category: string; club: string; available: boolean
  images: string[]; tags: string[]
}

const products = productsData as Product[]

const CATEGORY_LABEL: Record<string, string> = {
  'selecciones': 'Selecciones', 'premier-league': 'Premier League',
  'la-liga': 'La Liga', 'serie-a': 'Serie A', 'bundesliga': 'Bundesliga',
  'ligue-1': 'Ligue 1', 'liga-mx': 'Liga MX', 'mls': 'MLS', 'otros': 'Otros',
}

export default function ProductsListPage() {
  const router = useRouter()
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [tagFilter, setTagFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return products.filter(p => {
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q)
      const matchCat = catFilter === 'all' || p.category === catFilter
      const matchTag = tagFilter === 'all' || p.tags?.includes(tagFilter)
      return matchSearch && matchCat && matchTag
    })
  }, [search, catFilter, tagFilter])

  const categories = [...new Set(products.map(p => p.category))].sort()
  const tags       = [...new Set(products.flatMap(p => p.tags ?? []))].sort()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--blue-deep)' }}>
            Admin — Productos
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{filtered.length} de {products.length} productos</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs font-bold uppercase tracking-wider px-3 py-2 text-white" style={{ backgroundColor: 'var(--blue-primary)' }}>
            + Agregar
          </Link>
          <a href="/" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
            ← Catálogo
          </a>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, slug, club…"
          className="border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 w-64"
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
          <option value="all">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{CATEGORY_LABEL[c] ?? c}</option>)}
        </select>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          className="border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
          <option value="all">Todos los tags</option>
          {tags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {(search || catFilter !== 'all' || tagFilter !== 'all') && (
          <button onClick={() => { setSearch(''); setCatFilter('all'); setTagFilter('all') }}
            className="text-xs text-gray-400 hover:text-black uppercase tracking-wider">
            Limpiar
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-20 text-sm">No hay productos</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {filtered.map(product => (
              <button
                key={product.slug}
                onClick={() => router.push(`/admin/products/${product.slug}`)}
                className="bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left group"
              >
                {/* Imagen */}
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin foto</div>
                  )}
                  {!product.available && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-black/60 px-2 py-1">Agotado</span>
                    </div>
                  )}
                  {product.tags?.includes('retro') && (
                    <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-bold px-1 py-0.5 uppercase">Retro</span>
                  )}
                </div>
                {/* Info */}
                <div className="p-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{product.club}</p>
                  <p className="text-xs font-bold leading-tight mt-0.5 line-clamp-2">{product.name}</p>
                  <p className="text-xs font-bold mt-1">${product.price.toLocaleString('es-MX')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
