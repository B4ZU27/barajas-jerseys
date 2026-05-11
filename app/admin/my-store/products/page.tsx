import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/api-auth'
import ProductsGrid from './ProductsGrid'

export default async function MyProductsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Service role to bypass RLS
  const db = serviceClient()
  const { data: ownership } = await db
    .from('store_owners')
    .select('store_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!ownership) redirect('/admin/login')

  // Fetch master catalog + store products in parallel
  const [{ data: allProducts }, { data: storeProducts }] = await Promise.all([
    db.from('products')
      .select('id, name, price_default, images, leagues(id, name)')
      .order('name'),
    db.from('store_products')
      .select('product_id, price')
      .eq('store_id', ownership.store_id),
  ])

  // Build unified array: every master product + in-store status + custom price
  const storeMap = new Map((storeProducts ?? []).map(sp => [sp.product_id, sp]))

  const items = (allProducts ?? []).map(p => {
    const l = p.leagues as any
    const sp = storeMap.get(p.id)
    return {
      id:            p.id,
      name:          p.name,
      priceDefault:  p.price_default ?? null,
      image:         (p.images as string[] | null)?.[0] ?? null,
      league:        l?.name   ?? null,
      leagueId:      l?.id     ?? null,
      inStore:       !!sp,
      customPrice:   sp?.price ?? null,
    }
  })

  // Unique leagues for filters
  const leagueMap = new Map<string, { id: string; name: string }>()
  for (const item of items) {
    if (item.leagueId && item.league) leagueMap.set(item.leagueId, { id: item.leagueId, name: item.league })
  }
  const leagues = [...leagueMap.values()]

  const inStoreCount = items.filter(i => i.inStore).length

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--blue-deep)' }}>
          Catálogo
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {items.length} productos · {inStoreCount} en tu tienda
        </p>
      </div>
      <ProductsGrid items={items} leagues={leagues} />
    </div>
  )
}
