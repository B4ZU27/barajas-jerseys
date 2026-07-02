/*
  SERVER COMPONENT — página de timeline de un equipo específico.

  Recibe dos params de la URL:
    storecode → qué tienda
    club      → slug del equipo (ej: "argentina", "real-madrid")

  Si el club no tiene camisas con año → notFound() muestra la página 404.
*/

import { notFound } from 'next/navigation'
import { getProductsByClubForArchive } from '@/lib/products'
import JerseyTimeline from '@/components/JerseyTimeline'

// Archivo oculto temporalmente — en desarrollo

function toLabel(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default async function ArchivoClubPage({
  params,
}: {
  params: Promise<{ storecode: string; club: string }>
}) {
  notFound()
  const { storecode, club } = await params

  /*
    getProductsByClubForArchive devuelve solo productos con año,
    ordenados de más antiguo a más reciente.
    Si no hay ninguno → el equipo no tiene timeline.
  */
  const products = await getProductsByClubForArchive(club)

  if (products.length === 0) notFound()

  return (
    /*
      max-w-lg centra el timeline en desktop haciéndolo más parecido
      a la experiencia mobile — una camisa a la vez, centrada.
    */
    <div className="max-w-lg mx-auto border-x border-black/10">
      <JerseyTimeline
        products={products}
        storecode={storecode}
        clubLabel={toLabel(club)}
      />
    </div>
  )
}
