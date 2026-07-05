import { redirect, notFound } from 'next/navigation'
import { getFirstStore } from '@/lib/stores'

export default async function RootPage() {
  const store = await getFirstStore()
  if (!store) notFound()
  redirect(`/${store.slug}`)
}
