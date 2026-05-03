import { createClient, createStaticClient } from '@/lib/supabase/server'

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

// ─── Etiquetas ────────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  'selecciones':    'Selecciones',
  'premier-league': 'Premier League',
  'la-liga':        'La Liga',
  'serie-a':        'Serie A',
  'bundesliga':     'Bundesliga',
  'ligue-1':        'Ligue 1',
  'mls':            'MLS',
  'liga-mx':        'Liga MX',
  'otros':          'Otros',
}

export const TAG_LABELS: Record<string, string> = {
  'retro':       'Retro',
  'mundialista': 'Mundialistas',
  'destacado':   'Destacados',
  'video-only':  'Solo video',
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

// Convierte una fila de Supabase al formato Product que usa el frontend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRow(row: any): Product {
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
  }
}

const SELECT = `
  id, slug, name, price_default, sizes, description, images, tags, videos,
  league:leagues!league_id (slug),
  club:clubs!club_id (slug)
`

function forCatalog(list: Product[]): Product[] {
  return list.filter(p => !p.tags?.includes('video-only'))
}

// ─── Funciones públicas ───────────────────────────────────────────────────────

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('products').select(SELECT)
  if (error) { console.error(error); return [] }
  return (data ?? []).map(mapRow)
}

export async function getCatalogProducts(): Promise<Product[]> {
  const all = await getAllProducts()
  return forCatalog(all)
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .eq('slug', slug)
    .single()
  if (error || !data) return undefined
  return mapRow(data)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = await createClient()
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
  if (error) { console.error(error); return [] }
  return forCatalog((data ?? []).map(mapRow))
}

export async function getProductsByTag(tag: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .contains('tags', [tag])
  if (error) { console.error(error); return [] }
  return forCatalog((data ?? []).map(mapRow))
}

export async function getProductsByClubAndTag(club: string, tag: string): Promise<Product[]> {
  const supabase = await createClient()
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
  if (error) { console.error(error); return [] }
  return forCatalog((data ?? []).map(mapRow))
}

export async function getAllSlugs(): Promise<string[]> {
  const supabase = createStaticClient()
  const { data, error } = await supabase.from('products').select('slug')
  if (error) { console.error(error); return [] }
  return (data ?? []).map(r => r.slug)
}

export async function getProductsWithVideos(): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select(SELECT)
    .not('videos', 'eq', '{}')
  if (error) { console.error(error); return [] }
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
  if (error) { console.error(error); return [] }

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

export async function getPromotions(): Promise<Promotions> {
  const storeId = process.env.NEXT_PUBLIC_STORE_ID
  if (!storeId) return { active: false, banner: '', deals: [] }
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .eq('store_id', storeId)
    .single()
  if (error || !data) return { active: false, banner: '', deals: [] }
  return {
    active: data.active ?? false,
    banner: data.banner ?? '',
    deals:  data.deals  ?? [],
  }
}
