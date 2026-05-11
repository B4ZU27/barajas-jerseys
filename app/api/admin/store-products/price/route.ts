import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner, serviceClient } from '@/lib/api-auth'

export async function PATCH(request: NextRequest) {
  const auth = await requireStoreOwner()
  if (!auth.ok) return auth.response

  const { productId, price } = await request.json()
  if (!productId || price === undefined) {
    return NextResponse.json({ error: 'productId y price requeridos' }, { status: 400 })
  }

  const db = serviceClient()
  const { error } = await db
    .from('store_products')
    .update({ price: Number(price) })
    .eq('store_id', auth.storeId)
    .eq('product_id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
