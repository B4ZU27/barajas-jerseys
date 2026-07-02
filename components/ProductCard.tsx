'use client'

/*
  CLIENT COMPONENT — solo por la detección del aspect-ratio de imagen.
  Si en el futuro se elimina esa lógica puede volverse Server Component.

  Actualizado en Fase 5:
  - Caption estilo museo (mono gris + Bebas para nombre)
  - Badges con borde cuadrado retro
  - Sin grises genéricos — usa black/opacity
*/

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import type { Product } from '@/lib/products'

interface ProductCardProps {
  product: Product
  storecode: string
}

export default function ProductCard({ product, storecode }: ProductCardProps) {
  const [aspectRatio, setAspectRatio] = useState<string | null>(null)

  return (
    <Link href={`/${storecode}/products/${product.slug}`} className="group block">

      {/* Imagen */}
      <div
        className="relative overflow-hidden bg-white"
        style={aspectRatio ? { aspectRatio } : { aspectRatio: '0.75' }}
      >
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 20vw"
            onLoad={e => {
              const img = e.currentTarget as HTMLImageElement
              if (img.naturalWidth && img.naturalHeight) {
                setAspectRatio((img.naturalWidth / img.naturalHeight).toFixed(4))
              }
            }}
          />
        )}

        {/* Badges — cuadrados, borde fino */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
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
            <span className="border border-white text-white font-mono text-[10px] tracking-widest uppercase px-2 py-0.5">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Caption estilo museo */}
      <div className="pt-2 pb-3 px-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
          {product.club}
        </p>
        <h3 className="[font-family:var(--font-bebas)] text-lg uppercase leading-tight mt-0.5">
          {product.name}
        </h3>
        {product.price > 0 && (
          <p className="font-mono text-xs font-bold mt-0.5">
            ${product.price.toLocaleString('es-MX')}
          </p>
        )}
      </div>
    </Link>
  )
}
