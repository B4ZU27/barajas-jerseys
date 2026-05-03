import Link from 'next/link'
import CollectionCard from '@/components/CollectionCard'
import ProductCard from '@/components/ProductCard'
import HeroCarousel from '@/components/HeroCarousel'
import VideoStrip from '@/components/VideoStrip'
import { getActiveCategories, getProductsByTag, getCatalogProducts, getProductsWithVideos } from '@/lib/products'

export default async function HomePage() {
  const [collections, retros, withVideos, destacados, catalog] = await Promise.all([
    getActiveCategories(),
    getProductsByTag('retro'),
    getProductsWithVideos(),
    getProductsByTag('destacado'),
    getCatalogProducts(),
  ])
  const featured = destacados.length >= 4 ? destacados.slice(0, 8) : catalog.slice(0, 8)
  const retrosSliced = retros.slice(0, 10)

  return (
    <div>
      {/* Hero carousel — camisas retro */}
      <HeroCarousel products={retrosSliced} />

      {/* Strip de videos — solo aparece si hay productos con video */}
      <VideoStrip products={withVideos} />

      {/* Colecciones */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-baseline gap-4 mb-1">
          <h2 className="text-[42px] md:text-[56px] uppercase leading-none [font-family:var(--font-bebas)]">Colecciones</h2>
          <span className="text-xs uppercase tracking-widest text-gray-400 pb-1">— elige tu liga</span>
        </div>
        <div className="border-t-2 border-black mb-3" />

        {/* Grid 2 cols en mobile, lista en desktop */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-0">
          {collections.map((col, i) => (
            <CollectionCard
              key={col.slug}
              category={col.slug}
              label={col.label}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">Destacados</h2>
          <Link href="/camisas" className="text-xs uppercase tracking-widest underline underline-offset-4">
            Ver todo
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}
