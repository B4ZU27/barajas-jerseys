import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getPromotions, CATEGORY_LABELS } from '@/lib/products'
import { getStoreBySlug } from '@/lib/stores'
import ImageCarousel from '@/components/ImageCarousel'
import VideoCarousel from '@/components/VideoCarousel'
import ProductActions from '@/components/ProductActions'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  return {
    title: product ? `${product.name} | Archivo de Cancha` : 'Producto | Archivo de Cancha',
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ storecode: string; slug: string }>
}) {
  const { storecode, slug } = await params

  const [product, store, promos] = await Promise.all([
    getProductBySlug(slug),
    getStoreBySlug(storecode),
    getPromotions(),
  ])

  if (!product || !store) notFound()

  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category

  return (
    <div>

      {/* Breadcrumb */}
      <div className="px-4 py-3 border-retro-b">
        <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
          <Link href={`/${storecode}/camisas`} className="hover:text-black transition-colors">
            Meus Jerseys
          </Link>
          <span className="mx-2">—</span>
          <Link href={`/${storecode}/collections/${product.category}`} className="hover:text-black transition-colors">
            {categoryLabel}
          </Link>
          <span className="mx-2">—</span>
          <span className="text-black">{product.name}</span>
        </p>
      </div>

      {/* Layout producto */}
      <div className="grid md:grid-cols-2 md:border-retro-b">

        {/* Columna izquierda — imágenes */}
        <div className="min-w-0 md:border-r md:border-black">
          <ImageCarousel images={product.images} alt={product.name} />
          {product.videos && product.videos.length > 0 && (
            <div className="border-retro-top">
              <VideoCarousel videos={product.videos} alt={product.name} />
            </div>
          )}
        </div>

        {/* Columna derecha — info */}
        <div className="px-4 py-6 flex flex-col gap-5">

          {/* Nombre y badges */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
                {product.club} · {categoryLabel}
              </p>
              {product.tags?.includes('retro') && (
                <span className="border-retro-thin font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                  RETRO
                </span>
              )}
              {product.tags?.includes('mundialista') && (
                <span className="border-retro-thin font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                  MUNDIAL
                </span>
              )}
              {/* Año si tiene */}
              {product.year && (
                <span className="font-mono text-[9px] uppercase tracking-widest text-black/40">
                  {product.year}
                </span>
              )}
            </div>
            <h1
              className="[font-family:var(--font-bebas)] uppercase leading-none"
              style={{ fontSize: 'clamp(28px, 6vw, 52px)' }}
            >
              {product.name}
            </h1>
          </div>

          {/* Historia — si tiene story (El Archivo) */}
          {product.story && (
            <div className="border-retro p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-black/40 mb-2">
                Historia
              </p>
              <p className="text-sm text-black/70 leading-relaxed">
                {product.story}
              </p>
            </div>
          )}

          {/* Descripción */}
          {product.description && (
            <p className="text-sm text-black/60 leading-relaxed border-retro-top pt-4">
              {product.description}
            </p>
          )}

          {/* Link a guía de tallas */}
          <Link
            href={`/${storecode}/tallas`}
            className="font-mono text-[10px] uppercase tracking-widest text-black/40 hover:text-black transition-colors"
          >
            Ver guía de tallas →
          </Link>

          {/* Selector de tallas + botón WhatsApp */}
          <ProductActions
            product={product}
            whatsapp={store.whatsapp ?? ''}
            storecode={storecode}
          />


          {/* Link al archivo si tiene año */}
          {product.year && product.club && (
            <Link
              href={`/${storecode}/archivo/${product.club}`}
              className="font-mono text-[10px] uppercase tracking-widest text-black/40 hover:text-black transition-colors border-retro-top pt-4"
            >
              Ver historia de {product.club.replace(/-/g, ' ')} en El Archivo →
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}
