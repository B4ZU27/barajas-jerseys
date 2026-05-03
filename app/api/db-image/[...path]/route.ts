/**
 * GET /api/db-image/[...path]
 *
 * Sirve imágenes desde DATA/DB_jerseys/ — solo para desarrollo local.
 * En producción estas imágenes deben estar en Cloudinary.
 */
import { readFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'

const BASE_DIR = path.resolve(process.cwd(), '..', 'DATA', 'DB_jerseys')

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params
  const filePath = path.resolve(BASE_DIR, ...segments)

  // Prevenir path traversal
  if (!filePath.startsWith(BASE_DIR)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const file = await readFile(filePath)
    const ext  = path.extname(filePath).toLowerCase()
    const mime =
      ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
      ext === '.png'  ? 'image/png'  :
      ext === '.webp' ? 'image/webp' :
      ext === '.gif'  ? 'image/gif'  : 'application/octet-stream'

    return new NextResponse(file, {
      headers: {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
