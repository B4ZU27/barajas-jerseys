import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { serviceClient } from '@/lib/api-auth'
import { StoreSettingsForm, PasswordForm, StoreLinkCard } from './SettingsForm'

export default async function MySettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // Use service role to bypass RLS on store_owners
  const db = serviceClient()
  const { data: ownership } = await db
    .from('store_owners')
    .select('store_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!ownership) redirect('/admin/login')

  const { data: store } = await db
    .from('stores')
    .select('slug, whatsapp, show_prices')
    .eq('id', ownership.store_id)
    .single()

  if (!store) redirect('/admin/login')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--blue-deep)' }}>
          Configuración
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Gestiona la información de tu tienda y tu acceso.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <StoreLinkCard slug={store.slug} />
        <StoreSettingsForm store={store} />
        <PasswordForm />
      </div>
    </div>
  )
}
