import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner, serviceClient } from '@/lib/api-auth'

export async function PATCH(request: NextRequest) {
  const auth = await requireStoreOwner()
  if (!auth.ok) return auth.response

  const { slug, whatsapp, show_prices } = await request.json()

  const db = serviceClient()

  // If slug is changing, check it's not already taken by another store
  if (slug) {
    const { data: existing } = await db
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .neq('id', auth.storeId)
      .maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'El storecode ya está en uso' }, { status: 409 })
    }
  }

  const updates: Record<string, unknown> = {}
  if (slug        !== undefined) updates.slug        = slug
  if (whatsapp    !== undefined) updates.whatsapp    = whatsapp
  if (show_prices !== undefined) updates.show_prices = show_prices

  const { error } = await db.from('stores').update(updates).eq('id', auth.storeId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If slug changed, sync the internal auth email (storecode@owner.local)
  if (slug) {
    await db.auth.admin.updateUserById(auth.user.id, {
      email: `${slug}@owner.local`,
    })
  }

  return NextResponse.json({ ok: true })
}
