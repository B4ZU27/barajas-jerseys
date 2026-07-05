'use client'

/*
  CLIENT COMPONENT porque necesita:
  - useState: para el filtro activo, cuántos mostrar, y la lista shuffleada
  - useEffect: para hacer el shuffle al cargar (solo en el browser)
  - onClick: botón de shuffle y "ver más"

  Recibe 'products' como prop desde el Server Component (page.tsx)
  Los datos NO se vuelven a pedir — llegan del servidor una sola vez.
*/

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import FeedCard from '@/components/FeedCard'
import type { Product } from '@/lib/products'

interface JerseyFeedProps {
  products: Product[]                              // todos los productos del servidor
  leagues: { slug: string; label: string }[]       // ligas activas para los pills
  storecode: string
}

const BATCH = 20  // cuántos mostrar a la vez

/* Fisher-Yates shuffle — mezcla un array sin modificar el original */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]                      // copia para no mutar el original
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]         // intercambia posiciones
  }
  return a
}

export default function JerseyFeed({ products, leagues, storecode }: JerseyFeedProps) {

  /*
    useState(valorInicial) → [valor, setValor]
    'valor' es lo que lees. 'setValor' es lo que llamas para cambiarlo.
    Cuando cambia, React re-renderiza el componente automáticamente.
  */
  const [activeFilter, setActiveFilter] = useState('todo')
  const [visibleCount, setVisibleCount]   = useState(BATCH)
  const [shuffled, setShuffled]           = useState<Product[]>(products)

  /*
    useEffect(fn, [deps]) — corre 'fn' DESPUÉS de que el componente se monta.
    El array [] vacío significa: correr solo una vez al montar.
    Aquí shuffleamos solo en el browser para evitar error de hidratación
    (el servidor no puede usar Math.random() y dar el mismo resultado que el cliente).
  */
  useEffect(() => {
    setShuffled(shuffle(products))
  }, [products])

  /*
    useMemo(fn, [deps]) — solo recalcula cuando cambian las dependencias.
    Sin memo, filtraríamos TODOS los productos en CADA render — lento.
    Con memo, solo recalcula cuando cambia activeFilter o shuffled.
  */
  const filtered = useMemo(() => {
    if (activeFilter === 'todo')        return shuffled
    if (activeFilter === 'retro')       return shuffled.filter(p => p.tags?.includes('retro'))
    if (activeFilter === 'mundialista') return shuffled.filter(p => p.tags?.includes('mundialista'))
    // filtro por categoría de liga
    return shuffled.filter(p => p.category === activeFilter)
  }, [activeFilter, shuffled])

  const visible  = filtered.slice(0, visibleCount)
  const hasMore  = visibleCount < filtered.length

  function handleFilterChange(slug: string) {
    setActiveFilter(slug)
    setVisibleCount(BATCH)
    document.getElementById('jersey-feed-top')?.scrollIntoView({ behavior: 'smooth' })
  }

  function handleShuffle() {
    setShuffled(shuffle(products))
    setActiveFilter('todo')
    setVisibleCount(BATCH)
    // scroll suave al inicio del feed
    document.getElementById('jersey-feed-top')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="jersey-feed-top">

      {/* Barra sticky: pills + shuffle en una sola fila */}
      <div
        className="sticky z-30 bg-white border-retro-b"
        style={{ top: 'var(--navbar-height, 56px)' }}
      >
        {/* Fila superior — pills scrolleables */}
        <div className="overflow-x-auto border-b border-black/10" style={{ scrollbarWidth: 'none' }}>
          <div className="flex min-w-max">
            {[
              { slug: 'todo',        label: 'Todo'    },
              { slug: 'retro',       label: 'Retro'   },
              { slug: 'mundialista', label: 'Mundial' },
              ...leagues.map(l => ({ slug: l.slug, label: l.label })),
            ].map(pill => (
              <button
                key={pill.slug}
                onClick={() => handleFilterChange(pill.slug)}
                className={`pill-retro border-r border-black/20 last:border-r-0 ${activeFilter === pill.slug ? 'active' : ''}`}
                style={{ padding: '10px 16px' }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fila inferior — conteo + shuffle */}
        <div className="flex items-center justify-between px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
            {filtered.length} camisas
          </span>
          <button onClick={handleShuffle} className="btn-retro" style={{ fontSize: '10px', padding: '4px 10px' }}>
            ↺ Mezclar
          </button>
        </div>
      </div>

      {/* Grid de camisas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((product, i) => (
          /*
            key={product.id} — React necesita una clave única en cada lista
            para saber qué elemento cambió sin re-renderizar todos.
            Usa siempre el ID del dato, nunca el índice del array.
          */
          <FeedCard
            key={product.id}
            product={product}
            storecode={storecode}
            index={i}
          />
        ))}
      </div>

      {/* Ver más / ver todo el catálogo */}
      <div className="flex flex-col items-center gap-3 py-10 border-retro-top mx-4 mt-0">
        {hasMore && (
          <button
            onClick={() => setVisibleCount(c => c + BATCH)}
            className="btn-retro w-full max-w-sm text-center"
          >
            Ver {Math.min(BATCH, filtered.length - visibleCount)} más
          </button>
        )}
        <Link
          href={`/${storecode}/camisas`}
          className="btn-retro w-full max-w-sm text-center"
          style={{ background: '#000', color: '#fff' }}
        >
          Ver todo el catálogo →
        </Link>
      </div>

    </section>
  )
}
