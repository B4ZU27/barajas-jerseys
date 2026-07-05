/*
  SERVER COMPONENT — page.tsx siempre es Server por default en Next.js 14+.

  Esta función recibe 'params' con los valores de la URL dinámica.
  [storecode] en el nombre de carpeta → params.storecode en el código.

  Como es async, puede esperar llamadas a la base de datos directamente.
  Next.js corre esto en el servidor y manda el HTML listo al browser.
*/

import MuseumHeader from '@/components/MuseumHeader'
import ArchiveBlock from '@/components/ArchiveBlock'
import VideoStrip from '@/components/VideoStrip'
import JerseyFeed from '@/components/JerseyFeed'
import { getCatalogProducts, getActiveCategories, getProductsWithVideos } from '@/lib/products'

export default async function HomePage({
  params,
}: {
  params: Promise<{ storecode: string }>
}) {
  const { storecode } = await params

  /*
    Promise.all — lanza las tres consultas A LA VEZ en paralelo.
    Si las hicieras en secuencia (await una, await otra, await otra)
    tardaría 3x más. Así tardan lo que tarde la más lenta.
  */
  const [products, leagues, withVideos] = await Promise.all([
    getCatalogProducts(),      // todos los productos (sin video-only)
    getActiveCategories(),     // ligas con productos activos
    getProductsWithVideos(),   // para la sección "en movimiento"
  ])

  return (
    <div>
      {/*
        MuseumHeader, ArchiveBlock y VideoStrip son Server Components:
        se renderizan en el servidor y llegan al browser como HTML puro.

        JerseyFeed es Client Component: el HTML inicial viene del servidor
        (Next.js hace SSR del cliente también), pero se "hidrata" en el browser
        para activar el estado, clicks y shuffle.
      */}

      <MuseumHeader totalProducts={products.length} storecode={storecode} />

      {withVideos.length > 0 && (
        <VideoStrip products={withVideos} storecode={storecode} />
      )}

      <ArchiveBlock storecode={storecode} />

      {/*
        JerseyFeed recibe todos los productos como prop.
        Dentro del componente, el cliente maneja filtros y shuffle
        sin volver a llamar a la base de datos.
      */}
      <JerseyFeed
        products={products}
        leagues={leagues}
        storecode={storecode}
      />
    </div>
  )
}
