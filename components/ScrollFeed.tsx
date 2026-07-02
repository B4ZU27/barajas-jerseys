'use client'

/*
  CLIENT COMPONENT — necesita:
  - useState + useEffect: para el shuffle inicial y reshuffle
  - Interacción: botón de nueva colección

  Modo "Scrollear este pedo":
  Cada camisa ocupa casi toda la pantalla (95svh).
  El usuario scrollea naturalmente y ve una camisa a la vez.
  Orden siempre aleatorio — se reshufflea con el botón.
*/

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

  /*
    [] como dependencia = solo corre una vez al montar el componente.
    Hacemos el shuffle AQUÍ (en el cliente) porque Math.random() en el
    servidor daría un valor diferente al del cliente → error de hidratación.
  */
  useEffect(() => {
    setList(shuffle(products))
  }, [products])

  if (list.length === 0) return null

  return (
    <div>

      {/* Barra superior sticky — debajo del navbar */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-white border-retro-b"
        style={{ position: 'sticky', top: 'var(--navbar-height, 56px)', zIndex: 20 }}
      >
        <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
          {list.length} camisas · orden aleatorio
        </span>
        <button
          onClick={() => {
            setList(shuffle(products))
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="btn-retro"
          style={{ fontSize: '10px', padding: '6px 12px' }}
        >
          ↺ Nueva colección
        </button>
      </div>

      {/* Cards — cada una ocupa ~95% de la pantalla */}
      {list.map((product, i) => (
        <div
          key={product.id}
          className="flex flex-col border-retro-b"
          style={{ minHeight: '95svh' }}
        >

          {/* Imagen — ocupa la mayor parte */}
          <div className="relative bg-white border-retro-b" style={{ flex: '1 1 0', minHeight: '55svh' }}>
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="100vw"
                /*
                  Las primeras 2 imágenes cargan inmediato (eager).
                  El resto carga cuando se acercan al viewport (lazy).
                  next/image maneja esto automáticamente con loading=lazy.
                */
                loading={i < 2 ? 'eager' : 'lazy'}
              />
            )}

            {/* Número de catálogo */}
            <span className="absolute top-3 left-3 font-mono text-[10px] text-black/20 select-none">
              #{String(i + 1).padStart(3, '0')}
            </span>

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
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

          {/* Caption de museo — parte inferior */}
          <div className="p-5 bg-white flex flex-col justify-center gap-3" style={{ minHeight: '28svh' }}>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                {product.category} · {product.club}
              </p>
              <h2 className="[font-family:var(--font-bebas)] uppercase leading-none mt-1"
                style={{ fontSize: 'clamp(28px, 8vw, 48px)' }}>
                {product.name}
              </h2>
            </div>

            <div className="flex items-center justify-between">
              {product.price ? (
                <span className="font-mono text-base font-bold">
                  ${product.price.toLocaleString('es-MX')}
                </span>
              ) : (
                <span />
              )}

              {/*
                Link de Next.js — navegación sin recarga.
                Se ve como botón retro pero es un <a> internamente.
              */}
              <Link
                href={`/${storecode}/products/${product.slug}`}
                className="btn-retro"
              >
                Ver camisa →
              </Link>
            </div>
          </div>

        </div>
      ))}

      {/* Final del feed */}
      <div className="flex flex-col items-center justify-center gap-4 py-20 border-retro-top mx-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/30">
          — Fin de la colección —
        </p>
        <button
          onClick={() => {
            setList(shuffle(products))
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          className="btn-retro"
        >
          ↺ Nueva colección aleatoria
        </button>
      </div>

    </div>
  )
}
