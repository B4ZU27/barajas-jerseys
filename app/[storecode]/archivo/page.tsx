import Link from 'next/link'
import { getArchiveClubs } from '@/lib/products'
import TeamSearch from '@/components/TeamSearch'

export default async function ArchivoPage({
  params,
}: {
  params: Promise<{ storecode: string }>
}) {
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
        <TeamSearch clubs={clubs} storecode={storecode} />
      )}

    </div>
  )
}
