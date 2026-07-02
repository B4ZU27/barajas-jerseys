import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductsByCategory, CATEGORY_LABELS } from '@/lib/products'
import ProductGrid from '@/components/ProductGrid'

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const label = CATEGORY_LABELS[category]
  return {
    title: label ? `${label} | Archivo de Cancha` : 'Colección | Archivo de Cancha',
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
    <div>

      {/* Encabezado de colección */}
      <div className="px-4 pt-8 pb-6 border-retro-b">

        {/* Breadcrumb retro */}
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/40 mb-4">
          <Link href={`/${storecode}/camisas`} className="hover:text-black transition-colors">
            Meus Jerseys
          </Link>
          <span className="mx-2">—</span>
          {label}
        </p>

        <div className="flex items-end justify-between">
          <h1
            className="[font-family:var(--font-bebas)] uppercase leading-none"
            style={{ fontSize: 'clamp(40px, 10vw, 80px)' }}
          >
            {label}
          </h1>
          <span className="font-mono text-xs text-black/40 mb-1">
            {products.length} piezas
          </span>
        </div>
      </div>

      {/* Grid de productos */}
      {products.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-black/30">
            Sin camisas en esta colección todavía.
          </p>
        </div>
      ) : (
        <div className="px-4 py-8">
          <ProductGrid products={products} storecode={storecode} />
        </div>
      )}

    </div>
  )
}
