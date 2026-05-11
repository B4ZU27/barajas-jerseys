'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface OwnerSidebarProps {
  storeName: string
  slug: string
}

const NAV = [
  { label: 'Catálogo',      href: '/admin/my-store/products' },
  { label: 'Configuración', href: '/admin/my-store/settings' },
]

export default function OwnerSidebar({ storeName, slug }: OwnerSidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-56 shrink-0 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-200">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mi tienda</p>
        <p className="text-base font-black uppercase tracking-widest leading-tight" style={{ color: 'var(--blue-deep)' }}>
          {storeName}
        </p>
        <a
          href={`/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-mono text-gray-400 mt-0.5 hover:text-black transition-colors inline-block"
          title="Ver tu tienda"
        >
          /{slug} ↗
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`block px-5 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
              pathname.startsWith(href)
                ? 'text-black bg-gray-100'
                : 'text-gray-500 hover:text-black hover:bg-gray-50'
            }`}
          >
            {label}
          </Link>
        ))}

        <div className="mx-5 mt-3 mb-1 border-t border-gray-200" />

        <button
          onClick={handleLogout}
          className="block w-full px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-red-600 transition-colors text-left"
        >
          Cerrar sesión
        </button>
      </nav>
    </aside>
  )
}
