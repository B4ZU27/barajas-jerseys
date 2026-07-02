export const metadata = {
  title: 'Nós | Archivo de Cancha',
}

export default function NosotrosPage() {
  return (
    <div className="max-w-2xl mx-auto">

      {/* Encabezado */}
      <div className="px-4 pt-8 pb-6 border-retro-b">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 mb-2">
          Quiénes somos
        </p>
        <h1
          className="[font-family:var(--font-bebas)] uppercase leading-none"
          style={{ fontSize: 'clamp(52px, 14vw, 100px)' }}
        >
          Nós
        </h1>
      </div>

      {/* Contenido editorial */}
      <div className="px-4 py-8 space-y-0">

        {[
          {
            num: '01',
            title: 'De dónde venimos',
            text: 'Somos apasionados del fútbol que decidimos llevar las mejores camisas del mundo directamente a los aficionados. Selecciones nacionales, clubes europeos, liga mexicana y colecciones retro — todo en un solo lugar.',
          },
          {
            num: '02',
            title: 'Qué hacemos',
            text: 'Cubrimos todo el mundo del balompié: desde la camisa del Mundial de 1986 hasta la más reciente del Clásico. Cada pieza es seleccionada con criterio. No vendemos cualquier cosa — vendemos historia.',
          },
          {
            num: '03',
            title: 'Cómo trabajamos',
            text: 'Atención personalizada por WhatsApp. Te asesoramos en talla, versión (player vs fan) y disponibilidad. Envíos a toda la república. Tallas de la XS a la 4XL.',
          },
        ].map(item => (
          <div key={item.num} className="border-retro-b py-6">
            <div className="flex items-start gap-4">
              <span className="[font-family:var(--font-bebas)] text-4xl text-black/15 shrink-0 leading-none mt-1">
                {item.num}
              </span>
              <div>
                <h2 className="font-black text-sm uppercase tracking-wider mb-2">
                  {item.title}
                </h2>
                <p className="text-sm text-black/60 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}
