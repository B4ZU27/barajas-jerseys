import { notFound } from 'next/navigation'
import { getStoreBySlug } from '@/lib/stores'

export const metadata = {
  title: 'Contacto | Jerseys',
}

export default async function ContactoPage({
  params,
}: {
  params: Promise<{ storecode: string }>
}) {
  const { storecode } = await params
  const store = await getStoreBySlug(storecode)
  if (!store) notFound()

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-6">Hablemos</p>
      <h1 className="text-4xl font-black uppercase leading-tight mb-10">Contacto</h1>

      <div className="space-y-4">
        {/* WhatsApp */}
        {store.whatsapp && (
          <a
            href={`https://wa.me/${store.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 border border-gray-200 p-5 hover:border-black transition-colors group"
          >
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">WhatsApp</p>
              <p className="font-bold text-sm group-hover:underline">Escríbenos directo</p>
            </div>
          </a>
        )}

        {/* Email */}
        {store.email && (
          <a
            href={`mailto:${store.email}`}
            className="flex items-center gap-4 border border-gray-200 p-5 hover:border-black transition-colors group"
          >
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-0.5">Email</p>
              <p className="font-bold text-sm group-hover:underline">{store.email}</p>
            </div>
          </a>
        )}

        {!store.whatsapp && !store.instagram && !store.email && (
          <p className="text-sm text-gray-400">No hay información de contacto disponible.</p>
        )}
      </div>
    </div>
  )
}
