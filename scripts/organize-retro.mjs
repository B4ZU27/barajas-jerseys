/**
 * organize-retro.mjs
 *
 * Lee las carpetas de DATA/retro, detecta equipo y liga desde el nombre
 * (usando la misma lógica de categorize-products.mjs) y copia cada álbum a:
 *
 *   barjerseys_actual/[category]/[club]/[nombre-de-carpeta]/
 *
 * Uso: node mi-catalogo/scripts/organize-retro.mjs
 */

import { readdirSync, mkdirSync, cpSync, existsSync, writeFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT       = resolve(__dirname, '..', '..')          // e-commerce/
const DATA_RETRO = resolve(ROOT, 'DATA', 'retro')
const DEST       = resolve(ROOT, 'barjerseys_actual')

// ─── Mapeo de equipos (idéntico a categorize-products.mjs) ────────────────────

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
  { terms: ['norway', 'noruega'],     club: 'norway',      category: 'selecciones' },
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
  { terms: ['inter milan', 'inter-milan', 'inter de milan', 'internazionale', 'fc internazionale'], club: 'inter-milan', category: 'serie-a' },
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
  { terms: ['milan'],                        club: 'ac-milan',    category: 'serie-a' },

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
  { terms: ['borussia'],    club: 'borussia-dortmund', category: 'bundesliga' },

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

  // ── Otros/Sudamérica ──────────────────────────────────────────────────────────
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
  { terms: ['botafogo'],                                  club: 'botafogo',      category: 'otros' },
  { terms: ['vasco'],                                     club: 'vasco-da-gama', category: 'otros' },
  { terms: ['river'],                                     club: 'river-plate',   category: 'otros' },
  { terms: ['boca'],                                      club: 'boca-juniors',  category: 'otros' },
]

// ─── Función de detección (misma lógica que categorize-products.mjs) ──────────

function identifyTeam(folderName) {
  const text = folderName.toLowerCase()
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
    : { club: 'sin-identificar', category: 'sin-identificar' }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const folders = readdirSync(DATA_RETRO, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

const results = []
let copiedCount = 0
let skippedCount = 0
const unidentified = []

for (const folderName of folders) {
  const { club, category } = identifyTeam(folderName)

  const src  = join(DATA_RETRO, folderName)
  const dest = join(DEST, 'retro', category, club, folderName)

  if (existsSync(dest)) {
    skippedCount++
    results.push({ folderName, category, club, status: 'ya existe' })
    continue
  }

  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })

  copiedCount++
  results.push({ folderName, category, club, status: 'copiado' })

  if (category === 'sin-identificar') {
    unidentified.push(folderName)
  }
}

// ─── Reporte ──────────────────────────────────────────────────────────────────

const byCategory = {}
for (const r of results) {
  if (!byCategory[r.category]) byCategory[r.category] = {}
  if (!byCategory[r.category][r.club]) byCategory[r.category][r.club] = []
  byCategory[r.category][r.club].push(r.folderName)
}

const reportPath = resolve(ROOT, 'barjerseys_actual', 'retro-organization-report.json')
writeFileSync(reportPath, JSON.stringify({ summary: {
  total: folders.length,
  copied: copiedCount,
  skipped: skippedCount,
  unidentified: unidentified.length,
}, byCategory, unidentified }, null, 2), 'utf-8')

// ─── Consola ──────────────────────────────────────────────────────────────────

console.log('\n✓ organize-retro completado\n')
console.log('─── Resumen ──────────────────────────────────')
console.log(`  Total álbumes  : ${folders.length}`)
console.log(`  Copiados       : ${copiedCount}`)
console.log(`  Ya existían    : ${skippedCount}`)
console.log(`  Sin identificar: ${unidentified.length}`)
console.log('─── Por categoría ────────────────────────────')
for (const [cat, clubs] of Object.entries(byCategory)) {
  const total = Object.values(clubs).flat().length
  console.log(`  ${cat.padEnd(22)} ${String(total).padStart(4)} álbumes  |  ${Object.keys(clubs).length} clubes`)
}
if (unidentified.length > 0) {
  console.log('\n─── Sin identificar ──────────────────────────')
  unidentified.forEach(f => console.log(`  · ${f}`))
}
console.log('\n  Reporte: barjerseys_actual/retro-organization-report.json\n')
console.log('──────────────────────────────────────────────\n')
