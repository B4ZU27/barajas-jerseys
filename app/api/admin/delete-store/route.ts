import { NextRequest, NextResponse } from 'next/server'
import { requireCatalogAdmin, serviceClient } from '@/lib/api-auth'

export async function DELETE(request: NextRequest) {
  const auth = await requireCatalogAdmin()
  if (!auth.ok) return auth.response

  const { storeId } = await request.json()
  if (!storeId) {
    return NextResponse.json({ error: 'storeId requerido' }, { status: 400 })
  }

  const db = serviceClient()

  // Get the store owner's user_id before deleting
  const { data: ownerRow } = await db
    .from('store_owners')
    .select('user_id')
    .eq('store_id', storeId)
    .maybeSingle()

  // Delete the store (cascades to store_products, store_owners, promotions via RLS/FK)
  const { error: storeErr } = await db.from('stores').delete().eq('id', storeId)
  if (storeErr) {
    return NextResponse.json({ error: storeErr.message }, { status: 500 })
  }

  // Delete the auth user so they can no longer log in
  if (ownerRow?.user_id) {
    await db.auth.admin.deleteUser(ownerRow.user_id)
  }

  return NextResponse.json({ ok: true })
}
