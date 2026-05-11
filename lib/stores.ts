import { createStaticClient } from '@/lib/supabase/server'

export interface Store {
  id: string
  slug: string
  name: string
  whatsapp: string | null
  show_prices: boolean
  logo_url: string | null
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('stores')
    .select('id, slug, name, whatsapp, show_prices, logo_url')
    .eq('slug', slug)
    .single()
  return data ?? null
}

export async function getAllStores(): Promise<Store[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('stores')
    .select('id, slug, name, whatsapp, show_prices, logo_url')
    .order('name')
  return data ?? []
}
