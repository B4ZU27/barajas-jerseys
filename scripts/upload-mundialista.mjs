/**
 * upload-mundialista.mjs
 *
 * Lee data/inventory.json, filtra álbumes mundialistas con cloudinary: false,
 * sube cada imagen a Cloudinary en la carpeta:
 *   jerseys/mundialista/[club]/[slug]/
 *
 * Después actualiza products.json con las URLs reales e inventory.json
 * marcando cloudinary: true.
 *
 * Requiere en .env:
 *   CLOUDINARY_CLOUD_NAME=...
 *   CLOUDINARY_API_KEY=...
 *   CLOUDINARY_API_SECRET=...
 *
 * Uso: node mi-catalogo/scripts/upload-mundialista.mjs
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { v2 as cloudinary } from 'cloudinary'

const __dirname      = dirname(fileURLToPath(import.meta.url))
const ROOT           = resolve(__dirname, '..', '..')
const PRODUCTS_PATH  = resolve(ROOT, 'mi-catalogo', 'data', 'products.json')
const INVENTORY_PATH = resolve(ROOT, 'mi-catalogo', 'data', 'inventory.json')

// ─── Cargar .env manualmente (sin dependencia de dotenv) ─────────────────────

const envPath = resolve(ROOT, 'mi-catalogo', '.env.local')
const envLines = readFileSync(envPath, 'utf-8').split('\n')
for (const line of envLines) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ─── Cargar datos ─────────────────────────────────────────────────────────────

const products  = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf-8'))
const inventory = JSON.parse(readFileSync(INVENTORY_PATH, 'utf-8'))

const pending = inventory.albums.filter(
  e => e.sourceType === 'mundialista' && !e.cloudinary && e.inProducts
)

if (pending.length === 0) {
  console.log('\n✓ No hay mundialistas pendientes de subir a Cloudinary.\n')
  process.exit(0)
}

console.log(`\n→ Subiendo ${pending.length} álbumes a Cloudinary...\n`)

let successCount = 0
let errorCount   = 0

for (const entry of pending) {
  const folderPath = resolve(ROOT, entry.sourcePath)
  const cloudFolder = `jerseys/mundialista/${entry.club}/${entry.slug}`

  const urls = []
  console.log(`  [${successCount + errorCount + 1}/${pending.length}] ${entry.slug}`)

  try {
    for (const imgFile of entry.images) {
      const localPath = join(folderPath, imgFile)
      const publicId  = `${cloudFolder}/${imgFile.replace(/\.[^.]+$/, '')}`

      const result = await cloudinary.uploader.upload(localPath, {
        public_id:    publicId,
        overwrite:    false,
        resource_type: 'image',
      })
      urls.push(result.secure_url)
    }

    // Actualizar product en products.json
    const product = products.find(p => p.slug === entry.slug)
    if (product) product.images = urls

    // Marcar en inventory
    entry.cloudinary = true
    successCount++
    console.log(`    ✓ ${urls.length} imágenes subidas`)

  } catch (err) {
    errorCount++
    console.error(`    ✗ Error: ${err.message}`)
  }

  // Guardar progreso después de cada álbum (por si se interrumpe)
  writeFileSync(PRODUCTS_PATH,  JSON.stringify(products, null, 2),  'utf-8')
  writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8')
}

// Actualizar _meta
inventory._meta.uploadedToCloudinary = inventory.albums.filter(e => e.cloudinary).length
inventory._meta.pendingUpload = inventory.albums.filter(e => !e.cloudinary).length
inventory._meta.generatedAt = new Date().toISOString()
writeFileSync(INVENTORY_PATH, JSON.stringify(inventory, null, 2), 'utf-8')

console.log('\n─── Resultado ────────────────────────────────────')
console.log(`  Subidos con éxito : ${successCount}`)
console.log(`  Con error         : ${errorCount}`)
console.log('──────────────────────────────────────────────────\n')
