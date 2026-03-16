import Link from 'next/link'
import CollectionCard from '@/components/CollectionCard'
import ProductCard from '@/components/ProductCard'
import { getActiveCategories, getProductsByTag, getAllProducts } from '@/lib/products'

export default function HomePage() {
  const collections = getActiveCategories()
  const destacados = getProductsByTag('destacado')
  const featured = destacados.length >= 4
    ? destacados.slice(0, 8)
    : getAllProducts().slice(0, 8)

  return (
    <div>
      {/* Hero */}
      <section
        className="relative h-[90vw] max-h-[560px] md:h-[560px] bg-cover bg-top"
        style={{ backgroundImage: "url('/hero_002.png')" }}
      >
        {/* Gradiente solo en la parte inferior para leer el texto */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Texto al pie de la imagen */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-7 text-white">
          <h1 className="text-3xl md:text-4xl uppercase leading-tight [font-family:var(--font-bebas)]">
            Jerseys Retro<br />y Mundialistas
          </h1>
        </div>
      </section>

      {/* Colecciones */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="flex items-baseline gap-4 mb-1">
          <h2 className="text-[42px] md:text-[56px] uppercase leading-none [font-family:var(--font-bebas)]">Colecciones</h2>
          <span className="text-xs uppercase tracking-widest text-gray-400 pb-1">— elige tu liga</span>
        </div>
        <div className="border-t-2 border-black mb-0" />
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
