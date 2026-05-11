'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface Props {
  product: {
    id:           string
    name:         string
    priceDefault: number | null
    images:       string[]
    league:       string | null
  }
  inStore:     boolean
  customPrice: number | null
  prevId:      string | null
  nextId:      string | null
}

export default function ProductDetail({ product, inStore: initialInStore, customPrice, prevId, nextId }: Props) {
  const router = useRouter()

  const [imgIndex, setImgIndex] = useState(0)
  const [inStore,  setInStore]  = useState(initialInStore)
  const [price,    setPrice]    = useState(customPrice ?? product.priceDefault ?? 0)
  const [adding,   setAdding]   = useState(false)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [draft,    setDraft]    = useState('')
  const [confirm,  setConfirm]  = useState(false)
  const [removing, setRemoving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const images = product.images.length > 0 ? product.images : []

  /* ── Swipe detection ──────────────────────────────────────── */
  const touchStartX = useRef<number>(0)
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd   = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) < 60) return
    if (dx < 0 && nextId) router.push(`/admin/my-store/products/${nextId}`)
    if (dx > 0 && prevId) router.push(`/admin/my-store/products/${prevId}`)
  }

  /* ── Add ─────────────────────────────────────────────────── */
  const handleAdd = async () => {
    setAdding(true)
    const res = await fetch('/api/admin/store-products/add', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productIds: [product.id] }),
    })
    if (res.ok) {
      setPrice(product.priceDefault ?? 0)
      setInStore(true)
    }
    setAdding(false)
  }

  /* ── Price ───────────────────────────────────────────────── */
  const startEdit = () => {
    setDraft(String(price))
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }

  const savePrice = async () => {
    const n = Number(draft)
    if (isNaN(n) || n < 0) { setEditing(false); return }
    setSaving(true)
    const res = await fetch('/api/admin/store-products/price', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId: product.id, price: n }),
    })
    if (res.ok) setPrice(n)
    setEditing(false)
    setSaving(false)
  }

  /* ── Remove ──────────────────────────────────────────────── */
  const handleRemove = async () => {
    setRemoving(true)
    const res = await fetch('/api/admin/store-products/remove', {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ productId: product.id }),
    })
    if (res.ok) { setInStore(false); setConfirm(false) }
    setRemoving(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white">
        <button
          onClick={() => router.back()}
          className="text-[10px] font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors"
        >
          ← Volver
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => prevId && router.push(`/admin/my-store/products/${prevId}`)}
            disabled={!prevId}
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border border-gray-200 text-gray-500 hover:border-black hover:text-black disabled:opacity-30 transition-colors"
          >
            ← Ant
          </button>
          <button
            onClick={() => nextId && router.push(`/admin/my-store/products/${nextId}`)}
            disabled={!nextId}
            className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 border border-gray-200 text-gray-500 hover:border-black hover:text-black disabled:opacity-30 transition-colors"
          >
            Sig →
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 overflow-auto"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="max-w-2xl mx-auto p-6 flex flex-col gap-8">

          {/* Main image with thumbnail strip */}
          <div>
            {/* Main image */}
            <div className="relative aspect-square bg-gray-100 w-full">
              {images[imgIndex] ? (
                <Image
                  src={images[imgIndex]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 672px"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
                  Sin imagen
                </div>
              )}

              {/* Swipe hint on mobile */}
              {(prevId || nextId) && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 sm:hidden">
                  {prevId && <span className="text-white text-xs bg-black/40 px-2 py-0.5">← swipe</span>}
                  {nextId && <span className="text-white text-xs bg-black/40 px-2 py-0.5">swipe →</span>}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`relative shrink-0 w-16 h-16 border-2 transition-colors ${
                      i === imgIndex ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
                {product.league ?? '—'}
              </p>
              <h1 className="text-xl font-black uppercase tracking-widest leading-tight">
                {product.name}
              </h1>
              {product.priceDefault != null && (
                <p className="text-sm text-gray-400 mt-1">
                  Precio base: ${product.priceDefault.toLocaleString('es-MX')}
                </p>
              )}
            </div>

            {/* Store status + actions */}
            <div className={`border p-4 flex flex-col gap-3 ${inStore ? 'border-black' : 'border-gray-200'}`}>
              {inStore ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--blue-deep)' }}>
                      En tu tienda
                    </span>
                    {/* Editable price */}
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">$</span>
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
                          className="w-28 border border-black px-2 py-1 text-sm font-black text-right focus:outline-none"
                        />
                      </div>
                    ) : (
                      <button
                        onClick={startEdit}
                        className="text-lg font-black text-black hover:underline"
                        title="Toca para editar el precio"
                      >
                        ${price.toLocaleString('es-MX')}
                        <span className="text-[9px] font-normal text-gray-400 ml-1">editar</span>
                      </button>
                    )}
                  </div>

                  {confirm ? (
                    <div className="flex gap-2">
                      <button onClick={handleRemove} disabled={removing}
                        className="flex-1 py-2 text-xs font-bold uppercase text-white bg-red-600 disabled:opacity-50">
                        {removing ? 'Quitando…' : 'Sí, quitar'}
                      </button>
                      <button onClick={() => setConfirm(false)}
                        className="flex-1 py-2 text-xs font-bold uppercase text-gray-600 border border-gray-300">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirm(true)}
                      className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-red-600 transition-colors text-left">
                      Quitar de mi tienda
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="text-xs text-gray-400">Este producto no está en tu tienda todavía.</p>
                  <button
                    onClick={handleAdd}
                    disabled={adding}
                    className="py-3 text-sm font-black uppercase tracking-widest text-white disabled:opacity-50 transition-colors"
                    style={{ backgroundColor: adding ? 'var(--blue-primary)' : 'var(--blue-deep)' }}
                  >
                    {adding ? 'Agregando…' : '+ Agregar a mi tienda'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
