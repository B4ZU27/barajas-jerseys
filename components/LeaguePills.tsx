'use client'

/*
  CLIENT COMPONENT — tiene 'use client' porque:
  - El usuario hace clic en los pills para filtrar
  - Necesitamos useState para saber cuál está activo
  - Necesitamos comunicar el filtro al JerseyFeed (via callback)
*/

interface LeaguePillsProps {
  leagues: { slug: string; label: string }[]
  active: string
  onSelect: (slug: string) => void
}

const SPECIAL_PILLS = [
  { slug: 'todo',        label: 'Todo' },
  { slug: 'retro',      label: 'Retro' },
  { slug: 'mundialista', label: 'Mundial' },
]

export default function LeaguePills({ leagues, active, onSelect }: LeaguePillsProps) {
  const allPills = [
    ...SPECIAL_PILLS,
    ...leagues.map(l => ({ slug: l.slug, label: l.label })),
  ]

  return (
    /*
      sticky top-[offset] — se queda pegado justo debajo del Navbar mientras scrolleas.
      overflow-x-auto + scrollbar-none — scroll horizontal sin barra visible.
      gap + flex — los pills se acomodan en fila horizontal.
    */
    <div
      className="sticky z-30 bg-white border-retro-top border-retro-b overflow-x-auto"
      style={{ top: 'var(--navbar-height, 56px)', scrollbarWidth: 'none' }}
    >
      <div className="flex gap-0 min-w-max">
        {allPills.map((pill) => (
          <button
            key={pill.slug}
            onClick={() => onSelect(pill.slug)}
            className={`pill-retro border-r border-black/20 last:border-r-0 ${
              active === pill.slug ? 'active' : ''
            }`}
            style={{ padding: '10px 16px' }}
          >
            {pill.label}
          </button>
        ))}
      </div>
    </div>
  )
}
