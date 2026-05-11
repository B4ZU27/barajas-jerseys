import { createStaticClient } from '@/lib/supabase/server'
import NewStoreWizard from './NewStoreWizard'

async function getLeaguesAndTags() {
  const db = createStaticClient()
  const [{ data: leagues }, { data: products }] = await Promise.all([
    db.from('leagues').select('id, slug, name').order('sort_order'),
    db.from('products').select('tags, league_id'),
  ])

  const allTags = [...new Set((products ?? []).flatMap(p => p.tags ?? []))]
  const usedLeagueIds = new Set((products ?? []).map(p => p.league_id).filter(Boolean))
  const activeLeagues = (leagues ?? []).filter(l => usedLeagueIds.has(l.id))

  const counts = {
    all: (products ?? []).length,
    byLeague: Object.fromEntries(
      activeLeagues.map(l => [l.id, (products ?? []).filter(p => p.league_id === l.id).length])
    ),
    byTag: Object.fromEntries(
      allTags.map(t => [t, (products ?? []).filter(p => p.tags?.includes(t)).length])
    ),
  }

  return { leagues: activeLeagues, tags: allTags, counts }
}

export default async function NewStorePage() {
  const { leagues, tags, counts } = await getLeaguesAndTags()
  return <NewStoreWizard leagues={leagues} tags={tags} counts={counts} />
}
