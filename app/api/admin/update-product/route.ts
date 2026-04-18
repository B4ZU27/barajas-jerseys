import { readFile, writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? 'dsdg9rgi3',
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'products.json')
const DB_JERSEYS    = path.join(process.cwd(), '..', 'DATA', 'DB_jerseys')

interface Product {
  id: string; slug: string; name: string; price: number
  category: string; club: string; sizes: string[]; available: boolean
  description: string; images: string[]; tags: string[]; videos?: string[]
}

function isAuthorized(): boolean {
  return !!process.env.ADMIN_SECRET
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const formData    = await request.formData()
    const originalSlug = formData.get('originalSlug') as string

    const products: Product[] = JSON.parse(await readFile(PRODUCTS_PATH, 'utf8'))
    const idx = products.findIndex(p => p.slug === originalSlug)
    if (idx === -1) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

    const product = products[idx]

    // Campos editables
    if (formData.has('name'))        product.name        = formData.get('name') as string
    if (formData.has('price'))       product.price       = Number(formData.get('price'))
    if (formData.has('category'))    product.category    = formData.get('category') as string
    if (formData.has('club'))        product.club        = formData.get('club') as string
    if (formData.has('description')) product.description = formData.get('description') as string
    if (formData.has('available'))   product.available   = formData.get('available') === 'true'
    if (formData.has('sizes'))       product.sizes       = JSON.parse(formData.get('sizes') as string)
    if (formData.has('tags'))        product.tags        = JSON.parse(formData.get('tags') as string)

    // Imágenes a eliminar (índices separados por coma)
    const removeIdxRaw = formData.get('removeImages') as string
    if (removeIdxRaw) {
      const toRemove = removeIdxRaw.split(',').map(Number).sort((a, b) => b - a)
      for (const i of toRemove) {
        const imgPath = product.images[i]
        // Solo borrar si es imagen local
        if (imgPath?.startsWith('/api/db-image/')) {
          const segments = imgPath.replace('/api/db-image/', '').split('/')
          const filePath = path.join(DB_JERSEYS, ...segments)
          if (existsSync(filePath)) await unlink(filePath).catch(() => {})
        }
        product.images.splice(i, 1)
      }
    }

    // Nuevas imágenes
    const newFiles = formData.getAll('newImages') as File[]
    if (newFiles.length > 0) {
      const imgDir = path.join(DB_JERSEYS, product.category, product.club, product.slug)
      await mkdir(imgDir, { recursive: true })

      // Siguiente número disponible
      const existing = product.images.filter(i => i.startsWith('/api/db-image/'))
      let counter = existing.length + 1

      for (const file of newFiles) {
        if (!file || file.size === 0) continue
        const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
        const filename = `${String(counter).padStart(3, '0')}.${ext}`
        await writeFile(path.join(imgDir, filename), Buffer.from(await file.arrayBuffer()))
        product.images.push(`/api/db-image/${product.category}/${product.club}/${product.slug}/${filename}`)
        counter++
      }
    }

    // Videos a eliminar
    const removeVideosRaw = formData.get('removeVideos') as string
    if (removeVideosRaw && product.videos) {
      const toRemove = removeVideosRaw.split(',').map(Number).sort((a, b) => b - a)
      for (const i of toRemove) {
        const videoPath = product.videos[i]
        if (videoPath?.startsWith('/api/db-image/')) {
          const segments = videoPath.replace('/api/db-image/', '').split('/')
          const filePath = path.join(DB_JERSEYS, ...segments)
          if (existsSync(filePath)) await unlink(filePath).catch(() => {})
        }
        product.videos.splice(i, 1)
      }
    }

    // Nuevos videos → backup local + subir a Cloudinary
    const newVideoFiles = formData.getAll('newVideos') as File[]
    if (newVideoFiles.length > 0) {
      if (!product.videos) product.videos = []
      const videoDir = path.join(DB_JERSEYS, product.category, product.club, product.slug, 'videos')
      await mkdir(videoDir, { recursive: true })
      let counter = product.videos.length + 1
      for (const file of newVideoFiles) {
        if (!file || file.size === 0) continue
        const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'mp4'
        const filename = `${String(counter).padStart(3, '0')}.${ext}`
        const buffer   = Buffer.from(await file.arrayBuffer())

        // 1. Guardar local (backup)
        await writeFile(path.join(videoDir, filename), buffer)

        // 2. Subir a Cloudinary
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'video', folder: `jerseys/${product.slug}/videos`, public_id: filename.replace(/\.[^.]+$/, ''), overwrite: true },
            (err, res) => err ? reject(err) : resolve(res as { secure_url: string })
          )
          stream.end(buffer)
        })

        // 3. Guardar URL de Cloudinary en products.json
        product.videos.push(result.secure_url)
        counter++
      }
    }

    products[idx] = product
    await writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf8')
    return NextResponse.json({ success: true, product })
  } catch (err) {
    console.error('[update-product]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
