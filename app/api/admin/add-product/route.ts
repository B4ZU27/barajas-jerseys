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

export async function POST(request: NextRequest) {
  const { requireAuth } = await import('@/lib/api-auth')
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const body = await request.json()
  const { name, slug, price, category, club, description, sizes, tags, images, videos } = body

  if (!name || !slug) {
    return NextResponse.json({ error: 'name y slug son requeridos' }, { status: 400 })
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

  // Insertar producto
  const { data: product, error } = await supabase
    .from('products')
    .insert({
      slug,
      name,
      price_default: Number(price) || 0,
      league_id:     leagueId,
      club_id:       clubRow?.id ?? null,
      description:   description ?? '',
      sizes:         sizes ?? [],
      tags:          tags ?? [],
      images:        images ?? [],
      videos:        videos ?? [],
      created_by:    auth.user.id,
    })
    .select('id, slug')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ product })
}
