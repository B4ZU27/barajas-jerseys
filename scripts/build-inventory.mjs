/**
 * build-inventory.mjs
 *
 * Escanea DATA/retro y DATA/Mundialista y construye data/inventory.json
 * como fuente de verdad interna de todos los álbumes que tenemos.
 *
 * Campos por entrada:
 *   slug        → identificador único normalizado
 *   name        → nombre legible
 *   sourceType  → "retro" | "mundialista"
 *   sourcePath  → ruta relativa desde la raíz del proyecto
 *   club        → equipo identificado
 *   category    → categoría (selecciones, la-liga, etc.)
 *   tags        → ["retro"] | ["mundialistas"]
 *   images      → archivos de imagen encontrados
 *   placeholder → imagen principal (desde selections.json o primer jpg)
 *   cloudinary  → false (se actualiza en upload-mundialista.mjs)
 *   inProducts  → true si el slug ya existe en products.json
 *
 * Uso: node mi-catalogo/scripts/build-inventory.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT       = resolve(__dirname, '..', '..')
const DATA_RETRO = resolve(ROOT, 'DATA', 'retro')
const DATA_MUND  = resolve(ROOT, 'DATA', 'Mundialista')
const PRODUCTS_PATH  = resolve(ROOT, 'mi-catalogo', 'data', 'products.json')
const INVENTORY_PATH = resolve(ROOT, 'mi-catalogo', 'data', 'inventory.json')

// ─── TEAM_MAP (misma lógica que categorize-products) ─────────────────────────

const TEAM_MAP = [
  { terms: ['west germany', 'west-germany'],      club: 'west-germany',    category: 'selecciones' },
  { terms: ['south korea', 'south-korea'],         club: 'south-korea',     category: 'selecciones' },
  { terms: ['ivory coast', 'cote divoire'],         club: 'ivory-coast',     category: 'selecciones' },
  { terms: ['soviet union', 'ussr'],               club: 'ussr',            category: 'selecciones' },
  { terms: ['czech republic', 'czechoslovakia'],   club: 'czech-republic',  category: 'selecciones' },
  { terms: ['united states'],                      club: 'usa',             category: 'selecciones' },
  { terms: ['new zealand'],                        club: 'new-zealand',     category: 'selecciones' },
  { terms: ['costa rica'],                         club: 'costa-rica',      category: 'selecciones' },
  { terms: ['argentina'],    club: 'argentina',    category: 'selecciones' },
  { terms: ['italy', 'italia', 'italian'],         club: 'italy',           category: 'selecciones' },
  { terms: ['france', 'french', 'francia'],        club: 'france',          category: 'selecciones' },
  { terms: ['germany', 'german', 'deutschland'],   club: 'germany',         category: 'selecciones' },
  { terms: ['brazil', 'brasil', 'brazilian'],      club: 'brazil',          category: 'selecciones' },
  { terms: ['mexico', 'méxico', 'mexican'],        club: 'mexico',          category: 'selecciones' },
  { terms: ['spain', 'españa', 'spanish'],         club: 'spain',           category: 'selecciones' },
  { terms: ['england', 'english'],                 club: 'england',         category: 'selecciones' },
  { terms: ['netherlands', 'holland'],             club: 'netherlands',     category: 'selecciones' },
  { terms: ['portugal', 'portuguese'],             club: 'portugal',        category: 'selecciones' },
  { terms: ['uruguay'],      club: 'uruguay',      category: 'selecciones' },
  { terms: ['colombia'],     club: 'colombia',     category: 'selecciones' },
  { terms: ['chile'],        club: 'chile',        category: 'selecciones' },
  { terms: ['croatia'],      club: 'croatia',      category: 'selecciones' },
  { terms: ['denmark'],      club: 'denmark',      category: 'selecciones' },
  { terms: ['sweden'],       club: 'sweden',       category: 'selecciones' },
  { terms: ['nigeria'],      club: 'nigeria',      category: 'selecciones' },
  { terms: ['cameroon'],     club: 'cameroon',     category: 'selecciones' },
  { terms: ['scotland'],     club: 'scotland',     category: 'selecciones' },
  { terms: ['romania'],      club: 'romania',      category: 'selecciones' },
  { terms: ['yugoslavia'],   club: 'yugoslavia',   category: 'selecciones' },
  { terms: ['serbia'],       club: 'serbia',       category: 'selecciones' },
  { terms: ['belgium'],      club: 'belgium',      category: 'selecciones' },
  { terms: ['japan'],        club: 'japan',        category: 'selecciones' },
  { terms: ['austria'],      club: 'austria',      category: 'selecciones' },
  { terms: ['switzerland'],  club: 'switzerland',  category: 'selecciones' },
  { terms: ['peru'],         club: 'peru',         category: 'selecciones' },
  { terms: ['ecuador'],      club: 'ecuador',      category: 'selecciones' },
  { terms: ['ghana'],        club: 'ghana',        category: 'selecciones' },
  { terms: ['senegal'],      club: 'senegal',      category: 'selecciones' },
  { terms: ['turkey'],       club: 'turkey',       category: 'selecciones' },
  { terms: ['ireland'],      club: 'ireland',      category: 'selecciones' },
  { terms: ['wales'],        club: 'wales',        category: 'selecciones' },
  { terms: ['greece'],       club: 'greece',       category: 'selecciones' },
  { terms: ['paraguay'],     club: 'paraguay',     category: 'selecciones' },
  { terms: ['morocco'],      club: 'morocco',      category: 'selecciones' },
  { terms: ['algeria'],      club: 'algeria',      category: 'selecciones' },
  { terms: ['canada'],       club: 'canada',       category: 'selecciones' },
  { terms: ['norway', 'noruega'], club: 'norway',  category: 'selecciones' },
  { terms: ['usa'],          club: 'usa',          category: 'selecciones' },

  { terms: ['manchester united', 'man united', 'man utd'], club: 'manchester-united', category: 'premier-league' },
  { terms: ['manchester city', 'man city'],    club: 'manchester-city',   category: 'premier-league' },
  { terms: ['sheffield wednesday'],            club: 'sheffield-wednesday', category: 'premier-league' },
  { terms: ['sheffield united'],               club: 'sheffield-united',  category: 'premier-league' },
  { terms: ['nottingham forest'],              club: 'nottingham-forest', category: 'premier-league' },
  { terms: ['blackburn'],                      club: 'blackburn',         category: 'premier-league' },
  { terms: ['newcastle'],                      club: 'newcastle',         category: 'premier-league' },
  { terms: ['aston villa'],                    club: 'aston-villa',       category: 'premier-league' },
  { terms: ['west ham'],                       club: 'west-ham',          category: 'premier-league' },
  { terms: ['liverpool'],  club: 'liverpool',  category: 'premier-league' },
  { terms: ['arsenal'],    club: 'arsenal',    category: 'premier-league' },
  { terms: ['chelsea'],    club: 'chelsea',    category: 'premier-league' },
  { terms: ['tottenham'],  club: 'tottenham',  category: 'premier-league' },
  { terms: ['everton'],    club: 'everton',    category: 'premier-league' },
  { terms: ['leeds'],      club: 'leeds',      category: 'premier-league' },
  { terms: ['leicester'],  club: 'leicester',  category: 'premier-league' },
  { terms: ['sunderland'], club: 'sunderland', category: 'premier-league' },

  { terms: ['real madrid'],         club: 'real-madrid',     category: 'la-liga' },
  { terms: ['atletico madrid'],     club: 'atletico-madrid', category: 'la-liga' },
  { terms: ['fc barcelona'],        club: 'barcelona',       category: 'la-liga' },
  { terms: ['real betis'],          club: 'real-betis',      category: 'la-liga' },
  { terms: ['real zaragoza'],       club: 'zaragoza',        category: 'la-liga' },
  { terms: ['real sociedad'],       club: 'real-sociedad',   category: 'la-liga' },
  { terms: ['athletic bilbao', 'athletic club'], club: 'athletic-bilbao', category: 'la-liga' },
  { terms: ['celta vigo'],          club: 'celta-vigo',      category: 'la-liga' },
  { terms: ['barcelona', 'barca'],  club: 'barcelona',       category: 'la-liga' },
  { terms: ['valencia'],            club: 'valencia',        category: 'la-liga' },
  { terms: ['sevilla'],             club: 'sevilla',         category: 'la-liga' },
  { terms: ['villarreal'],          club: 'villarreal',      category: 'la-liga' },
  { terms: ['osasuna'],             club: 'osasuna',         category: 'la-liga' },
  { terms: ['espanyol'],            club: 'espanyol',        category: 'la-liga' },

  { terms: ['ac milan', 'acmilan'],                club: 'ac-milan',    category: 'serie-a' },
  { terms: ['inter milan', 'inter de milan', 'internazionale'], club: 'inter-milan', category: 'serie-a' },
  { terms: ['ss lazio'],            club: 'lazio',       category: 'serie-a' },
  { terms: ['as roma'],             club: 'roma',        category: 'serie-a' },
  { terms: ['ssc napoli'],          club: 'napoli',      category: 'serie-a' },
  { terms: ['juventus', 'juve'],    club: 'juventus',    category: 'serie-a' },
  { terms: ['fiorentina'],          club: 'fiorentina',  category: 'serie-a' },
  { terms: ['sampdoria'],           club: 'sampdoria',   category: 'serie-a' },
  { terms: ['parma'],               club: 'parma',       category: 'serie-a' },
  { terms: ['napoli'],              club: 'napoli',      category: 'serie-a' },
  { terms: ['lazio'],               club: 'lazio',       category: 'serie-a' },
  { terms: ['roma'],                club: 'roma',        category: 'serie-a' },
  { terms: ['inter'],               club: 'inter-milan', category: 'serie-a' },
  { terms: ['milan'],               club: 'ac-milan',    category: 'serie-a' },

  { terms: ['fc bayern', 'bayern munich', 'fc-bayern'], club: 'bayern-munich',      category: 'bundesliga' },
  { terms: ['borussia dortmund', 'bvb'],               club: 'borussia-dortmund',   category: 'bundesliga' },
  { terms: ['bayer leverkusen'],                        club: 'bayer-leverkusen',    category: 'bundesliga' },
  { terms: ['borussia monchengladbach', 'gladbach'],    club: 'borussia-mgladbach',  category: 'bundesliga' },
  { terms: ['werder bremen'],                           club: 'werder-bremen',       category: 'bundesliga' },
  { terms: ['eintracht frankfurt'],                     club: 'eintracht-frankfurt', category: 'bundesliga' },
  { terms: ['vfb stuttgart'],                           club: 'stuttgart',           category: 'bundesliga' },
  { terms: ['hamburger sv'],                            club: 'hamburg',             category: 'bundesliga' },
  { terms: ['schalke'],    club: 'schalke',    category: 'bundesliga' },
  { terms: ['hamburg'],    club: 'hamburg',    category: 'bundesliga' },
  { terms: ['dortmund'],   club: 'borussia-dortmund', category: 'bundesliga' },
  { terms: ['bayern'],     club: 'bayern-munich',     category: 'bundesliga' },

  { terms: ['paris saint germain', 'paris sg'], club: 'psg',       category: 'ligue-1' },
  { terms: ['olympique marseille'],             club: 'marseille', category: 'ligue-1' },
  { terms: ['olympique lyon', 'olympique lyonnais'], club: 'lyon', category: 'ligue-1' },
  { terms: ['girondins bordeaux', 'girondins'], club: 'bordeaux',  category: 'ligue-1' },
  { terms: ['as monaco'],   club: 'monaco',    category: 'ligue-1' },
  { terms: ['psg'],         club: 'psg',       category: 'ligue-1' },
  { terms: ['marseille'],   club: 'marseille', category: 'ligue-1' },
  { terms: ['bordeaux'],    club: 'bordeaux',  category: 'ligue-1' },
  { terms: ['nantes'],      club: 'nantes',    category: 'ligue-1' },
  { terms: ['lyon'],        club: 'lyon',      category: 'ligue-1' },

  { terms: ['club america'],           club: 'america',      category: 'liga-mx' },
  { terms: ['chivas guadalajara'],     club: 'chivas',       category: 'liga-mx' },
  { terms: ['santos laguna'],          club: 'santos-laguna', category: 'liga-mx' },
  { terms: ['pumas unam', 'cf pumas'], club: 'pumas',        category: 'liga-mx' },
  { terms: ['tigres uanl'],            club: 'tigres',       category: 'liga-mx' },
  { terms: ['cruz azul'],              club: 'cruz-azul',    category: 'liga-mx' },
  { terms: ['america'],    club: 'america',    category: 'liga-mx' },
  { terms: ['chivas'],     club: 'chivas',     category: 'liga-mx' },
  { terms: ['pumas'],      club: 'pumas',      category: 'liga-mx' },
  { terms: ['tigres'],     club: 'tigres',     category: 'liga-mx' },
  { terms: ['monterrey', 'rayados'], club: 'monterrey', category: 'liga-mx' },
  { terms: ['toluca'],     club: 'toluca',     category: 'liga-mx' },
  { terms: ['necaxa'],     club: 'necaxa',     category: 'liga-mx' },
  { terms: ['pachuca'],    club: 'pachuca',    category: 'liga-mx' },
  { terms: ['atlas'],      club: 'atlas',      category: 'liga-mx' },

  { terms: ['boca juniors'],   club: 'boca-juniors',    category: 'otros' },
  { terms: ['river plate'],    club: 'river-plate',     category: 'otros' },
  { terms: ['flamengo'],       club: 'flamengo',        category: 'otros' },
  { terms: ['corinthians'],    club: 'corinthians',     category: 'otros' },
  { terms: ['palmeiras'],      club: 'palmeiras',       category: 'otros' },
  { terms: ['botafogo'],       club: 'botafogo',        category: 'otros' },
  { terms: ['ajax'],           club: 'ajax',            category: 'otros' },
  { terms: ['porto'],          club: 'porto',           category: 'otros' },
  { terms: ['benfica'],        club: 'benfica',         category: 'otros' },
  { terms: ['psv'],            club: 'psv',             category: 'otros' },
  { terms: ['celtic'],         club: 'celtic',          category: 'otros' },
  { terms: ['rangers'],        club: 'rangers',         category: 'otros' },
  { terms: ['boca'],           club: 'boca-juniors',    category: 'otros' },
  { terms: ['river'],          club: 'river-plate',     category: 'otros' },
]

function identifyTeam(text) {
  const t = text.toLowerCase()
  let best = null, bestLen = 0
  for (const entry of TEAM_MAP) {
    for (const term of entry.terms) {
      if (t.includes(term) && term.length > bestLen) {
        best = entry
        bestLen = term.length
      }
    }
  }
  return best
    ? { club: best.club, category: best.category }
    : { club: 'sin-identificar', category: 'otros' }
}

function toSlug(str) {
  return str
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toName(folderName) {
  return folderName
    .replace(/[_-]+/g, ' ')
    .replace(/\b(\d{2})-(\d{2})\b/g, '$1-$2') // preserva "25-26"
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Cargar datos existentes ──────────────────────────────────────────────────

const products = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8'))
const existingSlugs = new Set(products.map(p => p.slug))

// Cargar selections.json para placeholders de mundialistas
const selectionsPath = join(DATA_MUND, 'selections.json')
const selectionsRaw = JSON.parse(readFileSync(selectionsPath, 'utf-8'))
// Normalizar claves a nombre de carpeta
const selectionsMap = {}
for (const [fullPath, val] of Object.entries(selectionsRaw)) {
  const parts = fullPath.replace(/\\/g, '/').split('/')
  const albumName = parts[parts.length - 1]
  selectionsMap[albumName] = val.placeholder
}

// ─── Escanear DATA/retro ──────────────────────────────────────────────────────

const entries = []

const retroFolders = readdirSync(DATA_RETRO, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

for (const folderName of retroFolders) {
  const slug = toSlug(folderName)
  const { club, category } = identifyTeam(folderName)
  const folderPath = join(DATA_RETRO, folderName)
  const images = readdirSync(folderPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  const placeholder = images.find(f => f.startsWith('placeholder')) || images[0] || null

  entries.push({
    slug,
    name: toName(folderName),
    sourceType: 'retro',
    sourcePath: `DATA/retro/${folderName}`,
    club,
    category,
    tags: ['retro'],
    images,
    placeholder,
    cloudinary: products.find(p => p.slug === slug)?.images?.some(u => u.includes('cloudinary')) ?? false,
    inProducts: existingSlugs.has(slug),
  })
}

// ─── Escanear DATA/Mundialista ────────────────────────────────────────────────

const countryFolders = readdirSync(DATA_MUND, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)

for (const country of countryFolders) {
  const countryPath = join(DATA_MUND, country)
  const albumFolders = readdirSync(countryPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)

  for (const albumName of albumFolders) {
    const slug = `${country}-${toSlug(albumName)}`
    const albumPath = join(countryPath, albumName)
    const images = readdirSync(albumPath).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    const placeholder = selectionsMap[albumName] || images.find(f => f.startsWith('hero')) || images[0] || null

    entries.push({
      slug,
      name: toName(albumName),
      sourceType: 'mundialista',
      sourcePath: `DATA/Mundialista/${country}/${albumName}`,
      club: country,           // ya está limpio en el nombre de carpeta
      category: 'selecciones',
      tags: ['mundialistas'],
      images,
      placeholder,
      cloudinary: products.find(p => p.slug === slug)?.images?.some(u => u.includes('cloudinary')) ?? false,
      inProducts: existingSlugs.has(slug),
    })
  }
}

// ─── Estadísticas ─────────────────────────────────────────────────────────────

const total      = entries.length
const retros     = entries.filter(e => e.sourceType === 'retro').length
const mundis     = entries.filter(e => e.sourceType === 'mundialista').length
const inProducts = entries.filter(e => e.inProducts).length
const uploaded   = entries.filter(e => e.cloudinary).length
const unidentified = entries.filter(e => e.club === 'sin-identificar').length

const inventory = {
  _meta: {
    generatedAt: new Date().toISOString(),
    total,
    retros,
    mundialistas: mundis,
    inProducts,
    notInProducts: total - inProducts,
    uploadedToCloudinary: uploaded,
    pendingUpload: total - uploaded,
    unidentified,
  },
  albums: entries,
}

writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8')

// ─── Consola ──────────────────────────────────────────────────────────────────

console.log('\n✓ inventory.json generado\n')
console.log('─── Resumen ──────────────────────────────────────')
console.log(`  Total álbumes en DATA   : ${total}`)
console.log(`  ├─ Retro                : ${retros}`)
console.log(`  └─ Mundialistas         : ${mundis}`)
console.log(`  En products.json        : ${inProducts}`)
console.log(`  Pendientes de añadir    : ${total - inProducts}`)
console.log(`  Subidos a Cloudinary    : ${uploaded}`)
console.log(`  Pendientes de subir     : ${total - uploaded}`)
if (unidentified > 0) {
  console.log(`  Sin identificar         : ${unidentified}`)
}
console.log('──────────────────────────────────────────────────\n')
