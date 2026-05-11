import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner, serviceClient } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const auth = await requireStoreOwner()
  if (!auth.ok) return auth.response

  const body = await request.json()
  // Support single productId or array productIds
  const ids: string[] = body.productIds ?? (body.productId ? [body.productId] : [])

  if (ids.length === 0) {
    return NextResponse.json({ error: 'productId(s) requerido' }, { status: 400 })
  }

  const db = serviceClient()

  // Fetch price_default for all products at once
  const { data: products } = await db
    .from('products')
    .select('id, price_default')
    .in('id', ids)

  const rows = (products ?? []).map(p => ({
    store_id:   auth.storeId,
    product_id: p.id,
    price:      p.price_default ?? 0,
    available:  true,
  }))

  // upsert with ignoreDuplicates handles "already in store" cleanly for bulk ops
  const { error } = await db
    .from('store_products')
    .upsert(rows, { onConflict: 'store_id,product_id', ignoreDuplicates: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
