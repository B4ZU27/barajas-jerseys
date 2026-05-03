'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  {
    section: 'Catálogo',
    items: [
      { label: 'Productos', href: '/admin/products' },
      { label: '+ Agregar producto', href: '/admin' },
    ],
  },
  {
    section: 'Tiendas',
    items: [
      { label: 'Ver tiendas', href: '/admin/stores' },
      { label: '+ Crear tienda', href: '/admin/stores/new' },
    ],
  },
  {
    section: 'Usuarios',
    items: [
      { label: 'Store Owners', href: '/admin/store-owners' },
    ],
  },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname.startsWith(href)

  return (
    <aside className="w-56 shrink-0 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-200">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Admin</p>
        <p className="text-base font-black uppercase tracking-widest leading-tight" style={{ color: 'var(--blue-deep)' }}>
          Archivo de Cancha
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ section, items }) => (
          <div key={section} className="mb-5">
            <p className="px-5 text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">
              {section}
            </p>
            {items.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`block px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive(href)
                    ? 'text-black bg-gray-100'
                    : 'text-gray-500 hover:text-black hover:bg-gray-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-red-600 transition-colors text-left"
        >
          Cerrar sesión →
        </button>
      </div>
    </aside>
  )
}
