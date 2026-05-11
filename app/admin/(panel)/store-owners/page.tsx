import Link from 'next/link'

export default function StoreOwnersPage() {
  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-xl font-black uppercase tracking-widest mb-1" style={{ color: 'var(--blue-deep)' }}>
        Store Owners
      </h1>
      <p className="text-xs text-gray-400 mb-8">
        Los store owners se crean y gestionan directamente al crear una tienda.
      </p>
      <Link
        href="/admin/stores/new"
        className="text-xs font-bold uppercase tracking-wider px-4 py-3 text-white inline-block"
        style={{ backgroundColor: 'var(--blue-primary)' }}
      >
        + Crear nueva tienda y owner
      </Link>
      <p className="text-xs text-gray-400 mt-6">
        Para ver los owners existentes, visita{' '}
        <Link href="/admin/stores" className="underline hover:text-black">
          la lista de tiendas
        </Link>
        .
      </p>
    </div>
  )
}
