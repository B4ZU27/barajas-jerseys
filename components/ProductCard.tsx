'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Product } from '@/lib/products'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [aspectRatio, setAspectRatio] = useState<string | null>(null)

  function handleImageLoad(result: any) {
    const ratio = (result.naturalWidth / result.naturalHeight).toFixed(4)
    setAspectRatio(ratio)
  }

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div
        className="relative overflow-hidden bg-gray-100"
        style={aspectRatio ? { aspectRatio } : { aspectRatio: '0.75' }}
      >
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 45vw, (max-width: 1024px) 25vw, 20vw"
            onLoad={handleImageLoad}
          />
        )}
        {product.tags?.includes('retro') && (
          <span className="absolute top-2 left-2 z-10 bg-purple-700 text-white font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
            RETRO
          </span>
        )}
        {product.tags?.includes('mundialista') && (
          <span className="absolute top-2 left-2 z-10 bg-green-500 text-white font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
            MUNDIAL
          </span>
        )}
        {!product.available && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-widest uppercase">
              Agotado
            </span>
          </div>
        )}
      </div>

      <div className="mt-2 px-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{product.club}</p>
        <h3 className="font-bold text-sm leading-tight mt-0.5">{product.name}</h3>
      </div>
    </Link>
  )
}
