'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/products'

interface HeroCarouselProps {
  products: Product[]
}

export default function HeroCarousel({ products }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent(i => (i + 1) % products.length), [products.length])
  const prev = () => setCurrent(i => (i - 1 + products.length) % products.length)

  useEffect(() => {
    if (paused) return
    const t = setInterval(next, 4500)
    return () => clearInterval(t)
  }, [next, paused])

  const product = products[current]
  if (!product) return null

  // Limpiar nombre: quitar sufijos tipo "5A", "8A", "0B", "3B" y guiones extra
  const cleanName = product.name
    .replace(/\s+\d[A-Za-z]$/i, '')
    .replace(/\s+retro\s*/i, ' ')
    .trim()

  return (
    <section
      className="relative w-full overflow-hidden bg-black select-none"
      style={{ minHeight: 'clamp(380px, 75vw, 580px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {products.map((p, i) => (
        <div
          key={p.slug}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          {/* Imagen de fondo con blur */}
          <div className="absolute inset-0">
            <Image
              src={p.images[0]}
              alt=""
              fill
              className="object-cover blur-xl scale-110 opacity-30"
              sizes="100vw"
              priority={i === 0}
            />
          </div>

          {/* Layout: imagen jersey + texto */}
          <div className="relative z-10 h-full max-w-6xl mx-auto px-4 flex items-center gap-6 md:gap-12">

            {/* Imagen de la camisa */}
            <div
              className="shrink-0 relative"
              style={{ width: 'clamp(140px, 35vw, 320px)', height: 'clamp(160px, 40vw, 370px)' }}
            >
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                className="object-contain drop-shadow-2xl"
                sizes="(max-width: 768px) 35vw, 320px"
                priority={i === 0}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>

            {/* Texto */}
            <div className="flex-1 text-white">
              <span className="inline-block bg-purple-700 text-white font-mono text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 mb-3">
                Retro
              </span>
              <h2
                className="uppercase leading-none [font-family:var(--font-bebas)] mb-3"
                style={{ fontSize: 'clamp(28px, 6vw, 64px)' }}
              >
                {p.name.replace(/\s+\d[A-Za-z]$/i, '').replace(/\s+retro\s*/i, ' ').trim()}
              </h2>
              <p className="text-white/50 text-xs uppercase tracking-widest mb-4">
                {p.category} · {p.club}
              </p>
              <Link
                href={`/products/${p.slug}`}
                className="inline-block border border-white text-white text-xs font-black uppercase tracking-widest px-5 py-3 hover:bg-white hover:text-black transition-colors duration-200"
              >
                Ver camisa →
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Controles prev/next */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white transition-colors backdrop-blur-sm"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white transition-colors backdrop-blur-sm"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`transition-all duration-300 rounded-full ${
              i === current ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Contador */}
      <div className="absolute bottom-4 right-4 z-20 text-white/40 text-[10px] font-mono">
        {String(current + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}
      </div>
    </section>
  )
}
