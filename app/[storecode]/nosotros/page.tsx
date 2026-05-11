export const metadata = {
  title: 'Nosotros | Jerseys',
}

export default function NosotrosPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">Quiénes somos</p>
      <h1 className="text-4xl font-black uppercase leading-tight mb-10">
        Nuestra<br />historia
      </h1>

      <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
        <p>
          Somos apasionados del fútbol que decidimos llevar las mejores camisas del mundo
          directamente a los aficionados. Selecciones nacionales, clubes europeos, mexicanos,
          sudamericanos y colecciones retro — todo en un solo lugar.
        </p>
        <p>
          Nuestro compromiso es ofrecer calidad y variedad al mejor precio, con atención
          personalizada por WhatsApp para que encuentres exactamente lo que buscas.
        </p>
        <p>
          Envíos a toda la república. Tallas de la S a la 2XL. Contáctanos y te asesoramos.
        </p>
      </div>
    </div>
  )
}
