import { notFound } from 'next/navigation'
import MuseumHeader from '@/components/MuseumHeader'
import ArchiveBlock from '@/components/ArchiveBlock'
import VideoStrip from '@/components/VideoStrip'
import JerseyFeed from '@/components/JerseyFeed'
import { getCatalogProducts, getActiveCategories, getProductsWithVideos } from '@/lib/products'
import { getFirstStore } from '@/lib/stores'

export default async function RootHomePage() {
  const store = await getFirstStore()
  if (!store) notFound()

  const [products, leagues, withVideos] = await Promise.all([
    getCatalogProducts(),
    getActiveCategories(),
    getProductsWithVideos(),
  ])

  return (
    <div>
      <MuseumHeader totalProducts={products.length} storecode={store.slug} />

      {withVideos.length > 0 && (
        <VideoStrip products={withVideos} storecode={store.slug} />
      )}

      <ArchiveBlock storecode={store.slug} />

      <JerseyFeed products={products} leagues={leagues} storecode={store.slug} />
    </div>
  )
}
