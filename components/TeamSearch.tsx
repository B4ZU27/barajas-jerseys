'use client'

/*
  CLIENT COMPONENT — necesita useState para el buscador.
  Recibe los clubes del servidor (ya filtrados: solo los que tienen año).
  El filtro de búsqueda ocurre 100% en el cliente sin re-fetch.
*/

import { useState } from 'react'
import Link from 'next/link'
import type { ArchiveClub } from '@/lib/products'

interface TeamSearchProps {
  clubs: ArchiveClub[]
  storecode: string
}

function toLabel(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export default function TeamSearch({ clubs, storecode }: TeamSearchProps) {
  const [query, setQuery] = useState('')

  /*
    El filtro es instantáneo — no hace fetch, solo filtra el array en memoria.
    Normalize para que "españa" encuentre "espana" y viceversa.
  */
  const filtered = clubs.filter(club =>
    toLabel(club.slug)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .includes(
        query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      )
  )

  return (
    <div>

      {/* Buscador */}
      <div className="px-4 py-4 border-retro-b">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar equipo..."
          className="w-full border-retro px-4 py-3 font-mono text-sm uppercase tracking-widest placeholder:text-black/30 focus:outline-none bg-white"
          autoFocus
        />
      </div>

      {/* Conteo de resultados */}
      {query && (
        <div className="px-4 py-2 border-retro-b">
          <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
            {filtered.length} equipo{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Lista de equipos */}
      {filtered.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-black/30">
            Sin resultados para "{query}"
          </p>
        </div>
      ) : (
        <div>
          {filtered.map(club => (
            /*
              Link de Next.js — navega a /archivo/[club-slug]
              El grupo [club] en la carpeta captura este valor como params.club
            */
            <Link
              key={club.slug}
              href={`/${storecode}/archivo/${club.slug}`}
              className="flex items-center justify-between px-4 py-4 border-retro-b
                hover:bg-black hover:text-white transition-colors group"
            >
              <div>
                <p className="font-black text-sm uppercase tracking-wider">
                  {toLabel(club.slug)}
                </p>
                <p className="font-mono text-[10px] text-black/40 group-hover:text-white/60 mt-0.5">
                  {club.minYear}
                  {club.minYear !== club.maxYear ? ` – ${club.maxYear}` : ''}
                  {' · '}
                  {club.count} camisa{club.count !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Barra de "profundidad" — visual de cuántas camisas tiene */}
                <div className="hidden sm:flex gap-0.5">
                  {Array.from({ length: Math.min(club.count, 8) }).map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-black group-hover:bg-white transition-colors"
                      style={{ height: `${8 + i * 3}px`, alignSelf: 'flex-end' }}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs font-bold">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
