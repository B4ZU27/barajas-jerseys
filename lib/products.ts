import productsData from '@/data/products.json'
import promotionsData from '@/data/promotions.json'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Category =
  | 'selecciones'
  | 'premier-league'
  | 'la-liga'
  | 'serie-a'
  | 'bundesliga'
  | 'ligue-1'
  | 'mls'
  | 'liga-mx'
  | 'otros'

export interface Product {
  id: string
  slug: string
  name: string
  price: number
  category: string
  club: string
  sizes: string[]
  available: boolean
  description: string
  images: string[]
  tags: string[]
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

// ─── Etiquetas de tags ────────────────────────────────────────────────────────

export const TAG_LABELS: Record<string, string> = {
  'retro':       'Retro',
  'mundialista': 'Mundialistas',
  'destacado':   'Destacados',
}

// ─── Etiquetas de categorías — fuente de verdad para orden y nombres ──────────

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

// ─── Productos ────────────────────────────────────────────────────────────────

const products: Product[] = productsData as Product[]

/** Devuelve todos los productos del catálogo */
export function getAllProducts(): Product[] {
  return products
}

/** Devuelve un producto por su slug, o undefined si no existe */
export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

/** Devuelve todos los productos de una categoría */
export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category)
}

/** Devuelve productos filtrados por club y tag */
export function getProductsByClubAndTag(club: string, tag: string): Product[] {
  return products.filter((p) => p.club === club && p.tags?.includes(tag))
}

/** Devuelve todos los productos que tienen un tag específico */
export function getProductsByTag(tag: string): Product[] {
  return products.filter((p) => p.tags?.includes(tag))
}

/** Devuelve todos los slugs — necesario para generateStaticParams en Next.js */
export function getAllSlugs(): string[] {
  return products.map((p) => p.slug)
}

/**
 * Devuelve solo las categorías que tienen al menos un producto,
 * respetando el orden definido en CATEGORY_LABELS.
 */
export function getActiveCategories(): { slug: string; label: string }[] {
  const present = new Set(products.map((p) => p.category))
  return Object.entries(CATEGORY_LABELS)
    .filter(([slug]) => present.has(slug))
    .map(([slug, label]) => ({ slug, label }))
}

/** Devuelve los tags activos (que tienen al menos un producto) */
export function getActiveTags(): { slug: string; label: string }[] {
  const present = new Set(products.flatMap((p) => p.tags ?? []))
  return Object.entries(TAG_LABELS)
    .filter(([slug]) => present.has(slug))
    .map(([slug, label]) => ({ slug, label }))
}

// ─── Promociones ──────────────────────────────────────────────────────────────

/** Devuelve las promociones activas. Si promotions.json está vacío ({}) devuelve todo inactivo. */
export function getPromotions(): Promotions {
  const p = promotionsData as Partial<Promotions>
  return {
    active: p.active ?? false,
    banner: p.banner ?? '',
    deals: p.deals ?? [],
  }
}
