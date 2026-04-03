import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const name        = formData.get('name')        as string
    const price       = Number(formData.get('price'))
    const category    = formData.get('category')    as string
    const club        = formData.get('club')        as string
    const description = formData.get('description') as string ?? ''
    const sizes       = JSON.parse(formData.get('sizes')  as string) as string[]
    const tags        = JSON.parse(formData.get('tags')   as string) as string[]
    const available   = formData.get('available') === 'true'
    const slug        = (formData.get('slug') as string) || `${club}-${toSlug(name)}`
    const images      = formData.getAll('images') as File[]

    if (!name || !category || !club || !slug) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // ── Guardar imágenes en DB_jerseys ─────────────────────────────────────────
    const imageDir = path.join(process.cwd(), '..', 'DATA', 'DB_jerseys', category, club, slug)
    await mkdir(imageDir, { recursive: true })

    const imagePaths: string[] = []

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      if (!file || file.size === 0) continue
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      // Primera imagen = placeholder, el resto numeradas
      const filename = i === 0 ? `placeholder.${ext}` : `${String(i).padStart(3, '0')}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(path.join(imageDir, filename), buffer)
      imagePaths.push(`/api/db-image/${category}/${club}/${slug}/${filename}`)
    }

    // ── Leer y actualizar products.json ────────────────────────────────────────
    const productsPath = path.join(process.cwd(), 'data', 'products.json')
    const productsJson = JSON.parse(await readFile(productsPath, 'utf8')) as Array<{ id: string; slug: string }>

    // Verificar slug duplicado
    if (productsJson.some(p => p.slug === slug)) {
      return NextResponse.json({ error: `El slug "${slug}" ya existe` }, { status: 409 })
    }

    const maxId = productsJson.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0)

    const newProduct = {
      id:          String(maxId + 1),
      slug,
      name,
      price,
      category,
      club,
      sizes,
      available,
      description,
      images:      imagePaths,
      tags,
    }

    productsJson.push(newProduct)
    await writeFile(productsPath, JSON.stringify(productsJson, null, 2), 'utf8')

    return NextResponse.json({ success: true, product: newProduct })
  } catch (err) {
    console.error('[add-product]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
