'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/products'

interface ScrollFeedProps {
  products: Product[]
  storecode: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function ScrollFeed({ products, storecode }: ScrollFeedProps) {
  const [list, setList] = useState<Product[]>([])

  useEffect(() => {
    setList(shuffle(products))
  }, [products])

  if (list.length === 0) return null

  function reshuffle() {
    setList(shuffle(products))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>

      {/* Barra sticky */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-white border-retro-b"
        style={{ position: 'sticky', top: 'var(--navbar-height, 56px)', zIndex: 20 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
          {list.length} piezas · aleatorio
        </span>
        <button onClick={reshuffle} className="btn-retro" style={{ fontSize: '10px', padding: '6px 12px' }}>
          ↺ Mezclar
        </button>
      </div>

      {/* Cards */}
      {list.map((product, i) => (
        <Link
          key={product.id}
          href={`/${storecode}/products/${product.slug}`}
          className="group flex flex-col border-retro-b"
          style={{ minHeight: '100svh' }}
        >

          {/* Imagen — 70% de la pantalla */}
          <div
            className="relative w-full bg-white overflow-hidden"
            style={{ flex: '0 0 70svh' }}
          >
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="100vw"
                loading={i < 2 ? 'eager' : 'lazy'}
              />
            )}

            {/* Badges top-right */}
            <div className="absolute top-4 right-4 flex flex-col gap-1 items-end">
              {product.tags?.includes('retro') && (
                <span className="border-retro-thin bg-white font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                  RETRO
                </span>
              )}
              {product.tags?.includes('mundialista') && (
                <span className="border-retro-thin bg-white font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                  MUNDIAL
                </span>
              )}
            </div>

            {/* Agotado */}
            {!product.available && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="border border-white text-white font-mono text-xs tracking-widest uppercase px-3 py-1">
                  Agotado
                </span>
              </div>
            )}
          </div>

          {/* Caption — 30% restante */}
          <div
            className="flex flex-col justify-between px-5 py-6 bg-white border-retro-top"
            style={{ flex: '1 1 0', minHeight: '28svh' }}
          >
            {/* Número + meta */}
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] text-black/25 select-none">
                #{String(i + 1).padStart(3, '0')}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/40 text-right">
                {product.club?.replace(/-/g, ' ')}
              </span>
            </div>

            {/* Nombre grande */}
            <h2
              className="[font-family:var(--font-bebas)] uppercase leading-none"
              style={{ fontSize: 'clamp(36px, 10vw, 60px)' }}
            >
              {product.name}
            </h2>

            {/* Liga + CTA */}
            <div className="flex items-end justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                {product.category?.replace(/-/g, ' ')}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest font-bold group-hover:underline underline-offset-4">
                Ver camisa →
              </span>
            </div>
          </div>

        </Link>
      ))}

      {/* Final */}
      <div className="flex flex-col items-center gap-4 py-20 border-retro-top mx-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/30">
          — Fin de la colección —
        </p>
        <button onClick={reshuffle} className="btn-retro">
          ↺ Nueva colección aleatoria
        </button>
      </div>

    </div>
  )
}
