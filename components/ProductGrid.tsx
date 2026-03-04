'use client'

import { useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/lib/products'

interface ProductGridProps {
  products: Product[]
}

const PAGE_SIZE = 12

export default function ProductGrid({ products }: ProductGridProps) {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(products.length / PAGE_SIZE)
  const start = (page - 1) * PAGE_SIZE
  const visible = products.slice(start, start + PAGE_SIZE)

  function goTo(n: number) {
    setPage(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-12">
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="w-9 h-9 border border-gray-300 text-sm font-bold hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => goTo(n)}
              className={`w-9 h-9 border text-sm font-bold transition-colors ${
                n === page
                  ? 'bg-black text-white border-black'
                  : 'border-gray-300 hover:border-black'
              }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="w-9 h-9 border border-gray-300 text-sm font-bold hover:border-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}
