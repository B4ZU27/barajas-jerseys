import { notFound } from 'next/navigation'
import { getProductsByCategory, getActiveCategories, CATEGORY_LABELS } from '@/lib/products'
import ProductGrid from '@/components/ProductGrid'

export async function generateStaticParams() {
  const categories = await getActiveCategories()
  return categories.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const label = CATEGORY_LABELS[category]
  return {
    title: label ? `${label} | Jerseys` : 'Colección | Jerseys',
  }
}

export default async function CollectionPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const label = CATEGORY_LABELS[category]

  if (!label) notFound()

  const products = await getProductsByCategory(category)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <p className="text-xs text-gray-400 uppercase tracking-widest mb-6">
        <a href="/camisas" className="hover:text-black transition-colors">Camisas</a> / {label}
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
        <ProductGrid products={products} />
      )}
    </div>
  )
}
