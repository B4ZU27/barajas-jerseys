/*
  SERVER COMPONENT — carga los datos y renderiza la página.

  <Suspense> es un componente de React que muestra un fallback
  mientras el componente hijo carga o mientras useSearchParams()
  espera los datos de la URL. Next.js lo requiere para cualquier
  componente que use useSearchParams() dentro del árbol.

  Sin Suspense, el build de producción fallaría con este error:
  "useSearchParams() should be wrapped in a suspense boundary"
*/

import { Suspense } from 'react'
import { getCatalogProducts } from '@/lib/products'
import MeusJerseysView from '@/components/MeusJerseysView'

export default async function CamisasPage({
  params,
}: {
  params: Promise<{ storecode: string }>
}) {
  const { storecode } = await params
  const products = await getCatalogProducts()

  return (
    <div>

      {/* Encabezado de página — estilo museo */}
      <div className="px-4 pt-8 pb-6 border-retro-b">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">
          Colección completa
        </p>
        <div className="flex items-end justify-between">
          <h1
            className="[font-family:var(--font-bebas)] uppercase leading-none"
            style={{ fontSize: 'clamp(40px, 10vw, 80px)' }}
          >
            Meus Jerseys
          </h1>
          <span className="font-mono text-xs text-black/40 mb-1">
            {products.length} piezas
          </span>
        </div>
      </div>

      {/*
        Suspense envuelve MeusJerseysView porque ese componente
        usa useSearchParams() internamente.

        fallback= es lo que se muestra mientras el componente suspende.
        Aquí mostramos un skeleton simple del toggle.
      */}
      <Suspense
        fallback={
          <div className="border-retro-b">
            <div className="h-12 bg-black/5 animate-pulse" />
          </div>
        }
      >
        <MeusJerseysView products={products} storecode={storecode} />
      </Suspense>

    </div>
  )
}
