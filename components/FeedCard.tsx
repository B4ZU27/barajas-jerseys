import Link from 'next/link'
import Image from 'next/image'
import type { Product } from '@/lib/products'

interface FeedCardProps {
  product: Product
  storecode: string
  index?: number
}

/*
  SERVER COMPONENT — no tiene 'use client'
  Recibe el producto como prop (data del servidor)
  y solo renderiza HTML estático.
  next/image maneja el lazy-load y optimización automática.
*/
export default function FeedCard({ product, storecode, index = 0 }: FeedCardProps) {
  const hasRetro = product.tags?.includes('retro')
  const hasMundial = product.tags?.includes('mundialista')

  return (
    <Link
      href={`/${storecode}/products/${product.slug}`}
      className="group block border-retro"
    >
      {/* Contenedor de imagen — aspecto retrato fijo */}
      <div className="relative w-full bg-white overflow-hidden" style={{ aspectRatio: '3/4' }}>

        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading={index < 4 ? 'eager' : 'lazy'}
          />
        )}

        {/* Número de catálogo — esquina superior izquierda */}
        <span className="absolute top-3 left-3 font-mono text-[10px] text-black/25 select-none">
          #{String(index + 1).padStart(3, '0')}
        </span>

        {/* Badges — esquina superior derecha */}
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          {hasRetro && (
            <span className="border-retro-thin bg-white font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
              RETRO
            </span>
          )}
          {hasMundial && (
            <span className="border-retro-thin bg-white font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
              MUNDIAL
            </span>
          )}
        </div>

        {/* Overlay agotado */}
        {!product.available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="border border-white text-white font-mono text-xs tracking-widest uppercase px-3 py-1">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Caption estilo museo — debajo de la imagen */}
      <div className="border-t border-black p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
          {product.category} · {product.club}
        </p>
        <h3 className="[font-family:var(--font-bebas)] text-2xl uppercase leading-none mt-0.5">
          {product.name}
        </h3>
      </div>
    </Link>
  )
}
