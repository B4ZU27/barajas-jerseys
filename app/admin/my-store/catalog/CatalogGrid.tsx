'use client'

import { useState } from 'react'
import Image from 'next/image'

interface CatalogProduct {
  id: string
  name: string
  league: string | null
  image: string | null
  price_default: number | null
  inStore: boolean
}

function CatalogProductCard({
  product,
  onAdd,
}: {
  product: CatalogProduct
  onAdd: (id: string) => Promise<void>
}) {
  const [adding, setAdding] = useState(false)
  const [added,  setAdded]  = useState(product.inStore)

  const handleAdd = async () => {
    setAdding(true)
    await onAdd(product.id)
    setAdding(false)
    setAdded(true)
  }

  return (
    <div className="bg-white border border-gray-200 flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-cover" sizes="200px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
        )}
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">{product.league ?? '—'}</p>
        <p className="text-xs font-black uppercase tracking-wider leading-tight">{product.name}</p>
        {product.price_default != null && (
          <p className="text-xs text-gray-500">${product.price_default.toLocaleString('es-MX')}</p>
        )}
        <div className="mt-auto pt-2 border-t border-gray-100">
          {added ? (
            <span className="text-[10px] font-bold uppercase text-gray-400">Ya en tu tienda</span>
          ) : (
            <button
              onClick={handleAdd}
              disabled={adding}
              className="text-[10px] font-bold uppercase tracking-wider text-white px-3 py-1.5 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: adding ? 'var(--blue-primary)' : 'var(--blue-deep)' }}
            >
              {adding ? 'Agregando…' : 'Agregar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CatalogGrid({
  products,
  leagues,
}: {
  products: CatalogProduct[]
  leagues: { id: string; name: string }[]
}) {
  const [leagueFilter, setLeagueFilter] = useState<string>('all')

  const filtered = leagueFilter === 'all'
    ? products
    : products.filter(p => p.league === leagues.find(l => l.id === leagueFilter)?.name)

  const addProduct = async (productId: string) => {
    await fetch('/api/admin/store-products/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productIds: [productId] }),
    })
  }

  return (
    <div>
      {/* League filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setLeagueFilter('all')}
          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border transition-colors ${
            leagueFilter === 'all'
              ? 'border-black text-black bg-white'
              : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-black'
          }`}
        >
          Todos ({products.length})
        </button>
        {leagues.map(l => {
          const count = products.filter(p => p.league === l.name).length
          return (
            <button
              key={l.id}
              onClick={() => setLeagueFilter(l.id)}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                leagueFilter === l.id
                  ? 'border-black text-black bg-white'
                  : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-black'
              }`}
            >
              {l.name} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(p => (
          <CatalogProductCard key={p.id} product={p} onAdd={addProduct} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-12">No hay productos en esta liga.</p>
      )}
    </div>
  )
}
