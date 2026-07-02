/*
  SERVER COMPONENT — sin 'use client'
  Solo muestra texto. No necesita ninguna interacción.
  Recibe el conteo de productos para mostrarlo dinámico.
*/

interface MuseumHeaderProps {
  totalProducts: number
  storecode: string
}

export default function MuseumHeader({ totalProducts, storecode }: MuseumHeaderProps) {
  return (
    <header className="px-4 pt-10 pb-8 border-retro-b">

      {/* Etiqueta superior — estilo código de museo */}
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-3">
        Temporada 2025 — Colección activa
      </p>

      {/* Nombre principal */}
      <h1
        className="[font-family:var(--font-bebas)] uppercase leading-none"
        style={{ fontSize: 'clamp(52px, 15vw, 120px)' }}
      >
        Archivo
        <br />
        de Cancha
      </h1>

      {/* Stats en línea — estilo ficha de museo */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4">
        {[
          { label: 'Piezas', value: totalProducts.toString() },
          { label: 'Ligas', value: '9' },
          { label: 'Envío', value: 'Todo México' },
        ].map(stat => (
          <div key={stat.label} className="flex items-baseline gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-black/40">
              {stat.label}
            </span>
            <span className="font-mono text-xs font-bold">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

    </header>
  )
}
