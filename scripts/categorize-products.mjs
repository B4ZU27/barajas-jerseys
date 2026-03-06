/**
 * categorize-products.mjs
 *
 * Lee data/products.json, detecta equipo y liga desde el nombre,
 * marca como retro si el año es <= 2000, y sobreescribe el JSON.
 * También genera data/categorization-report.json.
 *
 * Uso: node scripts/categorize-products.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── Mapeo de equipos ─────────────────────────────────────────────────────────
// Regla: los términos más largos (más específicos) deben aparecer PRIMERO
// dentro de cada entrada. La función de match elige la entrada cuyo término
// más largo coincida (longest-match), así "real madrid" gana sobre "madrid".

const TEAM_MAP = [

  // ── Selecciones ──────────────────────────────────────────────────────────────
  { terms: ['west germany', 'west-germany', 'westgermany'],   club: 'west-germany',    category: 'selecciones' },
  { terms: ['south korea', 'south-korea'],                    club: 'south-korea',     category: 'selecciones' },
  { terms: ['ivory coast', 'cote divoire', 'cote-divoire'],   club: 'ivory-coast',     category: 'selecciones' },
  { terms: ['soviet union', 'soviet-union', 'ussr'],          club: 'ussr',            category: 'selecciones' },
  { terms: ['czech republic', 'czechoslovakia'],              club: 'czech-republic',  category: 'selecciones' },
  { terms: ['united states', 'united-states'],                club: 'usa',             category: 'selecciones' },
  { terms: ['new zealand', 'new-zealand'],                    club: 'new-zealand',     category: 'selecciones' },
  { terms: ['costa rica', 'costa-rica'],                      club: 'costa-rica',      category: 'selecciones' },
  { terms: ['argentina'],   club: 'argentina',   category: 'selecciones' },
  { terms: ['italy', 'italia'],       club: 'italy',       category: 'selecciones' },
  { terms: ['france', 'francia'],     club: 'france',      category: 'selecciones' },
  { terms: ['germany', 'deutschland', 'alemania'], club: 'germany', category: 'selecciones' },
  { terms: ['brazil', 'brasil'],      club: 'brazil',      category: 'selecciones' },
  { terms: ['mexico', 'méxico'],      club: 'mexico',      category: 'selecciones' },
  { terms: ['spain', 'españa'],       club: 'spain',       category: 'selecciones' },
  { terms: ['england'],               club: 'england',     category: 'selecciones' },
  { terms: ['netherlands', 'holland'], club: 'netherlands', category: 'selecciones' },
  { terms: ['portugal'],              club: 'portugal',    category: 'selecciones' },
  { terms: ['uruguay'],               club: 'uruguay',     category: 'selecciones' },
  { terms: ['colombia'],              club: 'colombia',    category: 'selecciones' },
  { terms: ['chile'],                 club: 'chile',       category: 'selecciones' },
  { terms: ['croatia', 'hrvatska'],   club: 'croatia',     category: 'selecciones' },
  { terms: ['denmark', 'dinamarca'],  club: 'denmark',     category: 'selecciones' },
  { terms: ['sweden', 'suecia'],      club: 'sweden',      category: 'selecciones' },
  { terms: ['nigeria'],               club: 'nigeria',     category: 'selecciones' },
  { terms: ['cameroon', 'camerún'],   club: 'cameroon',    category: 'selecciones' },
  { terms: ['scotland', 'escocia'],   club: 'scotland',    category: 'selecciones' },
  { terms: ['romania', 'rumania'],    club: 'romania',     category: 'selecciones' },
  { terms: ['yugoslavia'],            club: 'yugoslavia',  category: 'selecciones' },
  { terms: ['serbia'],                club: 'serbia',      category: 'selecciones' },
  { terms: ['belgium', 'belgica'],    club: 'belgium',     category: 'selecciones' },
  { terms: ['japan', 'japon'],        club: 'japan',       category: 'selecciones' },
  { terms: ['austria'],               club: 'austria',     category: 'selecciones' },
  { terms: ['switzerland', 'suiza'],  club: 'switzerland', category: 'selecciones' },
  { terms: ['peru', 'perú'],          club: 'peru',        category: 'selecciones' },
  { terms: ['ecuador'],               club: 'ecuador',     category: 'selecciones' },
  { terms: ['ghana'],                 club: 'ghana',       category: 'selecciones' },
  { terms: ['senegal'],               club: 'senegal',     category: 'selecciones' },
  { terms: ['turkey', 'turquía'],     club: 'turkey',      category: 'selecciones' },
  { terms: ['ireland', 'irlanda'],    club: 'ireland',     category: 'selecciones' },
  { terms: ['wales', 'gales'],        club: 'wales',       category: 'selecciones' },
  { terms: ['greece', 'grecia'],      club: 'greece',      category: 'selecciones' },
  { terms: ['paraguay'],              club: 'paraguay',    category: 'selecciones' },
  { terms: ['venezuela'],             club: 'venezuela',   category: 'selecciones' },
  { terms: ['bolivia'],               club: 'bolivia',     category: 'selecciones' },
  { terms: ['morocco', 'marruecos'],  club: 'morocco',     category: 'selecciones' },
  { terms: ['usa'],                   club: 'usa',         category: 'selecciones' },

  // ── Premier League ────────────────────────────────────────────────────────────
  { terms: ['manchester united', 'manchester-united', 'man united', 'man utd', 'manutd'], club: 'manchester-united', category: 'premier-league' },
  { terms: ['manchester city', 'manchester-city', 'man city', 'mancity'],                club: 'manchester-city',   category: 'premier-league' },
  { terms: ['sheffield wednesday', 'sheffield-wednesday'],   club: 'sheffield-wednesday', category: 'premier-league' },
  { terms: ['sheffield united', 'sheffield-united'],         club: 'sheffield-united',    category: 'premier-league' },
  { terms: ['nottingham forest', 'nottingham-forest'],       club: 'nottingham-forest',   category: 'premier-league' },
  { terms: ['blackburn rovers', 'blackburn-rovers', 'blackburn'], club: 'blackburn',      category: 'premier-league' },
  { terms: ['newcastle united', 'newcastle-united', 'newcastle'], club: 'newcastle',      category: 'premier-league' },
  { terms: ['aston villa', 'aston-villa'],   club: 'aston-villa', category: 'premier-league' },
  { terms: ['west ham', 'west-ham'],         club: 'west-ham',    category: 'premier-league' },
  { terms: ['liverpool'],  club: 'liverpool',  category: 'premier-league' },
  { terms: ['arsenal'],    club: 'arsenal',    category: 'premier-league' },
  { terms: ['chelsea'],    club: 'chelsea',    category: 'premier-league' },
  { terms: ['tottenham', 'spurs'], club: 'tottenham', category: 'premier-league' },
  { terms: ['everton'],    club: 'everton',    category: 'premier-league' },
  { terms: ['leeds'],      club: 'leeds',      category: 'premier-league' },
  { terms: ['leicester'],  club: 'leicester',  category: 'premier-league' },
  { terms: ['sunderland'], club: 'sunderland', category: 'premier-league' },
  { terms: ['bolton'],     club: 'bolton',     category: 'premier-league' },
  { terms: ['ipswich'],    club: 'ipswich',    category: 'premier-league' },
  { terms: ['middlesbrough'], club: 'middlesbrough', category: 'premier-league' },
  { terms: ['coventry'],   club: 'coventry',   category: 'premier-league' },

  // ── La Liga ───────────────────────────────────────────────────────────────────
  { terms: ['real madrid', 'real-madrid', 'realmadrid'],     club: 'real-madrid',    category: 'la-liga' },
  { terms: ['atletico madrid', 'atletico-madrid', 'atletico de madrid'], club: 'atletico-madrid', category: 'la-liga' },
  { terms: ['fc barcelona', 'fc-barcelona'],                 club: 'barcelona',      category: 'la-liga' },
  { terms: ['real betis', 'real-betis'],                     club: 'real-betis',     category: 'la-liga' },
  { terms: ['real zaragoza', 'real-zaragoza'],               club: 'zaragoza',       category: 'la-liga' },
  { terms: ['real sociedad', 'real-sociedad'],               club: 'real-sociedad',  category: 'la-liga' },
  { terms: ['athletic bilbao', 'athletic-bilbao', 'athletic club'], club: 'athletic-bilbao', category: 'la-liga' },
  { terms: ['celta vigo', 'celta-vigo'],                     club: 'celta-vigo',     category: 'la-liga' },
  { terms: ['deportivo la coruña', 'deportivo la coruna', 'rc deportivo'], club: 'deportivo', category: 'la-liga' },
  { terms: ['barcelona', 'barca'],  club: 'barcelona',      category: 'la-liga' },
  { terms: ['atletico'],            club: 'atletico-madrid', category: 'la-liga' },
  { terms: ['valencia'],            club: 'valencia',       category: 'la-liga' },
  { terms: ['sevilla'],             club: 'sevilla',        category: 'la-liga' },
  { terms: ['villarreal'],          club: 'villarreal',     category: 'la-liga' },
  { terms: ['deportivo'],           club: 'deportivo',      category: 'la-liga' },
  { terms: ['osasuna'],             club: 'osasuna',        category: 'la-liga' },
  { terms: ['malaga', 'málaga'],    club: 'malaga',         category: 'la-liga' },
  { terms: ['espanyol'],            club: 'espanyol',       category: 'la-liga' },
  { terms: ['bilbao'],              club: 'athletic-bilbao', category: 'la-liga' },
  { terms: ['zaragoza'],            club: 'zaragoza',       category: 'la-liga' },
  { terms: ['valladolid'],          club: 'valladolid',     category: 'la-liga' },
  { terms: ['celta'],               club: 'celta-vigo',     category: 'la-liga' },

  // ── Serie A ───────────────────────────────────────────────────────────────────
  { terms: ['ac milan', 'ac-milan', 'acmilan', 'a.c. milan', 'a.c.milan'], club: 'ac-milan',   category: 'serie-a' },
  { terms: ['inter milan', 'inter-milan', 'internazionale', 'fc internazionale'], club: 'inter-milan', category: 'serie-a' },
  { terms: ['ss lazio', 'ss-lazio'],         club: 'lazio',       category: 'serie-a' },
  { terms: ['as roma', 'as-roma'],           club: 'roma',        category: 'serie-a' },
  { terms: ['ssc napoli', 'ssc-napoli'],     club: 'napoli',      category: 'serie-a' },
  { terms: ['juventus', 'juve'],             club: 'juventus',    category: 'serie-a' },
  { terms: ['fiorentina'],                   club: 'fiorentina',  category: 'serie-a' },
  { terms: ['sampdoria'],                    club: 'sampdoria',   category: 'serie-a' },
  { terms: ['atalanta'],                     club: 'atalanta',    category: 'serie-a' },
  { terms: ['udinese'],                      club: 'udinese',     category: 'serie-a' },
  { terms: ['bologna'],                      club: 'bologna',     category: 'serie-a' },
  { terms: ['parma'],                        club: 'parma',       category: 'serie-a' },
  { terms: ['torino'],                       club: 'torino',      category: 'serie-a' },
  { terms: ['lazio'],                        club: 'lazio',       category: 'serie-a' },
  { terms: ['napoli'],                       club: 'napoli',      category: 'serie-a' },
  { terms: ['roma'],                         club: 'roma',        category: 'serie-a' },
  { terms: ['inter'],                        club: 'inter-milan', category: 'serie-a' },
  { terms: ['milan'],                        club: 'ac-milan',    category: 'serie-a' }, // fallback

  // ── Bundesliga ────────────────────────────────────────────────────────────────
  { terms: ['fc bayern münchen', 'fc-bayern-munchen', 'fc bayern munich', 'fc-bayern', 'fc bayern'], club: 'bayern-munich', category: 'bundesliga' },
  { terms: ['borussia dortmund', 'borussia-dortmund', 'bvb 09', 'bvb09', 'bvb'], club: 'borussia-dortmund',  category: 'bundesliga' },
  { terms: ['bayer leverkusen', 'bayer-leverkusen'],     club: 'bayer-leverkusen',   category: 'bundesliga' },
  { terms: ['borussia monchengladbach', 'borussia-monchengladbach', 'monchengladbach', 'gladbach'], club: 'borussia-mgladbach', category: 'bundesliga' },
  { terms: ['werder bremen', 'werder-bremen'],           club: 'werder-bremen',      category: 'bundesliga' },
  { terms: ['eintracht frankfurt', 'eintracht-frankfurt'], club: 'eintracht-frankfurt', category: 'bundesliga' },
  { terms: ['vfb stuttgart', 'vfb-stuttgart'],           club: 'stuttgart',          category: 'bundesliga' },
  { terms: ['hamburger sv', 'hamburger-sv'],             club: 'hamburg',            category: 'bundesliga' },
  { terms: ['schalke'],     club: 'schalke',     category: 'bundesliga' },
  { terms: ['hamburg', 'hsv'], club: 'hamburg',  category: 'bundesliga' },
  { terms: ['kaiserslautern'], club: 'kaiserslautern', category: 'bundesliga' },
  { terms: ['wolfsburg'],   club: 'wolfsburg',   category: 'bundesliga' },
  { terms: ['stuttgart'],   club: 'stuttgart',   category: 'bundesliga' },
  { terms: ['werder'],      club: 'werder-bremen', category: 'bundesliga' },
  { terms: ['leverkusen'],  club: 'bayer-leverkusen', category: 'bundesliga' },
  { terms: ['dortmund'],    club: 'borussia-dortmund', category: 'bundesliga' },
  { terms: ['bayern'],      club: 'bayern-munich', category: 'bundesliga' },
  { terms: ['borussia'],    club: 'borussia-dortmund', category: 'bundesliga' }, // fallback

  // ── Ligue 1 ───────────────────────────────────────────────────────────────────
  { terms: ['paris saint germain', 'paris saint-germain', 'paris-saint-germain', 'paris sg'], club: 'psg',       category: 'ligue-1' },
  { terms: ['olympique marseille', 'olympique-marseille'],   club: 'marseille',  category: 'ligue-1' },
  { terms: ['olympique lyon', 'olympique-lyon', 'olympique lyonnais'], club: 'lyon', category: 'ligue-1' },
  { terms: ['girondins bordeaux', 'girondins-bordeaux', 'girondins'], club: 'bordeaux', category: 'ligue-1' },
  { terms: ['as monaco', 'as-monaco'],   club: 'monaco',     category: 'ligue-1' },
  { terms: ['rc lens', 'rc-lens'],       club: 'lens',       category: 'ligue-1' },
  { terms: ['stade rennais', 'rennes'],  club: 'rennes',     category: 'ligue-1' },
  { terms: ['losc lille', 'losc'],       club: 'lille',      category: 'ligue-1' },
  { terms: ['psg'],         club: 'psg',        category: 'ligue-1' },
  { terms: ['marseille'],   club: 'marseille',  category: 'ligue-1' },
  { terms: ['monaco'],      club: 'monaco',     category: 'ligue-1' },
  { terms: ['bordeaux'],    club: 'bordeaux',   category: 'ligue-1' },
  { terms: ['nantes'],      club: 'nantes',     category: 'ligue-1' },
  { terms: ['lens'],        club: 'lens',       category: 'ligue-1' },
  { terms: ['lille'],       club: 'lille',      category: 'ligue-1' },
  { terms: ['lyon'],        club: 'lyon',       category: 'ligue-1' },
  { terms: ['strasbourg'],  club: 'strasbourg', category: 'ligue-1' },
  { terms: ['metz'],        club: 'metz',       category: 'ligue-1' },

  // ── Liga MX ───────────────────────────────────────────────────────────────────
  { terms: ['club america', 'club-america', 'aguilas del america'], club: 'america',      category: 'liga-mx' },
  { terms: ['deportivo guadalajara', 'chivas guadalajara'],         club: 'chivas',       category: 'liga-mx' },
  { terms: ['santos laguna', 'santos-laguna'],                      club: 'santos-laguna', category: 'liga-mx' },
  { terms: ['pumas unam', 'pumas-unam', 'cf pumas'],               club: 'pumas',        category: 'liga-mx' },
  { terms: ['tigres uanl', 'tigres-uanl'],                          club: 'tigres',       category: 'liga-mx' },
  { terms: ['cf monterrey', 'rayados de monterrey'],                club: 'monterrey',    category: 'liga-mx' },
  { terms: ['deportivo toluca', 'deportivo-toluca'],                club: 'toluca',       category: 'liga-mx' },
  { terms: ['america'],       club: 'america',    category: 'liga-mx' },
  { terms: ['chivas'],        club: 'chivas',     category: 'liga-mx' },
  { terms: ['guadalajara'],   club: 'chivas',     category: 'liga-mx' },
  { terms: ['cruz azul', 'cruzazul'], club: 'cruz-azul', category: 'liga-mx' },
  { terms: ['pumas'],         club: 'pumas',      category: 'liga-mx' },
  { terms: ['tigres'],        club: 'tigres',     category: 'liga-mx' },
  { terms: ['monterrey', 'rayados'], club: 'monterrey', category: 'liga-mx' },
  { terms: ['toluca'],        club: 'toluca',     category: 'liga-mx' },
  { terms: ['necaxa'],        club: 'necaxa',     category: 'liga-mx' },
  { terms: ['pachuca'],       club: 'pachuca',    category: 'liga-mx' },
  { terms: ['atlas'],         club: 'atlas',      category: 'liga-mx' },
  { terms: ['leon', 'léon'],  club: 'leon',       category: 'liga-mx' },
  { terms: ['unam'],          club: 'pumas',      category: 'liga-mx' },

  // ── MLS ───────────────────────────────────────────────────────────────────────
  { terms: ['la galaxy', 'la-galaxy', 'los angeles galaxy'],   club: 'la-galaxy',  category: 'mls' },
  { terms: ['dc united', 'dc-united'],                         club: 'dc-united',  category: 'mls' },
  { terms: ['new york red bulls', 'new-york-red-bulls', 'red bulls'], club: 'red-bulls', category: 'mls' },
  { terms: ['new england revolution', 'new england'],          club: 'new-england-revolution', category: 'mls' },
  { terms: ['chicago fire', 'chicago-fire'],                   club: 'chicago-fire', category: 'mls' },
  { terms: ['columbus crew', 'columbus-crew'],                 club: 'columbus-crew', category: 'mls' },
  { terms: ['colorado rapids', 'colorado-rapids'],             club: 'colorado-rapids', category: 'mls' },
  { terms: ['seattle sounders', 'sounders'],                   club: 'seattle-sounders', category: 'mls' },
  { terms: ['toronto fc', 'toronto-fc'],                       club: 'toronto-fc', category: 'mls' },
  { terms: ['portland timbers', 'timbers'],                    club: 'portland-timbers', category: 'mls' },

  // ── Otros ─────────────────────────────────────────────────────────────────────
  { terms: ['boca juniors', 'boca-juniors', 'ca boca'],   club: 'boca-juniors',  category: 'otros' },
  { terms: ['river plate', 'river-plate'],                club: 'river-plate',   category: 'otros' },
  { terms: ['atletico mineiro', 'atletico-mineiro'],      club: 'atletico-mineiro', category: 'otros' },
  { terms: ['santos brasil', 'santos brazil', 'santos-brasil', 'fc santos'], club: 'santos-brasil', category: 'otros' },
  { terms: ['sao paulo', 'são paulo', 'sao-paulo'],       club: 'sao-paulo',     category: 'otros' },
  { terms: ['corinthians', 'sport club corinthians'],     club: 'corinthians',   category: 'otros' },
  { terms: ['se palmeiras', 'palmeiras'],                 club: 'palmeiras',     category: 'otros' },
  { terms: ['cruzeiro'],                                  club: 'cruzeiro',      category: 'otros' },
  { terms: ['cr flamengo', 'flamengo'],                   club: 'flamengo',      category: 'otros' },
  { terms: ['fluminense'],                                club: 'fluminense',    category: 'otros' },
  { terms: ['gremio', 'grêmio', 'grémio'],                club: 'gremio',        category: 'otros' },
  { terms: ['sport club internacional', 'sc internacional'], club: 'internacional', category: 'otros' },
  { terms: ['vasco da gama', 'vasco-da-gama'],            club: 'vasco-da-gama', category: 'otros' },
  { terms: ['racing club', 'racing-club', 'ca racing'],   club: 'racing-club',   category: 'otros' },
  { terms: ['independiente', 'ca independiente'],         club: 'independiente', category: 'otros' },
  { terms: ['san lorenzo', 'san-lorenzo'],                club: 'san-lorenzo',   category: 'otros' },
  { terms: ["newells old boys", "newells old-boys", 'newells', 'newell'], club: 'newells', category: 'otros' },
  { terms: ['afc ajax', 'ajax'],                          club: 'ajax',          category: 'otros' },
  { terms: ['fc porto', 'fc-porto', 'porto'],             club: 'porto',         category: 'otros' },
  { terms: ['sl benfica', 'sl-benfica', 'benfica'],       club: 'benfica',       category: 'otros' },
  { terms: ['sporting cp', 'sporting lisbon', 'sporting-cp'], club: 'sporting-cp', category: 'otros' },
  { terms: ['psv eindhoven', 'psv-eindhoven', 'psv'],     club: 'psv',           category: 'otros' },
  { terms: ['feyenoord'],                                 club: 'feyenoord',     category: 'otros' },
  { terms: ['rsc anderlecht', 'anderlecht'],              club: 'anderlecht',    category: 'otros' },
  { terms: ['galatasaray'],                               club: 'galatasaray',   category: 'otros' },
  { terms: ['fenerbahce', 'fenerbahçe'],                  club: 'fenerbahce',    category: 'otros' },
  { terms: ['celtic'],                                    club: 'celtic',        category: 'otros' },
  { terms: ['rangers'],                                   club: 'rangers',       category: 'otros' },
  { terms: ['vasco'],                                     club: 'vasco-da-gama', category: 'otros' },
  { terms: ['river'],                                     club: 'river-plate',   category: 'otros' },
  { terms: ['boca'],                                      club: 'boca-juniors',  category: 'otros' },
]

// ─── Funciones de detección ────────────────────────────────────────────────────

/** Extrae el primer año de 4 dígitos del nombre (ej. "1982 Season..." → 1982) */
function extractYear(name) {
  const match = name.match(/\b(\d{4})\b/)
  return match ? parseInt(match[1]) : null
}

/**
 * Busca el equipo en el texto usando longest-match:
 * de todos los términos que coincidan, gana el más largo.
 */
function identifyTeam(name, slug) {
  const text = (name + ' ' + slug).toLowerCase()
  let bestEntry = null
  let bestTermLength = 0

  for (const entry of TEAM_MAP) {
    for (const term of entry.terms) {
      if (text.includes(term) && term.length > bestTermLength) {
        bestEntry = entry
        bestTermLength = term.length
      }
    }
  }

  return bestEntry
    ? { club: bestEntry.club, category: bestEntry.category }
    : { club: 'otros', category: 'otros' }
}

// ─── Main ──────────────────────────────────────────────────────────────────────

const productsPath = resolve(ROOT, 'data/products.json')
const reportPath   = resolve(ROOT, 'data/categorization-report.json')

const products = JSON.parse(readFileSync(productsPath, 'utf-8'))

let retroCount    = 0
let identifiedCount = 0
let othersCount   = 0

const updated = products.map((p) => {
  const year    = extractYear(p.name)
  const isRetro = year !== null && year <= 2000
  const { club, category } = identifyTeam(p.name, p.slug)

  if (isRetro) retroCount++
  if (club === 'otros') othersCount++
  else identifiedCount++

  return {
    ...p,
    category,
    club,
    tags: isRetro ? ['retro'] : [],
  }
})

// ─── Reporte ──────────────────────────────────────────────────────────────────

const byCategory = {}
for (const p of updated) {
  if (!byCategory[p.category]) byCategory[p.category] = {}
  if (!byCategory[p.category][p.club]) byCategory[p.category][p.club] = []
  byCategory[p.category][p.club].push({ name: p.name, slug: p.slug, tags: p.tags })
}

const summary = {
  total: updated.length,
  retro: retroCount,
  nonRetro: updated.length - retroCount,
  identified: identifiedCount,
  unidentified: othersCount,
  byCategory: Object.fromEntries(
    Object.entries(byCategory).map(([cat, clubs]) => [
      cat,
      {
        total: Object.values(clubs).flat().length,
        clubs: Object.keys(clubs),
      },
    ])
  ),
}

const report = { summary, categories: byCategory }

// ─── Escritura ────────────────────────────────────────────────────────────────

writeFileSync(productsPath, JSON.stringify(updated, null, 2), 'utf-8')
writeFileSync(reportPath,   JSON.stringify(report,   null, 2), 'utf-8')

console.log('\n✓ products.json actualizado')
console.log('✓ categorization-report.json generado\n')
console.log('─── Resumen ──────────────────────────────────')
console.log(`  Total productos : ${summary.total}`)
console.log(`  Con tag retro   : ${summary.retro}`)
console.log(`  Identificados   : ${summary.identified}`)
console.log(`  Sin identificar : ${summary.unidentified} → category "otros"`)
console.log('─── Por categoría ────────────────────────────')
for (const [cat, info] of Object.entries(summary.byCategory)) {
  console.log(`  ${cat.padEnd(22)} ${String(info.total).padStart(4)} productos  |  ${info.clubs.length} clubes`)
}
console.log('──────────────────────────────────────────────\n')
