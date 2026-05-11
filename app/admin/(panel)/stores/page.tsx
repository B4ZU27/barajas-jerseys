import { createClient as serviceClient } from '@supabase/supabase-js'
import Link from 'next/link'
import StoreActions from './StoreActions'

async function getStores() {
  const db = serviceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: stores } = await db
    .from('stores')
    .select('id, slug, name, whatsapp, show_prices, created_at')
    .order('created_at', { ascending: false })

  if (!stores) return []

  // For each store: get owner email + product count
  const enriched = await Promise.all(stores.map(async (store) => {
    const { data: ownerRow } = await db
      .from('store_owners')
      .select('user_id')
      .eq('store_id', store.id)
      .maybeSingle()

    let ownerEmail = '—'
    let ownerPhone = '—'
    if (ownerRow?.user_id) {
      const { data: { user } } = await db.auth.admin.getUserById(ownerRow.user_id)
      // contact_email is the real email; auth email is internal (slug@owner.local)
      ownerEmail = (user?.user_metadata?.contact_email as string) || user?.email || '—'
      ownerPhone = (user?.user_metadata?.phone as string) ?? '—'
    }

    const { count } = await db
      .from('store_products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', store.id)

    return { ...store, ownerEmail, ownerPhone, productCount: count ?? 0 }
  }))

  return enriched
}

export default async function StoresPage() {
  const stores = await getStores()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-widest" style={{ color: 'var(--blue-deep)' }}>
            Tiendas
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{stores.length} tienda{stores.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/stores/new"
          className="text-xs font-bold uppercase tracking-wider px-3 py-2 text-white"
          style={{ backgroundColor: 'var(--blue-primary)' }}
        >
          + Crear tienda
        </Link>
      </div>

      {/* Table */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {stores.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-gray-400 mb-4">No hay tiendas creadas todavía.</p>
            <Link href="/admin/stores/new" className="text-xs font-bold uppercase tracking-wider underline">
              Crear primera tienda
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-400">Storecode</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-400">Nombre</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-400">Owner</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-400">Contacto</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-400">Productos</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-400">Precios</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-gray-400">URL</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold">{store.slug}</td>
                    <td className="px-4 py-3 font-bold">{store.name}</td>
                    <td className="px-4 py-3 text-gray-500">{store.ownerEmail}</td>
                    <td className="px-4 py-3 text-gray-500">{store.ownerPhone}</td>
                    <td className="px-4 py-3 text-gray-500">{store.productCount}</td>
                    <td className="px-4 py-3">
                      {store.show_prices
                        ? <span className="bg-green-100 text-green-700 font-bold px-1.5 py-0.5">Sí</span>
                        : <span className="bg-gray-100 text-gray-400 font-bold px-1.5 py-0.5">No</span>}
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-gray-400 hover:text-black hover:underline transition-colors"
                      >
                        /{store.slug} ↗
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <StoreActions storeId={store.id} storeName={store.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
