import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

type AuthOk  = { ok: true;  user: User }
type AuthErr = { ok: false; response: NextResponse }

export async function requireAuth(): Promise<AuthOk | AuthErr> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) }
  }

  return { ok: true, user }
}
