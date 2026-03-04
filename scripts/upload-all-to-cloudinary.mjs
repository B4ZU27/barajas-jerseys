/**
 * Sube todos los 120 álbumes de DATA/retro a Cloudinary y genera products.json
 *
 * Uso:
 *   node scripts/upload-all-to-cloudinary.mjs
 *
 * Requiere en .env.local:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary } from 'cloudinary'
import { readdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Leer .env.local
const envFile = await readFile(new URL('../.env.local', import.meta.url), 'utf-8').catch(() => '')
for (const line of envFile.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_RETRO = path.join(__dirname, '../../DATA/retro')
const PRODUCTS_FILE = path.join(__dirname, '../data/products.json')

// Generar slug desde nombre de carpeta
function generateSlug(folderName) {
  return folderName
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '')
}

// Leer todas las carpetas
const folders = await readdir(DATA_RETRO, { withFileTypes: true })
const retroFolders = folders.filter(f => f.isDirectory())

console.log(`\n📦 Procesando ${retroFolders.length} álbumes...\n`)

const products = []
let productId = 1

for (const folder of retroFolders) {
  const folderPath = path.join(DATA_RETRO, folder.name)
  const files = await readdir(folderPath)

  // Obtener imágenes en orden: placeholder, 001, 002, ..., 007
  const imageFiles = ['placeholder.jpg']
  for (let i = 1; i <= 7; i++) {
    const padded = String(i).padStart(3, '0')
    const filename = `${padded}.jpg`
    if (files.includes(filename)) {
      imageFiles.push(filename)
    }
  }

  if (imageFiles.length === 0) {
    console.log(`⚠️  ${folder.name} — sin imágenes, saltando`)
    continue
  }

  const slug = generateSlug(folder.name)
  const images = []
  let uploadedCount = 0

  console.log(`\n🔄 ${slug}`)

  // Subir cada imagen
  for (const imageFile of imageFiles) {
    const filePath = path.join(folderPath, imageFile)
    const publicId = `jerseys/retro/${slug}/${imageFile.replace('.jpg', '')}`

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        overwrite: false,
        resource_type: 'image',
      })

      images.push(result.secure_url)
      uploadedCount++
      console.log(`   ✓ ${imageFile}`)
    } catch (err) {
      if (err.message.includes('already exists')) {
        // Si ya existe, obtener la URL
        const existingUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1/jerseys/retro/${slug}/${imageFile.replace('.jpg', '')}.jpg`
        images.push(existingUrl)
        uploadedCount++
        console.log(`   ↻ ${imageFile} (ya existe)`)
      } else {
        console.error(`   ✗ ${imageFile}: ${err.message}`)
      }
    }
  }

  // Crear producto
  if (uploadedCount > 0) {
    const product = {
      id: productId.toString(),
      slug,
      name: folder.name.replace(/[0-9]+A?B?$/g, '').trim(),
      price: 1050 + Math.floor(Math.random() * 200), // 1050-1250
      category: 'retro',
      club: slug.split('-')[0] || 'retro',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      available: true,
      description: `Jersey retro: ${folder.name}`,
      images,
    }
    products.push(product)
    productId++

    console.log(`   📸 ${uploadedCount} imágenes — OK`)
  }
}

console.log(`\n✅ Total: ${products.length} productos con imágenes\n`)

// Escribir products.json
await writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2))

console.log(`📄 Escrito: ${PRODUCTS_FILE}`)
console.log(`\n🚀 Listo para: npm run dev`)
