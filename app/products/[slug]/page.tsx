import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getAllSlugs, getPromotions, type Category } from '@/lib/products'
import ImageCarousel from '@/components/ImageCarousel'
import ProductActions from '@/components/ProductActions'

const categoryLabels: Record<Category, string> = {
  selecciones: 'Selecciones Nacionales',
  'clubes-internacionales': 'Clubes Internacionales',
  mexico:      'Clubes México',
  retro:       'Retro',
}

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
  const categoryLabel = categoryLabels[product.category]

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">
        <Link href={`/collections/${product.category}`} className="hover:text-black transition-colors">
          {categoryLabel}
        </Link>
        {' / '}
        {product.name}
      </p>

      {/* Layout producto */}
      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Columna izquierda — imágenes */}
        <ImageCarousel images={product.images} alt={product.name} />

        {/* Columna derecha — info */}
        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{product.club}</p>
            <h1 className="text-2xl font-black uppercase leading-tight">{product.name}</h1>
            <p className="text-2xl font-semibold mt-2">${product.price.toLocaleString('es-MX')}</p>
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          )}

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
