import Link from 'next/link'
import CollectionCard from '@/components/CollectionCard'
import ProductCard from '@/components/ProductCard'
import { getAllProducts } from '@/lib/products'

const collections = [
  { slug: 'selecciones', label: 'Selecciones',  image: '/images/collections/selecciones.jpg' },
  { slug: 'clubes-internacionales', label: 'Clubes Internacionales', image: '/images/collections/clubes-internacionales.jpg' },
  { slug: 'mexico',      label: 'México',        image: '/images/collections/mexico.jpg' },
  { slug: 'retro',       label: 'Retro',         image: '/images/collections/retro.jpg' },
]

export default function HomePage() {
  const featured = getAllProducts().slice(0, 8)

  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white px-4 py-20 text-center">
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-4">Nueva colección</p>
        <h1 className="text-5xl md:text-7xl font-black uppercase leading-none mb-6">
          Camisas<br />de Fútbol
        </h1>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto text-sm">
          Selecciones, clubes europeos, mexicanos, sudamericanos y retro.
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
        <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-6">Colecciones</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {collections.map((col) => (
            <CollectionCard
              key={col.slug}
              category={col.slug as any}
              label={col.label}
              image={col.image}
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
