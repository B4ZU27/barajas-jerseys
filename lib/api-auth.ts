import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'

type AuthOk  = { ok: true;  user: User }
type AuthErr = { ok: false; response: NextResponse }

// ── Basic auth check ─────────────────────────────────────────────────────────

export async function requireAuth(): Promise<AuthOk | AuthErr> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }
  return { ok: true, user }
}

// ── Role-specific checks ──────────────────────────────────────────────────────

export async function requireCatalogAdmin(): Promise<AuthOk | AuthErr> {
  const auth = await requireAuth()
  if (!auth.ok) return auth

  const db = serviceClient()
  const { data } = await db
    .from('catalog_admins')
    .select('user_id')
    .eq('user_id', auth.user.id)
    .maybeSingle()

  if (!data) {
    return { ok: false, response: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) }
  }
  return { ok: true, user: auth.user }
}

type OwnerOk = { ok: true; user: User; storeId: string }

export async function requireStoreOwner(): Promise<OwnerOk | AuthErr> {
  const auth = await requireAuth()
  if (!auth.ok) return auth

  const db = serviceClient()
  const { data } = await db
    .from('store_owners')
    .select('store_id')
    .eq('user_id', auth.user.id)
    .maybeSingle()

  if (!data) {
    return { ok: false, response: NextResponse.json({ error: 'Acceso denegado' }, { status: 403 }) }
  }
  return { ok: true, user: auth.user, storeId: data.store_id }
}

// ── Service role client (admin operations) ───────────────────────────────────

export function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
