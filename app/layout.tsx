import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { getPromotions } from '@/lib/products'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Barajas Jerseys | Camisas de Fútbol',
  description: 'Catálogo de camisas de fútbol — Selecciones, Europa, México, Sudamérica y Retro.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const promos = getPromotions()

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {promos.active && (
          <div className="bg-black text-white text-center text-xs py-2 px-4 font-bold tracking-widest uppercase">
            {promos.banner}
          </div>
        )}
        <Navbar />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  )
}
