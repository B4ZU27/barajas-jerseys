import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import AutoSignOut from '@/components/AutoSignOut'
import { createClient } from '@/lib/supabase/server'
import { createClient as serviceClient } from '@supabase/supabase-js'

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  // Use service role to bypass RLS on catalog_admins
  const db = serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: isAdmin } = await db
    .from('catalog_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Not a catalog admin — check if store owner, redirect accordingly
  if (!isAdmin) {
    const { data: isOwner } = await db
      .from('store_owners')
      .select('store_id')
      .eq('user_id', user.id)
      .maybeSingle()
    redirect(isOwner ? '/admin/my-store' : '/admin/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AutoSignOut />
      <AdminSidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
