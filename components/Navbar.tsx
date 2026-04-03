'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  categories: { slug: string; label: string }[]
  tags: { slug: string; label: string }[]
}

export default function Navbar({ categories, tags }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)
  const pathname = usePathname()

  function closeAll() {
    setMenuOpen(false)
    setDropdownOpen(false)
    setTagsOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 text-white" style={{ backgroundColor: 'var(--blue-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <Link href="/" onClick={closeAll} className="text-2xl tracking-tight uppercase [font-family:var(--font-bebas)]">
          Archivo de Cancha
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider">
          <Link href="/" className={pathname === '/' ? 'border-b-2 border-white pb-0.5' : 'hover:opacity-70 transition-opacity'}>
            Home
          </Link>
          <Link href="/camisas" className={pathname === '/camisas' ? 'border-b-2 border-white pb-0.5' : 'hover:opacity-70 transition-opacity'}>
            Camisas
          </Link>

          {/* Dropdown de camisas */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1 hover:opacity-70 transition-opacity"
            >
              Colecciones
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 z-50 border border-white/20" style={{ backgroundColor: 'var(--blue-deep)' }}>
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/collections/${cat.slug}`}
                      onClick={closeAll}
                      className="block px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-white/10 border-b border-white/10 last:border-0 transition-colors text-white"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>


          <Link href="/tallas" className={pathname === '/tallas' ? 'border-b-2 border-white pb-0.5' : 'hover:opacity-70 transition-opacity'}>
            Tallas
          </Link>
          <Link href="/nosotros" className={pathname === '/nosotros' ? 'border-b-2 border-white pb-0.5' : 'hover:opacity-70 transition-opacity'}>
            Nosotros
          </Link>
          <Link href="/contacto" className={pathname === '/contacto' ? 'border-b-2 border-white pb-0.5' : 'hover:opacity-70 transition-opacity'}>
            Contacto
          </Link>
        </div>

        {/* Botón hamburguesa mobile */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden flex flex-col gap-1.5 p-1"
          aria-label="Abrir menú"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/20" style={{ backgroundColor: 'var(--blue-deep)' }}>
          <Link href="/" onClick={closeAll} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b border-white/10 text-white hover:bg-white/10 transition-colors">
            Home
          </Link>
          <Link href="/camisas" onClick={closeAll} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b border-white/10 text-white hover:bg-white/10 transition-colors">
            Camisas
          </Link>

          <div className="border-b border-white/10">
            <p className="px-4 py-3 text-xs font-black uppercase tracking-widest text-white/40">Colecciones</p>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                onClick={closeAll}
                className="block px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-white/10 transition-colors text-white"
              >
                {cat.label}
              </Link>
            ))}
          </div>


          <Link href="/tallas" onClick={closeAll} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b border-white/10 text-white hover:bg-white/10 transition-colors">
            Tallas
          </Link>
          <Link href="/nosotros" onClick={closeAll} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b border-white/10 text-white hover:bg-white/10 transition-colors">
            Nosotros
          </Link>
          <Link href="/contacto" onClick={closeAll} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-colors">
            Contacto
          </Link>
        </div>
      )}
    </nav>
  )
}
