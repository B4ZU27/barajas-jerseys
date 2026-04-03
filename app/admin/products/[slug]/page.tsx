'use client'

import { useState, useRef, useCallback, useEffect, useMemo, use } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import productsData from '@/data/products.json'

// ── Catálogo ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { slug: 'selecciones',    label: 'Selecciones' },
  { slug: 'premier-league', label: 'Premier League' },
  { slug: 'la-liga',        label: 'La Liga' },
  { slug: 'serie-a',        label: 'Serie A' },
  { slug: 'bundesliga',     label: 'Bundesliga' },
  { slug: 'ligue-1',        label: 'Ligue 1' },
  { slug: 'liga-mx',        label: 'Liga MX' },
  { slug: 'mls',            label: 'MLS' },
  { slug: 'otros',          label: 'Otros' },
]

const CLUBS_BY_CATEGORY: Record<string, string[]> = {
  'selecciones':    ['algeria','argentina','belgium','brazil','canada','colombia','croatia','england','france','germany','italy','japan','mexico','morocco','netherlands','norway','portugal','scotland','senegal','spain','switzerland','uruguay'],
  'premier-league': ['arsenal','chelsea','leeds','liverpool','manchester-united','tottenham'],
  'la-liga':        ['atletico-madrid','barcelona','real-betis','real-madrid','valencia'],
  'serie-a':        ['ac-milan','fiorentina','inter-milan','juventus','lazio','napoli','roma'],
  'bundesliga':     ['bayer-leverkusen','bayern-munich','borussia-dortmund'],
  'ligue-1':        ['lyon','marseille','psg'],
  'liga-mx':        ['america','atlas','chivas','cruz-azul','monterrey','necaxa','pachuca','pumas','tigres','toluca'],
  'mls':            ['dc-united','la-galaxy','seattle-sounders'],
  'otros':          ['otros','sin-identificar'],
}

const ALL_SIZES = ['XS','S','M','L','XL','2XL','3XL','4XL']
const ALL_TAGS  = [
  { slug: 'retro',       label: 'Retro' },
  { slug: 'mundialista', label: 'Mundialista' },
  { slug: 'destacado',   label: 'Destacado' },
]

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Product {
  id: string; slug: string; name: string; price: number
  category: string; club: string; sizes: string[]; available: boolean
  description: string; images: string[]; tags: string[]
}

interface NewImage { file: File; preview: string }

type Status = { type: 'idle' } | { type: 'loading' } | { type: 'success' } | { type: 'error'; message: string }

// ── Página ────────────────────────────────────────────────────────────────────

export default function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: paramSlug } = use(params)
  const router = useRouter()
  const original = (productsData as Product[]).find(p => p.slug === paramSlug)

  if (!original) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-bold">Producto no encontrado</p>
          <button onClick={() => router.back()} className="mt-4 text-xs text-blue-600 underline">Volver</button>
        </div>
      </div>
    )
  }

  return <EditForm original={original} />
}

function EditForm({ original }: { original: Product }) {
  const router = useRouter()

  const [name, setName]               = useState(original.name)
  const [price, setPrice]             = useState(String(original.price))
  const [category, setCategory]       = useState(original.category)
  const [club, setClub]               = useState(original.club)
  const [description, setDescription] = useState(original.description ?? '')
  const [sizes, setSizes]             = useState<string[]>(original.sizes)
  const [tags, setTags]               = useState<string[]>(original.tags ?? [])
  const [available, setAvailable]     = useState(original.available)

  // Imágenes existentes (las que vienen del producto)
  const [existingImages, setExistingImages] = useState<string[]>(original.images)
  const [removedIdxs, setRemovedIdxs]       = useState<number[]>([])

  // Nuevas imágenes a agregar
  const [newImages, setNewImages] = useState<NewImage[]>([])
  const [status, setStatus]       = useState<Status>({ type: 'idle' })
  const [dragging, setDragging]   = useState(false)
  const fileInputRef              = useRef<HTMLInputElement>(null)

  // Clubs sugeridos desde products.json para esta categoría
  const suggestedClubs = useMemo(() => {
    const all = productsData as { category: string; club: string }[]
    return [...new Set(all.filter(p => p.category === category).map(p => p.club))].sort()
  }, [category])

  // ── Imágenes ────────────────────────────────────────────────────────────────

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    setNewImages(prev => [...prev, ...arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }))])
  }, [])

  const toggleRemoveExisting = (idx: number) => {
    setRemovedIdxs(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const removeNew = (idx: number) => {
    setNewImages(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  // ── Toggles ──────────────────────────────────────────────────────────────────

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ type: 'loading' })

    const fd = new FormData()
    fd.append('originalSlug', original.slug)
    fd.append('name', name)
    fd.append('price', price)
    fd.append('category', category)
    fd.append('club', club)
    fd.append('description', description)
    fd.append('available', String(available))
    fd.append('sizes', JSON.stringify(sizes))
    fd.append('tags', JSON.stringify(tags))
    if (removedIdxs.length > 0) fd.append('removeImages', removedIdxs.join(','))
    newImages.forEach(img => fd.append('newImages', img.file))

    try {
      const res  = await fetch('/api/admin/update-product', { method: 'PATCH', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')
      setStatus({ type: 'success' })
      setRemovedIdxs([])
      setNewImages([])
      // Volver a la lista después de 800ms
      setTimeout(() => router.push('/admin/products'), 800)
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--blue-deep)' }}>
            Editar producto
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">{original.slug}</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
            ← Volver
          </button>
          <a href={`/products/${original.slug}`} target="_blank" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
            Ver en catálogo ↗
          </a>
        </div>
      </div>

      {/* Status */}
      {status.type === 'success' && (
        <div className="bg-green-600 text-white px-6 py-3 text-sm font-bold">✓ Cambios guardados</div>
      )}
      {status.type === 'error' && (
        <div className="bg-red-600 text-white px-6 py-3 text-sm font-bold flex items-center justify-between">
          <span>✗ {status.message}</span>
          <button onClick={() => setStatus({ type: 'idle' })}>✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">

        {/* ── Izquierda ──────────────────────────────────────────────────────── */}
        <div className="space-y-6">

          <Section title="Información básica">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Nombre *</Label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className={inputCls} required />
              </div>
              <div>
                <Label>Precio (MXN) *</Label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)}
                  min={0} className={inputCls} required />
              </div>
              <div>
                <Label>Disponibilidad</Label>
                <button type="button" onClick={() => setAvailable(v => !v)}
                  className="flex items-center gap-3 mt-1">
                  <span className={`relative w-10 h-5 rounded-full transition-colors ${available ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </span>
                  <span className="text-sm font-medium text-gray-700">{available ? 'Disponible' : 'Agotado'}</span>
                </button>
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <textarea value={description} onChange={e => setDescription(e.target.value)}
                rows={3} className={`${inputCls} resize-none`} />
            </div>
          </Section>

          <Section title="Clasificación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Categoría</Label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <Label>Club</Label>
                <input
                  type="text"
                  value={club}
                  onChange={e => setClub(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  list="clubs-list-edit"
                  placeholder="nombre-del-club"
                  className={`${inputCls} font-mono text-sm`}
                />
                <datalist id="clubs-list-edit">
                  {suggestedClubs.map(c => <option key={c} value={c} />)}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">Escribe o elige uno existente</p>
              </div>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ALL_TAGS.map(tag => (
                  <button key={tag.slug} type="button" onClick={() => toggleTag(tag.slug)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                      tags.includes(tag.slug) ? 'border-transparent text-white' : 'border-gray-300 text-gray-500 bg-white hover:border-gray-400'
                    }`}
                    style={tags.includes(tag.slug) ? { backgroundColor: 'var(--blue-primary)' } : {}}>
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          <Section title="Tallas">
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map(s => (
                <button key={s} type="button" onClick={() => toggleSize(s)}
                  className={`w-12 py-2 text-sm font-bold border transition-colors ${
                    sizes.includes(s) ? 'border-transparent text-white' : 'border-gray-300 text-gray-500 bg-white hover:border-gray-400'
                  }`}
                  style={sizes.includes(s) ? { backgroundColor: 'var(--blue-deep)' } : {}}>
                  {s}
                </button>
              ))}
            </div>
          </Section>

          <button type="submit" disabled={status.type === 'loading'}
            className="w-full py-4 text-sm font-black uppercase tracking-widest text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--blue-primary)' }}>
            {status.type === 'loading' ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>

        {/* ── Derecha: imágenes ───────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Imágenes existentes */}
          <Section title={`Imágenes actuales (${existingImages.length})`}>
            {existingImages.length === 0 ? (
              <p className="text-xs text-gray-400">Sin imágenes</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((src, idx) => {
                  const removed = removedIdxs.includes(idx)
                  return (
                    <div key={idx} className="relative group aspect-square bg-gray-100">
                      <Image src={src} alt={`img-${idx}`} fill className={`object-cover transition-opacity ${removed ? 'opacity-30' : ''}`} />
                      {idx === 0 && !removed && (
                        <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-bold px-1 py-0.5 uppercase">Cover</span>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => toggleRemoveExisting(idx)}
                          className={`text-xs font-bold px-2 py-1 ${removed ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}>
                          {removed ? '↩ Restaurar' : '✕ Quitar'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {removedIdxs.length > 0 && (
              <p className="text-xs text-red-500 font-bold">{removedIdxs.length} imagen(es) se eliminarán al guardar</p>
            )}
          </Section>

          {/* Agregar nuevas */}
          <Section title="Agregar imágenes">
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              className={`border-2 border-dashed rounded cursor-pointer transition-colors py-6 px-4 text-center ${
                dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                {dragging ? 'Suelta aquí' : 'Arrastra o haz click'}
              </p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => e.target.files && addFiles(e.target.files)} />

            {newImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {newImages.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square bg-gray-100">
                    <Image src={img.preview} alt={`new-${idx}`} fill className="object-cover" />
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1 py-0.5 uppercase">Nueva</span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeNew(idx)}
                        className="bg-red-600 text-white text-xs font-bold px-2 py-1">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

      </form>
    </div>
  )
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 p-5 space-y-4">
      <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">{title}</h2>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">{children}</label>
}

const inputCls = 'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white'
