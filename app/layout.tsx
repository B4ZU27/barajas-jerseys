import type { Metadata } from 'next'
import { Geist, Geist_Mono, Bebas_Neue } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const bebasNeue = Bebas_Neue({ variable: '--font-bebas', subsets: ['latin'], weight: '400' })

export const metadata: Metadata = {
  title: 'Archivo de Cancha | Camisas de Fútbol',
  description: 'Catálogo de camisas de fútbol — Selecciones, Europa, México, Sudamérica y Retro.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
