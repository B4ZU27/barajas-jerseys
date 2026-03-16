import type { Metadata } from 'next'
import { Geist, Geist_Mono, Bebas_Neue } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { getPromotions, getActiveCategories, getActiveTags } from '@/lib/products'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const bebasNeue = Bebas_Neue({ variable: '--font-bebas', subsets: ['latin'], weight: '400' })

export const metadata: Metadata = {
  title: 'Grada Sur | Camisas de Fútbol',
  description: 'Catálogo de camisas de fútbol — Selecciones, Europa, México, Sudamérica y Retro.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const promos = getPromotions()
  const categories = getActiveCategories()
  const tags = getActiveTags()

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} antialiased`}>
        {/* Ticker superior */}
        <div className="bg-black text-white overflow-hidden py-2 select-none">
          <div className="animate-ticker">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className="text-xs font-bold uppercase tracking-widest px-10">
                Nueva colección mundialista y camisas retro que nunca antes habías visto
                <span className="mx-6 text-white/30">◆</span>
              </span>
            ))}
          </div>
        </div>

        {promos.active && (
          <div className="text-white text-center text-xs py-2 px-4 font-bold tracking-widest uppercase" style={{ backgroundColor: 'var(--blue-deep)' }}>
            {promos.banner}
          </div>
        )}
        <Navbar categories={categories} tags={tags} />
        <main className="min-h-screen">{children}</main>
        <div className="grainy-bottom" />
      </body>
    </html>
  )
}
