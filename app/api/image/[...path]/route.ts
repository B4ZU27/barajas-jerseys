import { readFile, readdir } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API route: GET /api/image/[slug]/[filename]
 *
 * Sirve imágenes directamente desde DATA/retro/[folder]/
 * Ejemplo:
 *   GET /api/image/argentina-away-1986/placeholder.jpg
 *   → lee desde DATA/retro/1986 Season Argentina Away.../placeholder.jpg
 */

// Mapeo de slugs a carpetas reales en DATA
// Se genera dinámicamente o se pre-cachea
const FOLDER_MAP: Record<string, string> = {}

async function getFolderMap() {
  if (Object.keys(FOLDER_MAP).length > 0) return FOLDER_MAP

  const dataRetro = path.join(process.cwd(), '..', 'DATA', 'retro')
  try {
    const folders = await readdir(dataRetro, { withFileTypes: true })

    for (const folder of folders) {
      if (!folder.isDirectory()) continue

      // Generar slug desde el nombre de la carpeta
      // "1986 Season Argentina Away彩蓝 0A" → "1986-season-argentina-away"
      const slug = folder.name
        .replace(/[^a-zA-Z0-9\s]/g, '') // quita caracteres especiales
        .replace(/\s+/g, '-')             // espacios a guiones
        .toLowerCase()
        .replace(/-+/g, '-')              // guiones múltiples a uno
        .replace(/-$/, '')                // quita guión final

      FOLDER_MAP[slug] = folder.name
    }
  } catch (err) {
    console.error('Error reading DATA/retro:', err)
  }

  return FOLDER_MAP
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params

  if (!pathSegments || pathSegments.length < 2) {
    return NextResponse.json(
      { error: 'Invalid path. Expected /api/image/[slug]/[filename]' },
      { status: 400 }
    )
  }

  const slug = pathSegments[0]
  const filename = pathSegments.slice(1).join('/')

  const folderMap = await getFolderMap()
  const actualFolderName = folderMap[slug]

  if (!actualFolderName) {
    return NextResponse.json(
      { error: `Folder not found for slug: ${slug}` },
      { status: 404 }
    )
  }

  const filePath = path.join(
    process.cwd(),
    '..',
    'DATA',
    'retro',
    actualFolderName,
    filename
  )

  try {
    const data = await readFile(filePath)

    // Detectar MIME type
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeType = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    }[ext || ''] || 'application/octet-stream'

    return new NextResponse(data, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (err) {
    console.error('Error reading file:', err)
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
