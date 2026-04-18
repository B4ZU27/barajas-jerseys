'use client'

import { useState } from 'react'

interface VideoCarouselProps {
  videos: string[]
  alt: string
}

/**
 * Converts a Cloudinary video URL to a JPEG thumbnail of the first frame.
 * Works by inserting transformation params and swapping the extension.
 */
function getCloudinaryPoster(videoUrl: string): string {
  if (videoUrl.includes('cloudinary.com') && videoUrl.includes('/video/upload/')) {
    return videoUrl
      .replace('/video/upload/', '/video/upload/so_0,w_128/')
      .replace(/\.(mp4|mov|webm)$/i, '.jpg')
  }
  return ''
}

export default function VideoCarousel({ videos, alt }: VideoCarouselProps) {
  const [current, setCurrent] = useState(0)

  function prev() { setCurrent(i => i === 0 ? videos.length - 1 : i - 1) }
  function next() { setCurrent(i => i === videos.length - 1 ? 0 : i + 1) }

  if (!videos || videos.length === 0) return null

  return (
    <div className="w-full md:w-auto md:max-w-md mx-auto md:mx-0 overflow-hidden mt-3">
      {/* Label */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">
        En movimiento
      </p>

      {/* Video principal */}
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        {/* key fuerza remount del elemento al cambiar video → autoplay funciona */}
        <video
          key={videos[current]}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-contain"
        >
          <source src={videos[current]} type="video/mp4" />
        </video>

        {/* Flechas */}
        {videos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              aria-label="Video anterior"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8L10 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white flex items-center justify-center transition-colors"
              aria-label="Siguiente video"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3L11 8L6 13" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {videos.length > 1 && (
          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 font-mono">
            {current + 1} / {videos.length}
          </span>
        )}
      </div>

      {/* Thumbnails */}
      {videos.length > 1 && (
        <div className="flex gap-1 md:gap-2 mt-2 overflow-x-auto pb-2">
          {videos.map((url, i) => {
            const poster = getCloudinaryPoster(url)
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`relative aspect-square w-16 overflow-hidden flex-shrink-0 border-2 transition-colors bg-black ${
                  i === current ? 'border-black' : 'border-transparent'
                }`}
                aria-label={`Ver video ${i + 1}`}
              >
                {poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={poster} alt={`${alt} video ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}
                {/* Ícono de play */}
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ opacity: 0.75 }}>
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
