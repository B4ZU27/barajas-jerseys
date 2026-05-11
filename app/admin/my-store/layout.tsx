import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as serviceClient } from '@supabase/supabase-js'
import OwnerSidebar from '@/components/OwnerSidebar'

export default async function MyStoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  // Use service role to bypass RLS on store_owners
  const db = serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: ownership } = await db
    .from('store_owners')
    .select('store_id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Not a store owner — if they're an admin send them to the admin panel, otherwise login
  if (!ownership) {
    const { data: isAdmin } = await db
      .from('catalog_admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()
    redirect(isAdmin ? '/admin' : '/admin/login')
  }

  // Fetch store info for the sidebar
  const { data: store } = await db
    .from('stores')
    .select('name, slug')
    .eq('id', ownership.store_id)
    .single()

  if (!store) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerSidebar storeName={store.name} slug={store.slug} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
