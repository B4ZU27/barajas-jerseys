/**
 * Sube videos MP4 de un jersey a Cloudinary y muestra las URLs.
 *
 * Uso:
 *   CLOUDINARY_API_KEY=xxx CLOUDINARY_API_SECRET=yyy \
 *   node scripts/upload-videos.mjs <slug> <carpeta-con-mp4s>
 *
 * Ejemplo:
 *   node scripts/upload-videos.mjs argentina-local-2024 ./videos/argentina
 *
 * El cloud name se lee de CLOUDINARY_CLOUD_NAME (default: dsdg9rgi3)
 * Las URLs resultantes van bajo: jerseys/<slug>/videos/
 */

import { v2 as cloudinary } from 'cloudinary'
import { readdir } from 'fs/promises'
import { join, extname, basename } from 'path'

const [,, slug, folder] = process.argv

if (!slug || !folder) {
  console.error('Uso: node scripts/upload-videos.mjs <slug> <carpeta>')
  console.error('Ejemplo: node scripts/upload-videos.mjs argentina-local-2024 ./videos/argentina')
  process.exit(1)
}

if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Faltan variables de entorno: CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET')
  console.error('Encuéntralas en: https://console.cloudinary.com → Settings → API Keys')
  process.exit(1)
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? 'dsdg9rgi3',
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const VIDEO_EXTS = ['.mp4', '.mov', '.webm']

let files
try {
  files = (await readdir(folder))
    .filter(f => VIDEO_EXTS.includes(extname(f).toLowerCase()))
    .sort()
} catch {
  console.error(`No se pudo leer la carpeta: ${folder}`)
  process.exit(1)
}

if (files.length === 0) {
  console.error(`No hay videos (mp4/mov/webm) en: ${folder}`)
  process.exit(1)
}

console.log(`\nSubiendo ${files.length} video(s) para "${slug}"...\n`)

const urls = []

for (const file of files) {
  const filePath = join(folder, file)
  const publicId = basename(file, extname(file))

  process.stdout.write(`  ${file} → `)

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder:        `jerseys/${slug}/videos`,
      public_id:     publicId,
      overwrite:     true,
    })
    urls.push(result.secure_url)
    console.log(`✓ ${result.secure_url}`)
  } catch (err) {
    console.log(`✗ Error: ${err.message}`)
  }
}

if (urls.length === 0) {
  console.error('\nNingún video se subió correctamente.')
  process.exit(1)
}

console.log('\n─────────────────────────────────────────────')
console.log('Copia esto en products.json, dentro del producto:\n')
console.log(JSON.stringify({ videos: urls }, null, 2))
console.log('─────────────────────────────────────────────\n')
