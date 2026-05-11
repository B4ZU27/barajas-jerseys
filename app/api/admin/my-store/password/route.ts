import { NextRequest, NextResponse } from 'next/server'
import { requireStoreOwner, serviceClient } from '@/lib/api-auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const auth = await requireStoreOwner()
  if (!auth.ok) return auth.response

  const { currentPassword, newPassword } = await request.json()
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Contraseña actual y nueva requeridas' }, { status: 400 })
  }

  // Verify current password by re-authenticating
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  const email = userData.user?.email
  if (!email) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (signInErr) {
    return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 })
  }

  // Update password via service role
  const db = serviceClient()
  const { error: updateErr } = await db.auth.admin.updateUserById(auth.user.id, {
    password: newPassword,
  })
  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
