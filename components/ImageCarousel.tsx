'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ImageCarouselProps {
  images: string[]
  alt: string
}

// ── Lightbox mobile con pinch-to-zoom y pan ───────────────────────────────────

function MobileLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  const [scale, setScale]   = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  // Refs para los gestos
  const lastDist   = useRef<number | null>(null)
  const lastOffset = useRef({ x: 0, y: 0 })
  const lastTouch  = useRef<{ x: number; y: number } | null>(null)
  const isDragging = useRef(false)

  function getDistance(touches: React.TouchList) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      lastDist.current = getDistance(e.touches)
    } else if (e.touches.length === 1) {
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      isDragging.current = false
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    if (e.touches.length === 2 && lastDist.current !== null) {
      // Pinch zoom
      const dist     = getDistance(e.touches)
      const delta    = dist / lastDist.current
      setScale(s => Math.min(Math.max(s * delta, 1), 5))
      lastDist.current = dist
    } else if (e.touches.length === 1 && lastTouch.current && scale > 1) {
      // Pan cuando está zoomed
      const dx = e.touches[0].clientX - lastTouch.current.x
      const dy = e.touches[0].clientY - lastTouch.current.y
      isDragging.current = true
      setOffset(o => ({ x: o.x + dx, y: o.y + dy }))
      lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    }
  }

  function onTouchEnd(e: React.TouchEvent) {
    lastDist.current  = null
    lastTouch.current = null
    // Si no arrastró y escala es 1 → cerrar
    if (!isDragging.current && scale <= 1 && e.changedTouches.length === 1) {
      onClose()
    }
    isDragging.current = false
    // Reset offset si volvió a escala 1
    if (scale <= 1.05) {
      setScale(1)
      setOffset({ x: 0, y: 0 })
    }
  }

  function handleDoubleTap() {
    if (scale > 1) {
      setScale(1)
      setOffset({ x: 0, y: 0 })
    } else {
      setScale(2.5)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center touch-none">
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/20 flex items-center justify-center text-white text-lg font-bold rounded-full"
      >
        ✕
      </button>

      {/* Hint */}
      {scale === 1 && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-xs uppercase tracking-widest pointer-events-none">
          Pellizca para hacer zoom · Toca para cerrar
        </p>
      )}

      {/* Imagen con gestos */}
      <div
        className="w-full h-full flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onDoubleClick={handleDoubleTap}
        style={{ cursor: scale > 1 ? 'grab' : 'default' }}
      >
        <div
          style={{
            transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
            transition: isDragging.current ? 'none' : 'transform 0.15s ease',
            width: '100vw',
            height: '100vh',
            position: 'relative',
          }}
        >
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain p-6"
            sizes="100vw"
            draggable={false}
          />
        </div>
      </div>
    </div>
  )
}

// ── Carousel principal ─────────────────────────────────────────────────────────

export default function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [current, setCurrent]     = useState(0)
  const [zoomed, setZoomed]       = useState(false)
  const [lightbox, setLightbox]   = useState(false)
  const [zoomPos, setZoomPos]     = useState({ x: 50, y: 50 })
  const imgRef                    = useRef<HTMLDivElement>(null)

  function prev() { setCurrent(i => i === 0 ? images.length - 1 : i - 1) }
  function next() { setCurrent(i => i === images.length - 1 ? 0 : i + 1) }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!imgRef.current) return
    const rect = imgRef.current.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  function handleClick() {
    // Desktop: toggle zoom · Mobile: abrir lightbox
    if (window.matchMedia('(pointer: coarse)').matches) {
      setLightbox(true)
    } else {
      setZoomed(v => !v)
    }
  }

  if (images.length === 0) return null

  return (
    <>
      <div className="w-full md:w-auto md:max-w-md mx-auto md:mx-0 overflow-hidden">

        {/* Imagen principal */}
        <div
          ref={imgRef}
          className={`relative aspect-[3/4] overflow-hidden bg-white ${zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
          onClick={handleClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomed(false)}
        >
          <Image
            src={images[current]}
            alt={`${alt} ${current + 1}`}
            fill
            className={`object-contain transition-transform duration-200 ${zoomed ? 'scale-[2.2]' : 'scale-100'}`}
            style={zoomed ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` } : {}}
            sizes="(max-width: 768px) 90vw, (max-width: 1024px) 400px, 500px"
            priority
            draggable={false}
          />

          {!zoomed && (
            <span className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 pointer-events-none">
              + Zoom
            </span>
          )}

          {images.length > 1 && !zoomed && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Imagen anterior"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8L10 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Siguiente imagen"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3L11 8L6 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </>
          )}

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
                <Image src={src} alt={`${alt} thumbnail ${i + 1}`} fill className="object-contain" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox mobile con pinch-to-zoom */}
      {lightbox && (
        <MobileLightbox
          src={images[current]}
          alt={alt}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  )
}
