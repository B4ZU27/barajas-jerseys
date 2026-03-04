import productsData from '@/data/products.json'
import promotionsData from '@/data/promotions.json'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type Category = 'selecciones' | 'clubes-internacionales' | 'mexico' | 'retro'

export interface Product {
  id: string
  slug: string
  name: string
  price: number
  category: Category
  club: string
  sizes: string[]
  available: boolean
  description: string
  images: string[]
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
export function getProductsByCategory(category: Category): Product[] {
  return products.filter((p) => p.category === category)
}

/** Devuelve todos los slugs — necesario para generateStaticParams en Next.js */
export function getAllSlugs(): string[] {
  return products.map((p) => p.slug)
}

/** Devuelve todas las categorías únicas presentes en el JSON */
export function getAllCategories(): Category[] {
  const set = new Set(products.map((p) => p.category))
  return Array.from(set)
}

// ─── Promociones ──────────────────────────────────────────────────────────────

const promotions: Promotions = promotionsData as Promotions

/** Devuelve las promociones activas */
export function getPromotions(): Promotions {
  return promotions
}
