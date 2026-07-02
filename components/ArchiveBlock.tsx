import Link from 'next/link'

/*
  SERVER COMPONENT — solo texto + un Link.
  next/link es diferente a <a>: prefetches la página destino
  cuando el link entra en el viewport, haciendo la navegación instantánea.
*/

interface ArchiveBlockProps {
  storecode: string
}

export default function ArchiveBlock({ storecode }: ArchiveBlockProps) {
  return (
    <section className="border-retro-b px-4 py-8">

      <div className="max-w-md">
        {/* Label de sección */}
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">
          Colección histórica
        </p>

        <h2 className="[font-family:var(--font-bebas)] text-4xl uppercase leading-none mb-3">
          El Archivo
        </h2>

        <p className="text-sm text-black/60 leading-relaxed mb-5">
          Recorre la historia de los equipos camisa por camisa,
          año por año. Desde las piezas más icónicas hasta las
          menos conocidas.
        </p>

        {/*
          Link de next/link se comporta como <a> pero sin recargar la página.
          Next.js hace client-side navigation: solo cambia lo que necesita.
          className aplica los mismos estilos que en CSS.
        */}
        <Link href={`/${storecode}/archivo`} className="btn-retro">
          Entrar al Archivo →
        </Link>
      </div>

    </section>
  )
}
