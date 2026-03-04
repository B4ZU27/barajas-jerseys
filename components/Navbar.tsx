'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const categories = [
  { slug: 'selecciones', label: 'Selecciones Nacionales' },
  { slug: 'clubes-internacionales', label: 'Clubes Internacionales' },
  { slug: 'mexico',      label: 'Clubes México' },
  { slug: 'retro',       label: 'Retro' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const pathname = usePathname()

  function closeAll() {
    setMenuOpen(false)
    setDropdownOpen(false)
  }

  return (
    <nav className="border-b border-gray-200 bg-white text-black sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <Link href="/" onClick={closeAll} className="font-black text-lg tracking-tight uppercase">
          Barajas Jerseys
        </Link>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-wider">
          <Link
            href="/"
            className={pathname === '/' ? 'border-b-2 border-black pb-0.5' : 'hover:opacity-60 transition-opacity'}
          >
            Home
          </Link>

          {/* Dropdown de camisas */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1 hover:opacity-60 transition-opacity"
            >
              Camisas
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {dropdownOpen && (
              <>
                {/* Overlay para cerrar al hacer click afuera */}
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white border border-gray-200 z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/collections/${cat.slug}`}
                      onClick={closeAll}
                      className="block px-4 py-3 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <Link href="/nosotros" className={pathname === '/nosotros' ? 'border-b-2 border-black pb-0.5' : 'hover:opacity-60 transition-opacity'}>
            Nosotros
          </Link>
          <Link href="/contacto" className={pathname === '/contacto' ? 'border-b-2 border-black pb-0.5' : 'hover:opacity-60 transition-opacity'}>
            Contacto
          </Link>
        </div>

        {/* Botón hamburguesa mobile */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden flex flex-col gap-1.5 p-1"
          aria-label="Abrir menú"
        >
          <span className={`block w-6 h-0.5 bg-black transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block w-6 h-0.5 bg-black transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-black transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Menú mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <Link href="/" onClick={closeAll} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b border-gray-100">
            Home
          </Link>

          {/* Categorías directo, sin dropdown en mobile */}
          <div className="border-b border-gray-100">
            <p className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-400">Camisas</p>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/collections/${cat.slug}`}
                onClick={closeAll}
                className="block px-6 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          <Link href="/nosotros" onClick={closeAll} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider border-b border-gray-100">
            Nosotros
          </Link>
          <Link href="/contacto" onClick={closeAll} className="block px-4 py-3 text-sm font-bold uppercase tracking-wider">
            Contacto
          </Link>
        </div>
      )}
    </nav>
  )
}
