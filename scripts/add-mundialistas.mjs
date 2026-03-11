/**
 * add-mundialistas.mjs
 *
 * Lee data/inventory.json, filtra los álbumes con sourceType "mundialista"
 * que aún no están en products.json (inProducts: false), y los añade con:
 *   - category: "selecciones"
 *   - tags: ["mundialistas"]
 *   - price: 800
 *   - images: [] (vacío hasta subir a Cloudinary)
 *
 * Después actualiza inventory.json marcando inProducts: true.
 *
 * Uso: node mi-catalogo/scripts/add-mundialistas.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname      = dirname(fileURLToPath(import.meta.url))
const ROOT           = resolve(__dirname, '..', '..')
const PRODUCTS_PATH  = resolve(ROOT, 'mi-catalogo', 'data', 'products.json')
const INVENTORY_PATH = resolve(ROOT, 'mi-catalogo', 'data', 'inventory.json')

const products  = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8'))
const inventory = JSON.parse(readFileSync(INVENTORY_PATH, 'utf-8'))

const existingSlugs = new Set(products.map(p => p.slug))

// Siguiente ID disponible
let nextId = Math.max(...products.map(p => parseInt(p.id) || 0)) + 1

const toAdd = inventory.albums.filter(
  e => e.sourceType === 'mundialista' && !existingSlugs.has(e.slug)
)

if (toAdd.length === 0) {
  console.log('\n✓ No hay mundialistas pendientes de añadir.\n')
  process.exit(0)
}

for (const entry of toAdd) {
  products.push({
    id: String(nextId++),
    slug: entry.slug,
    name: entry.name,
    price: 800,
    category: 'selecciones',
    club: entry.club,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    available: true,
    description: '',
    images: [],
    tags: ['mundialistas'],
  })

  // Marcar en inventory
  entry.inProducts = true
}

// Actualizar _meta del inventory
inventory._meta.inProducts = inventory.albums.filter(e => e.inProducts).length
inventory._meta.notInProducts = inventory.albums.length - inventory._meta.inProducts
inventory._meta.generatedAt = new Date().toISOString()

writeFileSync(PRODUCTS_PATH,  JSON.stringify(products, null, 2),  'utf-8')
writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8')

console.log(`\n✓ ${toAdd.length} mundialistas añadidos a products.json\n`)
console.log('─── Añadidos ─────────────────────────────────────')
const byClub = {}
for (const e of toAdd) {
  if (!byClub[e.club]) byClub[e.club] = 0
  byClub[e.club]++
}
for (const [club, count] of Object.entries(byClub)) {
  console.log(`  ${club.padEnd(20)} ${count} productos`)
}
console.log('──────────────────────────────────────────────────\n')
console.log('  Siguiente paso: node mi-catalogo/scripts/upload-mundialista.mjs\n')
