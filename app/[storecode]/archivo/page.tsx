/*
  SERVER COMPONENT — página de entrada a El Archivo.
  Carga la lista de clubes con camisas catalogadas (año registrado)
  y la pasa al componente de búsqueda en el cliente.

  Si no hay clubs con año aún, muestra un mensaje.
*/

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getArchiveClubs } from '@/lib/products'
import TeamSearch from '@/components/TeamSearch'

function toLabel(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default async function ArchivoPage({
  params,
}: {
  params: Promise<{ storecode: string }>
}) {
  notFound()
  const { storecode } = await params
  const clubs = await getArchiveClubs()

  return (
    <div className="max-w-2xl mx-auto">

      {/* Encabezado */}
      <div className="px-4 pt-8 pb-6 border-retro-b">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">
              Colección histórica
            </p>
            <h1
              className="[font-family:var(--font-bebas)] uppercase leading-none"
              style={{ fontSize: 'clamp(48px, 12vw, 96px)' }}
            >
              El Archivo
            </h1>
            <p className="text-sm text-black/60 leading-relaxed mt-3 max-w-xs">
              Recorre la historia de los equipos camisa por camisa,
              año por año.
            </p>
          </div>

          {/* Stats */}
          <div className="text-right shrink-0">
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
              {clubs.length} equipos
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-black/40">
              {clubs.reduce((sum, c) => sum + c.count, 0)} camisas
            </p>
          </div>
        </div>

        {/* Link volver al catálogo */}
        <Link
          href={`/${storecode}/camisas`}
          className="inline-block mt-4 font-mono text-[10px] uppercase tracking-widest text-black/40 hover:text-black transition-colors"
        >
          ← Meus Jerseys
        </Link>
      </div>

      {clubs.length === 0 ? (
        <div className="px-4 py-20 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-black/30">
            Aún no hay camisas con año registrado.
          </p>
          <p className="font-mono text-[10px] text-black/20 mt-2">
            Agrega el año desde el panel de admin.
          </p>
        </div>
      ) : (
        <>
          {/* ── Tarjetas destacadas — primeros 2 clubes ── */}
          <div className="grid grid-cols-2 border-retro-b">
            {clubs.slice(0, 2).map((club) => (
              <Link
                key={club.slug}
                href={`/${storecode}/archivo/${club.slug}`}
                className="group relative border-r border-black last:border-r-0 overflow-hidden"
              >
                {/* Imagen de portada */}
                <div className="relative aspect-[3/4] bg-white">
                  {club.coverImage ? (
                    <Image
                      src={club.coverImage}
                      alt={toLabel(club.slug)}
                      fill
                      className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="50vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="font-mono text-[10px] text-black/20 uppercase tracking-widest">
                        Sin imagen
                      </span>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div className="border-retro-top p-3">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-black/40">
                    {club.minYear}{club.minYear !== club.maxYear ? ` – ${club.maxYear}` : ''} · {club.count} camisa{club.count !== 1 ? 's' : ''}
                  </p>
                  <h3 className="[font-family:var(--font-bebas)] text-xl uppercase leading-tight mt-0.5">
                    {toLabel(club.slug)}
                  </h3>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-black/40 mt-1 group-hover:text-black transition-colors">
                    Ver historia →
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* ── Buscador con el resto de equipos ── */}
          <TeamSearch clubs={clubs} storecode={storecode} />
        </>
      )}

    </div>
  )
}
