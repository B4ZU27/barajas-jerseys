import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getAllSlugs, getPromotions, CATEGORY_LABELS } from '@/lib/products'
import ImageCarousel from '@/components/ImageCarousel'
import VideoCarousel from '@/components/VideoCarousel'
import ProductActions from '@/components/ProductActions'

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  return {
    title: product ? `${product.name} | Jerseys` : 'Producto | Jerseys',
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) notFound()

  const promos = getPromotions()
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
        <Link href={`/collections/${product.category}`} className="hover:text-black transition-colors">
          {categoryLabel}
        </Link>
        {' / '}
        {product.name}
      </p>

      {/* Layout producto */}
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Columna izquierda — imágenes y videos */}
        <div className="min-w-0">
          <ImageCarousel images={product.images} alt={product.name} />
          {product.videos && product.videos.length > 0 && (
            <VideoCarousel videos={product.videos} alt={product.name} />
          )}
        </div>

        {/* Columna derecha — info */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs uppercase tracking-widest text-gray-400">{product.club}</p>
              {product.tags?.includes('retro') && (
                <span className="bg-purple-700 text-white font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                  RETRO
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black uppercase leading-tight">{product.name}</h1>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          )}

          <Link
            href="/tallas"
            className="text-xs uppercase tracking-widest underline underline-offset-4 text-gray-400 hover:text-black transition-colors"
          >
            Ver guía de tallas →
          </Link>
          <ProductActions product={product} />

          {/* Deals de promoción */}
          {promos.active && (
            <div className="border border-gray-200 p-4">
              <p className="text-xs font-bold uppercase tracking-widest mb-3">Promociones</p>
              <ul className="space-y-2">
                {promos.deals.map((deal) => (
                  <li key={deal.quantity} className="text-sm flex justify-between">
                    <span className="text-gray-600">{deal.quantity} camisas</span>
                    <span className="font-bold">${deal.total.toLocaleString('es-MX')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
