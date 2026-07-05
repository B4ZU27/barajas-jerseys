'use client'

/*
  CLIENT COMPONENT porque necesita:
  - useState: para abrir/cerrar el menú mobile y el dropdown de ligas
  - usePathname: hook de Next.js para saber en qué página estamos
    y así resaltar el link activo con un subrayado

  El Navbar es sticky (se queda fijo arriba al scrollear).
  Define --navbar-height en el elemento para que LeaguePills
  sepa dónde posicionarse con sticky.
*/

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  categories: { slug: string; label: string }[]
  tags: { slug: string; label: string }[]
  storecode: string
}

export default function Navbar({ categories, storecode }: NavbarProps) {
  const [menuOpen, setMenuOpen]       = useState(false)
  const [leaguesOpen, setLeaguesOpen] = useState(false)
  const pathname = usePathname()
  const base     = `/${storecode}`

  function closeAll() {
    setMenuOpen(false)
    setLeaguesOpen(false)
  }

  /*
    Función helper: devuelve las clases CSS del link según si está activo.
    Esto es un patrón común en React — extraer lógica repetida a una función.
  */
  function linkClass(href: string, exact = false) {
    const isActive = exact
      ? pathname === href
      : pathname.startsWith(href)
    return isActive
      ? 'relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white'
      : 'hover:opacity-60 transition-opacity'
  }

  /* Links del navbar — definidos como datos para no repetir JSX */
  const navLinks = [
    { href: base,                  label: 'Home',        exact: true  },
    { href: `${base}/camisas`,     label: 'Meus Jerseys', exact: false },
    { href: `${base}/archivo`,     label: 'Archivo',      exact: false },
    { href: `${base}/tallas`,      label: 'Tallas',       exact: false },
    { href: `${base}/nosotros`,    label: 'Nós',          exact: false },
    { href: `${base}/contacto`,    label: 'Contactinho',  exact: false },
  ]

  return (
    /*
      style con --navbar-height: LeaguePills lo lee para saber
      su posición sticky. Si cambias la altura del nav, cambia esta variable.
      h-14 = 56px en Tailwind.
    */
    <nav
      className="sticky top-0 z-50 bg-black text-white border-retro-b"
      style={{ '--navbar-height': '56px' } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">

        {/* ── Nombre — solo visible fuera del home ─────────────────── */}
        <Link href={base} onClick={closeAll} className="shrink-0">
          {pathname !== base && (
            <span className="text-xl tracking-tight uppercase [font-family:var(--font-bebas)]">
              Archivo de Cancha
            </span>
          )}
        </Link>

        {/* ── Links desktop ────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-7 text-[11px] font-black uppercase tracking-[0.12em]">

          {navLinks.map(link => (
            /*
              Si el link es "Meus Jerseys", además mostramos el dropdown de ligas.
              Para el resto, un Link simple.
            */
            link.label === 'Meus Jerseys' ? (
              <div key={link.href} className="relative">
                <button
                  onClick={() => setLeaguesOpen(v => !v)}
                  className={`flex items-center gap-1 pb-3.5 ${linkClass(link.href, link.exact)}`}
                >
                  {link.label}
                  <svg
                    width="10" height="10" viewBox="0 0 12 12" fill="none"
                    className={`transition-transform duration-200 ${leaguesOpen ? 'rotate-180' : ''}`}
                  >
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {leaguesOpen && (
                  <>
                    {/* Capa invisible para cerrar el dropdown al hacer click afuera */}
                    <div className="fixed inset-0 z-40" onClick={() => setLeaguesOpen(false)} />
                    <div className="absolute top-full left-0 mt-0 w-48 z-50 bg-black border-retro">
                      <Link
                        href={`${base}/camisas`}
                        onClick={closeAll}
                        className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest border-retro-b hover:bg-white hover:text-black transition-colors"
                      >
                        Todas las camisas
                      </Link>
                      {categories.map(cat => (
                        <Link
                          key={cat.slug}
                          href={`${base}/collections/${cat.slug}`}
                          onClick={closeAll}
                          className="block px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-retro-b last:border-0 hover:bg-white hover:text-black transition-colors"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`pb-3.5 ${linkClass(link.href, link.exact)}`}
              >
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* ── Hamburguesa mobile ───────────────────────────────────── */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {/*
            Animación de hamburguesa → X:
            La barra de arriba rota 45° y baja
            La del medio desaparece (opacity-0)
            La de abajo rota -45° y sube
          */}
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 origin-center
            ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-opacity duration-200
            ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-white transition-all duration-200 origin-center
            ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* ── Menú mobile ──────────────────────────────────────────────── */}
      {/*
        El menú mobile no usa animación de slide aún — simplemente aparece.
        Si quisiéramos animarlo, usaríamos Tailwind transitions o Framer Motion.
        Por ahora, funcionalidad sobre animación.
      */}
      {menuOpen && (
        <div className="md:hidden bg-black border-retro-top">

          {navLinks.map((link, i) => (
            link.label === 'Meus Jerseys' ? (
              <div key={link.href}>
                {/* Link principal */}
                <Link
                  href={link.href}
                  onClick={closeAll}
                  className="block px-4 py-3.5 text-[11px] font-black uppercase tracking-widest border-retro-b text-white hover:bg-white hover:text-black transition-colors"
                >
                  {link.label}
                </Link>
                {/* Sub-links de ligas debajo */}
                <div className="bg-white/5">
                  {categories.map(cat => (
                    <Link
                      key={cat.slug}
                      href={`${base}/collections/${cat.slug}`}
                      onClick={closeAll}
                      className="block px-7 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b border-white/10 last:border-0 text-white/70 hover:text-white transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeAll}
                className={`block px-4 py-3.5 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors
                  ${i < navLinks.length - 1 ? 'border-retro-b' : ''}`}
              >
                {link.label}
              </Link>
            )
          ))}

        </div>
      )}
    </nav>
  )
}
