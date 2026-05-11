'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { CatalogItem } from './ProductsGrid'

interface Props {
  item:           CatalogItem
  inStore:        boolean
  price:          number
  onAdd:          (id: string, priceDefault: number | null) => void
  onRemove:       (id: string) => void
  onPriceChange:  (id: string, price: number) => void
}

export default function ProductCard({ item, inStore, price, onAdd, onRemove, onPriceChange }: Props) {
  const [adding,   setAdding]   = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [draft,    setDraft]    = useState('')
  const [confirm,  setConfirm]  = useState(false)
  const [removing, setRemoving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ── Add ─────────────────────────────────────────────────── */
  const handleAdd = async () => {
    setAdding(true)
    const res = await fetch('/api/admin/store-products/add', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productIds: [item.id] }),
    })
    if (res.ok) onAdd(item.id, item.priceDefault)
    setAdding(false)
  }

  /* ── Price edit ───────────────────────────────────────────── */
  const startEdit = () => {
    setDraft(String(price))
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const savePrice = async () => {
    const newPrice = Number(draft)
    if (isNaN(newPrice) || newPrice < 0) { setEditing(false); return }
    setSaving(true)
    const res = await fetch('/api/admin/store-products/price', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId: item.id, price: newPrice }),
    })
    if (res.ok) onPriceChange(item.id, newPrice)
    setEditing(false)
    setSaving(false)
  }

  /* ── Remove ───────────────────────────────────────────────── */
  const handleRemove = async () => {
    setRemoving(true)
    const res = await fetch('/api/admin/store-products/remove', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId: item.id }),
    })
    if (res.ok) { onRemove(item.id); setConfirm(false) }
    setRemoving(false)
  }

  return (
    <div className={`bg-white border flex flex-col transition-colors ${inStore ? 'border-black' : 'border-gray-200'}`}>

      {/* In-store badge */}
      {inStore && (
        <div className="px-3 py-1 border-b border-black text-center">
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--blue-deep)' }}>
            En tienda
          </span>
        </div>
      )}

      {/* Image — click goes to detail page */}
      <Link href={`/admin/my-store/products/${item.id}`} className="block relative aspect-square bg-gray-100">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="200px" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs">Sin imagen</div>
        )}
      </Link>

      {/* Info + actions */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">
          {item.league ?? '—'}
        </p>
        <Link
          href={`/admin/my-store/products/${item.id}`}
          className="text-xs font-black uppercase tracking-wider leading-tight hover:underline"
        >
          {item.name}
        </Link>

        <div className="mt-auto pt-2 border-t border-gray-100">
          {inStore ? (
            <>
              {/* Editable price */}
              <div className="mb-2">
                {editing ? (
                  <input
                    ref={inputRef}
                    type="number"
                    min="0"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter')  savePrice()
                      if (e.key === 'Escape') setEditing(false)
                    }}
                    onBlur={savePrice}
                    disabled={saving}
                    className="w-full border border-black px-2 py-1 text-xs font-black text-center focus:outline-none"
                  />
                ) : (
                  <button onClick={startEdit} className="text-sm font-black text-black hover:underline" title="Editar precio">
                    ${price.toLocaleString('es-MX')}
                    <span className="text-[9px] font-normal text-gray-400 ml-1">editar</span>
                  </button>
                )}
              </div>

              {confirm ? (
                <div className="flex gap-1.5">
                  <button onClick={handleRemove} disabled={removing}
                    className="flex-1 text-[10px] font-bold uppercase text-white bg-red-600 py-1 disabled:opacity-50">
                    {removing ? '…' : 'Quitar'}
                  </button>
                  <button onClick={() => setConfirm(false)}
                    className="flex-1 text-[10px] font-bold uppercase text-gray-500 border border-gray-300 py-1">
                    No
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirm(true)}
                  className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-red-600 transition-colors">
                  Quitar de tienda
                </button>
              )}
            </>
          ) : (
            <>
              {item.priceDefault != null && (
                <p className="text-xs text-gray-400 mb-2">${item.priceDefault.toLocaleString('es-MX')}</p>
              )}
              <button onClick={handleAdd} disabled={adding}
                className="w-full text-[10px] font-bold uppercase tracking-wider text-white py-1.5 disabled:opacity-50 transition-colors"
                style={{ backgroundColor: adding ? 'var(--blue-primary)' : 'var(--blue-deep)' }}>
                {adding ? 'Agregando…' : '+ Agregar'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
