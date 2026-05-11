import { getCatalogProducts } from '@/lib/products'
import ProductGrid from '@/components/ProductGrid'

export default async function CamisasPage({ params }: { params: Promise<{ storecode: string }> }) {
  const { storecode } = await params
  const products = await getCatalogProducts()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="text-2xl font-black uppercase">Camisas</h1>
        <span className="text-xs text-gray-400">{products.length} productos</span>
      </div>
      <ProductGrid products={products} storecode={storecode} />
    </div>
  )
}
