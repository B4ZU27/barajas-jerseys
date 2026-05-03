import Image from 'next/image'
import SizeGuide from '@/components/SizeGuide'

export const metadata = {
  title: 'Guía de Tallas | Jerseys',
}

export default function TallasPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">Guía</p>
      <h1 className="text-4xl font-black uppercase leading-tight mb-10">
        Tabla de<br />Tallas
      </h1>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        Medidas en centímetros. Si estás entre dos tallas, elige la mayor para un fit más holgado.
      </p>
      <SizeGuide />
      <div className="mt-10 relative w-full">
        <Image
          src="/sizes.png"
          alt="Guía visual de tallas"
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}
