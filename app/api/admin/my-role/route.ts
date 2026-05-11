import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as serviceClient } from '@supabase/supabase-js'

/**
 * GET /api/admin/my-role
 * Returns the role of the currently authenticated user.
 * Uses service role to bypass RLS on role tables.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ role: 'none' }, { status: 401 })
  }

  const db = serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: isAdmin } = await db
    .from('catalog_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (isAdmin) {
    return NextResponse.json({ role: 'catalog_admin' })
  }

  const { data: ownerRow } = await db
    .from('store_owners')
    .select('store_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (ownerRow) {
    return NextResponse.json({ role: 'store_owner', storeId: ownerRow.store_id })
  }

  return NextResponse.json({ role: 'none' })
}
