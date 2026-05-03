'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { uploadFiles } from '@/lib/cloudinary-upload'

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: string; slug: string; name: string; price: number
  category: string; club: string; sizes: string[]
  description: string; images: string[]; tags: string[]; videos: string[]
}

export interface League { id: string; slug: string; name: string }
export interface Club   { slug: string; name: string; leagueId: string | null }

interface NewImage { file: File; preview: string }
interface NewVideo { file: File; preview: string }
type Status       = { type: 'idle' } | { type: 'uploading'; label: string } | { type: 'saving' } | { type: 'success' } | { type: 'error'; message: string }
type DeleteStatus = 'idle' | 'confirm' | 'deleting'

// ── Constantes ────────────────────────────────────────────────────────────────

const ALL_SIZES = ['XS','S','M','L','XL','2XL','3XL','4XL']
const ALL_TAGS  = [
  { slug: 'retro',       label: 'Retro' },
  { slug: 'mundialista', label: 'Mundialista' },
  { slug: 'destacado',   label: 'Destacado' },
  { slug: 'video-only',  label: 'Solo video' },
]

// ── Componente ────────────────────────────────────────────────────────────────

export default function EditForm({
  original,
  leagues,
  clubs,
}: {
  original: AdminProduct
  leagues:  League[]
  clubs:    Club[]
}) {
  const router = useRouter()

  const [name, setName]               = useState(original.name)
  const [price, setPrice]             = useState(String(original.price))
  const [category, setCategory]       = useState(original.category)
  const [club, setClub]               = useState(original.club)
  const [description, setDescription] = useState(original.description ?? '')
  const [sizes, setSizes]             = useState<string[]>(original.sizes)
  const [tags, setTags]               = useState<string[]>(original.tags ?? [])

  const [existingImages, setExistingImages] = useState<string[]>(original.images)
  const [removedIdxs, setRemovedIdxs]       = useState<number[]>([])
  const [newImages, setNewImages]           = useState<NewImage[]>([])

  const [existingVideos, setExistingVideos]     = useState<string[]>(original.videos ?? [])
  const [removedVideoIdxs, setRemovedVideoIdxs] = useState<number[]>([])
  const [newVideos, setNewVideos]               = useState<NewVideo[]>([])

  const [status, setStatus]             = useState<Status>({ type: 'idle' })
  const [deleteStatus, setDeleteStatus] = useState<DeleteStatus>('idle')
  const [dragging, setDragging]         = useState(false)

  const fileInputRef  = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  // Clubs filtrados por la liga seleccionada
  const suggestedClubs = useMemo(() => {
    const league = leagues.find(l => l.slug === category)
    if (!league) return clubs.map(c => c.slug).sort()
    return clubs.filter(c => c.leagueId === league.id).map(c => c.slug).sort()
  }, [category, leagues, clubs])

  // ── Imágenes ─────────────────────────────────────────────────────────────────

  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    setNewImages(prev => [...prev, ...arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }))])
  }, [])

  const toggleRemoveExisting = (idx: number) =>
    setRemovedIdxs(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])

  const removeNew = (idx: number) =>
    setNewImages(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx) })

  // ── Videos ───────────────────────────────────────────────────────────────────

  const addVideoFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('video/'))
    setNewVideos(prev => [...prev, ...arr.map(f => ({ file: f, preview: URL.createObjectURL(f) }))])
  }, [])

  const toggleRemoveVideo = (idx: number) =>
    setRemovedVideoIdxs(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])

  const removeNewVideo = (idx: number) =>
    setNewVideos(prev => { URL.revokeObjectURL(prev[idx].preview); return prev.filter((_, i) => i !== idx) })

  function getCloudinaryPoster(url: string): string {
    if (url.includes('cloudinary.com') && url.includes('/video/upload/')) {
      return url.replace('/video/upload/', '/video/upload/so_0,w_128/').replace(/\.(mp4|mov|webm)$/i, '.jpg')
    }
    return ''
  }

  // ── Toggles ───────────────────────────────────────────────────────────────────

  const toggleSize = (s: string) =>
    setSizes(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  // ── Submit ────────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Imágenes que quedan de las existentes
      const keptImages = existingImages.filter((_, i) => !removedIdxs.includes(i))

      // Subir nuevas imágenes a Cloudinary
      let newImageUrls: string[] = []
      if (newImages.length > 0) {
        setStatus({ type: 'uploading', label: `Subiendo imagen 1 de ${newImages.length}…` })
        newImageUrls = await uploadFiles(
          newImages.map(i => i.file),
          (done, total) => setStatus({ type: 'uploading', label: `Subiendo imagen ${done} de ${total}…` })
        )
      }

      // Videos que quedan + nuevos videos subidos
      const keptVideos = existingVideos.filter((_, i) => !removedVideoIdxs.includes(i))
      let newVideoUrls: string[] = []
      if (newVideos.length > 0) {
        setStatus({ type: 'uploading', label: `Subiendo video 1 de ${newVideos.length}…` })
        newVideoUrls = await uploadFiles(
          newVideos.map(v => v.file),
          (done, total) => setStatus({ type: 'uploading', label: `Subiendo video ${done} de ${total}…` })
        )
      }

      const finalImages = [...keptImages, ...newImageUrls]
      const finalVideos = [...keptVideos, ...newVideoUrls]

      setStatus({ type: 'saving' })
      const res = await fetch('/api/admin/update-product', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalSlug: original.slug,
          name, price, category, club, description, sizes, tags,
          images: finalImages,
          videos: finalVideos,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error')

      setStatus({ type: 'success' })
      setRemovedIdxs([])
      setNewImages([])
      setRemovedVideoIdxs([])
      setNewVideos([])
      setTimeout(() => router.push('/admin/products'), 800)
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
    }
  }

  const handleDelete = async () => {
    setDeleteStatus('deleting')
    try {
      const res = await fetch('/api/admin/delete-product', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: original.slug }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? 'Error al eliminar') }
      router.push('/admin/products')
    } catch (err) {
      setStatus({ type: 'error', message: (err as Error).message })
      setDeleteStatus('idle')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

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
          <button onClick={() => router.back()}
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
            ← Volver
          </button>
          <a href={`/products/${original.slug}`} target="_blank"
            className="text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-black transition-colors">
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

        {/* ── Izquierda ────────────────────────────────────────────────────────── */}
        <div className="space-y-6">

          <Section title="Información básica">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Nombre *</Label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputCls} required />
              </div>
              <div>
                <Label>Precio (MXN) *</Label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} className={inputCls} required />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
            </div>
          </Section>

          <Section title="Clasificación">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Liga / Categoría</Label>
                <select value={category} onChange={e => setCategory(e.target.value)} className={inputCls}>
                  {leagues.map(l => <option key={l.slug} value={l.slug}>{l.name}</option>)}
                  <option value="otros">Otros</option>
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

          {/* Botones guardar / eliminar */}
          <div className="flex gap-3">
            <button type="submit" disabled={status.type === 'uploading' || status.type === 'saving'}
              className="flex-1 py-4 text-sm font-black uppercase tracking-widest text-white transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--blue-primary)' }}>
              {status.type === 'uploading' ? status.label
                : status.type === 'saving' ? 'Guardando…'
                : 'Guardar cambios'}
            </button>

            {deleteStatus === 'idle' && (
              <button type="button" onClick={() => setDeleteStatus('confirm')}
                className="px-5 py-4 text-sm font-black uppercase tracking-widest text-red-600 border border-red-300 hover:bg-red-50 transition-colors">
                Eliminar
              </button>
            )}
            {deleteStatus === 'confirm' && (
              <div className="flex gap-2">
                <button type="button" onClick={() => setDeleteStatus('idle')}
                  className="px-4 py-4 text-sm font-black uppercase tracking-widest border border-gray-300 text-gray-500 hover:border-gray-500 transition-colors">
                  No
                </button>
                <button type="button" onClick={handleDelete}
                  className="px-4 py-4 text-sm font-black uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 transition-colors">
                  ¿Seguro?
                </button>
              </div>
            )}
            {deleteStatus === 'deleting' && (
              <div className="px-5 py-4 text-sm font-black uppercase tracking-widest text-red-400 border border-red-200">
                Eliminando…
              </div>
            )}
          </div>
        </div>

        {/* ── Derecha: imágenes y videos ───────────────────────────────────────── */}
        <div className="space-y-4">

          <Section title={`Imágenes actuales (${existingImages.length})`}>
            {existingImages.length === 0 ? (
              <p className="text-xs text-gray-400">Sin imágenes</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((src, idx) => {
                  const removed = removedIdxs.includes(idx)
                  return (
                    <div key={idx} className="relative group aspect-square bg-gray-100">
                      <Image src={src} alt={`img-${idx}`} fill sizes="128px" className={`object-cover transition-opacity ${removed ? 'opacity-30' : ''}`} />
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
                    <Image src={img.preview} alt={`new-${idx}`} fill sizes="128px" className="object-cover" />
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

          {existingVideos.length > 0 && (
            <Section title={`Videos actuales (${existingVideos.length})`}>
              <div className="grid grid-cols-3 gap-2">
                {existingVideos.map((url, idx) => {
                  const removed = removedVideoIdxs.includes(idx)
                  const poster  = getCloudinaryPoster(url)
                  return (
                    <div key={idx} className={`relative group aspect-square bg-black transition-opacity ${removed ? 'opacity-30' : ''}`}>
                      {poster
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={poster} alt={`video-${idx}`} className="w-full h-full object-cover" />
                        : <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                      }
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ opacity: 0.7 }}><path d="M8 5v14l11-7z"/></svg>
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => toggleRemoveVideo(idx)}
                          className={`text-xs font-bold px-2 py-1 ${removed ? 'bg-green-500 text-white' : 'bg-red-600 text-white'}`}>
                          {removed ? '↩ Restaurar' : '✕ Quitar'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {removedVideoIdxs.length > 0 && (
                <p className="text-xs text-red-500 font-bold">{removedVideoIdxs.length} video(s) se eliminarán al guardar</p>
              )}
            </Section>
          )}

          <Section title="Agregar videos">
            <div onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded cursor-pointer transition-colors py-6 px-4 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">MP4 · Arrastra o haz click</p>
            </div>
            <input ref={videoInputRef} type="file" accept="video/mp4,video/quicktime,video/webm" multiple className="hidden"
              onChange={e => e.target.files && addVideoFiles(e.target.files)} />

            {newVideos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {newVideos.map((v, idx) => (
                  <div key={idx} className="relative group aspect-square bg-black">
                    <video src={v.preview} className="w-full h-full object-cover" muted playsInline preload="metadata" />
                    <span className="absolute top-1 left-1 bg-purple-600 text-white text-[9px] font-bold px-1 py-0.5 uppercase">Nuevo</span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={() => removeNewVideo(idx)}
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

const inputCls = 'w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-black bg-white'
