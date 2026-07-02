import { createStaticClient } from '@/lib/supabase/server'
import { CATEGORY_LABELS, TAG_LABELS } from './constants'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string
  slug: string
  name: string
  price: number
  category: string   // league slug  e.g. 'la-liga'
  club: string       // club slug    e.g. 'real-madrid'
  sizes: string[]
  available: boolean
  description: string
  images: string[]
  tags: string[]
  videos?: string[]
  year?: number      // extraído de metadata.year
  story?: string     // extraído de metadata.story
  metadata?: Record<string, unknown>   // campo libre JSONB para cualquier dato extra
}

export interface ArchiveClub {
  slug: string
  count: number
  minYear: number
  maxYear: number
  coverImage?: string
}

export interface Deal {
  quantity: number
  total: number
}

export interface Promotions {
  active: boolean
  banner: string
  deals: Deal[]
}

// ─── Etiquetas (re-exportadas desde lib/constants para uso en Server Components) ─
export { CATEGORY_LABELS, TAG_LABELS } from './constants'

// ─── Helpers internos ─────────────────────────────────────────────────────────

// Convierte una fila de Supabase al formato Product que usa el frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Product {
  const meta = row.metadata ?? {}
  return {
    id:          row.id,
    slug:        row.slug,
    name:        row.name,
    price:       row.price_default ?? 0,
    category:    row.league?.slug  ?? 'otros',
    club:        row.club?.slug    ?? '',
    sizes:       row.sizes         ?? [],
    available:   true,
    description: row.description   ?? '',
    images:      row.images        ?? [],
    tags:        row.tags          ?? [],
    videos:      row.videos?.length > 0 ? row.videos : undefined,
    year:        meta.year         ?? undefined,
    story:       meta.story        ?? undefined,
    metadata:    meta,
  }
}

const SELECT = `
  id, slug, name, price_default, sizes, description, images, tags, videos, metadata,
  league:leagues!league_id (slug),
  club:clubs!club_id (slug)
`

function forCatalog(list: Product[]): Product[] {
  return list.filter(p => !p.tags?.includes('video-only'))
}

function logError(fn: string, error: unknown) {
  const e = error as { message?: string; code?: string; details?: string }
  console.error(`[products.ts / ${fn}]`, e?.message ?? e?.code ?? JSON.stringify(error))
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createStaticClient()
  const { data, error } = await supabase.from('products').select(SELECT)
  if (error) { logError('getAllProducts', error); return [] }
  return (data ?? []).map(mapRow)
}

export async function getCatalogProducts(): Promise<Product[]> {
  const all = await getAllProducts()
  return forCatalog(all)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .eq('slug', slug)
    .single()
  if (error || !data) return undefined
  return mapRow(data)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = createStaticClient()
  const { data: league } = await supabase
    .from('leagues')
    .select('id')
    .eq('slug', category)
    .single()
  if (!league) return []
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .eq('league_id', league.id)
  if (error) { logError('query', error); return [] }
  return forCatalog((data ?? []).map(mapRow))
}

export async function getProductsByTag(tag: string): Promise<Product[]> {
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .contains('tags', [tag])
  if (error) { logError('query', error); return [] }
  return forCatalog((data ?? []).map(mapRow))
}

export async function getProductsByClubAndTag(club: string, tag: string): Promise<Product[]> {
  const supabase = createStaticClient()
  const { data: clubRow } = await supabase
    .from('clubs')
    .select('id')
    .eq('slug', club)
    .single()
  if (!clubRow) return []
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .eq('club_id', clubRow.id)
    .contains('tags', [tag])
  if (error) { logError('query', error); return [] }
  return forCatalog((data ?? []).map(mapRow))
}

export async function getAllSlugs(): Promise<string[]> {
  const supabase = createStaticClient()
  const { data, error } = await supabase.from('products').select('slug')
  if (error) { logError('query', error); return [] }
  return (data ?? []).map(r => r.slug)
}

export async function getProductsWithVideos(): Promise<Product[]> {
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .not('videos', 'eq', '{}')
  if (error) { logError('getProductsWithVideos', error); return [] }
  return (data ?? []).map(mapRow).filter(p => p.videos && p.videos.length > 0)
}

export async function getActiveCategories(): Promise<{ slug: string; label: string }[]> {
  const supabase = createStaticClient()

  // IDs de ligas que tienen al menos un producto
  const { data: used } = await supabase
    .from('products')
    .select('league_id')
  const usedIds = new Set((used ?? []).map(r => r.league_id).filter(Boolean))

  // Traer ligas en orden
  const { data, error } = await supabase
    .from('leagues')
    .select('id, slug, name')
    .order('sort_order')
  if (error) { logError('query', error); return [] }

  return (data ?? [])
    .filter(l => usedIds.has(l.id))
    .map(l => ({ slug: l.slug, label: CATEGORY_LABELS[l.slug] ?? l.name }))
}

export async function getActiveTags(): Promise<{ slug: string; label: string }[]> {
  const supabase = createStaticClient()
  const { data } = await supabase.from('products').select('tags')
  const present = new Set((data ?? []).flatMap(r => r.tags ?? []))
  return Object.entries(TAG_LABELS)
    .filter(([slug]) => present.has(slug))
    .map(([slug, label]) => ({ slug, label }))
}

// ─── El Archivo ───────────────────────────────────────────────────────────────

/*
  Devuelve todos los clubes que tienen al menos 1 producto con año registrado.
  Agrupa en JavaScript porque Supabase SDK no hace GROUP BY nativo.
  Ordenado por cantidad de camisas (los más ricos primero).
*/
export async function getArchiveClubs(): Promise<ArchiveClub[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('products')
    .select('metadata, images, club:clubs!club_id(slug)')
    .not('metadata->>year', 'is', null)

  if (!data || data.length === 0) return []

  const map = new Map<string, { count: number; years: number[]; cover?: string }>()
  for (const row of data) {
    const slug = (row.club as any)?.slug ?? 'otros'
    const year = Number((row.metadata as any)?.year)
    if (!year) continue
    if (!map.has(slug)) map.set(slug, { count: 0, years: [] })
    const entry = map.get(slug)!
    entry.count++
    entry.years.push(year)
    if (!entry.cover) entry.cover = (row.images as string[])?.[0]
  }

  return Array.from(map.entries())
    .map(([slug, { count, years, cover }]) => ({
      slug,
      count,
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
      coverImage: cover,
    }))
    .sort((a, b) => b.count - a.count)
}

/*
  Devuelve los productos de un club que tienen año registrado,
  ordenados de más antiguo a más reciente.
  Para la vista de timeline de El Archivo.
*/
export async function getProductsByClubForArchive(clubSlug: string): Promise<Product[]> {
  const supabase = createStaticClient()

  const { data: clubRow } = await supabase
    .from('clubs')
    .select('id')
    .eq('slug', clubSlug)
    .maybeSingle()

  if (!clubRow) return []

  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .eq('club_id', clubRow.id)
    .not('metadata->>year', 'is', null)

  if (error) { logError('getProductsByClubForArchive', error); return [] }
  return (data ?? []).map(mapRow).sort((a, b) => (a.year ?? 0) - (b.year ?? 0))
}

export async function getPromotions(storeId?: string): Promise<Promotions> {
  const id = storeId ?? process.env.NEXT_PUBLIC_STORE_ID
  if (!id) return { active: false, banner: '', deals: [] }
  const supabase = createStaticClient()
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('store_id', id)
    .single()
  if (error || !data) return { active: false, banner: '', deals: [] }
  return {
    active: data.active ?? false,
    banner: data.banner ?? '',
    deals:  data.deals  ?? [],
  }
}
