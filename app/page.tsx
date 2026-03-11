import Link from 'next/link'
import CollectionCard from '@/components/CollectionCard'
import ProductCard from '@/components/ProductCard'
import { getActiveCategories, getProductsByClubAndTag, getAllProducts } from '@/lib/products'

export default function HomePage() {
  const collections = getActiveCategories()
  const mexicoMundialistas = getProductsByClubAndTag('mexico', 'mundialista')
  const featured = mexicoMundialistas.length >= 4
    ? mexicoMundialistas.slice(0, 8)
    : getAllProducts().slice(0, 8)

  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white px-4 py-20 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Nueva colección</p>
        <h1 className="text-6xl md:text-8xl uppercase leading-none mb-6 [font-family:var(--font-bebas)]">
          Jerseys<br />Mundialistas
        </h1>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">
          Selecciones, clubes de todo el mundo y especialidades en jerseys retro.
        </p>
        <Link
          href="/collections/selecciones"
          className="inline-block border border-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
        >
          Ver catálogo
        </Link>
      </section>

      {/* Colecciones */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-2">Colecciones</h2>
        <div className="flex flex-col">
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
          <Link href="/collections/selecciones" className="text-xs uppercase tracking-widest underline underline-offset-4">
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
