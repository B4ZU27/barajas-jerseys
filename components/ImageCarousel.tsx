'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: string[]
  alt: string
}

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  function prev() {
    setCurrent((i) => (i === 0 ? images.length - 1 : i - 1))
  }

  function next() {
    setCurrent((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  if (images.length === 0) return null

  return (
    <div className="w-full md:w-auto md:max-w-md mx-auto md:mx-0 overflow-hidden">
      {/* Imagen principal — aspecto fijo 3:4, no salta al cambiar imagen */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        <Image
          src={images[current]}
          alt={`${alt} ${current + 1}`}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 90vw, (max-width: 1024px) 400px, 500px"
          priority
        />

        {/* Flechas — solo si hay más de una imagen */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              aria-label="Imagen anterior"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              aria-label="Siguiente imagen"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {/* Contador */}
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 font-mono">
            {current + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-1 md:gap-2 mt-2 overflow-x-auto pb-2">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`relative aspect-square w-16 overflow-hidden flex-shrink-0 border-2 transition-colors ${
                i === current ? 'border-black' : 'border-transparent'
              }`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} thumbnail ${i + 1}`}
                fill
                className="object-contain"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
