/**
 * Genera products.json con todos los retros desde DATA/retro
 *
 * Lee todas las carpetas en DATA/retro, genera slugs, y crea un JSON
 * con referencias a /api/image/[slug]/[archivo]
 *
 * Uso:
 *   node scripts/generate-retro-products.mjs [limit]
 *   node scripts/generate-retro-products.mjs 20    # primeros 20
 *   node scripts/generate-retro-products.mjs       # todos
 */

import { readdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_RETRO = path.join(__dirname, '../../DATA/retro')
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json')

const LIMIT = parseInt(process.argv[2]) || Infinity

// Función para generar slug desde nombre de carpeta
function generateSlug(folderName) {
  return folderName
    .replace(/[^a-zA-Z0-9\s]/g, '') // quita caracteres especiales
    .replace(/\s+/g, '-')             // espacios a guiones
    .toLowerCase()
    .replace(/-+/g, '-')              // guiones múltiples a uno
    .trim()
    .replace(/^-+|-+$/g, '')          // quita guiones al inicio/final
}

// Leer carpetas
const folders = await readdir(DATA_RETRO, { withFileTypes: true })
const retroFolders = folders.filter(f => f.isDirectory()).slice(0, LIMIT)

console.log(`Encontradas ${retroFolders.length} carpetas de retro\n`)

// Generar productos
const retroProducts = retroFolders.map((folder, idx) => {
  const slug = generateSlug(folder.name)
  const id = (41 + idx).toString() // empezamos en 41 (después de los 40 existentes)

  return {
    id,
    slug,
    name: folder.name.replace(/[0-9]+A?B?$/g, '').trim(), // limpia el suffix de tallas
    price: 1100 + (Math.random() * 150 | 0), // precio aleatorio entre 1100-1250
    category: 'retro',
    club: slug.split('-')[0] || 'retro', // primer palabra como club
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    available: true,
    description: `Camiseta retro: ${folder.name}`,
    images: [
      `/api/image/${slug}/placeholder.jpg`,
      `/api/image/${slug}/001.jpg`,
      `/api/image/${slug}/002.jpg`,
      `/api/image/${slug}/003.jpg`,
    ],
  }
})

console.log('Productos generados:')
retroProducts.slice(0, 5).forEach(p => {
  console.log(`  ${p.id}. ${p.name} (${p.slug})`)
})
if (retroProducts.length > 5) {
  console.log(`  ... y ${retroProducts.length - 5} más\n`)
}

// Leer el JSON actual
let currentData
try {
  const content = await readFile(PRODUCTS_FILE, 'utf-8')
  currentData = JSON.parse(content)
  console.log(`Productos actuales: ${currentData.length}`)
} catch (err) {
  console.log('No hay products.json actual, empezando desde cero')
  currentData = []
}

// Reemplazar productos retro (ids >= 41)
const nonRetro = currentData.filter(p => parseInt(p.id) < 41)
const finalProducts = [...nonRetro, ...retroProducts]

console.log(`Productos finales: ${finalProducts.length}\n`)

// Escribir
await writeFile(PRODUCTS_FILE, JSON.stringify(finalProducts, null, 2))

console.log(`✓ Escrito en ${PRODUCTS_FILE}`)
console.log('\nAhora puedes correr: npm run dev')
