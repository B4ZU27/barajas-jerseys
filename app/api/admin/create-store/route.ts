import { NextRequest, NextResponse } from 'next/server'
import { requireCatalogAdmin, serviceClient } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const auth = await requireCatalogAdmin()
  if (!auth.ok) return auth.response

  const body = await request.json()
  const { name, slug, whatsapp, show_prices, ownerEmail, ownerPhone, ownerPassword, template } = body

  if (!name || !slug || !ownerEmail || !ownerPassword) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  const db = serviceClient()

  // 1. Check slug is not taken
  const { data: existing } = await db.from('stores').select('id').eq('slug', slug).maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'El storecode ya está en uso' }, { status: 409 })
  }

  // 2. Create Supabase Auth user for the store owner
  // Auth email is internal — store owner logs in with storecode, not this email
  const authEmail = `${slug}@owner.local`
  const { data: newUser, error: userErr } = await db.auth.admin.createUser({
    email: authEmail,
    password: ownerPassword,
    email_confirm: true,
    user_metadata: {
      contact_email: ownerEmail ?? '',
      phone: ownerPhone ?? '',
    },
  })
  if (userErr || !newUser.user) {
    return NextResponse.json({ error: userErr?.message ?? 'Error al crear usuario' }, { status: 500 })
  }

  // 3. Create the store
  const { data: store, error: storeErr } = await db
    .from('stores')
    .insert({ slug, name, whatsapp: whatsapp ?? '', show_prices: show_prices ?? false })
    .select('id')
    .single()
  if (storeErr || !store) {
    // Rollback: delete the auth user we just created
    await db.auth.admin.deleteUser(newUser.user.id)
    return NextResponse.json({ error: storeErr?.message ?? 'Error al crear tienda' }, { status: 500 })
  }

  // 4. Link owner to store
  const { error: ownerErr } = await db
    .from('store_owners')
    .insert({ user_id: newUser.user.id, store_id: store.id })
  if (ownerErr) {
    await db.auth.admin.deleteUser(newUser.user.id)
    await db.from('stores').delete().eq('id', store.id)
    return NextResponse.json({ error: ownerErr.message }, { status: 500 })
  }

  // 5. Apply product template
  if (template && template.type !== 'none') {
    let productQuery = db.from('products').select('id, price_default')

    if (template.type === 'all') {
      // no filter
    } else if (template.type === 'league' && template.leagueIds?.length) {
      productQuery = productQuery.in('league_id', template.leagueIds)
    } else if (template.type === 'tag' && template.tags?.length) {
      productQuery = productQuery.overlaps('tags', template.tags)
    }

    const { data: products } = await productQuery
    if (products && products.length > 0) {
      const rows = products.map(p => ({
        store_id: store.id,
        product_id: p.id,
        price: p.price_default,
        available: true,
      }))
      await db.from('store_products').insert(rows)
    }
  }

  return NextResponse.json({ storeId: store.id })
}
