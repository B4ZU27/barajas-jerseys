import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import EditForm from './EditForm'

export default async function EditProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const [productRes, leaguesRes, clubsRes] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id, slug, name, price_default, sizes, description, images, tags, videos,
        league:leagues!league_id (id, slug, name),
        club:clubs!club_id (id, slug, name)
      `)
      .eq('slug', slug)
      .single(),

    supabase
      .from('leagues')
      .select('id, slug, name')
      .order('sort_order'),

    supabase
      .from('clubs')
      .select('slug, name, league_id')
      .order('slug'),
  ])

  if (productRes.error || !productRes.data) notFound()

  const row = productRes.data as any

  const product = {
    id:          row.id,
    slug:        row.slug,
    name:        row.name,
    price:       row.price_default ?? 0,
    category:    row.league?.slug ?? 'otros',
    club:        row.club?.slug ?? '',
    sizes:       row.sizes ?? [],
    description: row.description ?? '',
    images:      row.images ?? [],
    tags:        row.tags ?? [],
    videos:      row.videos ?? [],
  }

  const leagues = (leaguesRes.data ?? []).map((l: any) => ({
    id:   l.id,
    slug: l.slug,
    name: l.name,
  }))

  const clubs = (clubsRes.data ?? []).map((c: any) => ({
    slug:     c.slug,
    name:     c.name,
    leagueId: c.league_id ?? null,
  }))

  return <EditForm original={product} leagues={leagues} clubs={clubs} />
}
