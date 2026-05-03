// Script de migración: products.json → Supabase
// Uso: node scripts/migrate-to-supabase.mjs
//
// Requiere en .env.local:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY  ← service role, no la anon key
//   NEXT_PUBLIC_STORE_ID       ← uuid de tu tienda en stores
//   SUPABASE_ADMIN_USER_ID     ← uuid de tu usuario en auth.users

import { createClient } from '@supabase/supabase-js'
import { readFileSync }  from 'fs'
import { resolve }       from 'path'

// ── Leer .env.local manualmente ───────────────────────────────────────────────
const envPath = resolve(process.cwd(), '.env.local')
const envVars = readFileSync(envPath, 'utf8')
  .split('\n')
  .filter(l => l && !l.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...rest] = line.split('=')
    acc[key.trim()] = rest.join('=').trim()
    return acc
  }, {})

const SUPABASE_URL      = envVars['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY  = envVars['SUPABASE_SERVICE_ROLE_KEY']
const ADMIN_USER_ID     = envVars['SUPABASE_ADMIN_USER_ID']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_USER_ID) {
  console.error('❌ Faltan variables en .env.local:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ADMIN_USER_ID')
  process.exit(1)
}

// ── Cliente con service role (bypasa RLS) ─────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ── Leer products.json ────────────────────────────────────────────────────────
const products = JSON.parse(
  readFileSync(resolve(process.cwd(), 'data', 'products.json'), 'utf8')
)

console.log(`📦 ${products.length} productos encontrados en products.json`)

async function run() {
  // 1. Obtener ligas (ya están en Supabase desde el SQL inicial)
  const { data: leagues, error: leaguesErr } = await supabase.from('leagues').select('id, slug')
  if (leaguesErr) { console.error('❌ Error leyendo leagues:', leaguesErr.message); process.exit(1) }
  const leagueMap = Object.fromEntries(leagues.map(l => [l.slug, l.id]))
  console.log(`🏆 ${leagues.length} ligas encontradas`)

  // 2. Insertar clubes únicos
  const uniqueClubs = [...new Set(products.map(p => p.club).filter(Boolean))]
  console.log(`⚽ Insertando ${uniqueClubs.length} clubes...`)

  for (const clubSlug of uniqueClubs) {
    // Buscar la liga del primer producto de este club
    const sample   = products.find(p => p.club === clubSlug)
    const leagueId = leagueMap[sample?.category] ?? null

    const { error } = await supabase.from('clubs').upsert(
      { slug: clubSlug, name: slugToName(clubSlug), league_id: leagueId },
      { onConflict: 'slug', ignoreDuplicates: true }
    )
    if (error) console.warn(`  ⚠️  Club ${clubSlug}: ${error.message}`)
    else console.log(`  ✓ ${clubSlug}`)
  }

  // Obtener mapa de clubes
  const { data: clubs } = await supabase.from('clubs').select('id, slug')
  const clubMap = Object.fromEntries(clubs.map(c => [c.slug, c.id]))

  // 3. Insertar productos
  console.log(`\n🎽 Insertando ${products.length} productos...`)
  let ok = 0, fail = 0

  for (const p of products) {
    const leagueId = leagueMap[p.category] ?? null
    const clubId   = clubMap[p.club]       ?? null

    const { data: inserted, error } = await supabase
      .from('products')
      .upsert({
        created_by:    ADMIN_USER_ID,
        slug:          p.slug,
        name:          p.name,
        price_default: p.price ?? null,
        league_id:     leagueId,
        club_id:       clubId,
        sizes:         p.sizes         ?? [],
        description:   p.description   ?? '',
        images:        p.images        ?? [],
        tags:          p.tags          ?? [],
        videos:        p.videos        ?? [],
      }, { onConflict: 'slug', ignoreDuplicates: true })
      .select('id')
      .single()

    if (error) {
      console.warn(`  ✗ ${p.slug}: ${error.message}`)
      fail++
      continue
    }

    console.log(`  ✓ ${p.slug}`)
    ok++
  }

  console.log(`\n✅ Migración completa: ${ok} ok, ${fail} errores`)
}

// Convierte "real-madrid" → "Real Madrid"
function slugToName(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

run().catch(err => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
