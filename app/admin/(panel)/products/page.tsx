import { createClient } from '@/lib/supabase/server'
import ProductsGrid from './ProductsGrid'

export default async function ProductsListPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id, slug, name, price_default, images, tags,
      league:leagues!league_id (slug),
      club:clubs!club_id (slug)
    `)
    .order('created_at', { ascending: false })

  if (error) console.error('Admin products fetch error:', error)

  const products = (data ?? []).map((row: any) => ({
    id:       row.id,
    slug:     row.slug,
    name:     row.name,
    price:    row.price_default ?? 0,
    category: row.league?.slug ?? 'otros',
    club:     row.club?.slug ?? '',
    images:   row.images ?? [],
    tags:     row.tags ?? [],
  }))

  return <ProductsGrid products={products} />
}
