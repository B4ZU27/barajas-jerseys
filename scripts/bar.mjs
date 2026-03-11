/**
 * bar.mjs — Barajas Jerseys CLI
 *
 * CLI interactivo para gestionar el catálogo de jerseys.
 * Fuente de verdad: DATA/barjerseys_actual/
 *
 * Uso: node mi-catalogo/scripts/bar.mjs
 */

import {
  readFileSync, writeFileSync, readdirSync,
  existsSync, mkdirSync, renameSync, rmSync,
  copyFileSync,
} from 'fs'
import { resolve, dirname, join, relative, basename } from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __dirname      = dirname(fileURLToPath(import.meta.url))
const ROOT           = resolve(__dirname, '..', '..')
const SOURCE         = resolve(ROOT, 'DATA', 'barjerseys_actual')
const INVENTORY_PATH = resolve(ROOT, 'mi-catalogo', 'data', 'inventory.json')
const PRODUCTS_PATH  = resolve(ROOT, 'mi-catalogo', 'data', 'products.json')

// ─── ANSI Colors ─────────────────────────────────────────────────────────────

const R = '\x1b[0m'
const B = s => `\x1b[1m${s}${R}`
const D = s => `\x1b[2m${s}${R}`
const cyan    = s => `\x1b[36m${s}${R}`
const green   = s => `\x1b[32m${s}${R}`
const yellow  = s => `\x1b[33m${s}${R}`
const red     = s => `\x1b[31m${s}${R}`
const gray    = s => `\x1b[90m${s}${R}`
const magenta = s => `\x1b[35m${s}${R}`
const blue    = s => `\x1b[34m${s}${R}`

// ─── Categories ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  'selecciones', 'premier-league', 'la-liga', 'serie-a',
  'bundesliga', 'ligue-1', 'liga-mx', 'mls', 'otros', 'sin-identificar',
]

// ─── Team Map ────────────────────────────────────────────────────────────────

const TEAM_MAP = [
  { terms: ['west germany', 'west-germany'],           club: 'west-germany',         category: 'selecciones' },
  { terms: ['south korea', 'south-korea'],             club: 'south-korea',          category: 'selecciones' },
  { terms: ['ivory coast', 'cote divoire'],            club: 'ivory-coast',          category: 'selecciones' },
  { terms: ['soviet union', 'ussr'],                   club: 'ussr',                 category: 'selecciones' },
  { terms: ['czech republic', 'czechoslovakia'],       club: 'czech-republic',       category: 'selecciones' },
  { terms: ['united states'],                          club: 'usa',                  category: 'selecciones' },
  { terms: ['new zealand'],                            club: 'new-zealand',          category: 'selecciones' },
  { terms: ['costa rica'],                             club: 'costa-rica',           category: 'selecciones' },
  { terms: ['argentina'],                              club: 'argentina',            category: 'selecciones' },
  { terms: ['italy', 'italia'],                        club: 'italy',                category: 'selecciones' },
  { terms: ['france', 'french', 'francia'],            club: 'france',               category: 'selecciones' },
  { terms: ['germany', 'german', 'deutschland'],       club: 'germany',              category: 'selecciones' },
  { terms: ['brazil', 'brasil'],                       club: 'brazil',               category: 'selecciones' },
  { terms: ['mexico', 'méxico'],                       club: 'mexico',               category: 'selecciones' },
  { terms: ['spain', 'españa'],                        club: 'spain',                category: 'selecciones' },
  { terms: ['england', 'english'],                     club: 'england',              category: 'selecciones' },
  { terms: ['netherlands', 'holland'],                 club: 'netherlands',          category: 'selecciones' },
  { terms: ['portugal'],                               club: 'portugal',             category: 'selecciones' },
  { terms: ['uruguay'],                                club: 'uruguay',              category: 'selecciones' },
  { terms: ['colombia'],                               club: 'colombia',             category: 'selecciones' },
  { terms: ['chile'],                                  club: 'chile',                category: 'selecciones' },
  { terms: ['croatia'],                                club: 'croatia',              category: 'selecciones' },
  { terms: ['denmark'],                                club: 'denmark',              category: 'selecciones' },
  { terms: ['sweden'],                                 club: 'sweden',               category: 'selecciones' },
  { terms: ['nigeria'],                                club: 'nigeria',              category: 'selecciones' },
  { terms: ['cameroon'],                               club: 'cameroon',             category: 'selecciones' },
  { terms: ['scotland'],                               club: 'scotland',             category: 'selecciones' },
  { terms: ['romania'],                                club: 'romania',              category: 'selecciones' },
  { terms: ['yugoslavia'],                             club: 'yugoslavia',           category: 'selecciones' },
  { terms: ['serbia'],                                 club: 'serbia',               category: 'selecciones' },
  { terms: ['belgium'],                                club: 'belgium',              category: 'selecciones' },
  { terms: ['japan'],                                  club: 'japan',                category: 'selecciones' },
  { terms: ['austria'],                                club: 'austria',              category: 'selecciones' },
  { terms: ['switzerland'],                            club: 'switzerland',          category: 'selecciones' },
  { terms: ['peru'],                                   club: 'peru',                 category: 'selecciones' },
  { terms: ['ecuador'],                                club: 'ecuador',              category: 'selecciones' },
  { terms: ['ghana'],                                  club: 'ghana',                category: 'selecciones' },
  { terms: ['senegal'],                                club: 'senegal',              category: 'selecciones' },
  { terms: ['turkey'],                                 club: 'turkey',               category: 'selecciones' },
  { terms: ['ireland'],                                club: 'ireland',              category: 'selecciones' },
  { terms: ['wales'],                                  club: 'wales',                category: 'selecciones' },
  { terms: ['greece'],                                 club: 'greece',               category: 'selecciones' },
  { terms: ['paraguay'],                               club: 'paraguay',             category: 'selecciones' },
  { terms: ['morocco'],                                club: 'morocco',              category: 'selecciones' },
  { terms: ['algeria'],                                club: 'algeria',              category: 'selecciones' },
  { terms: ['canada'],                                 club: 'canada',               category: 'selecciones' },
  { terms: ['norway', 'noruega'],                      club: 'norway',               category: 'selecciones' },
  { terms: ['usa'],                                    club: 'usa',                  category: 'selecciones' },

  { terms: ['manchester united', 'man united', 'man utd'], club: 'manchester-united',  category: 'premier-league' },
  { terms: ['manchester city', 'man city'],            club: 'manchester-city',      category: 'premier-league' },
  { terms: ['sheffield wednesday'],                    club: 'sheffield-wednesday',  category: 'premier-league' },
  { terms: ['sheffield united'],                       club: 'sheffield-united',     category: 'premier-league' },
  { terms: ['nottingham forest'],                      club: 'nottingham-forest',    category: 'premier-league' },
  { terms: ['blackburn'],                              club: 'blackburn',            category: 'premier-league' },
  { terms: ['newcastle'],                              club: 'newcastle',            category: 'premier-league' },
  { terms: ['aston villa'],                            club: 'aston-villa',          category: 'premier-league' },
  { terms: ['west ham'],                               club: 'west-ham',             category: 'premier-league' },
  { terms: ['liverpool'],                              club: 'liverpool',            category: 'premier-league' },
  { terms: ['arsenal'],                                club: 'arsenal',              category: 'premier-league' },
  { terms: ['chelsea'],                                club: 'chelsea',              category: 'premier-league' },
  { terms: ['tottenham'],                              club: 'tottenham',            category: 'premier-league' },
  { terms: ['everton'],                                club: 'everton',              category: 'premier-league' },
  { terms: ['leeds'],                                  club: 'leeds',                category: 'premier-league' },
  { terms: ['leicester'],                              club: 'leicester',            category: 'premier-league' },
  { terms: ['sunderland'],                             club: 'sunderland',           category: 'premier-league' },

  { terms: ['real madrid'],                            club: 'real-madrid',          category: 'la-liga' },
  { terms: ['atletico madrid'],                        club: 'atletico-madrid',      category: 'la-liga' },
  { terms: ['fc barcelona'],                           club: 'barcelona',            category: 'la-liga' },
  { terms: ['real betis'],                             club: 'real-betis',           category: 'la-liga' },
  { terms: ['real zaragoza'],                          club: 'zaragoza',             category: 'la-liga' },
  { terms: ['real sociedad'],                          club: 'real-sociedad',        category: 'la-liga' },
  { terms: ['athletic bilbao', 'athletic club'],       club: 'athletic-bilbao',      category: 'la-liga' },
  { terms: ['celta vigo'],                             club: 'celta-vigo',           category: 'la-liga' },
  { terms: ['barcelona', 'barca'],                     club: 'barcelona',            category: 'la-liga' },
  { terms: ['valencia'],                               club: 'valencia',             category: 'la-liga' },
  { terms: ['sevilla'],                                club: 'sevilla',              category: 'la-liga' },
  { terms: ['villarreal'],                             club: 'villarreal',           category: 'la-liga' },
  { terms: ['osasuna'],                                club: 'osasuna',              category: 'la-liga' },
  { terms: ['espanyol'],                               club: 'espanyol',             category: 'la-liga' },

  { terms: ['ac milan', 'acmilan'],                    club: 'ac-milan',             category: 'serie-a' },
  { terms: ['inter milan', 'internazionale'],          club: 'inter-milan',          category: 'serie-a' },
  { terms: ['ss lazio'],                               club: 'lazio',                category: 'serie-a' },
  { terms: ['as roma'],                                club: 'roma',                 category: 'serie-a' },
  { terms: ['ssc napoli'],                             club: 'napoli',               category: 'serie-a' },
  { terms: ['juventus', 'juve'],                       club: 'juventus',             category: 'serie-a' },
  { terms: ['fiorentina'],                             club: 'fiorentina',           category: 'serie-a' },
  { terms: ['sampdoria'],                              club: 'sampdoria',            category: 'serie-a' },
  { terms: ['parma'],                                  club: 'parma',                category: 'serie-a' },
  { terms: ['napoli'],                                 club: 'napoli',               category: 'serie-a' },
  { terms: ['lazio'],                                  club: 'lazio',                category: 'serie-a' },
  { terms: ['roma'],                                   club: 'roma',                 category: 'serie-a' },
  { terms: ['inter'],                                  club: 'inter-milan',          category: 'serie-a' },
  { terms: ['milan'],                                  club: 'ac-milan',             category: 'serie-a' },

  { terms: ['fc bayern', 'bayern munich', 'fc-bayern'],  club: 'bayern-munich',       category: 'bundesliga' },
  { terms: ['borussia dortmund', 'bvb'],               club: 'borussia-dortmund',    category: 'bundesliga' },
  { terms: ['bayer leverkusen'],                       club: 'bayer-leverkusen',     category: 'bundesliga' },
  { terms: ['borussia monchengladbach', 'gladbach'],   club: 'borussia-mgladbach',   category: 'bundesliga' },
  { terms: ['werder bremen'],                          club: 'werder-bremen',        category: 'bundesliga' },
  { terms: ['eintracht frankfurt'],                    club: 'eintracht-frankfurt',  category: 'bundesliga' },
  { terms: ['vfb stuttgart'],                          club: 'stuttgart',            category: 'bundesliga' },
  { terms: ['hamburger sv'],                           club: 'hamburg',              category: 'bundesliga' },
  { terms: ['schalke'],                                club: 'schalke',              category: 'bundesliga' },
  { terms: ['hamburg'],                                club: 'hamburg',              category: 'bundesliga' },
  { terms: ['dortmund'],                               club: 'borussia-dortmund',    category: 'bundesliga' },
  { terms: ['bayern'],                                 club: 'bayern-munich',        category: 'bundesliga' },

  { terms: ['paris saint germain', 'paris sg'],        club: 'psg',                  category: 'ligue-1' },
  { terms: ['olympique marseille'],                    club: 'marseille',            category: 'ligue-1' },
  { terms: ['olympique lyon', 'olympique lyonnais'],   club: 'lyon',                 category: 'ligue-1' },
  { terms: ['girondins bordeaux', 'girondins'],        club: 'bordeaux',             category: 'ligue-1' },
  { terms: ['as monaco'],                              club: 'monaco',               category: 'ligue-1' },
  { terms: ['psg'],                                    club: 'psg',                  category: 'ligue-1' },
  { terms: ['marseille'],                              club: 'marseille',            category: 'ligue-1' },
  { terms: ['bordeaux'],                               club: 'bordeaux',             category: 'ligue-1' },
  { terms: ['nantes'],                                 club: 'nantes',               category: 'ligue-1' },
  { terms: ['lyon'],                                   club: 'lyon',                 category: 'ligue-1' },

  { terms: ['club america', 'club américa'],           club: 'america',              category: 'liga-mx' },
  { terms: ['chivas guadalajara'],                     club: 'chivas',               category: 'liga-mx' },
  { terms: ['santos laguna'],                          club: 'santos-laguna',        category: 'liga-mx' },
  { terms: ['pumas unam', 'cf pumas'],                 club: 'pumas',                category: 'liga-mx' },
  { terms: ['tigres uanl'],                            club: 'tigres',               category: 'liga-mx' },
  { terms: ['cruz azul'],                              club: 'cruz-azul',            category: 'liga-mx' },
  { terms: ['america', 'américa'],                     club: 'america',              category: 'liga-mx' },
  { terms: ['chivas'],                                 club: 'chivas',               category: 'liga-mx' },
  { terms: ['pumas'],                                  club: 'pumas',                category: 'liga-mx' },
  { terms: ['tigres'],                                 club: 'tigres',               category: 'liga-mx' },
  { terms: ['monterrey', 'rayados'],                   club: 'monterrey',            category: 'liga-mx' },
  { terms: ['toluca'],                                 club: 'toluca',               category: 'liga-mx' },
  { terms: ['necaxa'],                                 club: 'necaxa',               category: 'liga-mx' },
  { terms: ['pachuca'],                                club: 'pachuca',              category: 'liga-mx' },
  { terms: ['atlas'],                                  club: 'atlas',                category: 'liga-mx' },

  { terms: ['boca juniors'],                           club: 'boca-juniors',         category: 'otros' },
  { terms: ['river plate'],                            club: 'river-plate',          category: 'otros' },
  { terms: ['flamengo'],                               club: 'flamengo',             category: 'otros' },
  { terms: ['corinthians'],                            club: 'corinthians',          category: 'otros' },
  { terms: ['palmeiras'],                              club: 'palmeiras',            category: 'otros' },
  { terms: ['botafogo'],                               club: 'botafogo',             category: 'otros' },
  { terms: ['ajax'],                                   club: 'ajax',                 category: 'otros' },
  { terms: ['porto'],                                  club: 'porto',                category: 'otros' },
  { terms: ['benfica'],                                club: 'benfica',              category: 'otros' },
  { terms: ['psv'],                                    club: 'psv',                  category: 'otros' },
  { terms: ['celtic'],                                 club: 'celtic',               category: 'otros' },
  { terms: ['rangers'],                                club: 'rangers',              category: 'otros' },
  { terms: ['boca'],                                   club: 'boca-juniors',         category: 'otros' },
  { terms: ['river'],                                  club: 'river-plate',          category: 'otros' },
  { terms: ['sporting lisboa', 'sporting cp', 'lisboa'], club: 'sporting-lisboa',   category: 'otros' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toName(folderName) {
  return folderName
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// Copia un directorio recursivamente, archivo por archivo (evita crashes con chars especiales)
function copyDirSafe(src, dst) {
  mkdirSync(dst, { recursive: true })
  const items = readdirSync(src)
  for (const item of items) {
    const srcItem = join(src, item)
    const dstItem = join(dst, item)
    // Solo copiamos archivos (imágenes), no subcarpetas
    try {
      copyFileSync(srcItem, dstItem)
    } catch (err) {
      // Loguear pero continuar con el siguiente archivo
      process.stdout.write(yellow(`\n    ⚠ No se pudo copiar ${item}: ${err.message}`))
    }
  }
}

// Extrae el primer año de 4 dígitos de un nombre de carpeta
function extractYear(name) {
  const match = name.match(/\b(1[89]\d{2}|20\d{2})\b/)
  return match ? parseInt(match[1]) : null
}

function identifyTeam(text) {
  const t = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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
    : null
}

function loadEnv() {
  const candidates = [
    resolve(ROOT, 'mi-catalogo', '.env'),
    resolve(ROOT, 'mi-catalogo', '.env.local'),
  ]
  for (const p of candidates) {
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const [key, ...rest] = line.split('=')
      if (key?.trim() && rest.length) process.env[key.trim()] = rest.join('=').trim()
    }
    return true
  }
  return false
}

function loadInventory() {
  if (!existsSync(INVENTORY_PATH)) return { _meta: {}, albums: [] }
  return JSON.parse(readFileSync(INVENTORY_PATH, 'utf-8'))
}

function saveInventory(inv) {
  writeFileSync(INVENTORY_PATH, JSON.stringify(inv, null, 2), 'utf-8')
}

function loadProducts() {
  if (!existsSync(PRODUCTS_PATH)) return []
  return JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8'))
}

function saveProducts(products) {
  writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf-8')
}

// Detecta si una carpeta es un álbum (contiene imágenes) o un club (contiene subcarpetas)
function isAlbumFolder(folderPath) {
  const items = readdirSync(folderPath)
  return items.some(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
}

// Escanea una categoría y devuelve todos sus álbumes
function scanCategoryFolder(categoryPath, categoryName) {
  const albums = []
  if (!existsSync(categoryPath)) return albums

  const items = readdirSync(categoryPath, { withFileTypes: true }).filter(d => d.isDirectory())

  for (const item of items) {
    const itemPath = join(categoryPath, item.name)

    if (isAlbumFolder(itemPath)) {
      // Álbum directo: category/album/
      albums.push(buildEntry(categoryName, null, item.name, itemPath))
    } else {
      // Club: category/club/album/
      const clubName = item.name
      const albumDirs = readdirSync(itemPath, { withFileTypes: true }).filter(d => d.isDirectory())
      for (const albumDir of albumDirs) {
        const albumPath = join(itemPath, albumDir.name)
        albums.push(buildEntry(categoryName, clubName, albumDir.name, albumPath))
      }
    }
  }
  return albums
}

function buildEntry(category, club, albumName, albumPath, tags = []) {
  const images = readdirSync(albumPath)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort((a, b) => {
      if (a.toLowerCase().startsWith('placeholder')) return -1
      if (b.toLowerCase().startsWith('placeholder')) return 1
      return a.localeCompare(b)
    })
  const clubSlug = club ? toSlug(club) : toSlug(category)
  const albumSlug = toSlug(albumName)
  const slug = `${clubSlug}-${albumSlug}`

  return {
    slug,
    name: toName(albumName),
    category,
    club: clubSlug,
    sourcePath: relative(ROOT, albumPath).replace(/\\/g, '/'),
    images,
    imageCount: images.length,
    tags,
    cloudinary: false,
    cloudinaryUrls: [],
    inProducts: false,
  }
}

// ─── Commands ─────────────────────────────────────────────────────────────────

const COMMANDS = {
  '?': {
    label: '?',
    desc: 'Muestra esta ayuda',
    detail: 'Lista todos los comandos disponibles con su descripción y uso.',
    usage: '?',
  },
  scan: {
    label: 'scan',
    desc: 'Escanea la carpeta fuente y actualiza inventory.json',
    detail: [
      'Recorre DATA/barjerseys_actual/ y detecta álbumes nuevos o eliminados.',
      'No toca Cloudinary ni products.json — solo actualiza el inventario local.',
      'Si un álbum ya existía en el inventory, conserva su estado (cloudinary, inProducts).',
    ].join('\n'),
    usage: 'scan',
  },
  status: {
    label: 'status',
    desc: 'Muestra el estado del catálogo por categoría',
    detail: [
      'Tabla con: álbumes totales, cuántos están en Cloudinary y cuántos en products.json.',
      'Útil para saber qué queda pendiente de subir o sincronizar.',
    ].join('\n'),
    usage: 'status',
  },
  remove: {
    label: 'remove',
    desc: 'Elimina un producto de products.json por slug o nombre',
    detail: [
      'Busca el producto por slug exacto o por texto parcial en el nombre.',
      'Si encuentra varios, te muestra la lista para que elijas.',
      'Lo marca como inProducts: false en inventory.json.',
      'No borra nada de Cloudinary ni del disco.',
    ].join('\n'),
    usage: 'remove [slug-o-texto]',
  },
  clear: {
    label: 'clear',
    desc: 'Vacía toda la carpeta barjerseys_actual',
    detail: [
      'DESTRUCTIVO — requiere confirmación.',
      'Borra todos los álbumes y subcarpetas de barjerseys_actual y resetea inventory.json.',
      'Ideal para empezar de cero antes de un import masivo.',
    ].join('\n'),
    usage: 'clear',
  },
  import: {
    label: 'import',
    desc: 'Importa en bulk una carpeta de álbumes al catálogo',
    detail: [
      'Detecta la estructura automáticamente:',
      '  · Anidada  [país/álbum/]  → como DATA/Mundialista',
      '  · Plana    [álbum/]       → como DATA/retro',
      'Identifica equipo y categoría desde el nombre de la carpeta.',
      '--tag <tag>          Agrega este tag a los álbumes importados.',
      '--year-max <año>     Solo aplica el --tag si el año del álbum es ≤ año.',
      'Corre scan automáticamente al terminar.',
    ].join('\n'),
    usage: 'import <ruta> [--tag <tag>] [--year-max <año>]',
  },
  add: {
    label: 'add',
    desc: 'Agrega una carpeta nueva al catálogo',
    detail: [
      'Recibe la ruta de una carpeta (un álbum o una carpeta con álbumes).',
      'Intenta identificar el equipo automáticamente con el nombre de la carpeta.',
      'Si lo identifica → te pregunta si moverla al lugar correcto en barjerseys_actual.',
      'Si no lo identifica → te pide elegir categoría y club manualmente.',
      'Al terminar corre scan automáticamente.',
    ].join('\n'),
    usage: 'add [ruta]',
  },
  upload: {
    label: 'upload',
    desc: 'Sube a Cloudinary los álbumes pendientes',
    detail: [
      'Lee inventory.json y sube todo lo que tenga cloudinary: false.',
      'Guarda el progreso después de cada álbum — si se interrumpe, reanuda solo.',
      'Al terminar corre sync automáticamente para actualizar products.json.',
      'Requiere credenciales en mi-catalogo/.env o .env.local.',
    ].join('\n'),
    usage: 'upload [--category <cat>] [--club <club>]',
  },
  sync: {
    label: 'sync',
    desc: 'Actualiza products.json con las URLs de Cloudinary',
    detail: [
      'Para cada álbum con cloudinary: true en inventory, crea o actualiza su entrada en products.json.',
      'No toca álbumes que no estén en Cloudinary todavía.',
      'Los productos nuevos se generan con price: 1050, available: true, sizes: S–2XL.',
    ].join('\n'),
    usage: 'sync',
  },
  pull: {
    label: 'pull',
    desc: 'Consulta Cloudinary y actualiza el inventory',
    detail: [
      'Llama a la API de Cloudinary para ver qué recursos existen en la carpeta jerseys/.',
      'Marca cloudinary: true en el inventory para los álbumes que ya están arriba.',
      'Útil si el inventory se desincronizó (por ejemplo, después de un reset).',
    ].join('\n'),
    usage: 'pull',
  },
  reset: {
    label: 'reset',
    desc: '⚠  Borra todo de Cloudinary y re-sube desde barjerseys_actual',
    detail: [
      'DESTRUCTIVO — requiere confirmación doble.',
      'Elimina toda la carpeta jerseys/ en Cloudinary y la vuelve a subir desde cero.',
      'Útil si cambiaste la estructura de carpetas o los nombres de los public_ids.',
      'Corre scan + upload + sync automáticamente al terminar.',
    ].join('\n'),
    usage: 'reset',
  },
  exit: {
    label: 'exit',
    desc: 'Sale del CLI',
    detail: 'También puedes usar Ctrl+C.',
    usage: 'exit',
  },
}

// ─── Command: ? ──────────────────────────────────────────────────────────────

function cmdHelp() {
  console.log('')
  console.log(B(cyan('  Comandos disponibles')))
  console.log('')
  for (const [name, cmd] of Object.entries(COMMANDS)) {
    const tag = name === 'reset' ? red(cmd.label) : cyan(cmd.label)
    console.log(`  ${B(tag)}`)
    console.log(`  ${gray('uso:')} ${cmd.usage}`)
    console.log(`  ${cmd.desc}`)
    if (cmd.detail) {
      for (const line of cmd.detail.split('\n')) {
        console.log(`  ${gray('→')} ${gray(line)}`)
      }
    }
    console.log('')
  }
}

// ─── Command: scan ───────────────────────────────────────────────────────────

function cmdScan() {
  console.log('')
  console.log(cyan('  Escaneando DATA/barjerseys_actual...'))

  const inventory = loadInventory()
  const existingMap = {}
  for (const a of inventory.albums ?? []) existingMap[a.slug] = a

  const freshAlbums = []
  for (const cat of CATEGORIES) {
    const catPath = join(SOURCE, cat)
    const albums = scanCategoryFolder(catPath, cat)
    freshAlbums.push(...albums)
  }

  let newCount = 0, updatedCount = 0

  const merged = freshAlbums.map(fresh => {
    const existing = existingMap[fresh.slug]
    if (!existing) {
      newCount++
      return fresh
    }
    updatedCount++
    // Conservar estado de Cloudinary, productos y tags
    return {
      ...fresh,
      tags: existing.tags ?? [],
      cloudinary: existing.cloudinary ?? false,
      cloudinaryUrls: existing.cloudinaryUrls ?? [],
      inProducts: existing.inProducts ?? false,
    }
  })

  // Detectar eliminados (estaban en inventory pero ya no están en disco)
  const freshSlugs = new Set(freshAlbums.map(a => a.slug))
  const removed = (inventory.albums ?? []).filter(a => !freshSlugs.has(a.slug))

  const total      = merged.length
  const uploaded   = merged.filter(a => a.cloudinary).length
  const inProds    = merged.filter(a => a.inProducts).length

  const newInv = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source: 'DATA/barjerseys_actual',
      total,
      uploadedToCloudinary: uploaded,
      pendingUpload: total - uploaded,
      inProducts: inProds,
      notInProducts: total - inProds,
    },
    albums: merged,
  }

  saveInventory(newInv)

  console.log(green(`  ✓ inventory.json actualizado`))
  console.log('')
  console.log(`  ${gray('Total álbumes:')}   ${B(total)}`)
  console.log(`  ${gray('Nuevos:')}          ${newCount > 0 ? yellow(newCount) : gray(newCount)}`)
  console.log(`  ${gray('Actualizados:')}    ${gray(updatedCount)}`)
  if (removed.length > 0) {
    console.log(`  ${gray('Ya no en disco:')} ${red(removed.length)} ${gray('(no se borran del inventory)')}`)
    for (const r of removed) console.log(`    ${red('–')} ${r.slug}`)
  }
  console.log('')
}

// ─── Command: status ─────────────────────────────────────────────────────────

function cmdStatus() {
  const inventory = loadInventory()
  const albums = inventory.albums ?? []

  if (albums.length === 0) {
    console.log(yellow('\n  Inventory vacío. Corre scan primero.\n'))
    return
  }

  console.log('')
  console.log(B(cyan('  Estado del catálogo')))
  console.log('')

  const header = [
    'Categoría'.padEnd(18),
    'Álbumes'.padStart(8),
    'Cloudinary'.padStart(12),
    'products.json'.padStart(15),
    'Pendientes'.padStart(12),
  ].join('  ')
  console.log(`  ${gray(header)}`)
  console.log(`  ${gray('─'.repeat(70))}`)

  let totAlbums = 0, totCloud = 0, totProds = 0

  for (const cat of CATEGORIES) {
    const catAlbums = albums.filter(a => a.category === cat)
    if (catAlbums.length === 0) continue

    const cloud   = catAlbums.filter(a => a.cloudinary).length
    const inProds = catAlbums.filter(a => a.inProducts).length
    const pending = catAlbums.length - cloud

    totAlbums += catAlbums.length
    totCloud  += cloud
    totProds  += inProds

    const pendingStr = pending > 0 ? yellow(String(pending).padStart(12)) : gray('0'.padStart(12))
    const cloudStr   = cloud === catAlbums.length
      ? green(`${cloud}/${catAlbums.length}`.padStart(12))
      : yellow(`${cloud}/${catAlbums.length}`.padStart(12))

    console.log([
      `  ${cat.padEnd(18)}`,
      String(catAlbums.length).padStart(8),
      cloudStr,
      `${inProds}/${catAlbums.length}`.padStart(15),
      pendingStr,
    ].join('  '))
  }

  console.log(`  ${gray('─'.repeat(70))}`)

  const totPending = totAlbums - totCloud
  const pendingTotStr = totPending > 0 ? yellow(String(totPending).padStart(12)) : green('0'.padStart(12))
  console.log([
    `  ${'TOTAL'.padEnd(18)}`,
    B(String(totAlbums).padStart(8)),
    B(`${totCloud}/${totAlbums}`.padStart(12)),
    B(`${totProds}/${totAlbums}`.padStart(15)),
    B(pendingTotStr),
  ].join('  '))
  console.log('')
}

// ─── Command: add ────────────────────────────────────────────────────────────

async function cmdAdd(args, rl) {
  let folderPath = args[0]

  if (!folderPath) {
    folderPath = await ask(rl, `  ${cyan('→')} Ruta de la carpeta: `)
  }

  folderPath = folderPath.trim().replace(/^["']|["']$/g, '')

  if (!existsSync(folderPath)) {
    console.log(red(`  ✗ No existe: ${folderPath}`))
    return
  }

  // Determinar si es un álbum directo o una carpeta con varios álbumes
  const isAlbum = isAlbumFolder(folderPath)
  const folderName = basename(folderPath)
  console.log('')

  if (isAlbum) {
    await addSingleAlbum(rl, folderPath, folderName)
  } else {
    // Carpeta con subálbumes
    const subDirs = readdirSync(folderPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    console.log(cyan(`  Detecté ${subDirs.length} subcarpetas en "${folderName}".`))
    const confirm = await ask(rl, `  ¿Procesar todas? [S/n] `)
    if (confirm.toLowerCase() === 'n') return

    for (const sub of subDirs) {
      const subPath = join(folderPath, sub)
      await addSingleAlbum(rl, subPath, sub)
    }
  }

  console.log(cyan('\n  Corriendo scan...\n'))
  cmdScan()
}

async function addSingleAlbum(rl, albumPath, albumName) {
  const identified = identifyTeam(albumName)

  if (identified) {
    console.log(`  ${gray('Álbum:')}    ${albumName}`)
    console.log(`  ${gray('Detecté:')} ${cyan(identified.club)} → ${magenta(identified.category)}`)
    const confirm = await ask(rl, `  ¿Mover aquí? [S/n] `)
    if (confirm.toLowerCase() === 'n') {
      await moveAlbumInteractive(rl, albumPath, albumName)
      return
    }
    moveAlbumTo(albumPath, albumName, identified.category, identified.club)
  } else {
    console.log(`  ${yellow('No pude identificar el equipo en:')} "${albumName}"`)
    await moveAlbumInteractive(rl, albumPath, albumName)
  }
}

async function moveAlbumInteractive(rl, albumPath, albumName) {
  console.log('')
  CATEGORIES.forEach((cat, i) => console.log(`    ${gray(`[${i + 1}]`)} ${cat}`))
  console.log('')
  const catIndex = await ask(rl, `  Elige categoría [1-${CATEGORIES.length}]: `)
  const category = CATEGORIES[parseInt(catIndex) - 1]
  if (!category) { console.log(red('  Categoría inválida, saltando.')); return }

  const club = await ask(rl, `  Nombre del club (slug, ej: "real-madrid"): `)
  const clubSlug = toSlug(club)

  moveAlbumTo(albumPath, albumName, category, clubSlug)
}

function moveAlbumTo(albumPath, albumName, category, club) {
  const destDir = join(SOURCE, category, club)
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })

  const dest = join(destDir, albumName)
  if (existsSync(dest)) {
    console.log(yellow(`  ⚠  Ya existe en destino: ${dest}`))
    return
  }

  renameSync(albumPath, dest)
  console.log(green(`  ✓ Movido → ${relative(ROOT, dest).replace(/\\/g, '/')}`))
}

// ─── Command: upload ─────────────────────────────────────────────────────────

async function cmdUpload(args) {
  if (!loadEnv()) {
    console.log(red('\n  ✗ No se encontró .env ni .env.local en mi-catalogo/'))
    console.log(gray('  Crea el archivo con CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET\n'))
    return
  }

  const { v2: cloudinary } = await import('cloudinary')
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const inventory = loadInventory()
  let pending = inventory.albums.filter(a => !a.cloudinary)

  // Filtros opcionales
  const catFlag  = args.indexOf('--category')
  const clubFlag = args.indexOf('--club')
  if (catFlag !== -1)  pending = pending.filter(a => a.category === args[catFlag + 1])
  if (clubFlag !== -1) pending = pending.filter(a => a.club === args[clubFlag + 1])

  if (pending.length === 0) {
    console.log(green('\n  ✓ Todo está en Cloudinary. Nada que subir.\n'))
    return
  }

  console.log('')
  console.log(cyan(`  Subiendo ${pending.length} álbumes a Cloudinary...`))
  console.log('')

  let ok = 0, fail = 0

  for (let i = 0; i < pending.length; i++) {
    const entry = pending[i]
    const folderPath = resolve(ROOT, entry.sourcePath)
    const cloudFolder = `jerseys/${entry.category}/${entry.club}/${entry.slug}`
    const prefix = `  [${i + 1}/${pending.length}]`

    process.stdout.write(`${prefix} ${entry.slug} ... `)

    const urls = []
    let entryFailed = false

    try {
      for (const imgFile of entry.images) {
        const localPath = join(folderPath, imgFile)
        const publicId  = `${cloudFolder}/${imgFile.replace(/\.[^.]+$/, '')}`

        const result = await cloudinary.uploader.upload(localPath, {
          public_id: publicId,
          overwrite: false,
          resource_type: 'image',
        })
        urls.push(result.secure_url)
      }

      entry.cloudinary    = true
      entry.cloudinaryUrls = urls
      ok++
      process.stdout.write(green(`✓ ${urls.length} imgs\n`))

    } catch (err) {
      entryFailed = true
      fail++
      process.stdout.write(red(`✗ ${err.message}\n`))
    }

    // Guardar progreso después de cada álbum
    const inv = loadInventory()
    const idx = inv.albums.findIndex(a => a.slug === entry.slug)
    if (idx !== -1) {
      inv.albums[idx].cloudinary    = entry.cloudinary
      inv.albums[idx].cloudinaryUrls = entry.cloudinaryUrls
    }
    inv._meta.uploadedToCloudinary = inv.albums.filter(a => a.cloudinary).length
    inv._meta.pendingUpload        = inv.albums.filter(a => !a.cloudinary).length
    inv._meta.generatedAt          = new Date().toISOString()
    saveInventory(inv)
  }

  console.log('')
  console.log(`  ${green('✓')} Subidos: ${green(ok)}   ${fail > 0 ? red('✗') : gray('✗')} Fallidos: ${fail > 0 ? red(fail) : gray(fail)}`)
  console.log('')

  if (ok > 0) {
    console.log(cyan('  Sincronizando products.json...'))
    cmdSync()
  }
}

// ─── Command: sync ───────────────────────────────────────────────────────────

function cmdSync() {
  const inventory = loadInventory()
  const products  = loadProducts()

  const uploaded = inventory.albums.filter(a => a.cloudinary && a.cloudinaryUrls?.length > 0)

  if (uploaded.length === 0) {
    console.log(yellow('\n  No hay álbumes en Cloudinary todavía. Corre upload primero.\n'))
    return
  }

  const existingMap = {}
  for (const p of products) existingMap[p.slug] = p

  let nextId = products.length > 0
    ? Math.max(...products.map(p => parseInt(p.id) || 0)) + 1
    : 1

  let created = 0, updated = 0

  const sortImages = (urls) => [...urls].sort((a, b) => {
    if (a.includes('/placeholder')) return -1
    if (b.includes('/placeholder')) return 1
    return a.localeCompare(b)
  })

  for (const album of uploaded) {
    if (existingMap[album.slug]) {
      existingMap[album.slug].images = sortImages(album.cloudinaryUrls)
      existingMap[album.slug].tags   = album.tags ?? []
      updated++
    } else {
      products.push({
        id: String(nextId++),
        slug: album.slug,
        name: album.name,
        price: 1050,
        category: album.category,
        club: album.club,
        sizes: ['S', 'M', 'L', 'XL', '2XL'],
        available: true,
        description: '',
        images: sortImages(album.cloudinaryUrls),
        tags: album.tags ?? [],
      })

      // Marcar en inventory
      const idx = inventory.albums.findIndex(a => a.slug === album.slug)
      if (idx !== -1) inventory.albums[idx].inProducts = true

      created++
    }
  }

  inventory._meta.inProducts    = inventory.albums.filter(a => a.inProducts).length
  inventory._meta.notInProducts = inventory.albums.length - inventory._meta.inProducts
  inventory._meta.generatedAt   = new Date().toISOString()

  saveProducts(products)
  saveInventory(inventory)

  console.log(green(`  ✓ products.json actualizado`))
  console.log(`  ${gray('Creados:')}     ${created}`)
  console.log(`  ${gray('Actualizados:')} ${updated}`)
  console.log('')
}

// ─── Command: pull ───────────────────────────────────────────────────────────

async function cmdPull() {
  if (!loadEnv()) {
    console.log(red('\n  ✗ No se encontró .env ni .env.local\n'))
    return
  }

  const { v2: cloudinary } = await import('cloudinary')
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  console.log(cyan('\n  Consultando Cloudinary...'))

  const inventory = loadInventory()
  const cloudSlugs = new Set()

  try {
    let nextCursor = undefined
    let totalResources = 0

    do {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'jerseys/',
        max_results: 500,
        next_cursor: nextCursor,
      })

      for (const r of result.resources) {
        // public_id: jerseys/[category]/[club]/[slug]/[file]
        const parts = r.public_id.split('/')
        if (parts.length >= 4) {
          const slug = parts[3]
          cloudSlugs.add(slug)
        }
      }

      totalResources += result.resources.length
      nextCursor = result.next_cursor
    } while (nextCursor)

    console.log(gray(`  ${totalResources} recursos encontrados en Cloudinary`))

    let marked = 0
    for (const album of inventory.albums) {
      const wasCloud = album.cloudinary
      album.cloudinary = cloudSlugs.has(album.slug)
      if (album.cloudinary && !wasCloud) marked++
    }

    inventory._meta.uploadedToCloudinary = inventory.albums.filter(a => a.cloudinary).length
    inventory._meta.pendingUpload        = inventory.albums.filter(a => !a.cloudinary).length
    inventory._meta.generatedAt          = new Date().toISOString()

    saveInventory(inventory)

    console.log(green(`  ✓ Inventory actualizado desde Cloudinary`))
    console.log(`  ${gray('En Cloudinary:')} ${inventory._meta.uploadedToCloudinary}/${inventory.albums.length}`)
    if (marked > 0) console.log(`  ${gray('Recién marcados:')} ${yellow(marked)}`)
    console.log('')

  } catch (err) {
    console.log(red(`  ✗ Error de Cloudinary: ${err.message}\n`))
  }
}

// ─── Command: reset ──────────────────────────────────────────────────────────

async function cmdReset(args, rl) {
  const inventory = loadInventory()
  const uploaded  = inventory.albums.filter(a => a.cloudinary).length

  console.log('')
  console.log(red(B('  ⚠  ACCIÓN DESTRUCTIVA')))
  console.log(red(`  Esto borrará ${uploaded} álbumes de Cloudinary y los volverá a subir.`))
  console.log('')

  const c1 = await ask(rl, `  ¿Seguro? Escribe ${B('RESET')} para continuar: `)
  if (c1 !== 'RESET') {
    console.log(gray('\n  Cancelado.\n'))
    return
  }

  const c2 = await ask(rl, `  Confirma de nuevo — ¿borrar toda la carpeta jerseys/ de Cloudinary? [s/N] `)
  if (c2.toLowerCase() !== 's') {
    console.log(gray('\n  Cancelado.\n'))
    return
  }

  if (!loadEnv()) {
    console.log(red('\n  ✗ No se encontró .env ni .env.local\n'))
    return
  }

  const { v2: cloudinary } = await import('cloudinary')
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  console.log(yellow('\n  Borrando carpeta jerseys/ de Cloudinary...'))

  try {
    await cloudinary.api.delete_resources_by_prefix('jerseys/')
    console.log(green('  ✓ Recursos eliminados'))
  } catch (err) {
    console.log(red(`  ✗ Error al borrar: ${err.message}`))
    return
  }

  // Resetear flags en inventory
  for (const album of inventory.albums) {
    album.cloudinary     = false
    album.cloudinaryUrls = []
    album.inProducts     = false
  }
  inventory._meta.uploadedToCloudinary = 0
  inventory._meta.pendingUpload        = inventory.albums.length
  saveInventory(inventory)

  console.log(cyan('\n  Re-subiendo todo...'))
  await cmdUpload([], rl)
}

// ─── Command: remove ─────────────────────────────────────────────────────────

async function cmdRemove(args, rl) {
  const query = args.join(' ').trim()
  const products = loadProducts()

  // Buscar por slug exacto o texto parcial en slug/nombre
  const search = (q) => {
    const t = q.toLowerCase()
    return products.filter(p =>
      p.slug.includes(t) || p.name.toLowerCase().includes(t)
    )
  }

  let matches = query ? search(query) : []

  if (matches.length === 0) {
    const input = await ask(rl, `  ${cyan('→')} Slug o nombre del álbum: `)
    matches = search(input.trim())
  }

  if (matches.length === 0) {
    console.log(yellow('  No se encontró ningún producto con ese texto.\n'))
    return
  }

  let toRemove

  if (matches.length === 1) {
    toRemove = matches[0]
    console.log(`  Encontrado: ${cyan(toRemove.name)} ${gray('(' + toRemove.slug + ')')}`)
    const confirm = await ask(rl, `  ¿Eliminar de products.json? [s/N] `)
    if (confirm.toLowerCase() !== 's') {
      console.log(gray('  Cancelado.\n'))
      return
    }
  } else {
    console.log(`\n  Se encontraron ${matches.length} productos:\n`)
    matches.forEach((p, i) => {
      console.log(`  ${gray('[' + (i + 1) + ']')} ${p.name} ${gray('(' + p.slug + ')')}`)
    })
    console.log(`  ${gray('[0]')} Cancelar`)
    console.log('')
    const choice = await ask(rl, `  Elige [0-${matches.length}]: `)
    const idx = parseInt(choice)
    if (!idx || idx < 1 || idx > matches.length) {
      console.log(gray('\n  Cancelado.\n'))
      return
    }
    toRemove = matches[idx - 1]
  }

  // Eliminar de products.json
  const updated = products.filter(p => p.slug !== toRemove.slug)
  saveProducts(updated)

  // Marcar inProducts: false en inventory
  const inventory = loadInventory()
  const idx = inventory.albums?.findIndex(a => a.slug === toRemove.slug)
  if (idx !== undefined && idx !== -1) {
    inventory.albums[idx].inProducts = false
    inventory._meta.inProducts    = inventory.albums.filter(a => a.inProducts).length
    inventory._meta.notInProducts = inventory.albums.length - inventory._meta.inProducts
    saveInventory(inventory)
  }

  console.log(green(`\n  ✓ "${toRemove.name}" eliminado de products.json`))
  console.log(gray('  El álbum sigue en barjerseys_actual y en Cloudinary.\n'))
}

// ─── Command: clear ──────────────────────────────────────────────────────────

async function cmdClear(args, rl) {
  const categories = readdirSync(SOURCE, { withFileTypes: true }).filter(d => d.isDirectory())

  if (categories.length === 0) {
    console.log(yellow('\n  barjerseys_actual ya está vacía.\n'))
    return
  }

  // Contar álbumes totales
  let total = 0
  for (const cat of categories) {
    const catPath = join(SOURCE, cat.name)
    const albums = scanCategoryFolder(catPath, cat.name)
    total += albums.length
  }

  console.log('')
  console.log(red(B('  ⚠  ACCIÓN DESTRUCTIVA')))
  console.log(red(`  Esto borrará ${total} álbumes en ${categories.length} categorías de barjerseys_actual.`))
  console.log(red('  Esta acción NO se puede deshacer.'))
  console.log('')

  const c1 = await ask(rl, `  ¿Seguro? Escribe ${B('CLEAR')} para confirmar: `)
  if (c1 !== 'CLEAR') {
    console.log(gray('\n  Cancelado.\n'))
    return
  }

  for (const cat of categories) {
    rmSync(join(SOURCE, cat.name), { recursive: true, force: true })
    console.log(gray(`  – ${cat.name}/`))
  }

  // Resetear inventory
  saveInventory({
    _meta: {
      generatedAt: new Date().toISOString(),
      source: 'DATA/barjerseys_actual',
      total: 0,
      uploadedToCloudinary: 0,
      pendingUpload: 0,
      inProducts: 0,
      notInProducts: 0,
    },
    albums: [],
  })

  console.log(green(`\n  ✓ barjerseys_actual vaciada (${total} álbumes eliminados)`))
  console.log(green('  ✓ inventory.json reseteado'))
  console.log('')
}

// ─── Command: import ─────────────────────────────────────────────────────────

async function cmdImport(args, rl) {
  // Parsear args: import <ruta> [--tag <tag>] [--year-max <año>]
  let sourcePath = null
  let tag = null
  let yearMax = null

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tag')      tag     = args[++i]
    else if (args[i] === '--year-max') yearMax = parseInt(args[++i])
    else if (!sourcePath)         sourcePath = args[i]
  }

  if (!sourcePath) {
    sourcePath = await ask(rl, `  ${cyan('→')} Ruta de la carpeta fuente: `)
    sourcePath = sourcePath.trim().replace(/^["']|["']$/g, '')
  }

  // Resolver ruta relativa desde ROOT
  if (!sourcePath.match(/^[A-Za-z]:|^\//)) {
    sourcePath = resolve(ROOT, sourcePath)
  }

  if (!existsSync(sourcePath)) {
    console.log(red(`  ✗ No existe: ${sourcePath}`))
    return
  }

  const topItems = readdirSync(sourcePath, { withFileTypes: true })
    .filter(d => d.isDirectory())

  if (topItems.length === 0) {
    console.log(yellow('  Carpeta vacía.'))
    return
  }

  // Detectar estructura: plana (álbumes directamente) o anidada (pais/album)
  const firstPath = join(sourcePath, topItems[0].name)
  const isNested = !isAlbumFolder(firstPath)

  console.log('')
  console.log(cyan(`  Estructura detectada: ${isNested
    ? 'anidada  ' + gray('[país/álbum]')
    : 'plana    ' + gray('[álbum]')
  }`))
  if (tag)     console.log(`  Tag:      ${magenta(tag)}${yearMax !== null ? gray(` (solo si año ≤ ${yearMax})`) : ''}`)
  console.log('')

  // Construir lista de álbumes a importar
  const toImport = []

  if (isNested) {
    // Mundialista-style: [country]/[album]/
    for (const countryDir of topItems) {
      if (countryDir.name === 'selections.json') continue
      const countryPath = join(sourcePath, countryDir.name)
      if (!existsSync(countryPath)) continue

      const albumDirs = readdirSync(countryPath, { withFileTypes: true }).filter(d => d.isDirectory())
      const identified = identifyTeam(countryDir.name)
      const category = identified?.category ?? 'selecciones'
      const club     = identified?.club     ?? toSlug(countryDir.name)

      for (const albumDir of albumDirs) {
        const albumPath = join(countryPath, albumDir.name)
        // En estructura anidada, el tag se aplica a todos
        toImport.push({
          albumPath,
          albumName: albumDir.name,
          club,
          category,
          tags: tag ? [tag] : [],
        })
      }
    }
  } else {
    // Retro-style: [album]/
    for (const albumDir of topItems) {
      const albumPath = join(sourcePath, albumDir.name)
      const identified = identifyTeam(albumDir.name)
      const category = identified?.category ?? 'otros'
      const club     = identified?.club     ?? 'sin-identificar'

      // Lógica de tag por año
      let albumTags = []
      if (tag) {
        if (yearMax !== null) {
          const year = extractYear(albumDir.name)
          if (year !== null && year <= yearMax) albumTags = [tag]
        } else {
          albumTags = [tag]
        }
      }

      toImport.push({
        albumPath,
        albumName: albumDir.name,
        club,
        category,
        tags: albumTags,
      })
    }
  }

  // Resumen antes de proceder
  const withTag    = toImport.filter(a => a.tags.length > 0).length
  const withoutTag = toImport.length - withTag
  const byCategory = {}
  for (const item of toImport) {
    byCategory[item.category] = (byCategory[item.category] ?? 0) + 1
  }

  console.log(`  ${B(toImport.length)} álbumes a importar`)
  console.log('')
  for (const [cat, count] of Object.entries(byCategory)) {
    console.log(`  ${gray('·')} ${cat.padEnd(18)} ${count}`)
  }
  if (tag) {
    console.log('')
    console.log(`  Con tag ${magenta('"' + tag + '"')}: ${green(withTag)}`)
    if (withoutTag > 0) console.log(`  Sin tag:              ${gray(withoutTag)}`)
  }
  console.log('')

  const confirm = await ask(rl, `  ¿Continuar? [S/n] `)
  if (confirm.toLowerCase() === 'n') {
    console.log(gray('\n  Cancelado.\n'))
    return
  }

  console.log('')
  let copied = 0, skipped = 0, failed = 0

  for (const { albumPath, albumName, club, category, tags: albumTags } of toImport) {
    const destDir = join(SOURCE, category, club)
    if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })

    const dest = join(destDir, albumName)

    if (existsSync(dest)) {
      process.stdout.write(gray(`  ↻ ${albumName}\n`))
      skipped++
      continue
    }

    try {
      copyDirSafe(albumPath, dest)
      process.stdout.write(green(`  ✓ `) + gray(`${category}/${club}/`) + `${albumName}`)
      if (albumTags.length > 0) process.stdout.write(` ${magenta('[' + albumTags.join(', ') + ']')}`)
      process.stdout.write('\n')
      copied++
    } catch (err) {
      process.stdout.write(red(`  ✗ ${albumName}: ${err.message}\n`))
      // Limpiar dest parcial si quedó a medias
      try { if (existsSync(dest)) rmSync(dest, { recursive: true, force: true }) } catch {}
      failed++
    }
  }

  console.log('')
  console.log(green(`  ✓ Importados: ${copied}`) + `  ${gray('Saltados: ' + skipped)}  ${failed > 0 ? red('Fallidos: ' + failed) : gray('Fallidos: 0')}`)
  console.log('')

  // Scan y aplicar tags al inventory
  console.log(cyan('  Actualizando inventory...'))
  cmdScan()

  if (tag) {
    // Construir mapa slug→tags desde toImport para actualizar el inventory
    const tagMap = new Map()
    for (const item of toImport) {
      if (item.tags.length === 0) continue
      const clubSlug  = toSlug(item.club)
      const albumSlug = toSlug(item.albumName)
      const slug = `${clubSlug}-${albumSlug}`
      tagMap.set(slug, item.tags)
    }

    const inventory = loadInventory()
    let tagged = 0
    for (const album of inventory.albums) {
      if (tagMap.has(album.slug)) {
        album.tags = tagMap.get(album.slug)
        tagged++
      }
    }
    saveInventory(inventory)
    console.log(green(`  ✓ Tags aplicados: ${tagged} álbumes con tag "${tag}"`))
    console.log('')
  }
}

// ─── REPL utils ──────────────────────────────────────────────────────────────

function ask(rl, prompt) {
  return new Promise(resolve => rl.question(prompt, resolve))
}

// ─── Banner ──────────────────────────────────────────────────────────────────

function printBanner() {
  console.clear()
  console.log('')
  console.log(B(cyan('  ██████╗  █████╗ ██████╗ ')))
  console.log(B(cyan('  ██╔══██╗██╔══██╗██╔══██╗')))
  console.log(B(cyan('  ██████╔╝███████║██████╔╝')))
  console.log(B(cyan('  ██╔══██╗██╔══██║██╔══██╗')))
  console.log(B(cyan('  ██████╔╝██║  ██║██║  ██║')))
  console.log(B(cyan('  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝')))
  console.log('')
  console.log(gray('  Barajas Jerseys CLI  ·  Gestión de catálogo'))
  console.log(gray(`  Fuente: DATA/barjerseys_actual/`))
  console.log('')
  console.log(`  Escribe ${cyan('?')} para ver los comandos  ·  ${gray('Ctrl+C para salir')}`)
  console.log('')
}

// ─── Main REPL ───────────────────────────────────────────────────────────────

process.on('uncaughtException', (err) => {
  console.error(red(`\n  ✗ Error inesperado: ${err.message}`))
  console.error(gray(`  ${err.stack?.split('\n')[1] ?? ''}`))
  console.error(gray('  El progreso guardado hasta ahora se conserva. Puedes re-correr el comando.\n'))
})

process.on('unhandledRejection', (reason) => {
  console.error(red(`\n  ✗ Error async: ${reason?.message ?? reason}`))
  console.error(gray('  El progreso guardado hasta ahora se conserva. Puedes re-correr el comando.\n'))
})

async function main() {
  printBanner()

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${cyan('bar')} ${gray('▶')} `,
    completer: (line) => {
      const completions = Object.keys(COMMANDS)
      const hits = completions.filter(c => c.startsWith(line))
      return [hits.length ? hits : completions, line]
    },
  })

  rl.prompt()

  rl.on('line', async (line) => {
    const [cmd, ...args] = line.trim().split(/\s+/)

    if (!cmd) {
      rl.prompt()
      return
    }

    console.log('')

    try {
      switch (cmd) {
        case '?':      cmdHelp();                    break
        case 'scan':   cmdScan();                    break
        case 'status': cmdStatus();                  break
        case 'remove': await cmdRemove(args, rl);    break
        case 'clear':  await cmdClear(args, rl);     break
        case 'import': await cmdImport(args, rl);    break
        case 'add':    await cmdAdd(args, rl);       break
        case 'upload': await cmdUpload(args);        break
        case 'sync':   cmdSync();                    break
        case 'pull':   await cmdPull();              break
        case 'reset':  await cmdReset(args, rl);     break
        case 'exit':
        case 'quit':
          console.log(gray('  Hasta luego.\n'))
          process.exit(0)
        default:
          console.log(yellow(`  Comando desconocido: "${cmd}"`))
          console.log(gray(`  Escribe ? para ver los comandos disponibles.`))
          console.log('')
      }
    } catch (err) {
      console.log(red(`  ✗ Error: ${err.message}`))
      console.log('')
    }

    rl.prompt()
  })

  rl.on('close', () => {
    console.log(gray('\n  Hasta luego.\n'))
    process.exit(0)
  })
}

main()
