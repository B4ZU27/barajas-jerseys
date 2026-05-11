import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner, serviceClient } from '@/lib/api-auth'

export async function DELETE(request: NextRequest) {
  const auth = await requireStoreOwner()
  if (!auth.ok) return auth.response

  const { productId } = await request.json()
  if (!productId) {
    return NextResponse.json({ error: 'productId requerido' }, { status: 400 })
  }

  const db = serviceClient()
  const { error } = await db
    .from('store_products')
    .delete()
    .eq('store_id', auth.storeId)
    .eq('product_id', productId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
