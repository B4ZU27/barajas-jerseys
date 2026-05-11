'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'

export interface CatalogItem {
  id:           string
  name:         string
  priceDefault: number | null
  image:        string | null
  league:       string | null
  leagueId:     string | null
  inStore:      boolean
  customPrice:  number | null
}

export default function ProductsGrid({
  items,
  leagues,
}: {
  items:   CatalogItem[]
  leagues: { id: string; name: string }[]
}) {
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const [addingAll,    setAddingAll]    = useState(false)

  // Lift inStore state here so "Agregar todo" can update all cards at once
  const [inStoreIds, setInStoreIds] = useState<Set<string>>(
    () => new Set(items.filter(i => i.inStore).map(i => i.id))
  )
  const [priceMap, setPriceMap] = useState<Map<string, number>>(
    () => new Map(items.map(i => [i.id, i.customPrice ?? i.priceDefault ?? 0]))
  )

  const filtered = leagueFilter === 'all'
    ? items
    : items.filter(item => item.leagueId === leagueFilter)

  const pendingInFilter = filtered.filter(i => !inStoreIds.has(i.id))

  /* ── Callbacks for ProductCard ── */
  const handleAdd = (id: string, priceDefault: number | null) => {
    setInStoreIds(prev => new Set([...prev, id]))
    setPriceMap(prev => new Map(prev).set(id, priceDefault ?? 0))
  }

  const handleRemove = (id: string) => {
    setInStoreIds(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  const handlePriceChange = (id: string, price: number) => {
    setPriceMap(prev => new Map(prev).set(id, price))
  }

  /* ── Agregar todo (filtered, not in store) ── */
  const handleAddAll = async () => {
    if (pendingInFilter.length === 0) return
    setAddingAll(true)
    const ids = pendingInFilter.map(i => i.id)
    const res = await fetch('/api/admin/store-products/add', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productIds: ids }),
    })
    if (res.ok) {
      ids.forEach(id => {
        const item = items.find(i => i.id === id)
        handleAdd(id, item?.priceDefault ?? null)
      })
    }
    setAddingAll(false)
  }

  return (
    <div>
      {/* Top bar: filters + agregar todo */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {/* League filters */}
        <button
          onClick={() => setLeagueFilter('all')}
          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border transition-colors ${
            leagueFilter === 'all'
              ? 'border-black text-black bg-white'
              : 'border-gray-200 text-gray-400 hover:border-gray-400 hover:text-black'
          }`}
        >
          Todos ({items.length})
        </button>
        {leagues.map(l => {
          const count = items.filter(p => p.leagueId === l.id).length
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

        {/* Agregar todo — only shown if there are pending products */}
        {pendingInFilter.length > 0 && (
          <button
            onClick={handleAddAll}
            disabled={addingAll}
            className="ml-auto text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 text-white disabled:opacity-50 transition-colors whitespace-nowrap"
            style={{ backgroundColor: addingAll ? 'var(--blue-primary)' : 'var(--blue-deep)' }}
          >
            {addingAll
              ? 'Agregando…'
              : `Agregar ${pendingInFilter.length === filtered.length ? 'todo' : pendingInFilter.length} (${pendingInFilter.length})`
            }
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(item => (
          <ProductCard
            key={item.id}
            item={item}
            inStore={inStoreIds.has(item.id)}
            price={priceMap.get(item.id) ?? item.priceDefault ?? 0}
            onAdd={handleAdd}
            onRemove={handleRemove}
            onPriceChange={handlePriceChange}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-12">No hay productos en esta liga.</p>
      )}
    </div>
  )
}
