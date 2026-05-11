import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/api-auth'
import ProductDetail from './ProductDetail'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const db = serviceClient()
  const { data: ownership } = await db
    .from('store_owners')
    .select('store_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!ownership) redirect('/admin/login')

  // Fetch the product
  const { data: product } = await db
    .from('products')
    .select('id, name, price_default, images, leagues(id, name)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const l = product.leagues as any

  // Check if product is in this store
  const { data: sp } = await db
    .from('store_products')
    .select('price')
    .eq('store_id', ownership.store_id)
    .eq('product_id', id)
    .maybeSingle()

  // Prev / Next by alphabetical name
  const [{ data: prevRow }, { data: nextRow }] = await Promise.all([
    db.from('products').select('id').lt('name', product.name).order('name', { ascending: false }).limit(1).maybeSingle(),
    db.from('products').select('id').gt('name', product.name).order('name', { ascending: true  }).limit(1).maybeSingle(),
  ])

  return (
    <ProductDetail
      product={{
        id:           product.id,
        name:         product.name,
        priceDefault: product.price_default ?? null,
        images:       (product.images as string[] | null) ?? [],
        league:       l?.name ?? null,
      }}
      inStore={!!sp}
      customPrice={sp?.price ?? null}
      prevId={prevRow?.id ?? null}
      nextId={nextRow?.id ?? null}
    />
  )
}
