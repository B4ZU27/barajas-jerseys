import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function slugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function PATCH(request: NextRequest) {
  const { requireAuth } = await import('@/lib/api-auth')
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const body = await request.json()
  const { originalSlug, name, price, category, club, description, sizes, tags, images, videos } = body

  if (!originalSlug) {
    return NextResponse.json({ error: 'originalSlug es requerido' }, { status: 400 })
  }

  const supabase = db()

  // Buscar liga por slug
  const { data: leagueRow } = await supabase
    .from('leagues')
    .select('id')
    .eq('slug', category)
    .maybeSingle()

  const leagueId = leagueRow?.id ?? null

  // Buscar o crear club
  let { data: clubRow } = await supabase
    .from('clubs')
    .select('id')
    .eq('slug', club)
    .maybeSingle()

  if (!clubRow && club) {
    const { data: newClub, error: clubErr } = await supabase
      .from('clubs')
      .insert({ slug: club, name: slugToName(club), league_id: leagueId })
      .select('id')
      .single()
    if (clubErr) return NextResponse.json({ error: clubErr.message }, { status: 500 })
    clubRow = newClub
  }

  // Actualizar producto
  const { error } = await supabase
    .from('products')
    .update({
      name,
      price_default: Number(price) || 0,
      league_id:     leagueId,
      club_id:       clubRow?.id ?? null,
      description:   description ?? '',
      sizes:         sizes ?? [],
      tags:          tags ?? [],
      images:        images ?? [],
      videos:        videos ?? [],
    })
    .eq('slug', originalSlug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
