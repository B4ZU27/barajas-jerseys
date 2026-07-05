import { createStaticClient } from '@/lib/supabase/server'

export interface Store {
  id: string
  slug: string
  name: string
  whatsapp: string | null
  email: string | null
  show_prices: boolean
  logo_url: string | null
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('stores')
    .select('id, slug, name, whatsapp, email, show_prices, logo_url')
    .eq('slug', slug)
    .single()
  return data ?? null
}

export async function getAllStores(): Promise<Store[]> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('stores')
    .select('id, slug, name, whatsapp, email, show_prices, logo_url')
    .order('name')
  return data ?? []
}

export async function getFirstStore(): Promise<Store | null> {
  const supabase = createStaticClient()
  const { data } = await supabase
    .from('stores')
    .select('id, slug, name, whatsapp, email, show_prices, logo_url')
    .order('created_at')
    .limit(1)
    .maybeSingle()
  return data ?? null
}
