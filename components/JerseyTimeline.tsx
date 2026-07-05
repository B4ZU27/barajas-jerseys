'use client'

/*
  CLIENT COMPONENT — maneja:
  - currentIndex: qué camisa estás viendo ahora
  - visible: para la animación de fade entre camisas
  - Navegación: ↑ anterior (año menor), ↓ siguiente (año mayor), → detalle

  Los productos llegan ordenados por año ASC desde el servidor.
  El índice 0 = camisa más antigua, el último = más reciente.
*/

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/lib/products'

interface JerseyTimelineProps {
  products: Product[]
  storecode: string
  clubLabel: string
}

export default function JerseyTimeline({ products, storecode, clubLabel }: JerseyTimelineProps) {
  const [index, setIndex]     = useState(0)
  const [visible, setVisible] = useState(true)

  const product = products[index]
  const hasPrev = index > 0
  const hasNext = index < products.length - 1

  /*
    Animación de transición entre camisas:
    1. setVisible(false) → opacity-0 + translateY leve (CSS transition)
    2. setTimeout 180ms → cambia el índice (mientras está invisible)
    3. setVisible(true) → vuelve a opacity-100 (nuevo producto aparece)

    Este patrón se llama "coordinated state update":
    primero escondes, luego cambias datos, luego muestras.
  */
  function goTo(newIndex: number) {
    setVisible(false)
    setTimeout(() => {
      setIndex(newIndex)
      setVisible(true)
    }, 180)
  }

  const minYear = products[0]?.year
  const maxYear = products[products.length - 1]?.year

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100svh - 56px)' }}>

      {/* ── Encabezado del equipo ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-retro-b bg-white">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
            El Archivo
          </p>
          <h2 className="[font-family:var(--font-bebas)] text-2xl uppercase leading-none">
            {clubLabel}
          </h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
            {minYear}{maxYear && maxYear !== minYear ? ` – ${maxYear}` : ''}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
            {products.length} camisa{products.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* ── Timeline progress bar ──────────────────────────────────── */}
      <div className="flex border-retro-b" style={{ height: '3px' }}>
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="flex-1 transition-colors"
            style={{ background: i <= index ? '#000' : '#e5e5e5' }}
            aria-label={`Ir a camisa ${i + 1}`}
          />
        ))}
      </div>

      {/* ── Contenido principal ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Navegación ↑ — solo aparece si hay camisa anterior */}
        {hasPrev && (
          <div className="flex justify-center py-3 border-retro-b">
            <button
              onClick={() => goTo(index - 1)}
              className="flex flex-col items-center gap-1 group"
              aria-label="Camisa anterior"
            >
              <span className="text-xl leading-none group-hover:-translate-y-0.5 transition-transform">↑</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-black/40">
                {products[index - 1].year}
              </span>
            </button>
          </div>
        )}

        {/* Imagen + info — con animación fade */}
        <div
          className="flex-1 flex flex-col transition-all duration-[180ms]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(6px)',
          }}
        >
          {/* Imagen — clic va al detalle */}
          <Link
            href={`/${storecode}/products/${product?.slug}`}
            className="relative bg-white border-retro-b block"
            style={{ flex: '1 1 0', minHeight: '58svh' }}
          >
            {product?.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 600px"
                priority
              />
            )}

            {/* Año como marca de agua en el fondo */}
            {product?.year && (
              <span
                className="absolute inset-0 flex items-center justify-center
                  [font-family:var(--font-bebas)] font-bold text-black/[0.04]
                  pointer-events-none select-none"
                style={{ fontSize: 'clamp(80px, 30vw, 200px)' }}
              >
                {product.year}
              </span>
            )}

            {/* Badges */}
            <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
              {product?.tags?.includes('retro') && (
                <span className="border-retro-thin bg-white font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                  RETRO
                </span>
              )}
              {product?.tags?.includes('mundialista') && (
                <span className="border-retro-thin bg-white font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                  MUNDIAL
                </span>
              )}
            </div>
          </Link>

          {/* Caption con año, nombre y story */}
          <div className="px-4 pt-4 pb-2">
            {/* Separador con año — estilo línea de tiempo */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-px bg-black" />
              <span className="[font-family:var(--font-bebas)] text-2xl">{product?.year}</span>
              <div className="flex-1 h-px bg-black" />
            </div>

            <h3
              className="[font-family:var(--font-bebas)] uppercase leading-none"
              style={{ fontSize: 'clamp(24px, 7vw, 40px)' }}
            >
              {product?.name}
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/40 mt-1">
              {product?.category} · {product?.club}
            </p>

            {/* Historia — aparece solo si tiene story */}
            {product?.story && (
              <p className="text-sm text-black/70 leading-relaxed mt-3 border-retro-top pt-3">
                {product.story}
              </p>
            )}
          </div>
        </div>

        {/* ── Control inferior: ↓ siguiente ─────────────────────── */}
        {hasNext && (
          <div className="border-retro-top mt-auto">
            <button
              onClick={() => goTo(index + 1)}
              className="w-full flex flex-col items-center justify-center gap-1 py-4
                hover:bg-black hover:text-white transition-colors group"
              aria-label="Camisa siguiente"
            >
              <span className="text-xl leading-none group-hover:translate-y-0.5 transition-transform">↓</span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-black/40 group-hover:text-white/60">
                {products[index + 1].year}
              </span>
            </button>
          </div>
        )}
      </div>

    </div>
  )
}
