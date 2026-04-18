'use client'

import Link from 'next/link'
import { Product } from '@/lib/products'

interface VideoStripProps {
  products: Product[]
}

export default function VideoStrip({ products }: VideoStripProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="bg-black py-10">
      {/* Encabezado */}
      <div className="max-w-6xl mx-auto px-4 mb-5">
        <div className="flex items-baseline gap-4">
          <h2
            className="uppercase leading-none text-white [font-family:var(--font-bebas)]"
            style={{ fontSize: 'clamp(36px, 7vw, 56px)' }}
          >
            En movimiento
          </h2>
          <span className="text-xs uppercase tracking-widest text-white/40 pb-1">
            — mírala antes de pedirla
          </span>
        </div>
        <div className="border-t border-white/10 mt-2" />
      </div>

      {/* Strip horizontal de videos */}
      <div
        className="flex gap-3 overflow-x-auto px-4 max-w-6xl mx-auto pb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="relative shrink-0 overflow-hidden bg-neutral-900 group"
            style={{ width: 'clamp(150px, 38vw, 240px)', aspectRatio: '3/4' }}
          >
            <video
              src={product.videos![0]}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Gradiente con nombre */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent pt-8 px-3 pb-3">
              <p className="text-white text-[11px] font-black uppercase tracking-wider leading-tight line-clamp-2">
                {product.name}
              </p>
              <p className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5">
                {product.club}
              </p>
            </div>

            {/* Borde blanco sutil al hover */}
            <div className="absolute inset-0 border border-transparent group-hover:border-white/20 transition-colors duration-300 pointer-events-none" />
          </Link>
        ))}
      </div>
    </section>
  )
}
