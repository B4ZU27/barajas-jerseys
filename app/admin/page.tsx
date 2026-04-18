'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import Image from 'next/image'
import productsData from '@/data/products.json'

// ── Datos del catálogo ─────────────────────────────────────────────────────────

const CATEGORIES: { slug: string; label: string }[] = [
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

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
const ALL_TAGS  = [
  { slug: 'retro',       label: 'Retro' },
  { slug: 'mundialista', label: 'Mundialista' },
  { slug: 'destacado',   label: 'Destacado' },
  { slug: 'video-only',  label: 'Solo video' },
]

// ── Helpers ────────────────────────────────────────────────────────────────────

function toSlug(str: string): string {
  return str
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface ImageFile {
  file: File
  preview: string
}

interface VideoFile {
  file: File
  preview: string
}

type Status = { type: 'idle' } | { type: 'loading' } | { type: 'success'; slug: string } | { type: 'error'; message: string }

// ── Componente principal ───────────────────────────────────────────────────────

export default function AdminPage() {
  // Campos del form
  const [name, setName]               = useState('')
  const [slug, setSlug]               = useState('')
  const [slugEdited, setSlugEdited]   = useState(false)
  const [price, setPrice]             = useState('')
  const [category, setCategory]       = useState('selecciones')
  const [club, setClub]               = useState('')
  const [description, setDescription] = useState('')
  const [sizes, setSizes]             = useState<string[]>(['S', 'M', 'L', 'XL', '2XL'])
  const [tags, setTags]               = useState<string[]>([])
  const [available, setAvailable]     = useState(true)
  const [images, setImages]           = useState<ImageFile[]>([])
  const [videos, setVideos]           = useState<VideoFile[]>([])
  const [status, setStatus]           = useState<Status>({ type: 'idle' })
  const [dragging, setDragging]       = useState(false)

  const fileInputRef  = useRef<HTMLInputElement>(null)
  const dropZoneRef   = useRef<HTMLDivElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Clubs sugeridos: los que ya existen en products.json para esta categoría
  const suggestedClubs = useMemo(() => {
    const all = (productsData as { category: string; club: string }[])
    return [...new Set(all.filter(p => p.category === category).map(p => p.club))].sort()
  }, [category])

  // Auto-generar slug cuando cambia name o club
  useEffect(() => {
    if (!slugEdited && name) {
      setSlug(club ? `${club}-${toSlug(name)}` : toSlug(name))
    }
  }, [name, club, slugEdited])

  // ── Imágenes ────────────────────────────────────────────────────────────────

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    const newImages = arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }))
    setImages(prev => [...prev, ...newImages])
  }, [])

  const removeImage = (idx: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      const arr = [...prev]
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return arr
    })
  }

  const addVideoFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('video/'))
    setVideos(prev => [...prev, ...arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }))])
  }, [])

  const removeVideo = (idx: number) => {
    setVideos(prev => {
      URL.revokeObjectURL(prev[idx].preview)
      return prev.filter((_, i) => i !== idx)
    })
  }

  // Drag & drop en la zona
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  // ── Toggle helpers ───────────────────────────────────────────────────────────

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !club || !slug) {
      setStatus({ type: 'error', message: 'Nombre, precio, club y slug son requeridos.' })
      return
    }
    if (images.length === 0 && videos.length === 0) {
      setStatus({ type: 'error', message: 'Agrega al menos una imagen o un video.' })
      return
    }

    setStatus({ type: 'loading' })

    const fd = new FormData()
    fd.append('name', name)
    fd.append('price', price)
    fd.append('category', category)
    fd.append('club', club)
    fd.append('description', description)
    fd.append('slug', slug)
    fd.append('sizes', JSON.stringify(sizes))
    fd.append('tags', JSON.stringify(tags))
    fd.append('available', String(available))
    images.forEach(img => fd.append('images', img.file))
    videos.forEach(v => fd.append('newVideos', v.file))

    try {
      const res  = await fetch('/api/admin/add-product', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
      setStatus({ type: 'success', slug: data.product.slug })
      resetForm()
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
    }
  }

  const resetForm = () => {
    setName(''); setSlug(''); setSlugEdited(false); setPrice('')
    setDescription(''); setSizes(['S', 'M', 'L', 'XL', '2XL']); setTags([])
    setAvailable(true); setImages([]); setVideos([])
  }

  // ── UI helpers ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--blue-deep)' }}>
            Admin — Agregar producto
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Guarda local en DB_jerseys · sube a Cloudinary después</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/admin/products" className="text-xs font-bold uppercase tracking-wider px-3 py-2 border border-gray-300 text-gray-600 hover:border-gray-500 transition-colors">
            Ver productos
          </a>
          <a href="/" className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
            ← Catálogo
          </a>
        </div>
      </div>

      {/* Status banner */}
      {status.type === 'success' && (
        <div className="bg-green-600 text-white px-6 py-3 text-sm font-bold flex items-center justify-between">
          <span>✓ Producto guardado: <code className="font-mono bg-green-700 px-1">{status.slug}</code></span>
          <button onClick={() => setStatus({ type: 'idle' })} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
      {status.type === 'error' && (
        <div className="bg-red-600 text-white px-6 py-3 text-sm font-bold flex items-center justify-between">
          <span>✗ {status.message}</span>
          <button onClick={() => setStatus({ type: 'idle' })} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

        {/* ── Columna izquierda: datos ─────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Sección: Info básica */}
          <Section title="Información básica">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Nombre del producto *</Label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="24-25 Players Argentina Home"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <Label>
                  Slug (auto)
                  {slugEdited && <span className="ml-2 text-amber-500 text-xs">editado manualmente</span>}
                </Label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => { setSlug(e.target.value); setSlugEdited(true) }}
                  placeholder="argentina-24-25-players-home"
                  className={`${inputCls} font-mono text-sm`}
                />
                {!slugEdited && slug && (
                  <p className="text-xs text-gray-400 mt-1">Auto-generado desde club + nombre</p>
                )}
              </div>

              <div>
                <Label>Precio (MXN) *</Label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="800"
                  min={0}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Descripción</Label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Camisa oficial, versión player..."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </Section>

          {/* Sección: Clasificación */}
          <Section title="Clasificación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Categoría *</Label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                  {CATEGORIES.map(c => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Club *</Label>
                <input
                  type="text"
                  value={club}
                  onChange={e => setClub(toSlug(e.target.value))}
                  list="clubs-list"
                  placeholder="nombre-del-club"
                  className={`${inputCls} font-mono text-sm`}
                  required
                />
                <datalist id="clubs-list">
                  {suggestedClubs.map(c => <option key={c} value={c} />)}
                </datalist>
                <p className="text-xs text-gray-400 mt-1">Escribe o elige uno existente</p>
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ALL_TAGS.map(tag => (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() => toggleTag(tag.slug)}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-colors ${
                      tags.includes(tag.slug)
                        ? 'border-transparent text-white'
                        : 'border-gray-300 text-gray-500 bg-white hover:border-gray-400'
                    }`}
                    style={tags.includes(tag.slug) ? { backgroundColor: 'var(--blue-primary)' } : {}}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* Sección: Inventario */}
          <Section title="Inventario">
            <div>
              <Label>Tallas disponibles</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ALL_SIZES.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`w-12 py-2 text-sm font-bold border transition-colors ${
                      sizes.includes(s)
                        ? 'border-transparent text-white'
                        : 'border-gray-300 text-gray-500 bg-white hover:border-gray-400'
                    }`}
                    style={sizes.includes(s) ? { backgroundColor: 'var(--blue-deep)' } : {}}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAvailable(v => !v)}
                className={`relative w-10 h-5 rounded-full transition-colors ${available ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${available ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {available ? 'Disponible' : 'No disponible'}
              </span>
            </div>
          </Section>

          {/* Botón submit */}
          <button
            type="submit"
            disabled={status.type === 'loading'}
            className="w-full py-4 text-sm font-black uppercase tracking-widest text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--blue-primary)' }}
          >
            {status.type === 'loading' ? 'Guardando…' : 'Guardar producto'}
          </button>
        </div>

        {/* ── Columna derecha: imágenes ────────────────────────────────────── */}
        <div className="space-y-4">
          <Section title="Imágenes">

            {/* Zona de drop */}
            <div
              ref={dropZoneRef}
              onClick={() => fileInputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              className={`border-2 border-dashed rounded cursor-pointer transition-colors py-8 px-4 text-center ${
                dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
              }`}
            >
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                {dragging ? 'Suelta aquí' : 'Arrastra o haz click'}
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — múltiples archivos</p>
              <p className="text-xs text-gray-400 mt-1">La primera imagen será el placeholder</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => e.target.files && addFiles(e.target.files)}
            />

            {/* Grid de previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square bg-gray-100">
                    <Image
                      src={img.preview}
                      alt={`Imagen ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    {/* Badge primera */}
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-black text-white text-[9px] font-bold px-1 py-0.5 uppercase">
                        Cover
                      </span>
                    )}
                    {/* Número */}
                    <span className="absolute bottom-1 right-1 bg-black/50 text-white text-[9px] px-1">
                      {idx + 1}
                    </span>
                    {/* Acciones */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx - 1)}
                          className="bg-white text-black text-xs font-bold px-2 py-1 hover:bg-gray-100"
                          title="Mover izquierda"
                        >
                          ←
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="bg-red-600 text-white text-xs font-bold px-2 py-1 hover:bg-red-700"
                      >
                        ✕
                      </button>
                      {idx < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, idx + 1)}
                          className="bg-white text-black text-xs font-bold px-2 py-1 hover:bg-gray-100"
                          title="Mover derecha"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Sección: Videos */}
          <Section title="Videos (opcional)">
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded cursor-pointer transition-colors py-6 px-4 text-center"
            >
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">MP4 · Arrastra o haz click</p>
              <p className="text-xs text-gray-400 mt-1">Se suben a Cloudinary automáticamente</p>
            </div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              multiple
              className="hidden"
              onChange={e => e.target.files && addVideoFiles(e.target.files)}
            />

            {videos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {videos.map((v, idx) => (
                  <div key={idx} className="relative group aspect-square bg-black">
                    <video src={v.preview} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    <span className="absolute top-1 left-1 bg-purple-600 text-white text-[9px] font-bold px-1 py-0.5 uppercase">
                      {idx + 1}
                    </span>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeVideo(idx)}
                        className="bg-red-600 text-white text-xs font-bold px-2 py-1">✕</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Preview card */}
          {(name || images[0]) && (
            <Section title="Preview en catálogo">
              <div className="bg-white border border-gray-200 overflow-hidden">
                <div className="aspect-square bg-gray-100 relative">
                  {images[0] ? (
                    <Image src={images[0].preview} alt="preview" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase tracking-wider">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">{category} · {club}</p>
                  <p className="font-bold text-sm mt-0.5 truncate">{name || '—'}</p>
                  <p className="text-sm font-bold mt-1">${price ? Number(price).toLocaleString('es-MX') : '—'}</p>
                  {tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {tags.map(t => (
                        <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-1.5 py-0.5">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Section>
          )}

          {/* Slug info */}
          {slug && (
            <div className="bg-gray-100 px-3 py-2 text-xs font-mono text-gray-600 break-all">
              <span className="font-bold text-gray-400 uppercase tracking-wider text-[10px] block mb-1">Slug</span>
              {slug}
            </div>
          )}
        </div>

      </form>
    </div>
  )
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

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
