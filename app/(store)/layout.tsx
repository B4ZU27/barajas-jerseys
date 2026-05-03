import Navbar from '@/components/Navbar'
import { getPromotions, getActiveCategories, getActiveTags } from '@/lib/products'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [promos, categories, tags] = await Promise.all([
    getPromotions(),
    getActiveCategories(),
    getActiveTags(),
  ])

  return (
    <>
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
        <div
          className="text-white text-center text-xs py-2 px-4 font-bold tracking-widest uppercase"
          style={{ backgroundColor: 'var(--blue-deep)' }}
        >
          {promos.banner}
        </div>
      )}
      <Navbar categories={categories} tags={tags} />
      <main className="min-h-screen">{children}</main>
      <div className="grainy-bottom" />
    </>
  )
}
