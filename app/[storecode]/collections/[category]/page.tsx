import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductsByCategory, CATEGORY_LABELS } from '@/lib/products'
import ProductGrid from '@/components/ProductGrid'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const label = CATEGORY_LABELS[category]
  return {
    title: label ? `${label} | Jerseys` : 'Colección | Jerseys',
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ storecode: string; category: string }>
}) {
  const { storecode, category } = await params
  const label = CATEGORY_LABELS[category]
  if (!label) notFound()

  const products = await getProductsByCategory(category)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
        <Link href={`/${storecode}/camisas`} className="hover:text-black transition-colors">
          Camisas
        </Link>{' '}
        / {label}
      </p>

      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-2xl font-black uppercase">{label}</h1>
        <span className="text-xs text-gray-400">{products.length} productos</span>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-400 text-sm py-20 text-center">
          No hay productos en esta categoría todavía.
        </p>
      ) : (
        <ProductGrid products={products} storecode={storecode} />
      )}
    </div>
  )
}
