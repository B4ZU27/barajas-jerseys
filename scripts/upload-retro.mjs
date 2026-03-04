/**
 * Sube todas las imágenes de DATA/retro a Cloudinary.
 *
 * Uso:
 *   node scripts/upload-retro.mjs
 *
 * Requiere en .env.local:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

import { v2 as cloudinary } from 'cloudinary'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// Leer variables de entorno desde .env.local manualmente (sin dotenv)
const envFile = await readFile(new URL('../.env.local', import.meta.url), 'utf-8').catch(() => '')
for (const line of envFile.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const __dirname  = path.dirname(fileURLToPath(import.meta.url))
const DATA_RETRO = path.join(__dirname, '../../DATA/retro')

// Lee las carpetas de producto
const productFolders = await readdir(DATA_RETRO, { withFileTypes: true })

for (const folder of productFolders) {
  if (!folder.isDirectory()) continue

  const folderPath = path.join(DATA_RETRO, folder.name)
  const files = await readdir(folderPath)

  // Solo archivos de imagen
  const images = files.filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))

  for (const imageFile of images) {
    const filePath = path.join(folderPath, imageFile)

    // El public_id en Cloudinary: jerseys/retro/{nombre-de-carpeta}/{nombre-de-archivo}
    // Cloudinary no acepta espacios ni caracteres especiales en el public_id,
    // así que los limpiamos aquí.
    const cleanFolder = folder.name.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase()
    const cleanFile   = imageFile.replace(/[^a-zA-Z0-9-_.]/g, '_').toLowerCase()
    const publicId    = `jerseys/retro/${cleanFolder}/${cleanFile}`

    try {
      const result = await cloudinary.uploader.upload(filePath, {
        public_id,
        overwrite: false,    // no re-sube si ya existe
        resource_type: 'image',
      })
      console.log(`✓ ${imageFile} → ${result.secure_url}`)
    } catch (err) {
      console.error(`✗ ${imageFile}:`, err.message)
    }
  }
}

console.log('\n¡Listo! Todas las imágenes fueron subidas.')
